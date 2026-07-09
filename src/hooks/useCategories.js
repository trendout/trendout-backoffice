import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { slugify } from "../lib/theme";

export function useCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("position");

    if (error) {
      console.error("Erro a carregar categorias:", error);
      setLoading(false);
      return;
    }

    setCategories(
      data.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        parentId: c.parent_id,
        position: c.position,
      }))
    );
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const saveCategory = async (cat) => {
    await supabase.from("categories").upsert({
      id: cat.id,
      name: cat.name,
      slug: cat.slug || slugify(cat.name),
      parent_id: cat.parentId || null,
      position: cat.position || 0,
    });
    await load();
  };

  const deleteCategory = async (id) => {
    // elimina também as subcategorias (parent_id = id), como acontece no protótipo
    await supabase.from("categories").delete().or(`id.eq.${id},parent_id.eq.${id}`);
    await load();
  };

  const reorder = async (updates) => {
    // updates: [{ id, position }]
    await Promise.all(updates.map((u) => supabase.from("categories").update({ position: u.position }).eq("id", u.id)));
    setCategories((prev) => prev.map((c) => {
      const u = updates.find((x) => x.id === c.id);
      return u ? { ...c, position: u.position } : c;
    }));
  };

  return { categories, loading, saveCategory, deleteCategory, reorder, reload: load };
}
