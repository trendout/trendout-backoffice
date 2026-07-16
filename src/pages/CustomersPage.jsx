import React, { useState, useMemo } from "react";
import { Search, Mail, ArrowUpDown } from "lucide-react";
import { T, inputStyle } from "../lib/theme";
import { useCustomers } from "../hooks/useCustomers";
import CustomerDetailModal from "../components/CustomerDetailModal";

export default function CustomersPage() {
  const { customers, loading } = useCustomers();
  const [query, setQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("recent"); // 'recent' | 'oldest'
  const [selected, setSelected] = useState(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = customers.filter((c) => !q || c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q));

    list = [...list].sort((a, b) => {
      const dateA = new Date(a.lastOrderDate || a.firstSeen).getTime();
      const dateB = new Date(b.lastOrderDate || b.firstSeen).getTime();
      return sortOrder === "recent" ? dateB - dateA : dateA - dateB;
    });

    return list;
  }, [customers, query, sortOrder]);

  if (loading) return <div style={{ color: T.muted, fontSize: 13.5 }}>A carregar clientes...</div>;

  const totalNewsletter = customers.filter((c) => c.isNewsletterSubscriber).length;

  return (
    <div>
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 20 }}>
        <div style={{ background: T.bgRaised, border: `1px solid ${T.border}`, borderRadius: 12, padding: 18, flex: "1 1 180px" }}>
          <div style={{ fontSize: 11.5, color: T.muted, textTransform: "uppercase", letterSpacing: 0.4 }}>Total de clientes</div>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, marginTop: 6 }}>{customers.length}</div>
        </div>
        <div style={{ background: T.bgRaised, border: `1px solid ${T.border}`, borderRadius: 12, padding: 18, flex: "1 1 180px" }}>
          <div style={{ fontSize: 11.5, color: T.muted, textTransform: "uppercase", letterSpacing: 0.4 }}>Subscritores newsletter</div>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, marginTop: 6, color: T.accent }}>{totalNewsletter}</div>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div style={{ position: "relative", flex: "1 1 260px", maxWidth: 340 }}>
          <Search size={15} style={{ position: "absolute", left: 12, top: 12, color: T.muted }} />
          <input style={{ ...inputStyle, paddingLeft: 36 }} placeholder="Pesquisar por nome ou email..." value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <button
          onClick={() => setSortOrder(sortOrder === "recent" ? "oldest" : "recent")}
          style={{ display: "flex", alignItems: "center", gap: 8, background: "none", border: `1px solid ${T.border}`, borderRadius: 8, color: T.text, padding: "10px 14px", cursor: "pointer", fontSize: 13 }}
        >
          <ArrowUpDown size={14} /> {sortOrder === "recent" ? "Mais recentes primeiro" : "Mais antigos primeiro"}
        </button>
      </div>

      <div style={{ background: T.bgRaised, border: `1px solid ${T.border}`, borderRadius: 12, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
          <thead>
            <tr style={{ background: T.bgRaised2, textAlign: "left" }}>
              {["Cliente", "Email", "Conta", "Encomendas", "Total gasto", "Pontos", "Newsletter", "Última atividade"].map((h) => (
                <th key={h} style={{ padding: "12px 16px", color: T.muted, fontWeight: 600, fontSize: 11.5, textTransform: "uppercase", letterSpacing: 0.4 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.email} style={{ borderTop: `1px solid ${T.border}` }}>
                <td style={{ padding: "12px 16px", fontWeight: 600 }}>
                  <button onClick={() => setSelected(c)} style={{ background: "none", border: "none", color: T.text, cursor: "pointer", fontWeight: 600, fontSize: 13.5, textAlign: "left", padding: 0 }}>
                    {c.name || <span style={{ color: T.muted, fontWeight: 400 }}>—</span>}
                  </button>
                </td>
                <td style={{ padding: "12px 16px", color: T.muted }}>{c.email}</td>
                <td style={{ padding: "12px 16px" }}>
                  {c.hasAccount ? (
                    <span style={{ fontSize: 11.5, color: c.emailConfirmed ? T.accent : T.warn, border: `1px solid ${c.emailConfirmed ? T.accent : T.warn}55`, borderRadius: 999, padding: "3px 9px" }}>
                      {c.emailConfirmed ? "Confirmada" : "Por confirmar"}
                    </span>
                  ) : (
                    <span style={{ color: T.muted, fontSize: 12 }}>Convidado</span>
                  )}
                </td>
                <td style={{ padding: "12px 16px" }}>{c.orderCount}</td>
                <td style={{ padding: "12px 16px", color: c.totalSpent > 0 ? T.accent : T.muted, fontWeight: c.totalSpent > 0 ? 600 : 400 }}>€{c.totalSpent.toFixed(2)}</td>
                <td style={{ padding: "12px 16px", color: (c.pointsBalance || 0) > 0 ? T.accent : T.muted }}>{c.pointsBalance || 0}</td>
                <td style={{ padding: "12px 16px" }}>
                  {c.isNewsletterSubscriber ? (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11.5, color: T.accent, background: "rgba(201,255,63,0.1)", border: `1px solid ${T.accent}55`, borderRadius: 999, padding: "3px 9px" }}>
                      <Mail size={11} /> Subscrito
                    </span>
                  ) : (
                    <span style={{ color: T.muted, fontSize: 12 }}>—</span>
                  )}
                </td>
                <td style={{ padding: "12px 16px", color: T.muted }}>
                  {(c.lastOrderDate || c.firstSeen) ? new Date(c.lastOrderDate || c.firstSeen).toLocaleDateString("pt-PT") : "—"}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={8} style={{ padding: 28, textAlign: "center", color: T.muted }}>Sem clientes encontrados.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {selected && <CustomerDetailModal customer={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
