import React, { useState, useRef } from "react";
import { createPortal } from "react-dom";
import { Plus, Pencil, Trash2, Search, AlertTriangle, Minus, X, Percent } from "lucide-react";
import { T, inputStyle, Button } from "../lib/theme";
import { useProducts } from "../hooks/useSupabaseData";
import { useCategories } from "../hooks/useCategories";
import ProductModal from "../components/ProductModal";
import BulkPriceModal from "../components/BulkPriceModal";

export default function ProductsPage() {
  const { products, loading, saveProduct, deleteProduct, quickUpdate, adjustVariantStock, bulkAdjustPrices } = useProducts();
  const { categories, loading: categoriesLoading } = useCategories();

  const [query, setQuery] = useState("");
  const [modalProduct, setModalProduct] = useState(undefined); // undefined=fechado, null=novo, obj=editar
  const [deleteId, setDeleteId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [stockPopoverId, setStockPopoverId] = useState(null);
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [stockPopoverPos, setStockPopoverPos] = useState({ top: 0, left: 0 });

  const filtered = products.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()));
  const totalStock = (p) => p.variants.reduce((s, v) => s + v.stock, 0);
  const quickInputStyle = { ...inputStyle, padding: "6px 8px", fontSize: 12.5 };

  const handleSave = async (product) => {
    setSaving(true);
    setErrorMsg("");
    try {
      await saveProduct(product);
      setModalProduct(undefined);
    } catch (err) {
      setErrorMsg(err.message || "Erro ao guardar o produto.");
    } finally {
      setSaving(false);
    }
  };

  if (loading || categoriesLoading) {
    return <div style={{ color: T.muted, fontSize: 13.5 }}>A carregar produtos...</div>;
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div style={{ position: "relative", flex: "1 1 260px", maxWidth: 340 }}>
          <Search size={15} style={{ position: "absolute", left: 12, top: 12, color: T.muted }} />
          <input style={{ ...inputStyle, paddingLeft: 36 }} placeholder="Pesquisar por nome..." value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <Button variant="ghost" onClick={() => setBulkModalOpen(true)}><Percent size={15} /> Ajustar preços em massa</Button>
          <Button onClick={() => setModalProduct(null)}><Plus size={15} /> Novo produto</Button>
        </div>
      </div>

      {errorMsg && <div style={{ color: T.danger, fontSize: 13, marginBottom: 14 }}>{errorMsg}</div>}

      <div style={{ background: T.bgRaised, border: `1px solid ${T.border}`, borderRadius: 12, overflow: "hidden", overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, minWidth: 900 }}>
          <thead>
            <tr style={{ background: T.bgRaised2, textAlign: "left" }}>
              {["Produto", "Marca", "Referência", "EAN", "Preço (€)", "Preço promo (€)", "Stock", "Disponibilidade", "Estado", ""].map((h) => (
                <th key={h} style={{ padding: "12px 14px", color: T.muted, fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: 0.4 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => {
              const stock = totalStock(p);
              return (
                <tr key={p.id} style={{ borderTop: `1px solid ${T.border}` }}>
                  <td style={{ padding: "10px 14px" }}>
                    <button onClick={() => setModalProduct(p)} style={{ background: "none", border: "none", color: T.text, cursor: "pointer", fontWeight: 600, fontSize: 13, textAlign: "left", padding: 0 }}>
                      {p.name}
                    </button>
                    <div style={{ fontSize: 11.5, color: T.muted }}>{p.category}</div>
                  </td>
                  <td style={{ padding: "10px 14px" }}>
                    <select value={p.brand || "Trendout"} onChange={(e) => quickUpdate(p.id, { brand: e.target.value })} style={{ ...quickInputStyle, width: 96 }}>
                      {["Trendout", "Anidriz", "REPX", "RSB"].map((b) => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </td>
                  <td style={{ padding: "10px 14px" }}>
                    <input style={{ ...quickInputStyle, width: 110 }} value={p.reference || ""} onChange={(e) => quickUpdate(p.id, { reference: e.target.value })} />
                  </td>
                  <td style={{ padding: "10px 14px" }}>
                    <input style={{ ...quickInputStyle, width: 120 }} value={p.ean || ""} onChange={(e) => quickUpdate(p.id, { ean: e.target.value })} />
                  </td>
                  <td style={{ padding: "10px 14px" }}>
                    <input style={{ ...quickInputStyle, width: 76 }} type="number" step="0.01" value={p.basePrice} onChange={(e) => quickUpdate(p.id, { basePrice: parseFloat(e.target.value) || 0 })} />
                  </td>
                  <td style={{ padding: "10px 14px" }}>
                    <input style={{ ...quickInputStyle, width: 76 }} type="number" step="0.01" value={p.compareAtPrice || ""} placeholder="—" onChange={(e) => quickUpdate(p.id, { compareAtPrice: e.target.value ? parseFloat(e.target.value) : null })} />
                  </td>
                  <td style={{ padding: "10px 14px", position: "relative" }}>
                    <button
                      onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setStockPopoverPos({ top: rect.bottom + 6, left: rect.left });
                        setStockPopoverId(stockPopoverId === p.id ? null : p.id);
                      }}
                      style={{ background: "none", border: `1px solid ${T.border}`, borderRadius: 6, padding: "4px 10px", cursor: "pointer", color: stock === 0 ? T.danger : stock < 5 ? T.warn : T.text, fontSize: 13 }}
                    >
                      {stock}{stock < 5 && stock > 0 && <AlertTriangle size={12} style={{ marginLeft: 4, verticalAlign: -1 }} />}
                    </button>

                    {stockPopoverId === p.id && createPortal(
                      <>
                        <div style={{ position: "fixed", inset: 0, zIndex: 90 }} onClick={() => setStockPopoverId(null)} />
                        <div style={{
                          position: "fixed", top: stockPopoverPos.top, left: stockPopoverPos.left, zIndex: 91,
                          background: T.bgRaised2, border: `1px solid ${T.border}`, borderRadius: 10, color: T.text,
                          fontFamily: "Inter, -apple-system, sans-serif",
                          padding: 14, minWidth: 220, boxShadow: "0 12px 30px rgba(0,0,0,0.4)",
                        }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                            <span style={{ fontSize: 11.5, color: T.muted, textTransform: "uppercase", letterSpacing: 0.4 }}>Stock por variante</span>
                            <button onClick={() => setStockPopoverId(null)} style={{ background: "none", border: "none", color: T.muted, cursor: "pointer" }}><X size={13} /></button>
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                            {p.variants.map((v) => (
                              <div key={v.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                                <span style={{ fontSize: 12.5, color: T.text }}>{v.size}{v.color ? ` · ${v.color}` : ""}</span>
                                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                  <button
                                    onClick={() => adjustVariantStock(p.id, v.id, -1)}
                                    disabled={v.stock === 0}
                                    style={{ width: 24, height: 24, borderRadius: 6, border: `1px solid ${T.border}`, background: "none", color: v.stock === 0 ? T.muted : T.text, cursor: v.stock === 0 ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                                  >
                                    <Minus size={12} />
                                  </button>
                                  <span style={{ width: 26, textAlign: "center", fontSize: 13, fontWeight: 600, color: v.stock === 0 ? T.danger : v.stock < 5 ? T.warn : T.text }}>{v.stock}</span>
                                  <button
                                    onClick={() => adjustVariantStock(p.id, v.id, 1)}
                                    style={{ width: 24, height: 24, borderRadius: 6, border: `1px solid ${T.border}`, background: "none", color: T.text, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                                  >
                                    <Plus size={12} />
                                  </button>
                                </div>
                              </div>
                            ))}
                            {p.variants.length === 0 && <div style={{ fontSize: 12, color: T.muted }}>Sem variantes.</div>}
                          </div>
                        </div>
                      </>,
                      document.body
                    )}
                  </td>
                  <td style={{ padding: "10px 14px" }}>
                    <select
                      value={p.availability || "available"}
                      onChange={(e) => quickUpdate(p.id, { availability: e.target.value })}
                      style={{
                        ...quickInputStyle, width: 128, fontWeight: 600,
                        color: p.availability === "unavailable" ? T.danger : p.availability === "out_of_stock" ? T.warn : T.accent,
                        borderColor: p.availability === "unavailable" ? T.danger : p.availability === "out_of_stock" ? T.warn : T.border,
                      }}
                    >
                      <option value="available">Disponível</option>
                      <option value="unavailable">Indisponível</option>
                      <option value="out_of_stock">Sem stock</option>
                    </select>
                  </td>
                  <td style={{ padding: "10px 14px" }}>
                    <button onClick={() => quickUpdate(p.id, { active: !p.active })} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: p.active ? T.accent : T.muted }}>
                      {p.active ? "Ativo" : "Inativo"}
                    </button>
                  </td>
                  <td style={{ padding: "10px 14px", textAlign: "right", whiteSpace: "nowrap" }}>
                    <button onClick={() => setModalProduct(p)} style={{ background: "none", border: "none", color: T.text, cursor: "pointer", marginRight: 10 }}><Pencil size={15} /></button>
                    <button onClick={() => setDeleteId(p.id)} style={{ background: "none", border: "none", color: T.danger, cursor: "pointer" }}><Trash2 size={15} /></button>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={10} style={{ padding: 28, textAlign: "center", color: T.muted }}>Sem produtos encontrados.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {bulkModalOpen && (
        <BulkPriceModal
          productCount={products.length}
          onClose={() => setBulkModalOpen(false)}
          onApply={bulkAdjustPrices}
        />
      )}

      {modalProduct !== undefined && (
        <ProductModal
          product={modalProduct}
          categories={categories}
          onClose={() => setModalProduct(undefined)}
          onSave={handleSave}
        />
      )}
      {saving && <div style={{ position: "fixed", bottom: 20, right: 20, background: T.bgRaised2, border: `1px solid ${T.border}`, borderRadius: 8, padding: "10px 16px", color: T.text, fontSize: 13 }}>A guardar...</div>}

      {deleteId && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }}>
          <div style={{ background: T.bgRaised, border: `1px solid ${T.border}`, borderRadius: 12, padding: 24, width: 320 }}>
            <p style={{ marginTop: 0, fontSize: 14 }}>Eliminar este produto e todas as suas variantes?</p>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <Button variant="ghost" onClick={() => setDeleteId(null)}>Cancelar</Button>
              <Button variant="danger" onClick={async () => { await deleteProduct(deleteId); setDeleteId(null); }}>Eliminar</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
