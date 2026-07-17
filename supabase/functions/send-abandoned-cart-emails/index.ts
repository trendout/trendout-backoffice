// supabase/functions/send-abandoned-cart-emails/index.ts
//
// Corre sozinha, agendada (ver pg_cron no schema.sql). Procura carrinhos
// parados há mais de 10 horas, sem aviso ainda enviado, e manda um email
// a lembrar o cliente — com os artigos e um link para cada produto
// (não tentamos "restaurar" o carrinho automaticamente, porque ele vive
// no browser do cliente, não no servidor).

import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const FROM_ADDRESS = "Trendout <noreply@trendout.pt>";
const LOGO_URL = `${Deno.env.get("SUPABASE_URL")}/storage/v1/object/public/product-images/trendout-logo.png`;
const STORE_URL = "https://loja.trendout.pt";

function emailHtml(items: any[], subtotal: number, storeName: string) {
  const itemsHtml = items.map((it: any) => `
    <tr>
      <td style="padding:10px 0; width:64px;">
        ${it.image ? `<img src="${it.image}" width="56" height="56" style="border-radius:8px; object-fit:cover; display:block;" />` : ""}
      </td>
      <td style="padding:10px 0 10px 12px;">
        ${it.name}${it.size ? ` — ${it.size}` : ""}${it.color ? ` (${it.color})` : ""} × ${it.qty}<br />
        <a href="${STORE_URL}" style="color:#7c9a2e; font-size:12px; text-decoration:none;">Ver produto →</a>
      </td>
      <td style="padding:10px 0; text-align:right;">€${(it.price * it.qty).toFixed(2)}</td>
    </tr>
  `).join("");

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
                <h1 style="font-size:20px; margin:0 0 12px;">Deixaste isto no carrinho 👀</h1>
                <p style="font-size:14px; color:#444; line-height:1.6; margin:0 0 20px;">
                  Ainda estás a tempo — os artigos abaixo continuam à tua espera.
                </p>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  ${itemsHtml}
                  <tr style="border-top:1px solid #eee;">
                    <td></td>
                    <td style="padding-top:10px; font-weight:bold;">Subtotal</td>
                    <td style="padding-top:10px; font-weight:bold; text-align:right;">€${subtotal.toFixed(2)}</td>
                  </tr>
                </table>
                <table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:24px;">
                  <tr>
                    <td align="center" bgcolor="#c9ff3f" style="background-color:#c9ff3f; border-radius:8px;">
                      <a href="${STORE_URL}" style="display:inline-block; padding:14px 28px; font-size:14px; font-weight:bold; color:#0f1210; text-decoration:none;">
                        Voltar à loja
                      </a>
                    </td>
                  </tr>
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
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    let cartId: string | null = null;
    try {
      const body = await req.json();
      cartId = body?.cartId || null;
    } catch {
      // sem corpo (chamada do agendamento) — segue para o modo em lote
    }

    let carts;
    if (cartId) {
      // envio manual de um carrinho específico, a partir do backoffice — ignora os 10h/já enviado
      const { data, error } = await supabase.from("cart_snapshots").select("*").eq("id", cartId);
      if (error) throw error;
      carts = data;
    } else {
      const cutoff = new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(); // há mais de 10h
      const { data, error } = await supabase
        .from("cart_snapshots")
        .select("*")
        .lt("updated_at", cutoff)
        .is("reminder_sent_at", null);
      if (error) throw error;
      carts = data;
    }

    if (!carts || carts.length === 0) {
      return new Response(JSON.stringify({ sent: 0 }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 });
    }

    const { data: settings } = await supabase.from("store_settings").select("store_name").eq("id", 1).single();
    const storeName = settings?.store_name || "Trendout";
    const resendKey = Deno.env.get("RESEND_API_KEY")!;

    let sent = 0;
    for (const cart of carts) {
      const items = Array.isArray(cart.items) ? cart.items : [];
      if (items.length === 0) continue;

      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: FROM_ADDRESS,
          to: cart.customer_email,
          subject: "Deixaste artigos no carrinho da Trendout",
          html: emailHtml(items, Number(cart.subtotal), storeName),
        }),
      });

      if (res.ok) {
        await supabase.from("cart_snapshots").update({ reminder_sent_at: new Date().toISOString() }).eq("id", cart.id);
        sent += 1;
      } else {
        console.error(`Falha ao enviar para ${cart.customer_email}:`, await res.text());
      }
    }

    return new Response(JSON.stringify({ sent }), {
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
