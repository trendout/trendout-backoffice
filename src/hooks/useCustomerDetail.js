import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

export function useCustomerDetail(email, customerId) {
  const [addresses, setAddresses] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);

      const ordersPromise = supabase
        .from("orders")
        .select("id, order_number, status, payment_status, total, created_at")
        .eq("customer_email", email)
        .order("created_at", { ascending: false });

      const addressesPromise = customerId
        ? supabase.from("customer_addresses").select("*").eq("customer_id", customerId)
        : Promise.resolve({ data: [] });

      const [{ data: ordersData }, { data: addressesData }] = await Promise.all([ordersPromise, addressesPromise]);

      if (cancelled) return;

      setOrders(
        (ordersData || []).map((o) => ({
          id: o.id,
          orderNumber: o.order_number,
          status: o.status,
          paymentStatus: o.payment_status,
          total: Number(o.total),
          createdAt: o.created_at,
        }))
      );

      setAddresses(
        (addressesData || []).map((a) => ({
          id: a.id,
          label: a.label,
          fullName: a.full_name,
          phone: a.phone,
          address: a.address_line1,
          postalCode: a.postal_code,
          city: a.city,
          country: a.country,
          nif: a.nif,
          isDefaultShipping: a.is_default_shipping,
          isDefaultBilling: a.is_default_billing,
        }))
      );

      setLoading(false);
    }

    if (email) load();
    return () => { cancelled = true; };
  }, [email, customerId]);

  return { addresses, orders, loading };
}
