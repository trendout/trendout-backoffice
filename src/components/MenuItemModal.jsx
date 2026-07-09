import React, { useState } from "react";
import { X } from "lucide-react";
import { T, inputStyle, Field, Button } from "../lib/theme";

export default function MenuItemModal({ item, categories, collections, onClose, onSave }) {
  const categoryNames = categories.map((c) => c.name);
  const [form, setForm] = useState(item || { id: crypto.randomUUID(), label: "", linkType: "category", value: categoryNames[0] || "" });

  const submit = () => {
    if (!form.label.trim() || !form.value) return;
    onSave(form);
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }}>
      <div style={{ width: 360, background: T.bgRaised, border: `1px solid ${T.border}`, borderRadius: 14, padding: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
          <h3 style={{ margin: 0, fontFamily: "'Bebas Neue', sans-serif", fontSize: 20 }}>{item ? "Editar item" : "Novo item de menu"}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", color: T.muted, cursor: "pointer" }}><X size={18} /></button>
        </div>
        <Field label="Texto do link">
          <input style={inputStyle} value={form.label} onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))} placeholder="Ex: Novidades" />
        </Field>
        <Field label="Tipo de destino">
          <select
            style={inputStyle}
            value={form.linkType}
            onChange={(e) => {
              const linkType = e.target.value;
              const value = linkType === "category" ? (categoryNames[0] || "") : linkType === "collection" ? (collections[0]?.slug || "") : "";
              setForm((f) => ({ ...f, linkType, value }));
            }}
          >
            <option value="category">Categoria</option>
            <option value="collection">Coleção</option>
            <option value="custom">Link personalizado</option>
          </select>
        </Field>
        {form.linkType === "category" && (
          <Field label="Categoria">
            <select style={inputStyle} value={form.value} onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))}>
              {categoryNames.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
        )}
        {form.linkType === "collection" && (
          <Field label="Coleção">
            <select style={inputStyle} value={form.value} onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))}>
              {collections.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
            </select>
          </Field>
        )}
        {form.linkType === "custom" && (
          <Field label="URL">
            <input style={inputStyle} value={form.value} onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))} placeholder="/ajuda/envios" />
          </Field>
        )}
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button onClick={submit}>Guardar item</Button>
        </div>
      </div>
    </div>
  );
}
