import React, { useState } from "react";
import { Plus, Pencil, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import { T, Button } from "../lib/theme";
import { useCategories } from "../hooks/useCategories";
import CategoryModal from "../components/CategoryModal";

export default function CategoriesPage() {
  const { categories, loading, saveCategory, deleteCategory, reorder } = useCategories();
  const [modal, setModal] = useState(undefined); // { category, isTop, parentId }
  const [deleteId, setDeleteId] = useState(null);

  if (loading) return <div style={{ color: T.muted, fontSize: 13.5 }}>A carregar categorias...</div>;

  const topCategories = categories.filter((c) => !c.parentId).sort((a, b) => a.position - b.position);
  const subsOf = (id) => categories.filter((c) => c.parentId === id).sort((a, b) => a.position - b.position);

  const handleSave = async (cat, isTop) => {
    const siblings = categories.filter((c) => c.parentId === (isTop ? null : cat.parentId));
    const exists = categories.some((c) => c.id === cat.id);
    await saveCategory({ ...cat, position: exists ? cat.position : siblings.length });
    setModal(undefined);
  };

  const move = async (list, idx, dir) => {
    const target = idx + dir;
    if (target < 0 || target >= list.length) return;
    const a = list[idx], b = list[target];
    await reorder([{ id: a.id, position: b.position }, { id: b.id, position: a.position }]);
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 20 }}>
        <Button onClick={() => setModal({ category: null, isTop: true })}><Plus size={15} /> Nova categoria principal</Button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {topCategories.map((top, ti) => {
          const subs = subsOf(top.id);
          return (
            <div key={top.id} style={{ background: T.bgRaised, border: `1px solid ${T.border}`, borderRadius: 12, overflow: "hidden" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", background: T.bgRaised2 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  <button onClick={() => move(topCategories, ti, -1)} disabled={ti === 0} style={{ background: "none", border: "none", color: ti === 0 ? "#3a3f3a" : T.muted, cursor: ti === 0 ? "default" : "pointer" }}><ArrowUp size={12} /></button>
                  <button onClick={() => move(topCategories, ti, 1)} disabled={ti === topCategories.length - 1} style={{ background: "none", border: "none", color: ti === topCategories.length - 1 ? "#3a3f3a" : T.muted, cursor: ti === topCategories.length - 1 ? "default" : "pointer" }}><ArrowDown size={12} /></button>
                </div>
                <div style={{ fontWeight: 700, fontSize: 14, flex: 1 }}>{top.name}</div>
                <span style={{ fontSize: 11.5, color: T.muted }}>/{top.slug}</span>
                <button onClick={() => setModal({ category: top, isTop: true })} style={{ background: "none", border: "none", color: T.text, cursor: "pointer" }}><Pencil size={14} /></button>
                <button onClick={() => setDeleteId(top.id)} style={{ background: "none", border: "none", color: T.danger, cursor: "pointer" }}><Trash2 size={14} /></button>
              </div>
              {subs.map((sub, si) => (
                <div key={sub.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 16px 10px 40px", borderTop: `1px solid ${T.border}` }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                    <button onClick={() => move(subs, si, -1)} disabled={si === 0} style={{ background: "none", border: "none", color: si === 0 ? "#3a3f3a" : T.muted, cursor: si === 0 ? "default" : "pointer" }}><ArrowUp size={11} /></button>
                    <button onClick={() => move(subs, si, 1)} disabled={si === subs.length - 1} style={{ background: "none", border: "none", color: si === subs.length - 1 ? "#3a3f3a" : T.muted, cursor: si === subs.length - 1 ? "default" : "pointer" }}><ArrowDown size={11} /></button>
                  </div>
                  <div style={{ fontSize: 13, flex: 1 }}>{sub.name}</div>
                  <span style={{ fontSize: 11.5, color: T.muted }}>/{top.slug}/{sub.slug}</span>
                  <button onClick={() => setModal({ category: sub, isTop: false })} style={{ background: "none", border: "none", color: T.text, cursor: "pointer" }}><Pencil size={13} /></button>
                  <button onClick={() => setDeleteId(sub.id)} style={{ background: "none", border: "none", color: T.danger, cursor: "pointer" }}><Trash2 size={13} /></button>
                </div>
              ))}
              <div style={{ padding: "10px 16px 10px 40px", borderTop: subs.length ? `1px solid ${T.border}` : "none" }}>
                <button
                  onClick={() => setModal({ category: null, isTop: false, parentId: top.id })}
                  style={{ background: "none", border: "none", color: T.accent, cursor: "pointer", fontSize: 12.5, display: "flex", alignItems: "center", gap: 5, padding: 0 }}
                >
                  <Plus size={12} /> Adicionar subcategoria
                </button>
              </div>
            </div>
          );
        })}
        {topCategories.length === 0 && (
          <div style={{ padding: 28, textAlign: "center", color: T.muted, background: T.bgRaised, border: `1px solid ${T.border}`, borderRadius: 12 }}>
            Sem categorias criadas.
          </div>
        )}
      </div>

      {modal !== undefined && (
        <CategoryModal
          category={modal.category ? modal.category : (modal.parentId ? { id: crypto.randomUUID(), name: "", parentId: modal.parentId } : null)}
          isTop={modal.isTop}
          topCategories={topCategories}
          onClose={() => setModal(undefined)}
          onSave={(cat) => handleSave(cat, modal.isTop)}
        />
      )}

      {deleteId && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }}>
          <div style={{ background: T.bgRaised, border: `1px solid ${T.border}`, borderRadius: 12, padding: 24, width: 320 }}>
            <p style={{ marginTop: 0, fontSize: 14 }}>Eliminar esta categoria? As subcategorias associadas também são eliminadas.</p>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <Button variant="ghost" onClick={() => setDeleteId(null)}>Cancelar</Button>
              <Button variant="danger" onClick={async () => { await deleteCategory(deleteId); setDeleteId(null); }}>Eliminar</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
