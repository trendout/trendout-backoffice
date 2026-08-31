// supabase/functions/send-review-request/index.ts
//
// Duas formas de chamar:
// 1. Manual, com { orderId } no corpo — usado quando o admin marca a
//    encomenda como "Entregue" no backoffice, dispara logo.
// 2. Em lote, sem corpo (ou corpo vazio) — corre agendada (cron), e vai
//    buscar todas as encomendas enviadas há mais de X dias (definido nas
//    Definições) que ainda não têm confirmação de entrega nem pedido já
//    enviado.

import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const FROM_ADDRESS = "Trendout <noreply@trendout.pt>";
const LOGO_URL = `${Deno.env.get("SUPABASE_URL")}/storage/v1/object/public/product-images/trendout-logo.png`;
const STORE_URL = "https://loja.trendout.pt";

function emailHtml(items: any[], message: string, storeName: string) {
  const bodyHtml = message.replace(/\n/g, "<br>");

  const itemsHtml = items.map((it: any) => {
    const productUrl = it.slug ? `${STORE_URL}/produto/${it.slug}` : STORE_URL;
    return `
      <tr>
        <td style="padding:8px 0; width:56px;">
          ${it.image ? `<a href="${productUrl}"><img src="${it.image}" width="48" height="48" style="border-radius:8px; object-fit:cover; display:block;" /></a>` : ""}
        </td>
        <td style="padding:8px 0 8px 12px;">
          <a href="${productUrl}" style="color:#1a1a1a; text-decoration:none; font-size:13px; font-weight:bold;">${it.name}</a><br />
          <a href="${productUrl}#avaliacoes" style="color:#7c9a2e; font-size:12px; text-decoration:none;">Avaliar este produto →</a>
        </td>
      </tr>
    `;
  }).join("");

  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse; background:#f4f4f4; padding:24px 0;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px; background:#ffffff; border-radius:12px; overflow:hidden; font-family:Arial,sans-serif;">
            <tr>
              <td align="center" bgcolor="#0f1210" style="background-color:#0f1210; padding:28px 0;">
                <img src="${LOGO_URL}" height="40" alt="${storeName}" style="display:block; border:0;" />
              </td>
            </tr>
            <tr>
              <td style="padding:24px 28px 8px; color:#1a1a1a; font-size:14px; line-height:1.7;">
                ${bodyHtml}
              </td>
            </tr>
            <tr>
              <td style="padding:8px 28px 24px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  ${itemsHtml}
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    let body: any = {};
    try { body = await req.json(); } catch { /* corpo vazio — chamada em lote (cron) */ }
    const singleOrderId = body?.orderId;

    const { data: settings } = await supabase.from("store_settings").select("*").eq("id", 1).single();
    if (!settings?.review_request_enabled && !singleOrderId) {
      // em lote, respeita o interruptor; se for um pedido manual (o admin
      // carregou no botão de propósito), envia mesmo que o automático esteja desligado
      return new Response(JSON.stringify({ sent: 0, skipped: "disabled" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const subject = settings?.review_request_subject || "O que achaste da tua compra?";
    const message = settings?.review_request_message || "Gostávamos de saber a tua opinião sobre a tua encomenda!";
    const daysAfter = settings?.review_request_days_after_shipping ?? 7;
    const storeName = settings?.store_name || "Trendout";

    let orders: any[] = [];

    if (singleOrderId) {
      const { data } = await supabase.from("orders").select("id, customer_email, review_requested_at").eq("id", singleOrderId).single();
      if (data) orders = [data];
    } else {
      const cutoff = new Date(Date.now() - daysAfter * 24 * 60 * 60 * 1000).toISOString();
      const { data } = await supabase
        .from("orders")
        .select("id, customer_email, review_requested_at")
        .is("review_requested_at", null)
        .is("delivered_at", null)
        .eq("status", "shipped")
        .lte("shipped_at", cutoff);
      orders = data || [];
    }

    let sent = 0;
    for (const order of orders) {
      if (order.review_requested_at) continue; // já enviado, nunca duplicar

      const { data: items } = await supabase
        .from("order_items")
        .select("product_id, product_name, products(slug, images)")
        .eq("order_id", order.id);

      const itemsForEmail = (items || []).map((it: any) => ({
        name: it.product_name,
        slug: it.products?.slug || null,
        image: it.products?.images?.[0] || null,
      }));

      const html = emailHtml(itemsForEmail, message, storeName);

      const resendResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${Deno.env.get("RESEND_API_KEY")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ from: FROM_ADDRESS, to: order.customer_email, subject, html }),
      });

      if (resendResponse.ok) {
        await supabase.from("orders").update({ review_requested_at: new Date().toISOString() }).eq("id", order.id);
        sent++;
      }
    }

    return new Response(JSON.stringify({ sent }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
