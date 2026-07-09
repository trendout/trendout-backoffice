import React, { useState } from "react";
import { Plus, Pencil, Trash2, ArrowUp, ArrowDown, Link as LinkIcon } from "lucide-react";
import { T, Button } from "../lib/theme";
import { useMenus } from "../hooks/useMenus";
import { useCategories } from "../hooks/useCategories";
import { useCollections } from "../hooks/useCollections";
import MenuItemModal from "../components/MenuItemModal";

const MENU_DEFS = [
  { key: "main_nav", label: "Menu principal (topo do site)" },
  { key: "footer_loja", label: "Rodapé — Loja" },
  { key: "footer_ajuda", label: "Rodapé — Ajuda" },
  { key: "footer_legal", label: "Rodapé — Legal" },
];

export default function NavigationPage() {
  const { menus, loading, saveItem, deleteItem, reorder } = useMenus();
  const { categories, loading: categoriesLoading } = useCategories();
  const { collections, loading: collectionsLoading } = useCollections();
  const [activeMenu, setActiveMenu] = useState("main_nav");
  const [modalItem, setModalItem] = useState(undefined);

  if (loading || categoriesLoading || collectionsLoading) {
    return <div style={{ color: T.muted, fontSize: 13.5 }}>A carregar navegação...</div>;
  }

  const items = menus[activeMenu] || [];

  const move = async (idx, dir) => {
    const target = idx + dir;
    if (target < 0 || target >= items.length) return;
    const a = items[idx], b = items[target];
    await reorder([{ id: a.id, position: b.position }, { id: b.id, position: a.position }]);
  };

  const save = async (item) => {
    await saveItem(activeMenu, item, collections);
    setModalItem(undefined);
  };

  const describeTarget = (item) => {
    if (item.linkType === "category") return `Categoria: ${item.value}`;
    if (item.linkType === "collection") return `Coleção: ${collections.find((c) => c.slug === item.value)?.name || item.value}`;
    return `Link: ${item.value}`;
  };

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {MENU_DEFS.map((m) => (
          <button
            key={m.key}
            onClick={() => setActiveMenu(m.key)}
            style={{
              padding: "8px 14px", borderRadius: 8, fontSize: 12.5, cursor: "pointer",
              border: `1px solid ${activeMenu === m.key ? T.accent : T.border}`,
              background: activeMenu === m.key ? "rgba(201,255,63,0.08)" : "transparent",
              color: activeMenu === m.key ? T.accent : T.muted,
            }}
          >
            {m.label}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 14 }}>
        <Button onClick={() => setModalItem(null)}><Plus size={15} /> Novo item</Button>
      </div>

      <div style={{ background: T.bgRaised, border: `1px solid ${T.border}`, borderRadius: 12, overflow: "hidden" }}>
        {items.map((item, idx) => (
          <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderTop: idx > 0 ? `1px solid ${T.border}` : "none" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <button onClick={() => move(idx, -1)} disabled={idx === 0} style={{ background: "none", border: "none", color: idx === 0 ? "#3a3f3a" : T.muted, cursor: idx === 0 ? "default" : "pointer" }}><ArrowUp size={13} /></button>
              <button onClick={() => move(idx, 1)} disabled={idx === items.length - 1} style={{ background: "none", border: "none", color: idx === items.length - 1 ? "#3a3f3a" : T.muted, cursor: idx === items.length - 1 ? "default" : "pointer" }}><ArrowDown size={13} /></button>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 13.5 }}>{item.label}</div>
              <div style={{ fontSize: 12, color: T.muted, display: "flex", alignItems: "center", gap: 4 }}><LinkIcon size={11} /> {describeTarget(item)}</div>
            </div>
            <button onClick={() => setModalItem(item)} style={{ background: "none", border: "none", color: T.text, cursor: "pointer" }}><Pencil size={15} /></button>
            <button onClick={() => deleteItem(item.id)} style={{ background: "none", border: "none", color: T.danger, cursor: "pointer" }}><Trash2 size={15} /></button>
          </div>
        ))}
        {items.length === 0 && <div style={{ padding: 28, textAlign: "center", color: T.muted }}>Sem itens neste menu.</div>}
      </div>

      {modalItem !== undefined && (
        <MenuItemModal item={modalItem} categories={categories} collections={collections} onClose={() => setModalItem(undefined)} onSave={save} />
      )}
    </div>
  );
}
