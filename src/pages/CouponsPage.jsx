import React, { useState } from "react";
import { Plus, Trash2, X, Users, UserCog, Wallet, Check } from "lucide-react";
import { T, inputStyle, Field, Button } from "../lib/theme";
import { useCoupons } from "../hooks/useCoupons";
import { useCouponUsage } from "../hooks/useCouponUsage";
import { useCommissions } from "../hooks/useCommissions";

export default function CouponsPage() {
  const { coupons, loading, addCoupon, toggleCoupon, deleteCoupon, assignInfluencer } = useCoupons();
  const { usageByCode, loading: usageLoading } = useCouponUsage();
  const { byCoupon: commissionsByCode, loading: commissionsLoading, markPaid } = useCommissions();
  const [modalOpen, setModalOpen] = useState(false);
  const [usageModalCode, setUsageModalCode] = useState(null);
  const [influencerModalCoupon, setInfluencerModalCoupon] = useState(null);
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

  const top3 = Object.entries(usageByCode)
    .map(([code, uses]) => ({ code, count: uses.length, totalDiscount: uses.reduce((s, u) => s + u.discountAmount, 0) }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  return (
    <div>
      {top3.length > 0 && (
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 20 }}>
          {top3.map((c, i) => (
            <div key={c.code} style={{ background: T.bgRaised, border: `1px solid ${i === 0 ? T.accent : T.border}`, borderRadius: 12, padding: 16, flex: "1 1 200px" }}>
              <div style={{ fontSize: 11.5, color: T.muted, textTransform: "uppercase", letterSpacing: 0.4 }}>
                {i === 0 ? "🥇 Mais usado" : i === 1 ? "🥈 2º mais usado" : "🥉 3º mais usado"}
              </div>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, marginTop: 4, letterSpacing: 0.5 }}>{c.code}</div>
              <div style={{ fontSize: 12.5, color: T.muted, marginTop: 4 }}>{c.count} utilizaç{c.count > 1 ? "ões" : "ão"} · −€{c.totalDiscount.toFixed(2)} em descontos</div>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 20 }}>
        <Button onClick={() => setModalOpen(true)}><Plus size={15} /> Novo cupão</Button>
      </div>

      <div style={{ background: T.bgRaised, border: `1px solid ${T.border}`, borderRadius: 12, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
          <thead>
            <tr style={{ background: T.bgRaised2, textAlign: "left" }}>
              {["Código", "Tipo", "Valor", "Estado", "Utilizações", "Influenciador", ""].map((h) => (
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
                <td style={{ padding: "12px 16px" }}>
                  {usageLoading ? (
                    <span style={{ color: T.muted, fontSize: 12 }}>...</span>
                  ) : (usageByCode[d.code]?.length > 0) ? (
                    <button onClick={() => setUsageModalCode(d.code)} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", color: T.accent, cursor: "pointer", fontSize: 12.5, padding: 0 }}>
                      <Users size={13} /> {usageByCode[d.code].length}
                    </button>
                  ) : (
                    <span style={{ color: T.muted, fontSize: 12 }}>0</span>
                  )}
                </td>
                <td style={{ padding: "12px 16px" }}>
                  {d.ownerEmail ? (
                    <button onClick={() => setInfluencerModalCoupon(d)} style={{ background: "none", border: "none", cursor: "pointer", textAlign: "left", padding: 0 }}>
                      <div style={{ fontSize: 12.5, color: T.text }}>{d.ownerEmail}</div>
                      <div style={{ fontSize: 11.5, color: T.accent }}>
                        {commissionsLoading ? "..." : `€${(commissionsByCode[d.code] || []).filter((c) => c.status !== "cancelled").reduce((s, c) => s + c.amount, 0).toFixed(2)} (${d.commissionRate}%)`}
                      </div>
                    </button>
                  ) : (
                    <button onClick={() => setInfluencerModalCoupon(d)} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: `1px solid ${T.border}`, borderRadius: 6, padding: "5px 10px", color: T.muted, cursor: "pointer", fontSize: 11.5 }}>
                      <UserCog size={12} /> Atribuir
                    </button>
                  )}
                </td>
                <td style={{ padding: "12px 16px", textAlign: "right" }}>
                  <button onClick={() => deleteCoupon(d.id)} style={{ background: "none", border: "none", color: T.danger, cursor: "pointer" }}><Trash2 size={15} /></button>
                </td>
              </tr>
            ))}
            {coupons.length === 0 && (
              <tr><td colSpan={7} style={{ padding: 28, textAlign: "center", color: T.muted }}>Sem cupões criados.</td></tr>
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
      {usageModalCode && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }}>
          <div style={{ width: "100%", maxWidth: 480, maxHeight: "80vh", overflowY: "auto", background: T.bgRaised, border: `1px solid ${T.border}`, borderRadius: 14, padding: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontFamily: "'Bebas Neue', sans-serif", fontSize: 20 }}>Quem usou "{usageModalCode}"</h3>
              <button onClick={() => setUsageModalCode(null)} style={{ background: "none", border: "none", color: T.muted, cursor: "pointer" }}><X size={18} /></button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {(usageByCode[usageModalCode] || []).map((u, i) => (
                <div key={i} style={{ background: T.bg, border: `1px solid ${T.border}`, borderRadius: 8, padding: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 600 }}>
                    <span>{u.customerName || u.customerEmail}</span>
                    <span style={{ color: T.accent }}>−€{u.discountAmount.toFixed(2)}</span>
                  </div>
                  <div style={{ fontSize: 12, color: T.muted, marginTop: 4 }}>
                    {u.orderNumber} · {new Date(u.createdAt).toLocaleDateString("pt-PT")} · Total €{u.total.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {influencerModalCoupon && (
        <InfluencerModal
          coupon={influencerModalCoupon}
          commissions={commissionsByCode[influencerModalCoupon.code] || []}
          onAssign={assignInfluencer}
          onMarkPaid={markPaid}
          onClose={() => setInfluencerModalCoupon(null)}
        />
      )}
    </div>
  );
}

function InfluencerModal({ coupon, commissions, onAssign, onMarkPaid, onClose }) {
  const [email, setEmail] = useState(coupon.ownerEmail || "");
  const [rate, setRate] = useState(coupon.commissionRate ?? 5);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const pending = commissions.filter((c) => c.status === "pending");
  const paid = commissions.filter((c) => c.status === "paid");
  const pendingTotal = pending.reduce((s, c) => s + c.amount, 0);
  const paidTotal = paid.reduce((s, c) => s + c.amount, 0);

  const save = async () => {
    setSaving(true);
    setError("");
    try {
      await onAssign(coupon.id, email, parseFloat(rate) || 0);
      onClose();
    } catch (err) {
      setError(err.message || "Erro ao atribuir.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 210 }}>
      <div style={{ width: "100%", maxWidth: 460, maxHeight: "85vh", overflowY: "auto", background: T.bgRaised, border: `1px solid ${T.border}`, borderRadius: 14, padding: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
          <h3 style={{ margin: 0, fontFamily: "'Bebas Neue', sans-serif", fontSize: 20 }}>Influenciador — {coupon.code}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", color: T.muted, cursor: "pointer" }}><X size={18} /></button>
        </div>

        <Field label="Email da conta do influenciador">
          <input style={inputStyle} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="influencer@email.com" />
        </Field>
        <Field label="Percentagem de comissão (sobre o valor dos produtos, sem portes)">
          <input style={inputStyle} type="number" step="0.1" value={rate} onChange={(e) => setRate(e.target.value)} placeholder="5" />
        </Field>
        <p style={{ fontSize: 11.5, color: T.muted, margin: "0 0 16px", lineHeight: 1.5 }}>
          A conta tem de já existir (o influenciador precisa de se ter registado na loja). Deixa o email em branco e guarda para removeres a atribuição.
        </p>
        {error && <div style={{ color: T.danger, fontSize: 12.5, marginBottom: 14 }}>{error}</div>}
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginBottom: 22 }}>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button onClick={save} disabled={saving}>{saving ? "A guardar..." : "Guardar"}</Button>
        </div>

        {coupon.ownerEmail && (
          <>
            <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 18 }}>
              <div style={{ display: "flex", gap: 14, marginBottom: 16 }}>
                <div style={{ flex: 1, background: T.bg, border: `1px solid ${T.warn}55`, borderRadius: 8, padding: 12 }}>
                  <div style={{ fontSize: 11, color: T.muted, textTransform: "uppercase" }}>Por pagar</div>
                  <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, color: T.warn }}>€{pendingTotal.toFixed(2)}</div>
                </div>
                <div style={{ flex: 1, background: T.bg, border: `1px solid ${T.accent}55`, borderRadius: 8, padding: 12 }}>
                  <div style={{ fontSize: 11, color: T.muted, textTransform: "uppercase" }}>Já pago</div>
                  <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, color: T.accent }}>€{paidTotal.toFixed(2)}</div>
                </div>
              </div>

              {pending.length > 0 && (
                <Button variant="ghost" onClick={() => onMarkPaid(pending.map((c) => c.id))} style={{ width: "100%", marginBottom: 14, fontSize: 12.5 }}>
                  <Check size={13} /> Marcar as {pending.length} comissões pendentes como pagas
                </Button>
              )}

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {commissions.map((c) => (
                  <div key={c.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, padding: "8px 0", borderTop: `1px solid ${T.border}` }}>
                    <span style={{ color: c.status === "cancelled" ? T.muted : T.text, textDecoration: c.status === "cancelled" ? "line-through" : "none" }}>
                      €{c.subtotal.toFixed(2)} × {c.rate}% · {new Date(c.createdAt).toLocaleDateString("pt-PT")}
                    </span>
                    <span style={{ color: c.status === "paid" ? T.accent : c.status === "cancelled" ? T.muted : T.warn, fontWeight: 600 }}>
                      €{c.amount.toFixed(2)} {c.status === "paid" ? "✓" : c.status === "cancelled" ? "(cancelada)" : ""}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
