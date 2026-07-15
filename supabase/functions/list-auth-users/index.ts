// supabase/functions/list-auth-users/index.ts
//
// A lista de Clientes no backoffice, até agora, só via quem já tinha
// feito uma encomenda ou subscrito a newsletter — quem só criou conta
// (sem comprar) ficava invisível. Esta função lista TODAS as contas
// registadas, mas só devolve dados a quem for mesmo admin.

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

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // confirma que quem está a chamar é mesmo um utilizador válido
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userErr } = await supabase.auth.getUser(token);
    if (userErr || !user) throw new Error("Sessão inválida");

    // e que é mesmo admin (não um cliente qualquer)
    const { data: adminRow } = await supabase.from("admin_profiles").select("id").eq("id", user.id).single();
    if (!adminRow) throw new Error("Sem permissão de admin");

    const { data, error } = await supabase.auth.admin.listUsers({ perPage: 1000 });
    if (error) throw error;

    const users = data.users
      .filter((u) => !u.email?.endsWith("@trendout-admin.internal")) // por segurança, mesmo que nunca uses este domínio
      .map((u) => ({
        id: u.id,
        email: u.email,
        createdAt: u.created_at,
        emailConfirmed: !!u.email_confirmed_at,
      }));

    return new Response(JSON.stringify({ users }), {
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
