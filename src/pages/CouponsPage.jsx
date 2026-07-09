import React, { useState } from "react";
import { Plus, Trash2, X } from "lucide-react";
import { T, inputStyle, Field, Button } from "../lib/theme";
import { useCoupons } from "../hooks/useCoupons";

export default function CouponsPage() {
  const { coupons, loading, addCoupon, toggleCoupon, deleteCoupon } = useCoupons();
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ code: "", type: "percent", value: "" });
  const [errorMsg, setErrorMsg] = useState("");

  if (loading) return <div style={{ color: T.muted, fontSize: 13.5 }}>A carregar cupões...</div>;

  const submit = async () => {
    if (!form.code.trim() || !form.value) return;
    try {
      await addCoupon({ ...form, value: parseFloat(form.value) });
      setForm({ code: "", type: "percent", value: "" });
      setModalOpen(false);
      setErrorMsg("");
    } catch (err) {
      setErrorMsg(err.message || "Erro ao criar o cupão (o código pode já existir).");
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 20 }}>
        <Button onClick={() => setModalOpen(true)}><Plus size={15} /> Novo cupão</Button>
      </div>

      <div style={{ background: T.bgRaised, border: `1px solid ${T.border}`, borderRadius: 12, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
          <thead>
            <tr style={{ background: T.bgRaised2, textAlign: "left" }}>
              {["Código", "Tipo", "Valor", "Estado", ""].map((h) => (
                <th key={h} style={{ padding: "12px 16px", color: T.muted, fontWeight: 600, fontSize: 11.5, textTransform: "uppercase", letterSpacing: 0.4 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {coupons.map((d) => (
              <tr key={d.id} style={{ borderTop: `1px solid ${T.border}` }}>
                <td style={{ padding: "12px 16px", fontWeight: 700, letterSpacing: 0.5 }}>{d.code}</td>
                <td style={{ padding: "12px 16px", color: T.muted }}>{d.type === "percent" ? "Percentagem" : "Valor fixo"}</td>
                <td style={{ padding: "12px 16px" }}>{d.type === "percent" ? `${d.value}%` : `€${d.value.toFixed(2)}`}</td>
                <td style={{ padding: "12px 16px" }}>
                  <button onClick={() => toggleCoupon(d.id, !d.active)} style={{ fontSize: 12, color: d.active ? T.accent : T.muted, background: "none", border: "none", cursor: "pointer" }}>
                    {d.active ? "Ativo" : "Inativo"}
                  </button>
                </td>
                <td style={{ padding: "12px 16px", textAlign: "right" }}>
                  <button onClick={() => deleteCoupon(d.id)} style={{ background: "none", border: "none", color: T.danger, cursor: "pointer" }}><Trash2 size={15} /></button>
                </td>
              </tr>
            ))}
            {coupons.length === 0 && (
              <tr><td colSpan={5} style={{ padding: 28, textAlign: "center", color: T.muted }}>Sem cupões criados.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }}>
          <div style={{ width: 340, background: T.bgRaised, border: `1px solid ${T.border}`, borderRadius: 14, padding: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontFamily: "'Bebas Neue', sans-serif", fontSize: 20 }}>Novo cupão</h3>
              <button onClick={() => setModalOpen(false)} style={{ background: "none", border: "none", color: T.muted, cursor: "pointer" }}><X size={18} /></button>
            </div>
            <Field label="Código">
              <input style={inputStyle} value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))} placeholder="TRENDOUT10" />
            </Field>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Field label="Tipo">
                <select style={inputStyle} value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}>
                  <option value="percent">Percentagem</option>
                  <option value="fixed">Valor fixo (€)</option>
                </select>
              </Field>
              <Field label="Valor">
                <input style={inputStyle} type="number" value={form.value} onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))} placeholder="10" />
              </Field>
            </div>
            {errorMsg && <div style={{ color: T.danger, fontSize: 12.5, marginBottom: 10 }}>{errorMsg}</div>}
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
              <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancelar</Button>
              <Button onClick={submit}>Criar cupão</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
