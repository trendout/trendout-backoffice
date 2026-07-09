import React, { useState } from "react";
import { Plus, Pencil, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import { T, Button } from "../lib/theme";
import { useHeroSlides } from "../hooks/useHeroSlides";
import HeroSlideModal from "../components/HeroSlideModal";

export default function HeroSlidesPage() {
  const { slides, loading, saveSlide, deleteSlide, reorder } = useHeroSlides();
  const [modalSlide, setModalSlide] = useState(undefined);
  const [deleteId, setDeleteId] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  if (loading) return <div style={{ color: T.muted, fontSize: 13.5 }}>A carregar slides...</div>;

  const save = async (slide) => {
    try {
      await saveSlide(slide);
      setModalSlide(undefined);
    } catch (err) {
      setErrorMsg(err.message || "Erro ao guardar o slide.");
    }
  };

  const move = async (idx, dir) => {
    const target = idx + dir;
    if (target < 0 || target >= slides.length) return;
    const a = slides[idx], b = slides[target];
    await reorder([{ id: a.id, position: b.position }, { id: b.id, position: a.position }]);
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <p style={{ color: T.muted, fontSize: 13, margin: 0, maxWidth: 480 }}>
          Estes slides aparecem em rotação automática no topo da homepage da loja.
        </p>
        <Button onClick={() => setModalSlide(null)}><Plus size={15} /> Novo slide</Button>
      </div>

      {errorMsg && <div style={{ color: T.danger, fontSize: 13, marginBottom: 14 }}>{errorMsg}</div>}

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {slides.map((s, idx) => (
          <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 14, background: T.bgRaised, border: `1px solid ${T.border}`, borderRadius: 10, padding: 14 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <button onClick={() => move(idx, -1)} disabled={idx === 0} style={{ background: "none", border: "none", color: idx === 0 ? "#3a3f3a" : T.muted, cursor: idx === 0 ? "default" : "pointer" }}><ArrowUp size={13} /></button>
              <button onClick={() => move(idx, 1)} disabled={idx === slides.length - 1} style={{ background: "none", border: "none", color: idx === slides.length - 1 ? "#3a3f3a" : T.muted, cursor: idx === slides.length - 1 ? "default" : "pointer" }}><ArrowDown size={13} /></button>
            </div>

            <div style={{ width: 90, height: 54, borderRadius: 6, overflow: "hidden", background: T.bgRaised2, flexShrink: 0 }}>
              {s.imageUrl && <img src={s.imageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 11.5, color: T.accent, textTransform: "uppercase", letterSpacing: 0.4 }}>{s.eyebrow}</div>
              <div style={{ fontWeight: 700, fontSize: 14, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.title}</div>
              <div style={{ fontSize: 12, color: T.muted }}>{s.ctaLabel} → {s.href}</div>
            </div>

            <span style={{ fontSize: 11.5, color: s.active ? T.accent : T.muted, whiteSpace: "nowrap" }}>{s.active ? "Ativo" : "Inativo"}</span>

            <button onClick={() => setModalSlide(s)} style={{ background: "none", border: "none", color: T.text, cursor: "pointer" }}><Pencil size={15} /></button>
            <button onClick={() => setDeleteId(s.id)} style={{ background: "none", border: "none", color: T.danger, cursor: "pointer" }}><Trash2 size={15} /></button>
          </div>
        ))}
        {slides.length === 0 && (
          <div style={{ padding: 28, textAlign: "center", color: T.muted, background: T.bgRaised, border: `1px solid ${T.border}`, borderRadius: 12 }}>
            Sem slides criados — a loja mostra um slide padrão enquanto não criares nenhum.
          </div>
        )}
      </div>

      {modalSlide !== undefined && (
        <HeroSlideModal slide={modalSlide} onClose={() => setModalSlide(undefined)} onSave={save} />
      )}

      {deleteId && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }}>
          <div style={{ background: T.bgRaised, border: `1px solid ${T.border}`, borderRadius: 12, padding: 24, width: 320 }}>
            <p style={{ marginTop: 0, fontSize: 14 }}>Eliminar este slide?</p>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <Button variant="ghost" onClick={() => setDeleteId(null)}>Cancelar</Button>
              <Button variant="danger" onClick={async () => { await deleteSlide(deleteId); setDeleteId(null); }}>Eliminar</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
