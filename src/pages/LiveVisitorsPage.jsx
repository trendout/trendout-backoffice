import React from "react";
import { MapPin, ShoppingBag, CreditCard, Eye } from "lucide-react";
import { T } from "../lib/theme";
import { useLiveVisitors } from "../hooks/useLiveVisitors";

const CART_STATUS_META = {
  browsing: { label: "A navegar", color: T.muted, icon: Eye },
  has_cart: { label: "Com produtos no carrinho", color: T.warn, icon: ShoppingBag },
  checkout: { label: "No checkout", color: T.accent, icon: CreditCard },
};

function timeAgo(dateStr) {
  const seconds = Math.round((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return `há ${seconds}s`;
  return `há ${Math.round(seconds / 60)}min`;
}

export default function LiveVisitorsPage() {
  const { visitors, loading } = useLiveVisitors();

  const totalWithCart = visitors.filter((v) => v.cartStatus !== "browsing").length;

  return (
    <div>
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 20 }}>
        <div style={{ background: T.bgRaised, border: `1px solid ${T.border}`, borderRadius: 12, padding: 18, flex: "1 1 180px" }}>
          <div style={{ fontSize: 11.5, color: T.muted, textTransform: "uppercase", letterSpacing: 0.4 }}>Visitantes agora</div>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 30, marginTop: 6, color: T.accent }}>{visitors.length}</div>
        </div>
        <div style={{ background: T.bgRaised, border: `1px solid ${T.border}`, borderRadius: 12, padding: 18, flex: "1 1 180px" }}>
          <div style={{ fontSize: 11.5, color: T.muted, textTransform: "uppercase", letterSpacing: 0.4 }}>Com produtos no carrinho</div>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 30, marginTop: 6 }}>{totalWithCart}</div>
        </div>
      </div>

      {loading ? (
        <div style={{ color: T.muted, fontSize: 13.5 }}>A carregar...</div>
      ) : visitors.length === 0 ? (
        <div style={{ background: T.bgRaised, border: `1px solid ${T.border}`, borderRadius: 12, padding: 40, textAlign: "center", color: T.muted }}>
          Sem visitantes ativos neste momento. Esta página atualiza-se sozinha a cada 5 segundos.
        </div>
      ) : (
        <div style={{ background: T.bgRaised, border: `1px solid ${T.border}`, borderRadius: 12, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
            <thead>
              <tr style={{ background: T.bgRaised2, textAlign: "left" }}>
                {["Local", "Página atual", "Estado", "Valor no carrinho", "Última atividade"].map((h) => (
                  <th key={h} style={{ padding: "12px 16px", color: T.muted, fontWeight: 600, fontSize: 11.5, textTransform: "uppercase", letterSpacing: 0.4 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visitors.map((v) => {
                const meta = CART_STATUS_META[v.cartStatus] || CART_STATUS_META.browsing;
                const Icon = meta.icon;
                return (
                  <tr key={v.id} style={{ borderTop: `1px solid ${T.border}` }}>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <MapPin size={13} color={T.muted} />
                        {v.city ? `${v.city}, ${v.country}` : "Localização desconhecida"}
                      </div>
                    </td>
                    <td style={{ padding: "12px 16px", color: T.muted, fontFamily: "monospace", fontSize: 12.5 }}>{v.currentPage}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: meta.color }}>
                        <Icon size={13} /> {meta.label}
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px", color: v.cartValue ? T.accent : T.muted, fontWeight: v.cartValue ? 600 : 400 }}>
                      {v.cartValue ? `€${v.cartValue.toFixed(2)}` : "—"}
                    </td>
                    <td style={{ padding: "12px 16px", color: T.muted }}>{timeAgo(v.lastSeen)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
