import React, { useState } from "react";
import { X } from "lucide-react";
import { T, inputStyle, Field, Button, slugify } from "../lib/theme";

export default function CategoryModal({ category, isTop, topCategories, onClose, onSave }) {
  const [form, setForm] = useState(
    category || { id: crypto.randomUUID(), name: "", parentId: isTop ? null : (topCategories[0]?.id || null) }
  );

  const submit = () => {
    if (!form.name.trim()) return;
    onSave({ ...form, slug: slugify(form.name) });
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }}>
      <div style={{ width: 340, background: T.bgRaised, border: `1px solid ${T.border}`, borderRadius: 14, padding: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
          <h3 style={{ margin: 0, fontFamily: "'Bebas Neue', sans-serif", fontSize: 20 }}>
            {category ? "Editar categoria" : isTop ? "Nova categoria principal" : "Nova subcategoria"}
          </h3>
          <button onClick={onClose} style={{ background: "none", border: "none", color: T.muted, cursor: "pointer" }}><X size={18} /></button>
        </div>
        <Field label="Nome">
          <input style={inputStyle} value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Ex: Running" />
        </Field>
        {!isTop && (
          <Field label="Categoria principal">
            <select style={inputStyle} value={form.parentId || ""} onChange={(e) => setForm((f) => ({ ...f, parentId: e.target.value }))}>
              {topCategories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </Field>
        )}
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button onClick={submit}>Guardar</Button>
        </div>
      </div>
    </div>
  );
}
