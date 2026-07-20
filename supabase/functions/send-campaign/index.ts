// supabase/functions/send-campaign/index.ts
//
// Envia uma mensagem pontual — a um único cliente, a uma lista escolhida
// no backoffice, ou a todos os subscritores ativos da newsletter.
// Depois de enviar, marca "last_contacted_at" em quem for subscritor,
// para o backoffice saber quem já recebeu e quem ainda falta.
//
// body: { mode: "single", toEmail, subject, message }
//    ou { mode: "selected", emails: string[], subject, message }
//    ou { mode: "broadcast", subject, message }

import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const FROM_ADDRESS = "Trendout <noreply@trendout.pt>";
const LOGO_URL = `${Deno.env.get("SUPABASE_URL")}/storage/v1/object/public/product-images/trendout-logo.png`;

function emailHtml(storeName: string, message: string, unsubscribeUrl: string | null) {
  const bodyHtml = message.replace(/\n/g, "<br>");

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
              <td style="padding:32px 28px; color:#1a1a1a; font-size:14px; line-height:1.7;">
                ${bodyHtml}
              </td>
            </tr>
            ${unsubscribeUrl ? `
            <tr>
              <td style="padding:0 28px 24px; text-align:center;">
                <a href="${unsubscribeUrl}" style="color:#999; font-size:11px; text-decoration:underline;">Cancelar subscrição</a>
              </td>
            </tr>` : ""}
          </table>
        </td>
      </tr>
    </table>
  `;
}

async function sendOne(resendKey: string, to: string, subject: string, html: string) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: FROM_ADDRESS, to, subject, html }),
  });
  return res.ok;
}

async function sendBatch(resendKey: string, emails: { to: string; subject: string; html: string }[]) {
  const res = await fetch("https://api.resend.com/emails/batch", {
    method: "POST",
    headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
    body: JSON.stringify(emails.map((e) => ({ from: FROM_ADDRESS, to: e.to, subject: e.subject, html: e.html }))),
  });
  return res.ok;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { mode, toEmail, emails: selectedEmails, subject, message } = await req.json();
    if (!subject || !message) throw new Error("Falta o assunto ou a mensagem.");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: settings } = await supabase.from("store_settings").select("store_name").eq("id", 1).single();
    const storeName = settings?.store_name || "Trendout";
    const resendKey = Deno.env.get("RESEND_API_KEY")!;

    if (mode === "single") {
      if (!toEmail) throw new Error("Falta o email do cliente.");
      const html = emailHtml(storeName, message, null);
      const ok = await sendOne(resendKey, toEmail, subject, html);
      if (!ok) throw new Error("O Resend recusou o envio.");

      await supabase.from("newsletter_subscribers").update({ last_contacted_at: new Date().toISOString() }).eq("email", toEmail);

      return new Response(JSON.stringify({ sent: 1 }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 });
    }

    if (mode === "selected" || mode === "broadcast") {
      let subs;
      if (mode === "selected") {
        if (!Array.isArray(selectedEmails) || selectedEmails.length === 0) throw new Error("Nenhum contacto selecionado.");
        const { data, error } = await supabase
          .from("newsletter_subscribers")
          .select("email, unsubscribe_token")
          .in("email", selectedEmails)
          .eq("active", true);
        if (error) throw error;
        subs = data;
      } else {
        const { data, error } = await supabase
          .from("newsletter_subscribers")
          .select("email, unsubscribe_token")
          .eq("active", true);
        if (error) throw error;
        subs = data;
      }

      let sent = 0;
      const sentEmails: string[] = [];
      const BATCH_SIZE = 90; // margem por baixo do limite de 100 do Resend por pedido
      for (let i = 0; i < (subs || []).length; i += BATCH_SIZE) {
        const batch = (subs || []).slice(i, i + BATCH_SIZE);
        const emailPayloads = batch.map((s) => ({
          to: s.email,
          subject,
          html: emailHtml(storeName, message, `${Deno.env.get("SUPABASE_URL")}/functions/v1/unsubscribe?token=${s.unsubscribe_token}`),
        }));
        const ok = await sendBatch(resendKey, emailPayloads);
        if (ok) {
          sent += batch.length;
          sentEmails.push(...batch.map((s) => s.email));
        }
      }

      if (sentEmails.length > 0) {
        await supabase
          .from("newsletter_subscribers")
          .update({ last_contacted_at: new Date().toISOString() })
          .in("email", sentEmails);
      }

      return new Response(JSON.stringify({ sent, total: (subs || []).length }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    throw new Error("Modo inválido — usa 'single', 'selected' ou 'broadcast'.");
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
