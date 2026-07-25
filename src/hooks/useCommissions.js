import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";

export function useCommissions() {
  const [byCoupon, setByCoupon] = useState({});
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("influencer_commissions")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) { console.error(error); setLoading(false); return; }

    const grouped = {};
    (data || []).forEach((c) => {
      if (!grouped[c.coupon_code]) grouped[c.coupon_code] = [];
      grouped[c.coupon_code].push({
        id: c.id,
        orderId: c.order_id,
        subtotal: Number(c.order_subtotal),
        rate: Number(c.commission_rate),
        amount: Number(c.commission_amount),
        status: c.status,
        createdAt: c.created_at,
      });
    });

    setByCoupon(grouped);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const markPaid = async (ids) => {
    const { error } = await supabase.from("influencer_commissions").update({ status: "paid" }).in("id", ids);
    if (error) throw error;
    await load();
  };

  return { byCoupon, loading, markPaid, reload: load };
}
