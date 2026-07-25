import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

export function useCouponUsage() {
  const [usageByCode, setUsageByCode] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const { data, error } = await supabase
        .from("orders")
        .select("order_number, customer_name, customer_email, coupon_code, discount_amount, total, created_at")
        .not("coupon_code", "is", null)
        .order("created_at", { ascending: false });

      if (cancelled) return;
      if (error) { console.error(error); setLoading(false); return; }

      const grouped = {};
      (data || []).forEach((o) => {
        const code = o.coupon_code;
        if (!grouped[code]) grouped[code] = [];
        grouped[code].push({
          orderNumber: o.order_number,
          customerName: o.customer_name,
          customerEmail: o.customer_email,
          discountAmount: Number(o.discount_amount || 0),
          total: Number(o.total),
          createdAt: o.created_at,
        });
      });

      setUsageByCode(grouped);
      setLoading(false);
    }

    load();
    return () => { cancelled = true; };
  }, []);

  return { usageByCode, loading };
}
