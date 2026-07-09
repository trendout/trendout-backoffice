import React, { useState } from "react";
import { T } from "../lib/theme";
import { Badge, STATUS_META } from "../lib/orderStatus";
import { useOrders } from "../hooks/useSupabaseData";
import OrderDrawer from "../components/OrderDrawer";

export default function OrdersPage() {
  const { orders, loading, updateStatus, markAsPaid } = useOrders();
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  if (loading) return <div style={{ color: T.muted, fontSize: 13.5 }}>A carregar encomendas...</div>;

  const filtered = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  const handleUpdateStatus = async (id, status) => {
    await updateStatus(id, status);
    setSelected((s) => (s && s.id === id ? { ...s, status } : s));
  };

  const handleMarkAsPaid = async (id) => {
    try {
      await markAsPaid(id);
      setSelected((s) => (s && s.id === id ? { ...s, paymentStatus: "paid", status: "confirmed" } : s));
    } catch (err) {
      setErrorMsg(err.message || "Erro ao marcar como pago.");
    }
  };

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {["all", ...Object.keys(STATUS_META)].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            style={{
              padding: "7px 14px", borderRadius: 999, fontSize: 12.5, cursor: "pointer",
              border: `1px solid ${filter === s ? T.accent : T.border}`,
              background: filter === s ? "rgba(201,255,63,0.08)" : "transparent",
              color: filter === s ? T.accent : T.muted,
            }}
          >
            {s === "all" ? "Todas" : STATUS_META[s].label}
          </button>
        ))}
      </div>

      <div style={{ background: T.bgRaised, border: `1px solid ${T.border}`, borderRadius: 12, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
          <thead>
            <tr style={{ background: T.bgRaised2, textAlign: "left" }}>
              {["Encomenda", "Cliente", "Data", "Total", "Pagamento", "Estado"].map((h) => (
                <th key={h} style={{ padding: "12px 16px", color: T.muted, fontWeight: 600, fontSize: 11.5, textTransform: "uppercase", letterSpacing: 0.4 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((o) => (
              <tr key={o.id} onClick={() => setSelected(o)} style={{ borderTop: `1px solid ${T.border}`, cursor: "pointer" }}>
                <td style={{ padding: "12px 16px", fontWeight: 600 }}>{o.orderNumber}</td>
                <td style={{ padding: "12px 16px" }}>{o.customerName}</td>
                <td style={{ padding: "12px 16px", color: T.muted }}>{o.createdAt ? new Date(o.createdAt).toLocaleDateString("pt-PT") : "—"}</td>
                <td style={{ padding: "12px 16px" }}>€{Number(o.total).toFixed(2)}</td>
                <td style={{ padding: "12px 16px", color: T.muted }}>{o.paymentMethod === "card" ? "Cartão" : "Transferência"}</td>
                <td style={{ padding: "12px 16px" }}><Badge status={o.status} /></td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={6} style={{ padding: 28, textAlign: "center", color: T.muted }}>Sem encomendas nesta categoria.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {errorMsg && <div style={{ color: T.danger, fontSize: 13, marginTop: 12 }}>{errorMsg}</div>}

      {selected && <OrderDrawer order={selected} onClose={() => setSelected(null)} onUpdateStatus={handleUpdateStatus} onMarkAsPaid={handleMarkAsPaid} />}
    </div>
  );
}
