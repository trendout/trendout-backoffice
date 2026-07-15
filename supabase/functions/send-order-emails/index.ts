// supabase/functions/send-order-emails/index.ts
//
// Envia dois emails via Resend sempre que uma encomenda é criada/confirmada:
// um ao cliente (confirmação) e outro à admin (aviso de nova encomenda).

import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Domínio verificado no Resend — já não é preciso o endereço de teste.
const FROM_ADDRESS = "Trendout <noreply@trendout.pt>";

// Logo carregado no bucket público "product-images" do Supabase Storage
const LOGO_URL = `${Deno.env.get("SUPABASE_URL")}/storage/v1/object/public/product-images/trendout-logo.png`;

function formatMoney(n: number) {
  return `€${Number(n).toFixed(2)}`;
}

function customerEmailHtml(order: any, storeName: string, contactPhone: string, contactEmail: string) {
  const itemsHtml = order.order_items
    .map((it: any) => `
      <tr>
        <td style="padding:10px 0; width:64px;">
          ${it.image ? `<img src="${it.image}" width="56" height="56" style="border-radius:8px; object-fit:cover; display:block;" />` : ""}
        </td>
        <td style="padding:10px 0 10px 12px;">${it.product_name}${it.size ? ` — ${it.size}` : ""}${it.color ? ` (${it.color})` : ""} × ${it.quantity}</td>
        <td style="padding:10px 0; text-align:right;">${formatMoney(it.line_total)}</td>
      </tr>`)
    .join("");

  const paymentNote = order.payment_method === "card"
    ? "O teu pagamento por cartão foi confirmado."
    : "Assim que recebermos a tua transferência bancária, a encomenda avança para produção.";

  return `
    <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #1a1a1a;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
        <tr>
          <td align="center" bgcolor="#0f1210" style="background-color:#0f1210; padding:24px 0; border-radius:8px 8px 0 0;">
            <img src="${LOGO_URL}" height="40" alt="${storeName}" style="display:block; border:0;" />
          </td>
        </tr>
      </table>
      <h1 style="font-size: 20px;">Obrigado pela tua compra, ${order.customer_name}!</h1>
      <p>A tua encomenda <strong>${order.order_number}</strong> foi recebida com sucesso.</p>
      <p style="color: #555;">${paymentNote}</p>
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        ${itemsHtml}
        <tr style="border-top: 1px solid #ddd;">
          <td></td>
          <td style="padding-top: 10px; font-weight: bold;">Total</td>
          <td style="padding-top: 10px; font-weight: bold; text-align: right;">${formatMoney(order.total)}</td>
        </tr>
      </table>
      <p style="color: #888; font-size: 12px; border-top: 1px solid #eee; padding-top: 14px; margin-top: 20px;">
        Este é um email automático — não é possível responder diretamente.<br />
        Dúvidas sobre a tua encomenda? Contacta-nos${contactPhone ? ` pelo ${contactPhone}` : ""}${contactEmail ? ` ou <a href="mailto:${contactEmail}" style="color:#555;">${contactEmail}</a>` : ""}.
      </p>
      <p style="color: #aaa; font-size: 11px;">${storeName}</p>
    </div>
  `;
}

function adminEmailHtml(order: any, storeName: string) {
  const itemsHtml = order.order_items
    .map((it: any) => `<li>${it.product_name} — ${it.size || ""} ${it.color || ""} × ${it.quantity} (${formatMoney(it.line_total)})</li>`)
    .join("");

  return `
    <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #1a1a1a;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
        <tr>
          <td align="center" bgcolor="#0f1210" style="background-color:#0f1210; padding:24px 0; border-radius:8px 8px 0 0;">
            <img src="${LOGO_URL}" height="40" alt="${storeName}" style="display:block; border:0;" />
          </td>
        </tr>
      </table>
      <h1 style="font-size: 20px;">Nova encomenda: ${order.order_number}</h1>
      <p><strong>Cliente:</strong> ${order.customer_name} (${order.customer_email})</p>
      <p><strong>Método de pagamento:</strong> ${order.payment_method === "card" ? "Cartão" : "Transferência bancária"}</p>
      <p><strong>Total:</strong> ${formatMoney(order.total)}</p>
      <p><strong>Artigos:</strong></p>
      <ul>${itemsHtml}</ul>
    </div>
  `;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { orderId } = await req.json();
    if (!orderId) throw new Error("Falta orderId");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .select("*, order_items(*, products(images))")
      .eq("id", orderId)
      .single();
    if (orderErr || !order) throw new Error("Encomenda não encontrada");

    // achata a imagem do produto (primeira do array) para dentro de cada artigo,
    // para os templates de email não precisarem de saber da estrutura da junção
    order.order_items = order.order_items.map((it: any) => ({
      ...it,
      image: Array.isArray(it.products?.images) ? it.products.images[0] : null,
    }));

    const { data: settings } = await supabase.from("store_settings").select("*").eq("id", 1).single();
    const storeName = settings?.store_name || "Trendout";
    const resendKey = Deno.env.get("RESEND_API_KEY")!;

    const sends = [];

    if (order.customer_email) {
      sends.push(
        fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            from: FROM_ADDRESS,
            to: order.customer_email,
            subject: `Confirmação da encomenda ${order.order_number}`,
            html: customerEmailHtml(order, storeName, settings?.company_phone, settings?.company_email),
          }),
        })
      );
    }

    if (settings?.company_email) {
      sends.push(
        fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            from: FROM_ADDRESS,
            to: settings.company_email,
            subject: `Nova encomenda: ${order.order_number}`,
            html: adminEmailHtml(order, storeName),
          }),
        })
      );
    }

    const results = await Promise.allSettled(sends);
    const errors = results.filter((r) => r.status === "rejected");

    return new Response(JSON.stringify({ sent: sends.length, errors: errors.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
