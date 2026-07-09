import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

/**
 * Conta encomendas que ainda precisam de atenção (pendentes de pagamento ou
 * já pagas mas ainda não processadas) — usado no selo junto a "Encomendas".
 */
export function useNewOrdersCount() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const { count: c } = await supabase
        .from("orders")
        .select("id", { count: "exact", head: true })
        .in("status", ["pending", "confirmed"]);
      if (!cancelled) setCount(c || 0);
    }

    load();
    const interval = setInterval(load, 20000); // atualiza sozinho a cada 20s
    return () => { cancelled = true; clearInterval(interval); };
  }, []);

  return count;
}
