// supabase/functions/get-order-status/index.ts
//
// A página de confirmação, depois do Stripe redirecionar de volta, precisa
// de saber se o pagamento já foi confirmado — mas um cliente convidado
// (sem sessão) não tem permissão para ler a tabela "orders" diretamente
// (por segurança, só o dono ou a admin podem). Esta função devolve só o
// mínimo necessário (estado, número, total), usando a service role,
// sem expor mais nenhuma encomenda.

import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { orderNumber } = await req.json();
    if (!orderNumber) throw new Error("Falta orderNumber");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data, error } = await supabase
      .from("orders")
      .select("order_number, payment_status, status, total")
      .eq("order_number", orderNumber)
      .single();

    if (error || !data) throw new Error("Encomenda não encontrada");

    return new Response(JSON.stringify(data), {
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
