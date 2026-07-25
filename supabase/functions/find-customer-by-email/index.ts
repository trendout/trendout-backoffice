// supabase/functions/find-customer-by-email/index.ts
//
// Usado no backoffice para ligar um cupão a uma conta de cliente existente
// (o influenciador) — só admins podem chamar isto.

import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Não autenticado");

    const { email } = await req.json();
    if (!email) throw new Error("Falta o email.");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userErr } = await supabase.auth.getUser(token);
    if (userErr || !user) throw new Error("Sessão inválida");

    const { data: adminRow } = await supabase.from("admin_profiles").select("id").eq("id", user.id).single();
    if (!adminRow) throw new Error("Sem permissão de admin");

    const { data, error } = await supabase.auth.admin.listUsers({ perPage: 1000 });
    if (error) throw error;

    const found = data.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());

    return new Response(JSON.stringify({ userId: found?.id || null }), {
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
