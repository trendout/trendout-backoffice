import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { slugify } from "../lib/theme";

export function useCollections() {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("collections")
      .select("*, collection_products(product_id)")
      .order("position");

    if (error) {
      console.error("Erro a carregar coleções:", error);
      setLoading(false);
      return;
    }

    setCollections(
      data.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        description: c.description,
        active: c.is_active,
        productIds: (c.collection_products || []).map((cp) => cp.product_id),
      }))
    );
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const saveCollection = async (collection) => {
    const { data: saved, error } = await supabase
      .from("collections")
      .upsert({
        id: collection.id,
        name: collection.name,
        slug: collection.slug || slugify(collection.name),
        description: collection.description,
        is_active: collection.active,
      })
      .select()
      .single();

    if (error) throw error;

    // substitui a lista de produtos da coleção pela atual
    await supabase.from("collection_products").delete().eq("collection_id", saved.id);
    if (collection.productIds?.length) {
      await supabase.from("collection_products").insert(
        collection.productIds.map((productId, idx) => ({
          collection_id: saved.id,
          product_id: productId,
          position: idx,
        }))
      );
    }

    await load();
  };

  const deleteCollection = async (id) => {
    await supabase.from("collections").delete().eq("id", id);
    await load();
  };

  return { collections, loading, saveCollection, deleteCollection, reload: load };
}
