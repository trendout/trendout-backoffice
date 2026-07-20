// supabase/functions/unsubscribe/index.ts
//
// Link presente em todos os emails de campanha — cancela a subscrição sem
// precisar de sessão nenhuma. Não usamos HTML sofisticado aqui (o Supabase
// força text/plain nas Edge Functions), só uma mensagem simples de confirmação.

import { createClient } from "npm:@supabase/supabase-js@2";

Deno.serve(async (req) => {
  const url = new URL(req.url);
  const token = url.searchParams.get("token");

  if (!token) {
    return new Response("Falta o código de cancelamento.", { status: 400 });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const { error } = await supabase
    .from("newsletter_subscribers")
    .update({ active: false })
    .eq("unsubscribe_token", token);

  if (error) {
    return new Response("Não foi possível cancelar a subscrição. Tenta outra vez mais tarde.", { status: 400 });
  }

  return new Response(
    "Subscrição cancelada com sucesso. Já não vais receber mais emails da Trendout.\n\nPodes fechar esta página.",
    { status: 200, headers: { "Content-Type": "text/plain; charset=utf-8" } }
  );
});
