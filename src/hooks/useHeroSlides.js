import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";

export function useHeroSlides() {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from("hero_slides").select("*").order("position");
    if (error) { console.error(error); setLoading(false); return; }

    setSlides(
      data.map((s) => ({
        id: s.id,
        eyebrow: s.eyebrow,
        title: s.title,
        ctaLabel: s.cta_label,
        href: s.href,
        imageUrl: s.image_url,
        position: s.position,
        active: s.is_active,
      }))
    );
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const saveSlide = async (slide) => {
    const exists = slides.some((s) => s.id === slide.id);
    const { error } = await supabase.from("hero_slides").upsert({
      id: slide.id,
      eyebrow: slide.eyebrow,
      title: slide.title,
      cta_label: slide.ctaLabel,
      href: slide.href,
      image_url: slide.imageUrl,
      is_active: slide.active,
      position: exists ? slide.position : slides.length,
    });
    if (error) throw error;
    await load();
  };

  const deleteSlide = async (id) => {
    await supabase.from("hero_slides").delete().eq("id", id);
    await load();
  };

  const reorder = async (updates) => {
    await Promise.all(updates.map((u) => supabase.from("hero_slides").update({ position: u.position }).eq("id", u.id)));
    await load();
  };

  return { slides, loading, saveSlide, deleteSlide, reorder, reload: load };
}
