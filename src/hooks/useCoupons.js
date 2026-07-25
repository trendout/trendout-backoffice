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
        ownerCustomerId: c.owner_customer_id,
        ownerEmail: c.owner_email || "",
        commissionRate: c.commission_rate != null ? Number(c.commission_rate) : 5,
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

  // procura a conta do cliente pelo email, e liga-a ao cupão como "dono" (influenciador)
  const assignInfluencer = async (couponId, email, commissionRate) => {
    if (!email.trim()) {
      const { error } = await supabase.from("coupons").update({ owner_customer_id: null, owner_email: null, commission_rate: commissionRate }).eq("id", couponId);
      if (error) throw error;
      await load();
      return;
    }

    const { data, error: fnErr } = await supabase.functions.invoke("find-customer-by-email", { body: { email: email.trim().toLowerCase() } });
    if (fnErr) throw fnErr;
    if (data?.error) throw new Error(data.error);
    if (!data?.userId) throw new Error("Não encontrei nenhuma conta com esse email.");

    const { error } = await supabase.from("coupons").update({ owner_customer_id: data.userId, owner_email: email.trim().toLowerCase(), commission_rate: commissionRate }).eq("id", couponId);
    if (error) throw error;
    await load();
  };

  return { coupons, loading, addCoupon, toggleCoupon, deleteCoupon, assignInfluencer, reload: load };
}
