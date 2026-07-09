import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";

export function useVatRates() {
  const [rates, setRates] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from("vat_rates").select("*").order("country_code");
    if (error) { console.error(error); setLoading(false); return; }
    setRates(data.map((r) => ({ id: r.id, countryCode: r.country_code, label: r.label, ratePercent: Number(r.rate_percent) })));
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const updateRate = async (id, ratePercent) => {
    await supabase.from("vat_rates").update({ rate_percent: ratePercent }).eq("id", id);
    setRates((prev) => prev.map((r) => (r.id === id ? { ...r, ratePercent } : r)));
  };

  const addMarket = async (countryCode, label, ratePercent) => {
    const { error } = await supabase.from("vat_rates").insert({ country_code: countryCode, label, rate_percent: ratePercent });
    if (error) throw error;
    await load();
  };

  const deleteMarket = async (id) => {
    await supabase.from("vat_rates").delete().eq("id", id);
    await load();
  };

  return { rates, loading, updateRate, addMarket, deleteMarket, reload: load };
}
