import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { slugify } from "../lib/theme";

export function usePages() {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("pages")
      .select("*")
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("Erro a carregar páginas:", error);
      setLoading(false);
      return;
    }

    setPages(
      data.map((p) => ({
        id: p.id,
        title: p.title,
        slug: p.slug,
        content: p.content,
        featuredImage: p.featured_image,
        metaDescription: p.meta_description,
        status: p.status,
        updatedAt: p.updated_at,
      }))
    );
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const savePage = async (page) => {
    const { error } = await supabase.from("pages").upsert({
      id: page.id,
      title: page.title,
      slug: page.slug || slugify(page.title),
      content: page.content,
      featured_image: page.featuredImage,
      meta_description: page.metaDescription,
      status: page.status,
    });
    if (error) throw error;
    await load();
  };

  const deletePage = async (id) => {
    await supabase.from("pages").delete().eq("id", id);
    await load();
  };

  return { pages, loading, savePage, deletePage, reload: load };
}
