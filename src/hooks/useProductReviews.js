import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";

export function useProductReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("product_reviews")
      .select("*, products(name, slug, images)")
      .order("created_at", { ascending: false });

    if (error) { console.error(error); setLoading(false); return; }

    setReviews(
      data.map((r) => ({
        id: r.id,
        productId: r.product_id,
        productName: r.products?.name || "(produto removido)",
        productImage: r.products?.images?.[0] || null,
        customerName: r.customer_name,
        rating: r.rating,
        comment: r.comment || "",
        status: r.status,
        createdAt: r.created_at,
      }))
    );
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const updateStatus = async (id, status) => {
    const { error } = await supabase.from("product_reviews").update({ status }).eq("id", id);
    if (error) throw error;
    setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
  };

  const remove = async (id) => {
    const { error } = await supabase.from("product_reviews").delete().eq("id", id);
    if (error) throw error;
    setReviews((prev) => prev.filter((r) => r.id !== id));
  };

  return { reviews, loading, updateStatus, remove, reload: load };
}
