import React, { useState } from "react";
import { X } from "lucide-react";
import { T, inputStyle, Field, Button } from "../lib/theme";

export default function CollectionModal({ collection, products, onClose, onSave }) {
  const [form, setForm] = useState(
    collection || { id: crypto.randomUUID(), name: "", slug: "", description: "", active: true, productIds: [] }
  );

  const toggleProduct = (id) => setForm((f) => ({
    ...f,
    productIds: f.productIds.includes(id) ? f.productIds.filter((x) => x !== id) : [...f.productIds, id],
  }));

  const submit = () => {
    if (!form.name.trim()) return;
    onSave(form);
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "flex-start", justifyContent: "center", zIndex: 200, padding: "40px 16px", overflowY: "auto" }}>
      <div style={{ width: "100%", maxWidth: 520, background: T.bgRaised, border: `1px solid ${T.border}`, borderRadius: 14, padding: 28 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 18 }}>
          <h2 style={{ margin: 0, fontFamily: "'Bebas Neue', sans-serif", fontSize: 24 }}>{collection ? "Editar coleção" : "Nova coleção"}</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", color: T.muted, cursor: "pointer" }}><X size={20} /></button>
        </div>

        <Field label="Nome da coleção">
          <input style={inputStyle} value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Ex: Novidades" />
        </Field>
        <Field label="Slug (URL)">
          <input style={inputStyle} value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} placeholder="novidades (gerado automaticamente se vazio)" />
        </Field>
        <Field label="Descrição">
          <textarea style={{ ...inputStyle, minHeight: 60, resize: "vertical" }} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
        </Field>

        <div style={{ fontSize: 12, color: T.muted, fontWeight: 600, letterSpacing: 0.3, textTransform: "uppercase", marginBottom: 8 }}>Produtos na coleção</div>
        <div style={{ maxHeight: 220, overflowY: "auto", border: `1px solid ${T.border}`, borderRadius: 8, marginBottom: 18 }}>
          {products.map((p) => (
            <label key={p.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderBottom: `1px solid ${T.border}`, fontSize: 13, cursor: "pointer" }}>
              <input type="checkbox" checked={form.productIds.includes(p.id)} onChange={() => toggleProduct(p.id)} style={{ accentColor: T.accent }} />
              {p.name}
              <span style={{ marginLeft: "auto", color: T.muted, fontSize: 12 }}>{p.category}</span>
            </label>
          ))}
          {products.length === 0 && <div style={{ padding: 16, color: T.muted, fontSize: 13 }}>Sem produtos criados ainda.</div>}
        </div>

        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, marginBottom: 20, color: T.muted }}>
          <input type="checkbox" checked={form.active} onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))} style={{ accentColor: T.accent }} />
          Coleção ativa na loja
        </label>

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button onClick={submit}>Guardar coleção</Button>
        </div>
      </div>
    </div>
  );
}
