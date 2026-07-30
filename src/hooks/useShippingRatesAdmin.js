import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";

export function useShippingRatesAdmin() {
  const [rates, setRates] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from("shipping_rates").select("*").order("country_code");
    if (error) { console.error(error); setLoading(false); return; }

    setRates(
      data.map((r) => ({
        id: r.id,
        countryCode: r.country_code,
        label: r.label,
        standardPrice: Number(r.standard_price),
        expressPrice: Number(r.express_price),
        standardEta: r.standard_eta,
        expressEta: r.express_eta,
        freeEligible: r.free_eligible,
        freeShippingThreshold: r.free_shipping_threshold != null ? Number(r.free_shipping_threshold) : null,
      }))
    );
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const saveRate = async (rate) => {
    const { error } = await supabase.from("shipping_rates").update({
      label: rate.label,
      standard_price: rate.standardPrice,
      express_price: rate.expressPrice,
      standard_eta: rate.standardEta,
      express_eta: rate.expressEta,
      free_eligible: rate.freeEligible,
      free_shipping_threshold: rate.freeShippingThreshold,
    }).eq("id", rate.id);
    if (error) throw error;
    await load();
  };

  return { rates, loading, saveRate, reload: load };
}
