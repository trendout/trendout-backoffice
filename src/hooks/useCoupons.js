import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";

export function useCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("coupons")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erro a carregar cupões:", error);
      setLoading(false);
      return;
    }

    setCoupons(
      data.map((c) => ({
        id: c.id,
        code: c.code,
        type: c.type,
        value: Number(c.value),
        label: c.label,
        active: c.active,
      }))
    );
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const addCoupon = async (coupon) => {
    const { error } = await supabase.from("coupons").insert({
      code: coupon.code.toUpperCase(),
      type: coupon.type,
      value: coupon.value,
      label: coupon.label || (coupon.type === "percent" ? `${coupon.value}% de desconto` : `${coupon.value}€ de desconto`),
      active: true,
    });
    if (error) throw error;
    await load();
  };

  const toggleCoupon = async (id, active) => {
    await supabase.from("coupons").update({ active }).eq("id", id);
    setCoupons((prev) => prev.map((c) => (c.id === id ? { ...c, active } : c)));
  };

  const deleteCoupon = async (id) => {
    await supabase.from("coupons").delete().eq("id", id);
    await load();
  };

  return { coupons, loading, addCoupon, toggleCoupon, deleteCoupon, reload: load };
}
