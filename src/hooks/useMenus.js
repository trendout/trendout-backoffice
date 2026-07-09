import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";

const MENU_KEYS = ["main_nav", "footer_loja", "footer_ajuda", "footer_legal"];

export function useMenus() {
  const [menus, setMenus] = useState({}); // { main_nav: [...items], footer_loja: [...] }
  const [menuIds, setMenuIds] = useState({}); // { main_nav: uuid, ... }
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);

    // garante que os 4 menus existem (idempotente)
    const { data: existingMenus } = await supabase.from("menus").select("*");
    const existingKeys = (existingMenus || []).map((m) => m.key);
    const missing = MENU_KEYS.filter((k) => !existingKeys.includes(k));
    if (missing.length) {
      const labels = { main_nav: "Menu principal", footer_loja: "Rodapé — Loja", footer_ajuda: "Rodapé — Ajuda", footer_legal: "Rodapé — Legal" };
      await supabase.from("menus").insert(missing.map((key) => ({ key, label: labels[key] })));
    }

    const { data: allMenus, error: menusError } = await supabase.from("menus").select("*");
    if (menusError) { console.error(menusError); setLoading(false); return; }

    const ids = {};
    allMenus.forEach((m) => { ids[m.key] = m.id; });
    setMenuIds(ids);

    const { data: items, error: itemsError } = await supabase
      .from("menu_items")
      .select("*, collections(slug)")
      .order("position");
    if (itemsError) { console.error(itemsError); setLoading(false); return; }

    const grouped = {};
    MENU_KEYS.forEach((k) => { grouped[k] = []; });
    items.forEach((it) => {
      const menuKey = allMenus.find((m) => m.id === it.menu_id)?.key;
      if (!menuKey) return;
      grouped[menuKey].push({
        id: it.id,
        label: it.label,
        linkType: it.link_type,
        value: it.link_type === "category" ? it.category : it.link_type === "collection" ? it.collections?.slug : it.custom_url,
        position: it.position,
      });
    });
    setMenus(grouped);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const saveItem = async (menuKey, item, collectionsList) => {
    const menuId = menuIds[menuKey];
    const payload = {
      id: item.id,
      menu_id: menuId,
      label: item.label,
      link_type: item.linkType,
      category: item.linkType === "category" ? item.value : null,
      collection_id: item.linkType === "collection" ? (collectionsList.find((c) => c.slug === item.value)?.id || null) : null,
      custom_url: item.linkType === "custom" ? item.value : null,
      position: item.position ?? (menus[menuKey]?.length || 0),
    };
    await supabase.from("menu_items").upsert(payload);
    await load();
  };

  const deleteItem = async (id) => {
    await supabase.from("menu_items").delete().eq("id", id);
    await load();
  };

  const reorder = async (updates) => {
    await Promise.all(updates.map((u) => supabase.from("menu_items").update({ position: u.position }).eq("id", u.id)));
    await load();
  };

  return { menus, loading, saveItem, deleteItem, reorder, reload: load };
}
