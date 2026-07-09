import React, { useState } from "react";
import { X, ImagePlus } from "lucide-react";
import { T, inputStyle, Field, Button } from "../lib/theme";
import { uploadImage } from "../lib/uploadImage";

export default function HeroSlideModal({ slide, onClose, onSave }) {
  const [form, setForm] = useState(
    slide || { id: crypto.randomUUID(), eyebrow: "", title: "", ctaLabel: "", href: "", imageUrl: "", active: true }
  );
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleImage = async (file) => {
    if (!file) return;
    setUploading(true);
    setUploadError("");
    try {
      const url = await uploadImage(file);
      update("imageUrl", url);
    } catch (err) {
      setUploadError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const submit = () => {
    if (!form.title.trim()) return;
    onSave(form);
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "flex-start", justifyContent: "center", zIndex: 200, padding: "40px 16px", overflowY: "auto" }}>
      <div style={{ width: "100%", maxWidth: 520, background: T.bgRaised, border: `1px solid ${T.border}`, borderRadius: 14, padding: 28 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 18 }}>
          <h2 style={{ margin: 0, fontFamily: "'Bebas Neue', sans-serif", fontSize: 24 }}>{slide ? "Editar slide" : "Novo slide"}</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", color: T.muted, cursor: "pointer" }}><X size={20} /></button>
        </div>

        <Field label="Imagem de fundo">
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            {form.imageUrl && (
              <img src={form.imageUrl} alt="" style={{ width: 100, height: 60, objectFit: "cover", borderRadius: 8, border: `1px solid ${T.border}` }} />
            )}
            <label style={{ ...inputStyle, display: "flex", alignItems: "center", gap: 8, cursor: "pointer", color: T.muted, width: "auto" }}>
              <ImagePlus size={15} /> {uploading ? "A enviar..." : form.imageUrl ? "Trocar imagem" : "Carregar imagem"}
              <input type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => handleImage(e.target.files[0])} />
            </label>
          </div>
          {uploadError && <div style={{ color: T.danger, fontSize: 12, marginTop: 8 }}>{uploadError}</div>}
        </Field>

        <Field label="Eyebrow (texto pequeno acima do título)">
          <input style={inputStyle} value={form.eyebrow || ""} onChange={(e) => update("eyebrow", e.target.value)} placeholder="Nova coleção" />
        </Field>
        <Field label="Título">
          <input style={inputStyle} value={form.title} onChange={(e) => update("title", e.target.value)} placeholder="TREINA MAIS FORTE" />
        </Field>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <Field label="Texto do botão">
            <input style={inputStyle} value={form.ctaLabel || ""} onChange={(e) => update("ctaLabel", e.target.value)} placeholder="Ver coleção" />
          </Field>
          <Field label="Link do botão">
            <input style={inputStyle} value={form.href || ""} onChange={(e) => update("href", e.target.value)} placeholder="/categoria/Vestuário" />
          </Field>
        </div>

        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, marginBottom: 20, color: T.muted }}>
          <input type="checkbox" checked={form.active} onChange={(e) => update("active", e.target.checked)} style={{ accentColor: T.accent }} />
          Slide ativo (visível na loja)
        </label>

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button onClick={submit}>Guardar slide</Button>
        </div>
      </div>
    </div>
  );
}
