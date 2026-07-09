import React, { useState } from "react";
import { X, TrendingUp, TrendingDown } from "lucide-react";
import { T, inputStyle, Field, Button } from "../lib/theme";

export default function BulkPriceModal({ productCount, onClose, onApply }) {
  const [type, setType] = useState("percent"); // 'percent' | 'fixed'
  const [direction, setDirection] = useState("increase"); // 'increase' | 'decrease'
  const [value, setValue] = useState("");
  const [includeCompareAt, setIncludeCompareAt] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [applying, setApplying] = useState(false);
  const [done, setDone] = useState(null);

  const previewText = () => {
    if (!value) return "";
    const amount = type === "percent" ? `${value}%` : `€${value}`;
    return `Isto vai ${direction === "increase" ? "aumentar" : "diminuir"} o preço de todos os ${productCount} produtos em ${amount}${includeCompareAt ? " (incluindo o preço riscado)" : ""}.`;
  };

  const apply = async () => {
    setApplying(true);
    const count = await onApply({ type, direction, value: parseFloat(value) || 0, includeCompareAt });
    setApplying(false);
    setDone(count);
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }}>
      <div style={{ width: "100%", maxWidth: 440, background: T.bgRaised, border: `1px solid ${T.border}`, borderRadius: 14, padding: 26 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 18 }}>
          <h2 style={{ margin: 0, fontFamily: "'Bebas Neue', sans-serif", fontSize: 22 }}>Ajustar preços em massa</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", color: T.muted, cursor: "pointer" }}><X size={20} /></button>
        </div>

        {done !== null ? (
          <div>
            <p style={{ fontSize: 14, color: T.accent, marginBottom: 20 }}>
              Preço atualizado em {done} produto{done !== 1 ? "s" : ""} com sucesso ✓
            </p>
            <Button onClick={onClose} style={{ width: "100%" }}>Fechar</Button>
          </div>
        ) : (
          <>
            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              <button
                onClick={() => setDirection("increase")}
                style={{
                  flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "10px", borderRadius: 8, cursor: "pointer",
                  border: `1px solid ${direction === "increase" ? T.accent : T.border}`,
                  background: direction === "increase" ? "rgba(201,255,63,0.08)" : "none",
                  color: direction === "increase" ? T.accent : T.text, fontSize: 13,
                }}
              >
                <TrendingUp size={14} /> Aumentar
              </button>
              <button
                onClick={() => setDirection("decrease")}
                style={{
                  flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "10px", borderRadius: 8, cursor: "pointer",
                  border: `1px solid ${direction === "decrease" ? T.accent : T.border}`,
                  background: direction === "decrease" ? "rgba(201,255,63,0.08)" : "none",
                  color: direction === "decrease" ? T.accent : T.text, fontSize: 13,
                }}
              >
                <TrendingDown size={14} /> Diminuir
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 8 }}>
              <Field label="Tipo">
                <select style={inputStyle} value={type} onChange={(e) => setType(e.target.value)}>
                  <option value="percent">Percentagem (%)</option>
                  <option value="fixed">Valor fixo (€)</option>
                </select>
              </Field>
              <Field label={type === "percent" ? "Valor (%)" : "Valor (€)"}>
                <input style={inputStyle} type="number" step="0.01" min="0" value={value} onChange={(e) => setValue(e.target.value)} placeholder={type === "percent" ? "10" : "2.00"} />
              </Field>
            </div>

            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: T.muted, marginBottom: 18, cursor: "pointer" }}>
              <input type="checkbox" checked={includeCompareAt} onChange={(e) => setIncludeCompareAt(e.target.checked)} style={{ accentColor: T.accent }} />
              Aplicar também ao preço riscado (preço promocional)
            </label>

            {previewText() && (
              <div style={{ background: T.bg, border: `1px solid ${T.border}`, borderRadius: 8, padding: 12, fontSize: 12.5, color: T.warn, marginBottom: 20, lineHeight: 1.5 }}>
                ⚠ {previewText()} Esta ação não tem "desfazer" automático.
              </div>
            )}

            {!confirming ? (
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <Button variant="ghost" onClick={onClose}>Cancelar</Button>
                <Button onClick={() => value && setConfirming(true)}>Continuar</Button>
              </div>
            ) : (
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <Button variant="ghost" onClick={() => setConfirming(false)}>Voltar</Button>
                <Button variant="danger" onClick={apply} disabled={applying}>
                  {applying ? "A aplicar..." : `Sim, aplicar a ${productCount} produtos`}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
