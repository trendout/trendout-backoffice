import React, { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { T, Button } from "../lib/theme";
import { usePages } from "../hooks/usePages";
import PageModal from "../components/PageModal";

export default function PagesPage() {
  const { pages, loading, savePage, deletePage } = usePages();
  const [modalPage, setModalPage] = useState(undefined);
  const [deleteId, setDeleteId] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  if (loading) return <div style={{ color: T.muted, fontSize: 13.5 }}>A carregar páginas...</div>;

  const save = async (p) => {
    try {
      await savePage(p);
      setModalPage(undefined);
    } catch (err) {
      setErrorMsg(err.message || "Erro ao guardar a página (o slug pode já existir).");
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 20 }}>
        <Button onClick={() => setModalPage(null)}><Plus size={15} /> Nova página</Button>
      </div>

      {errorMsg && <div style={{ color: T.danger, fontSize: 13, marginBottom: 14 }}>{errorMsg}</div>}

      <div style={{ background: T.bgRaised, border: `1px solid ${T.border}`, borderRadius: 12, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
          <thead>
            <tr style={{ background: T.bgRaised2, textAlign: "left" }}>
              {["Página", "Slug", "Estado", "Atualizada", ""].map((h) => (
                <th key={h} style={{ padding: "12px 16px", color: T.muted, fontWeight: 600, fontSize: 11.5, textTransform: "uppercase", letterSpacing: 0.4 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pages.map((p) => (
              <tr key={p.id} style={{ borderTop: `1px solid ${T.border}` }}>
                <td style={{ padding: "12px 16px", fontWeight: 600 }}>{p.title}</td>
                <td style={{ padding: "12px 16px", color: T.muted }}>/{p.slug}</td>
                <td style={{ padding: "12px 16px" }}>
                  <span style={{ fontSize: 12, color: p.status === "published" ? T.accent : T.muted }}>{p.status === "published" ? "Publicada" : "Rascunho"}</span>
                </td>
                <td style={{ padding: "12px 16px", color: T.muted }}>{p.updatedAt ? new Date(p.updatedAt).toLocaleDateString("pt-PT") : "—"}</td>
                <td style={{ padding: "12px 16px", textAlign: "right", whiteSpace: "nowrap" }}>
                  <button onClick={() => setModalPage(p)} style={{ background: "none", border: "none", color: T.text, cursor: "pointer", marginRight: 10 }}><Pencil size={15} /></button>
                  <button onClick={() => setDeleteId(p.id)} style={{ background: "none", border: "none", color: T.danger, cursor: "pointer" }}><Trash2 size={15} /></button>
                </td>
              </tr>
            ))}
            {pages.length === 0 && (
              <tr><td colSpan={5} style={{ padding: 28, textAlign: "center", color: T.muted }}>Sem páginas criadas.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {modalPage !== undefined && (
        <PageModal page={modalPage} onClose={() => setModalPage(undefined)} onSave={save} />
      )}

      {deleteId && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }}>
          <div style={{ background: T.bgRaised, border: `1px solid ${T.border}`, borderRadius: 12, padding: 24, width: 320 }}>
            <p style={{ marginTop: 0, fontSize: 14 }}>Eliminar esta página?</p>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <Button variant="ghost" onClick={() => setDeleteId(null)}>Cancelar</Button>
              <Button variant="danger" onClick={async () => { await deletePage(deleteId); setDeleteId(null); }}>Eliminar</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
