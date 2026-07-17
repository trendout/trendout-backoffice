import React from "react";
import { X, MapPin, Mail, Heart } from "lucide-react";
import { T } from "../lib/theme";
import { Badge } from "../lib/orderStatus";
import { useCustomerDetail } from "../hooks/useCustomerDetail";

export default function CustomerDetailModal({ customer, onClose }) {
  const { addresses, orders, favorites, loading } = useCustomerDetail(customer.email, customer.customerId);

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "flex-start", justifyContent: "center", zIndex: 200, padding: "40px 16px", overflowY: "auto" }}>
      <div style={{ width: "100%", maxWidth: 560, background: T.bgRaised, border: `1px solid ${T.border}`, borderRadius: 14, padding: 28 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <div>
            <h2 style={{ margin: 0, fontFamily: "'Bebas Neue', sans-serif", fontSize: 24 }}>{customer.name || "Cliente"}</h2>
            <div style={{ color: T.muted, fontSize: 13, marginTop: 4 }}>{customer.email}</div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: T.muted, cursor: "pointer" }}><X size={20} /></button>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 22 }}>
          <div style={{ background: T.bg, border: `1px solid ${T.border}`, borderRadius: 8, padding: "10px 16px", flex: "1 1 120px" }}>
            <div style={{ fontSize: 11, color: T.muted, textTransform: "uppercase" }}>Encomendas</div>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, marginTop: 2 }}>{customer.orderCount}</div>
          </div>
          <div style={{ background: T.bg, border: `1px solid ${T.border}`, borderRadius: 8, padding: "10px 16px", flex: "1 1 120px" }}>
            <div style={{ fontSize: 11, color: T.muted, textTransform: "uppercase" }}>Total gasto</div>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, marginTop: 2, color: T.accent }}>€{customer.totalSpent.toFixed(2)}</div>
          </div>
          {customer.isNewsletterSubscriber && (
            <div style={{ background: "rgba(201,255,63,0.08)", border: `1px solid ${T.accent}55`, borderRadius: 8, padding: "10px 16px", flex: "1 1 120px", display: "flex", alignItems: "center", gap: 8 }}>
              <Mail size={16} color={T.accent} />
              <span style={{ fontSize: 12.5, color: T.accent }}>Subscrito à newsletter</span>
            </div>
          )}
        </div>

        {loading ? (
          <div style={{ color: T.muted, fontSize: 13.5 }}>A carregar...</div>
        ) : (
          <>
            <div style={{ marginBottom: 22 }}>
              <div style={{ fontSize: 11.5, color: T.muted, textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 10 }}>Moradas guardadas</div>
              {addresses.length === 0 ? (
                <div style={{ color: T.muted, fontSize: 13, background: T.bg, border: `1px solid ${T.border}`, borderRadius: 8, padding: 14, textAlign: "center" }}>
                  Sem moradas guardadas na conta.
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  {addresses.map((a) => (
                    <div key={a.id} style={{ background: T.bg, border: `1px solid ${T.border}`, borderRadius: 8, padding: 12 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                        <MapPin size={12} color={T.muted} />
                        <span style={{ fontWeight: 700, fontSize: 12.5 }}>{a.label || "Morada"}</span>
                      </div>
                      <div style={{ fontSize: 12, color: "#cfd3cd", lineHeight: 1.6 }}>
                        {a.fullName}<br />
                        {a.address}<br />
                        {a.postalCode} {a.city}, {a.country}
                        {a.nif && <><br />NIF: {a.nif}</>}
                      </div>
                      <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                        {a.isDefaultShipping && <span style={{ fontSize: 10, color: T.accent, border: `1px solid ${T.accent}55`, borderRadius: 999, padding: "2px 7px" }}>Entrega</span>}
                        {a.isDefaultBilling && <span style={{ fontSize: 10, color: T.warn, border: `1px solid ${T.warn}55`, borderRadius: 999, padding: "2px 7px" }}>Faturação</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ marginBottom: 22 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11.5, color: T.muted, textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 10 }}>
                <Heart size={12} /> Produtos favoritos
              </div>
              {favorites.length === 0 ? (
                <div style={{ color: T.muted, fontSize: 13, background: T.bg, border: `1px solid ${T.border}`, borderRadius: 8, padding: 14, textAlign: "center" }}>
                  Sem produtos favoritos.
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  {favorites.map((f) => (
                    <div key={f.id} style={{ display: "flex", alignItems: "center", gap: 10, background: T.bg, border: `1px solid ${T.border}`, borderRadius: 8, padding: 10 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 6, overflow: "hidden", background: T.bgRaised2, flexShrink: 0 }}>
                        {f.image && <img src={f.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 12.5, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{f.name}</div>
                        <div style={{ fontSize: 12, color: T.accent }}>€{f.basePrice.toFixed(2)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <div style={{ fontSize: 11.5, color: T.muted, textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 10 }}>Histórico de encomendas</div>
              {orders.length === 0 ? (
                <div style={{ color: T.muted, fontSize: 13, background: T.bg, border: `1px solid ${T.border}`, borderRadius: 8, padding: 14, textAlign: "center" }}>
                  Ainda sem encomendas.
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {orders.map((o) => (
                    <div key={o.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: T.bg, border: `1px solid ${T.border}`, borderRadius: 8, padding: "10px 14px" }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{o.orderNumber}</div>
                        <div style={{ fontSize: 11.5, color: T.muted }}>{new Date(o.createdAt).toLocaleDateString("pt-PT")}</div>
                      </div>
                      <Badge status={o.status} />
                      <div style={{ fontWeight: 700, fontSize: 13.5 }}>€{o.total.toFixed(2)}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
