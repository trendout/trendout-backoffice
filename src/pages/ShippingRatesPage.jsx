import React, { useState } from "react";
import { Truck, Save } from "lucide-react";
import { T, inputStyle, Button } from "../lib/theme";
import { useShippingRatesAdmin } from "../hooks/useShippingRatesAdmin";

function RateRow({ rate, onSave }) {
  const [form, setForm] = useState(rate);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const save = async () => {
    setSaving(true);
    try {
      await onSave(form);
      setSaved(true);
      setTimeout(() => setSaved(false), 1800);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ background: T.bgRaised, border: `1px solid ${T.border}`, borderRadius: 12, padding: 18, marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, letterSpacing: 0.5 }}>{form.label}</div>
          <div style={{ fontSize: 11.5, color: T.muted }}>Código: {rate.countryCode}</div>
        </div>
        <Button onClick={save} disabled={saving} style={{ fontSize: 12.5, padding: "8px 14px" }}>
          <Save size={13} /> {saving ? "A guardar..." : "Guardar"}
        </Button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12 }}>
        <div>
          <label style={{ fontSize: 11, color: T.muted, display: "block", marginBottom: 4 }}>Nome do mercado</label>
          <input style={inputStyle} value={form.label} onChange={(e) => update("label", e.target.value)} />
        </div>
        <div>
          <label style={{ fontSize: 11, color: T.muted, display: "block", marginBottom: 4 }}>Envio standard (€)</label>
          <input style={inputStyle} type="number" step="0.01" value={form.standardPrice} onChange={(e) => update("standardPrice", parseFloat(e.target.value) || 0)} />
        </div>
        <div>
          <label style={{ fontSize: 11, color: T.muted, display: "block", marginBottom: 4 }}>Envio express (€)</label>
          <input style={inputStyle} type="number" step="0.01" value={form.expressPrice} onChange={(e) => update("expressPrice", parseFloat(e.target.value) || 0)} />
        </div>
        <div>
          <label style={{ fontSize: 11, color: T.muted, display: "block", marginBottom: 4 }}>Prazo standard</label>
          <input style={inputStyle} value={form.standardEta} onChange={(e) => update("standardEta", e.target.value)} placeholder="2-4 dias úteis" />
        </div>
        <div>
          <label style={{ fontSize: 11, color: T.muted, display: "block", marginBottom: 4 }}>Prazo express</label>
          <input style={inputStyle} value={form.expressEta} onChange={(e) => update("expressEta", e.target.value)} placeholder="1-2 dias úteis" />
        </div>
      </div>

      <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${T.border}` }}>
        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: T.text, cursor: "pointer", marginBottom: form.freeEligible ? 10 : 0 }}>
          <input type="checkbox" checked={!!form.freeEligible} onChange={(e) => update("freeEligible", e.target.checked)} style={{ accentColor: T.accent }} />
          Elegível para portes grátis (envio standard)
        </label>
        {form.freeEligible && (
          <div style={{ maxWidth: 260 }}>
            <label style={{ fontSize: 11, color: T.muted, display: "block", marginBottom: 4 }}>
              Portes grátis a partir de (€) — deixa em branco para usar o valor geral das Definições
            </label>
            <input
              style={inputStyle}
              type="number"
              step="0.01"
              value={form.freeShippingThreshold ?? ""}
              onChange={(e) => update("freeShippingThreshold", e.target.value === "" ? null : parseFloat(e.target.value))}
              placeholder="Usar valor geral"
            />
          </div>
        )}
      </div>

      {saved && <div style={{ color: T.accent, fontSize: 12, marginTop: 10 }}>Guardado ✓</div>}
    </div>
  );
}

export default function ShippingRatesPage() {
  const { rates, loading, saveRate } = useShippingRatesAdmin();

  if (loading) return <div style={{ color: T.muted, fontSize: 13.5 }}>A carregar taxas de envio...</div>;

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20, color: T.muted, fontSize: 12.5 }}>
        <Truck size={14} />
        Um mercado por linha — define o preço e o prazo de cada um. Se ativares "portes grátis", podes definir um valor próprio para esse mercado, ou deixar em branco para usar o valor geral (Definições → Envio grátis a partir de).
      </div>
      {rates.map((r) => (
        <RateRow key={r.id} rate={r} onSave={saveRate} />
      ))}
    </div>
  );
}
