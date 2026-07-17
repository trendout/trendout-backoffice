import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";

export function useAbandonedCarts() {
  const [carts, setCarts] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("cart_snapshots")
      .select("*")
      .order("updated_at", { ascending: false });

    if (error) { console.error(error); setLoading(false); return; }

    setCarts(
      data.map((c) => ({
        id: c.id,
        customerId: c.customer_id,
        customerEmail: c.customer_email,
        items: Array.isArray(c.items) ? c.items : [],
        subtotal: Number(c.subtotal),
        updatedAt: c.updated_at,
        reminderSentAt: c.reminder_sent_at,
      }))
    );
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const sendReminderNow = async (cartId) => {
    const { error } = await supabase.functions.invoke("send-abandoned-cart-emails", { body: { cartId } });
    if (error) throw error;
    await load();
  };

  return { carts, loading, reload: load, sendReminderNow };
}
