import React, { useState } from "react";
import { Plus, Trash2, Percent } from "lucide-react";
import { T, inputStyle, Field, Button } from "../lib/theme";
import { useVatRates } from "../hooks/useVatRates";

const COUNTRY_OPTIONS = [
  { code: "PT", label: "Portugal (Continente)" },
  { code: "PT-ILHAS", label: "Portugal (Açores/Madeira)" },
  { code: "ES", label: "Espanha" },
  { code: "FR", label: "França" },
  { code: "DE", label: "Alemanha" },
  { code: "EU", label: "Outro país da UE" },
  { code: "ROW", label: "Resto do mundo" },
];

export default function VatRatesPage() {
  const { rates, loading, updateRate, addMarket, deleteMarket } = useVatRates();
  const [addOpen, setAddOpen] = useState(false);
  const [newCode, setNewCode] = useState("ROW");
  const [newRate, setNewRate] = useState("0");
  const [errorMsg, setErrorMsg] = useState("");

  if (loading) return <div style={{ color: T.muted, fontSize: 13.5 }}>A carregar taxas de IVA...</div>;

  const availableToAdd = COUNTRY_OPTIONS.filter((c) => !rates.some((r) => r.countryCode === c.code));

  const submitAdd = async () => {
    const opt = COUNTRY_OPTIONS.find((c) => c.code === newCode);
    if (!opt) return;
    try {
      await addMarket(opt.code, opt.label, parseFloat(newRate) || 0);
      setAddOpen(false);
      setNewRate("0");
    } catch (err) {
      setErrorMsg(err.message || "Erro ao adicionar mercado.");
    }
  };

  return (
    <div style={{ maxWidth: 560 }}>
      <div style={{ background: T.bgRaised, border: `1px solid ${T.border}`, borderRadius: 12, padding: "12px 16px", marginBottom: 16, fontSize: 13, color: T.muted, display: "flex", gap: 8 }}>
        <Percent size={15} style={{ flexShrink: 0, marginTop: 1 }} />
        <span>Os preços na loja já incluem o IVA (PVP final). Esta taxa serve para discriminar o valor de IVA nas faturas e resumos de encomenda, consoante o país de entrega.</span>
      </div>

      {errorMsg && <div style={{ color: T.danger, fontSize: 13, marginBottom: 12 }}>{errorMsg}</div>}

      <div style={{ background: T.bgRaised, border: `1px solid ${T.border}`, borderRadius: 12, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
          <thead>
            <tr style={{ background: T.bgRaised2, textAlign: "left" }}>
              {["Mercado", "Taxa de IVA (%)", ""].map((h) => (
                <th key={h} style={{ padding: "12px 16px", color: T.muted, fontWeight: 600, fontSize: 11.5, textTransform: "uppercase", letterSpacing: 0.4 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rates.map((r) => (
              <tr key={r.id} style={{ borderTop: `1px solid ${T.border}` }}>
                <td style={{ padding: "12px 16px", fontWeight: 600 }}>{r.label}</td>
                <td style={{ padding: "12px 16px" }}>
                  <input
                    style={{ ...inputStyle, width: 90, padding: "6px 10px" }}
                    type="number" step="0.01" min="0" max="100"
                    value={r.ratePercent}
                    onChange={(e) => updateRate(r.id, parseFloat(e.target.value) || 0)}
                  />
                </td>
                <td style={{ padding: "12px 16px", textAlign: "right" }}>
                  <button onClick={() => deleteMarket(r.id)} style={{ background: "none", border: "none", color: T.danger, cursor: "pointer" }}><Trash2 size={15} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {availableToAdd.length > 0 && (
        <div style={{ marginTop: 16 }}>
          {!addOpen ? (
            <Button variant="ghost" onClick={() => setAddOpen(true)}><Plus size={14} /> Adicionar mercado</Button>
          ) : (
            <div style={{ background: T.bgRaised, border: `1px solid ${T.border}`, borderRadius: 10, padding: 16, display: "flex", gap: 12, alignItems: "flex-end" }}>
              <Field label="Mercado">
                <select style={inputStyle} value={newCode} onChange={(e) => setNewCode(e.target.value)}>
                  {availableToAdd.map((c) => <option key={c.code} value={c.code}>{c.label}</option>)}
                </select>
              </Field>
              <Field label="Taxa (%)">
                <input style={{ ...inputStyle, width: 90 }} type="number" step="0.01" value={newRate} onChange={(e) => setNewRate(e.target.value)} />
              </Field>
              <Button onClick={submitAdd} style={{ marginBottom: 14 }}>Adicionar</Button>
              <Button variant="ghost" onClick={() => setAddOpen(false)} style={{ marginBottom: 14 }}>Cancelar</Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
