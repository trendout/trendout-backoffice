import React, { useState } from "react";
import { X, ImagePlus } from "lucide-react";
import { T, inputStyle, Field, Button } from "../lib/theme";
import { uploadImage } from "../lib/uploadImage";
import RichTextEditor from "./RichTextEditor";

export default function PageModal({ page, onClose, onSave }) {
  const [form, setForm] = useState(
    page || { id: crypto.randomUUID(), title: "", slug: "", content: "", featuredImage: "", metaDescription: "", status: "draft" }
  );
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const submit = () => {
    if (!form.title.trim()) return;
    onSave(form);
  };

  const handleFeaturedImage = async (file) => {
    if (!file) return;
    setUploading(true);
    setUploadError("");
    try {
      const url = await uploadImage(file);
      setForm((f) => ({ ...f, featuredImage: url }));
    } catch (err) {
      setUploadError(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "flex-start", justifyContent: "center", zIndex: 200, padding: "40px 16px", overflowY: "auto" }}>
      <div style={{ width: "100%", maxWidth: 720, background: T.bgRaised, border: `1px solid ${T.border}`, borderRadius: 14, padding: 28 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 18 }}>
          <h2 style={{ margin: 0, fontFamily: "'Bebas Neue', sans-serif", fontSize: 24 }}>{page ? "Editar página" : "Nova página"}</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", color: T.muted, cursor: "pointer" }}><X size={20} /></button>
        </div>

        <Field label="Título">
          <input style={inputStyle} value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Ex: Sobre a Trendout" />
        </Field>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <Field label="Slug (URL)">
            <input style={inputStyle} value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} placeholder="sobre-a-trendout" />
          </Field>
          <Field label="Estado">
            <select style={inputStyle} value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}>
              <option value="draft">Rascunho</option>
              <option value="published">Publicada</option>
            </select>
          </Field>
        </div>

        <Field label="Imagem de destaque">
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            {form.featuredImage && <img src={form.featuredImage} alt="" style={{ width: 60, height: 60, objectFit: "cover", borderRadius: 8, border: `1px solid ${T.border}` }} />}
            <label style={{ ...inputStyle, display: "flex", alignItems: "center", gap: 8, cursor: "pointer", color: T.muted, width: "auto" }}>
              <ImagePlus size={15} /> {uploading ? "A enviar..." : form.featuredImage ? "Trocar imagem" : "Carregar imagem"}
              <input type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => handleFeaturedImage(e.target.files[0])} />
            </label>
          </div>
          {uploadError && <div style={{ color: T.danger, fontSize: 12, marginTop: 8 }}>{uploadError}</div>}
        </Field>

        <Field label="Meta descrição (SEO)">
          <input style={inputStyle} value={form.metaDescription || ""} onChange={(e) => setForm((f) => ({ ...f, metaDescription: e.target.value }))} placeholder="Frase curta para motores de busca" />
        </Field>

        <Field label="Conteúdo">
          <RichTextEditor value={form.content} onChange={(html) => setForm((f) => ({ ...f, content: html }))} />
        </Field>

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 18 }}>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button onClick={submit}>Guardar página</Button>
        </div>
      </div>
    </div>
  );
}
