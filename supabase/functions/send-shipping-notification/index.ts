// supabase/functions/send-shipping-notification/index.ts
//
// Envia um email ao cliente a avisar que a encomenda foi enviada,
// com o código de rastreio. Disparado manualmente pela admin,
// no painel de detalhe da encomenda (botão "Notificar cliente do envio").

import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const FROM_ADDRESS = "Trendout <noreply@trendout.pt>";
const LOGO_URL = `${Deno.env.get("SUPABASE_URL")}/storage/v1/object/public/product-images/trendout-logo.png`;

function emailHtml(order: any, storeName: string) {
  // CTT é a transportadora mais comum em Portugal — se um dia usares outra,
  // troca este link (ou remove a secção) por um mais adequado.
  const trackingUrl = `https://appserver2.ctt.pt/feapl_2/app/open/objectSearch/objectSearch.jspx?lang=def&objects=${encodeURIComponent(order.tracking_code)}`;

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
              <td style="padding:32px 28px; color:#1a1a1a;">
                <h1 style="font-size:20px; margin:0 0 16px;">A tua encomenda está a caminho! 📦</h1>
                <p style="font-size:14px; color:#444; line-height:1.6; margin:0 0 20px;">
                  A encomenda <strong>${order.order_number}</strong> já foi enviada.
                </p>
                <table role="presentation" cellpadding="0" cellspacing="0" style="background:#f7f7f7; border-radius:8px; width:100%; margin-bottom:20px;">
                  <tr>
                    <td style="padding:16px;">
                      <div style="font-size:11px; color:#888; text-transform:uppercase; letter-spacing:0.4px; margin-bottom:6px;">Código de rastreio</div>
                      <div style="font-size:16px; font-weight:bold; letter-spacing:0.5px;">${order.tracking_code}</div>
                    </td>
                  </tr>
                </table>
                <table role="presentation" cellpadding="0" cellspacing="0">
                  <tr>
                    <td align="center" bgcolor="#c9ff3f" style="background-color:#c9ff3f; border-radius:8px;">
                      <a href="${trackingUrl}" style="display:inline-block; padding:14px 28px; font-size:14px; font-weight:bold; color:#0f1210; text-decoration:none;">
                        Acompanhar entrega
                      </a>
                    </td>
                  </tr>
                </table>
                <p style="font-size:12px; color:#999; margin:24px 0 0; line-height:1.6;">
                  ${storeName} — obrigado por comprares connosco.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
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
      .select("order_number, customer_email, tracking_code")
      .eq("id", orderId)
      .single();
    if (orderErr || !order) throw new Error("Encomenda não encontrada");
    if (!order.tracking_code) throw new Error("Esta encomenda ainda não tem código de rastreio");
    if (!order.customer_email) throw new Error("Esta encomenda não tem email de cliente");

    const { data: settings } = await supabase.from("store_settings").select("store_name").eq("id", 1).single();
    const storeName = settings?.store_name || "Trendout";
    const resendKey = Deno.env.get("RESEND_API_KEY")!;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: FROM_ADDRESS,
        to: order.customer_email,
        subject: `A tua encomenda ${order.order_number} foi enviada!`,
        html: emailHtml(order, storeName),
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Resend recusou o envio: ${errText}`);
    }

    return new Response(JSON.stringify({ sent: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
