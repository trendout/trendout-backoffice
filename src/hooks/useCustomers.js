import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";

export function useCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);

    const [{ data: orders, error: ordersErr }, { data: subs, error: subsErr }] = await Promise.all([
      supabase.from("orders").select("customer_id, customer_email, customer_name, total, created_at"),
      supabase.from("newsletter_subscribers").select("email, subscribed_at, active"),
    ]);

    if (ordersErr || subsErr) {
      console.error(ordersErr || subsErr);
      setLoading(false);
      return;
    }

    const map = {};

    (orders || []).forEach((o) => {
      if (!o.customer_email) return;
      const key = o.customer_email.toLowerCase();
      if (!map[key]) {
        map[key] = {
          email: o.customer_email,
          name: o.customer_name || "",
          customerId: o.customer_id || null,
          orderCount: 0,
          totalSpent: 0,
          lastOrderDate: o.created_at,
          firstSeen: o.created_at,
          isNewsletterSubscriber: false,
          hasAccount: false,
          emailConfirmed: false,
        };
      }
      map[key].orderCount += 1;
      map[key].totalSpent += Number(o.total || 0);
      if (o.customer_id) map[key].customerId = o.customer_id;
      if (new Date(o.created_at) > new Date(map[key].lastOrderDate)) map[key].lastOrderDate = o.created_at;
      if (new Date(o.created_at) < new Date(map[key].firstSeen)) map[key].firstSeen = o.created_at;
      if (o.customer_name && !map[key].name) map[key].name = o.customer_name;
    });

    (subs || []).forEach((s) => {
      const key = s.email.toLowerCase();
      if (!map[key]) {
        map[key] = {
          email: s.email,
          name: "",
          orderCount: 0,
          totalSpent: 0,
          lastOrderDate: null,
          firstSeen: s.subscribed_at,
          isNewsletterSubscriber: s.active !== false,
          hasAccount: false,
          emailConfirmed: false,
        };
      } else {
        map[key].isNewsletterSubscriber = s.active !== false;
      }
    });

    // contas registadas na loja (mesmo sem nunca terem comprado nada)
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: usersData, error: usersErr } = await supabase.functions.invoke("list-auth-users");
        if (!usersErr && usersData?.users) {
          usersData.users.forEach((u) => {
            const key = u.email.toLowerCase();
            if (!map[key]) {
              map[key] = {
                email: u.email,
                name: "",
                customerId: u.id,
                orderCount: 0,
                totalSpent: 0,
                lastOrderDate: null,
                firstSeen: u.createdAt,
                isNewsletterSubscriber: false,
                hasAccount: true,
                emailConfirmed: u.emailConfirmed,
              };
            } else {
              map[key].hasAccount = true;
              map[key].emailConfirmed = u.emailConfirmed;
              if (!map[key].customerId) map[key].customerId = u.id;
            }
          });
        }
      }
    } catch (err) {
      console.error("Erro ao carregar contas registadas:", err.message);
    }

    setCustomers(Object.values(map));
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  return { customers, loading, reload: load };
}
