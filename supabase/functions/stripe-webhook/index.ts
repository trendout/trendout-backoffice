// supabase/functions/stripe-webhook/index.ts
//
// O Stripe chama este endpoint sozinho quando um pagamento é concluído
// (ou falha). Confirma a assinatura para garantir que o pedido vem mesmo
// do Stripe, e atualiza a encomenda correspondente.

import Stripe from "npm:stripe@16";
import { createClient } from "npm:@supabase/supabase-js@2";

Deno.serve(async (req) => {
  const signature = req.headers.get("stripe-signature");
  const body = await req.text();

  const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
    apiVersion: "2024-06-20",
  });

  let event;
  try {
    event = await stripe.webhooks.constructEventAsync(
      body,
      signature!,
      Deno.env.get("STRIPE_WEBHOOK_SECRET")!
    );
  } catch (err) {
    console.error("Assinatura inválida:", err.message);
    return new Response(`Webhook signature error: ${err.message}`, { status: 400 });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as any;
    const orderId = session.metadata?.order_id;

    if (orderId) {
      let last4: string | null = null;
      try {
        if (session.payment_intent) {
          const paymentIntent = await stripe.paymentIntents.retrieve(session.payment_intent, {
            expand: ["latest_charge.payment_method_details"],
          });
          last4 = (paymentIntent as any).latest_charge?.payment_method_details?.card?.last4 || null;
        }
      } catch (err) {
        console.error("Não foi possível obter os últimos 4 dígitos do cartão:", err.message);
      }

      await supabase
        .from("orders")
        .update({
          payment_status: "paid",
          status: "confirmed",
          stripe_payment_intent_id: session.payment_intent,
          card_last4: last4,
        })
        .eq("id", orderId);
    }
  }

  if (event.type === "checkout.session.expired") {
    const session = event.data.object as any;
    const orderId = session.metadata?.order_id;
    if (orderId) {
      await supabase.from("orders").update({ status: "cancelled" }).eq("id", orderId);
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { "Content-Type": "application/json" },
    status: 200,
  });
});
