import React, { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { T, Button } from "../lib/theme";
import { useCollections } from "../hooks/useCollections";
import { useProducts } from "../hooks/useSupabaseData";
import CollectionModal from "../components/CollectionModal";

export default function CollectionsPage() {
  const { collections, loading, saveCollection, deleteCollection } = useCollections();
  const { products, loading: productsLoading } = useProducts();
  const [modalCollection, setModalCollection] = useState(undefined);
  const [deleteId, setDeleteId] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  if (loading || productsLoading) return <div style={{ color: T.muted, fontSize: 13.5 }}>A carregar coleções...</div>;

  const save = async (c) => {
    try {
      await saveCollection(c);
      setModalCollection(undefined);
    } catch (err) {
      setErrorMsg(err.message || "Erro ao guardar a coleção.");
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 20 }}>
        <Button onClick={() => setModalCollection(null)}><Plus size={15} /> Nova coleção</Button>
      </div>

      {errorMsg && <div style={{ color: T.danger, fontSize: 13, marginBottom: 14 }}>{errorMsg}</div>}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 14 }}>
        {collections.map((c) => (
          <div key={c.id} style={{ background: T.bgRaised, border: `1px solid ${T.border}`, borderRadius: 12, padding: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 20 }}>{c.name}</div>
              <span style={{ fontSize: 11.5, color: c.active ? T.accent : T.muted }}>{c.active ? "Ativa" : "Inativa"}</span>
            </div>
            <div style={{ fontSize: 12.5, color: T.muted, margin: "6px 0 12px" }}>{c.description}</div>
            <div style={{ fontSize: 12.5, color: T.text, marginBottom: 14 }}>{c.productIds.length} produto{c.productIds.length !== 1 ? "s" : ""}</div>
            <div style={{ display: "flex", gap: 8 }}>
              <Button variant="ghost" style={{ flex: 1, padding: "7px 10px", fontSize: 12.5 }} onClick={() => setModalCollection(c)}><Pencil size={13} /> Editar</Button>
              <button onClick={() => setDeleteId(c.id)} style={{ background: "none", border: `1px solid ${T.border}`, borderRadius: 8, color: T.danger, cursor: "pointer", padding: "0 10px" }}><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
        {collections.length === 0 && (
          <div style={{ gridColumn: "1/-1", padding: 28, textAlign: "center", color: T.muted, background: T.bgRaised, border: `1px solid ${T.border}`, borderRadius: 12 }}>
            Sem coleções criadas.
          </div>
        )}
      </div>

      {modalCollection !== undefined && (
        <CollectionModal collection={modalCollection} products={products} onClose={() => setModalCollection(undefined)} onSave={save} />
      )}

      {deleteId && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }}>
          <div style={{ background: T.bgRaised, border: `1px solid ${T.border}`, borderRadius: 12, padding: 24, width: 320 }}>
            <p style={{ marginTop: 0, fontSize: 14 }}>Eliminar esta coleção?</p>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <Button variant="ghost" onClick={() => setDeleteId(null)}>Cancelar</Button>
              <Button variant="danger" onClick={async () => { await deleteCollection(deleteId); setDeleteId(null); }}>Eliminar</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
