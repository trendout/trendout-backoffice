import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

export function useLiveVisitors() {
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const cutoff = new Date(Date.now() - 2 * 60 * 1000).toISOString(); // ativos nos últimos 2 min
      const { data, error } = await supabase
        .from("visitor_sessions")
        .select("*")
        .gte("last_seen", cutoff)
        .order("last_seen", { ascending: false });

      if (cancelled) return;
      if (error) { console.error(error); setLoading(false); return; }

      setVisitors(
        data.map((v) => ({
          id: v.id,
          city: v.city,
          country: v.country,
          countryCode: v.country_code,
          currentPage: v.current_page,
          cartStatus: v.cart_status,
          cartValue: v.cart_value != null ? Number(v.cart_value) : null,
          lastSeen: v.last_seen,
        }))
      );
      setLoading(false);
    }

    load();
    const interval = setInterval(load, 5000); // atualiza sozinho a cada 5s
    return () => { cancelled = true; clearInterval(interval); };
  }, []);

  return { visitors, loading };
}
