import React, { useState, useRef, useEffect } from "react";
import { X, Plus, Trash2, ImagePlus } from "lucide-react";
import { T, inputStyle, Field, Button, SIZES } from "../lib/theme";
import { uploadProductImage } from "../lib/uploadImage";

export default function ProductModal({ product, categories, onClose, onSave }) {
  const topCategories = categories.filter((c) => !c.parentId);
  const [form, setForm] = useState(
    product || {
      id: crypto.randomUUID(),
      name: "", reference: "", brand: "Trendout", ean: "", weightGrams: "",
      topCategory: topCategories[0]?.name || "", category: "", description: "",
      features: [], basePrice: "", compareAtPrice: "", couponCode: "",
      availability: "available", active: true, images: [],
      variants: [{ id: crypto.randomUUID(), size: "M", color: "", sku: "", ean: "", stock: 0, soldRecently: 0 }],
    }
  );
  const [featuresText, setFeaturesText] = useState((product?.features || []).join("\n"));
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const galleryInputRef = useRef(null);

  const topCatObj = topCategories.find((c) => c.name === form.topCategory);
  const subCategories = categories.filter((c) => c.parentId === topCatObj?.id);

  // Garante que o valor real (form.category) bate certo com o que aparece visível no
  // <select> — se estiver vazio ou já não existir na lista atual, assume a primeira opção.
  useEffect(() => {
    if (subCategories.length === 0) return;
    const isValid = subCategories.some((c) => c.name === form.category);
    if (!isValid) update("category", subCategories[0].name);
  }, [subCategories.map((c) => c.id).join(","), form.topCategory]); // eslint-disable-line

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const updateVariant = (id, k, v) => setForm((f) => ({ ...f, variants: f.variants.map((va) => (va.id === id ? { ...va, [k]: v } : va)) }));
  const addVariant = () => setForm((f) => ({ ...f, variants: [...f.variants, { id: crypto.randomUUID(), size: "M", color: "", sku: "", ean: "", stock: 0, soldRecently: 0 }] }));
  const removeVariant = (id) => setForm((f) => ({ ...f, variants: f.variants.filter((va) => va.id !== id) }));

  const addImages = async (files) => {
    setUploading(true);
    setUploadError("");
    try {
      for (const file of Array.from(files || [])) {
        if (!file.type.startsWith("image/")) continue;
        const url = await uploadProductImage(file);
        setForm((f) => ({ ...f, images: [...f.images, url] }));
      }
    } catch (err) {
      setUploadError(err.message);
    } finally {
      setUploading(false);
    }
  };
  const removeImage = (idx) => update("images", form.images.filter((_, i) => i !== idx));
  const moveImage = (idx, dir) => {
    const arr = [...form.images];
    const target = idx + dir;
    if (target < 0 || target >= arr.length) return;
    [arr[idx], arr[target]] = [arr[target], arr[idx]];
    update("images", arr);
  };

  const submit = () => {
    if (!form.name.trim() || !form.basePrice) return;
    onSave({
      ...form,
      basePrice: parseFloat(form.basePrice),
      compareAtPrice: form.compareAtPrice ? parseFloat(form.compareAtPrice) : null,
      weightGrams: form.weightGrams ? parseInt(form.weightGrams) : null,
      features: featuresText.split("\n").map((s) => s.trim()).filter(Boolean),
    });
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "flex-start", justifyContent: "center", zIndex: 200, padding: "40px 16px", overflowY: "auto" }}>
      <div style={{ width: "100%", maxWidth: 680, background: T.bgRaised, border: `1px solid ${T.border}`, borderRadius: 14, padding: 28 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontFamily: "'Bebas Neue', sans-serif", fontSize: 24, letterSpacing: 0.5 }}>
            {product ? "Editar produto" : "Novo produto"}
          </h2>
          <button onClick={onClose} style={{ background: "none", border: "none", color: T.muted, cursor: "pointer" }}><X size={20} /></button>
        </div>

        <Field label="Nome do produto">
          <input style={inputStyle} value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="Ex: T-shirt Performance Box Logo" />
        </Field>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <Field label="Categoria principal (menu)">
            <select style={inputStyle} value={form.topCategory} onChange={(e) => { update("topCategory", e.target.value); update("category", ""); }}>
              {topCategories.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
          </Field>
          <Field label="Subcategoria">
            <select style={inputStyle} value={form.category} onChange={(e) => update("category", e.target.value)}>
              {subCategories.length === 0 && <option value="">Sem subcategorias</option>}
              {subCategories.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
          </Field>
        </div>

        <Field label="Marca">
          <select style={inputStyle} value={form.brand || "Trendout"} onChange={(e) => update("brand", e.target.value)}>
            {["Trendout", "Anidriz", "REPX", "RSB"].map((b) => <option key={b} value={b}>{b}</option>)}
          </select>
        </Field>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
          <Field label="Referência (SKU base)">
            <input style={inputStyle} value={form.reference} onChange={(e) => update("reference", e.target.value)} placeholder="TRD-TS-0142" />
          </Field>
          <Field label="EAN base (opcional)">
            <input style={inputStyle} value={form.ean} onChange={(e) => update("ean", e.target.value)} placeholder="5601234567890" />
          </Field>
          <Field label="Peso (gramas)">
            <input style={inputStyle} type="number" value={form.weightGrams} onChange={(e) => update("weightGrams", e.target.value)} placeholder="220" />
          </Field>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
          <Field label="Preço (€)">
            <input style={inputStyle} type="number" step="0.01" value={form.basePrice} onChange={(e) => update("basePrice", e.target.value)} placeholder="24.90" />
          </Field>
          <Field label="Preço riscado (€, opcional)">
            <input style={inputStyle} type="number" step="0.01" value={form.compareAtPrice} onChange={(e) => update("compareAtPrice", e.target.value)} placeholder="29.90" />
          </Field>
          <Field label="Cupão em destaque">
            <input style={inputStyle} value={form.couponCode || ""} onChange={(e) => update("couponCode", e.target.value.toUpperCase())} placeholder="TREINO10" />
          </Field>
        </div>

        <Field label="Disponibilidade">
          <select style={inputStyle} value={form.availability || "available"} onChange={(e) => update("availability", e.target.value)}>
            <option value="available">Disponível</option>
            <option value="unavailable">Indisponível (mostra aviso + contactos na ficha)</option>
            <option value="out_of_stock">Sem stock</option>
          </select>
        </Field>

        <Field label="Descrição">
          <textarea style={{ ...inputStyle, minHeight: 70, resize: "vertical" }} value={form.description} onChange={(e) => update("description", e.target.value)} />
        </Field>

        <Field label="Características (uma por linha)">
          <textarea style={{ ...inputStyle, minHeight: 80, resize: "vertical" }} value={featuresText} onChange={(e) => setFeaturesText(e.target.value)} placeholder={"100% algodão pentado, 220 g/m²\nCorte reto\nLavagem à máquina até 30°C"} />
        </Field>

        <div style={{ marginBottom: 8 }}>
          <span style={{ display: "block", fontSize: 12, color: T.muted, marginBottom: 8, fontWeight: 600, letterSpacing: 0.3 }}>Fotos do produto</span>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {form.images.map((img, idx) => (
              <div key={idx} style={{ position: "relative", width: 76, height: 76 }}>
                <img src={img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 8, border: `1px solid ${T.border}` }} />
                {idx === 0 && <span style={{ position: "absolute", bottom: 2, left: 2, fontSize: 9, background: T.accent, color: "#0f1210", padding: "1px 5px", borderRadius: 4, fontWeight: 700 }}>Principal</span>}
                <button onClick={() => removeImage(idx)} style={{ position: "absolute", top: -6, right: -6, width: 18, height: 18, borderRadius: "50%", background: T.danger, border: "none", color: "#0f1210", cursor: "pointer" }}><X size={11} /></button>
                {idx > 0 && <button onClick={() => moveImage(idx, -1)} style={{ position: "absolute", top: -6, left: -6, width: 18, height: 18, borderRadius: "50%", background: T.bgRaised2, border: `1px solid ${T.border}`, color: T.text, cursor: "pointer", fontSize: 10 }}>‹</button>}
              </div>
            ))}
            <button
              onClick={() => galleryInputRef.current.click()}
              disabled={uploading}
              style={{ width: 76, height: 76, borderRadius: 8, border: `1px dashed ${T.border}`, background: "none", color: T.muted, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4 }}
            >
              <ImagePlus size={18} /> <span style={{ fontSize: 10 }}>{uploading ? "A enviar..." : "Adicionar"}</span>
            </button>
            <input ref={galleryInputRef} type="file" accept="image/*" multiple style={{ display: "none" }} onChange={(e) => addImages(e.target.files)} />
          </div>
          {uploadError && <div style={{ color: T.danger, fontSize: 12, marginTop: 8 }}>{uploadError}</div>}
        </div>

        <div style={{ marginTop: 18, marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 12, color: T.muted, fontWeight: 600, letterSpacing: 0.3, textTransform: "uppercase" }}>Variantes (tamanho/capacidade / cor / stock)</span>
          <Button variant="ghost" onClick={addVariant} style={{ padding: "6px 10px", fontSize: 12 }}><Plus size={13} /> Adicionar</Button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 18 }}>
          {form.variants.map((v) => (
            <div key={v.id} style={{ display: "grid", gridTemplateColumns: "78px 1fr 1fr 1fr 56px 60px 30px", gap: 6, alignItems: "center" }}>
              <input
                style={{ ...inputStyle, padding: "8px 6px" }}
                list="size-suggestions"
                placeholder="Tam./Capac."
                value={v.size}
                onChange={(e) => updateVariant(v.id, "size", e.target.value)}
              />
              <datalist id="size-suggestions">
                {SIZES.map((s) => <option key={s} value={s} />)}
                <option value="250ml" /><option value="500ml" /><option value="750ml" /><option value="1L" />
                <option value="Único" />
              </datalist>
              <input style={{ ...inputStyle, padding: "8px 6px" }} placeholder="Cor" value={v.color} onChange={(e) => updateVariant(v.id, "color", e.target.value)} />
              <input style={{ ...inputStyle, padding: "8px 6px" }} placeholder="SKU" value={v.sku} onChange={(e) => updateVariant(v.id, "sku", e.target.value)} />
              <input style={{ ...inputStyle, padding: "8px 6px" }} placeholder="EAN" value={v.ean || ""} onChange={(e) => updateVariant(v.id, "ean", e.target.value)} />
              <input style={{ ...inputStyle, padding: "8px 6px" }} type="number" placeholder="Stock" value={v.stock} onChange={(e) => updateVariant(v.id, "stock", parseInt(e.target.value) || 0)} />
              <input style={{ ...inputStyle, padding: "8px 6px" }} type="number" placeholder="Vend./h" value={v.soldRecently || 0} onChange={(e) => updateVariant(v.id, "soldRecently", parseInt(e.target.value) || 0)} />
              <button onClick={() => removeVariant(v.id)} style={{ background: "none", border: "none", color: T.danger, cursor: "pointer" }}><Trash2 size={15} /></button>
            </div>
          ))}
        </div>

        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, marginBottom: 20, color: T.muted }}>
          <input type="checkbox" checked={form.active} onChange={(e) => update("active", e.target.checked)} style={{ accentColor: T.accent }} />
          Produto ativo na loja
        </label>

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button onClick={submit}>Guardar produto</Button>
        </div>
      </div>
    </div>
  );
}
