// supabase/functions/create-checkout-session/index.ts
//
// Recebe um order_id (de uma encomenda já criada com status 'pending'),
// vai buscar os artigos dessa encomenda A SÉRIO à base de dados (nunca confia
// em preços vindos do browser), cria uma sessão de pagamento no Stripe,
// e devolve o URL para onde redirecionar o cliente.

import Stripe from "npm:stripe@16";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { orderId, successUrl, cancelUrl } = await req.json();
    if (!orderId) throw new Error("Falta orderId");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Vai buscar a encomenda e os artigos A SÉRIO à base de dados
    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .eq("id", orderId)
      .single();

    if (orderErr || !order) throw new Error("Encomenda não encontrada");
    if (order.payment_status === "paid") throw new Error("Esta encomenda já está paga");

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
      apiVersion: "2024-06-20",
    });

    // Um line item por artigo da encomenda
    const lineItems = order.order_items.map((item: any) => ({
      price_data: {
        currency: "eur",
        product_data: {
          name: `${item.product_name}${item.size ? ` — ${item.size}` : ""}${item.color ? ` (${item.color})` : ""}`,
        },
        unit_amount: Math.round(Number(item.unit_price) * 100),
      },
      quantity: item.quantity,
    }));

    // Portes como linha separada, se houver
    if (Number(order.shipping_cost) > 0) {
      lineItems.push({
        price_data: {
          currency: "eur",
          product_data: { name: "Portes de envio" },
          unit_amount: Math.round(Number(order.shipping_cost) * 100),
        },
        quantity: 1,
      });
    }

    // Desconto de cupão, se houver (Stripe usa "discounts" com um coupon criado on-the-fly)
    let discounts: any[] = [];
    if (Number(order.discount_amount) > 0) {
      const coupon = await stripe.coupons.create({
        amount_off: Math.round(Number(order.discount_amount) * 100),
        currency: "eur",
        duration: "once",
        name: order.coupon_code || "Desconto",
      });
      discounts = [{ coupon: coupon.id }];
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: lineItems,
      discounts,
      customer_email: order.customer_email || undefined,
      success_url: successUrl || `${req.headers.get("origin")}/checkout/sucesso?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${req.headers.get("origin")}/carrinho`,
      metadata: { order_id: order.id, order_number: order.order_number },
    });

    // Guarda a referência da sessão na encomenda
    await supabase.from("orders").update({ stripe_session_id: session.id }).eq("id", order.id);

    return new Response(JSON.stringify({ url: session.url }), {
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
