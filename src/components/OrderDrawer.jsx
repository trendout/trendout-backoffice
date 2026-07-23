import React, { useState, useEffect } from "react";
import { X, CheckCircle2, Truck, Save, Send, Printer, MapPin, AlertTriangle } from "lucide-react";
import { T, inputStyle, Button } from "../lib/theme";
import { Badge, STATUS_META } from "../lib/orderStatus";
import { supabase } from "../lib/supabase";
import { generateOrderPdf } from "../lib/orderPdf";

export default function OrderDrawer({ order, onClose, onUpdateStatus, onMarkAsPaid, onUpdateTrackingCode }) {
  const [trackingInput, setTrackingInput] = useState(order.trackingCode || "");
  const [savedTracking, setSavedTracking] = useState(false);
  const [notifying, setNotifying] = useState(false);
  const [notifyResult, setNotifyResult] = useState("");

  useEffect(() => {
    setTrackingInput(order.trackingCode || "");
  }, [order.id]);

  const saveTracking = async () => {
    await onUpdateTrackingCode(order.id, trackingInput.trim());
    setSavedTracking(true);
    setTimeout(() => setSavedTracking(false), 2000);
  };

  const notifyShipping = async () => {
    setNotifying(true);
    setNotifyResult("");
    const { error } = await supabase.functions.invoke("send-shipping-notification", { body: { orderId: order.id } });
    setNotifying(false);
    setNotifyResult(error ? `Erro: ${error.message}` : "Email enviado ✓");
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", justifyContent: "flex-end", zIndex: 200 }}>
      <div style={{ width: "min(420px, 100%)", background: T.bgRaised, borderLeft: `1px solid ${T.border}`, height: "100%", overflowY: "auto", padding: 26 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
          <div>
            <h2 style={{ margin: 0, fontFamily: "'Bebas Neue', sans-serif", fontSize: 24 }}>{order.orderNumber}</h2>
            <div style={{ color: T.muted, fontSize: 12.5, marginTop: 4 }}>
              {order.createdAt ? new Date(order.createdAt).toLocaleDateString("pt-PT", { day: "2-digit", month: "long", year: "numeric" }) : "—"}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button
              onClick={() => generateOrderPdf(order)}
              title="Gerar PDF da encomenda para colar na embalagem"
              style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: `1px solid ${T.border}`, borderRadius: 8, color: T.text, padding: "7px 12px", cursor: "pointer", fontSize: 12.5 }}
            >
              <Printer size={14} /> PDF
            </button>
            <button onClick={onClose} style={{ background: "none", border: "none", color: T.muted, cursor: "pointer" }}><X size={20} /></button>
          </div>
        </div>

        <Badge status={order.status} />

        <div style={{ marginTop: 20 }}>
          <div style={{ fontSize: 11.5, color: T.muted, textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 8 }}>Cliente</div>
          <div style={{ fontSize: 13.5 }}>{order.customerName}</div>
          <div style={{ fontSize: 12.5, color: T.muted }}>{order.customerEmail}</div>
        </div>

        {order.shipping && (
          <div style={{ marginTop: 18 }}>
            <div style={{ fontSize: 11.5, color: T.muted, textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 8 }}>Morada de envio</div>
            <div style={{ fontSize: 13, lineHeight: 1.6, color: "#cfd3cd" }}>
              {order.shipping.fullName}<br />
              {order.shipping.address}<br />
              {order.shipping.postalCode} {order.shipping.city}, {order.shipping.country}<br />
              {order.shipping.phone}
            </div>
          </div>
        )}

        <div style={{ marginTop: 18 }}>
          <div style={{ fontSize: 11.5, color: T.muted, textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 8 }}>Envio</div>
          <div style={{ fontSize: 13, color: "#cfd3cd" }}>
            {order.shippingCountry || "—"} · {order.shippingSpeed === "express" ? "Envio Express" : "Envio Standard"}<br />
            Entrega estimada: {order.estimatedDelivery ? new Date(order.estimatedDelivery).toLocaleDateString("pt-PT") : "a calcular"}
          </div>
        </div>

        {order.orderIpCity && (() => {
          const mismatch = order.orderIpCountryCode && order.shippingCountry && order.orderIpCountryCode !== order.shippingCountry;
          return (
            <div style={{ marginTop: 18 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11.5, color: T.muted, textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 8 }}>
                <MapPin size={12} /> Localização de quem fez a encomenda
              </div>
              <div style={{ fontSize: 13, color: "#cfd3cd", display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <span>{order.orderIpCity}, {order.orderIpCountry}</span>
                {order.orderIpLat && order.orderIpLng && (
                  <a
                    href={`https://www.google.com/maps?q=${order.orderIpLat},${order.orderIpLng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: T.accent, fontSize: 12, textDecoration: "none" }}
                  >
                    Ver no mapa →
                  </a>
                )}
              </div>
              {mismatch && (
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8, color: T.warn, fontSize: 12, background: "rgba(255,180,77,0.08)", border: `1px solid ${T.warn}55`, borderRadius: 6, padding: "6px 10px" }}>
                  <AlertTriangle size={13} /> Esta localização não corresponde ao país da morada de entrega — vale a pena confirmar antes de enviar.
                </div>
              )}
            </div>
          );
        })()}

        <div style={{ marginTop: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11.5, color: T.muted, textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 8 }}>
            <Truck size={12} /> Código de rastreio
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              style={inputStyle}
              value={trackingInput}
              onChange={(e) => setTrackingInput(e.target.value)}
              placeholder="ex: CTT123456789PT"
            />
            <Button variant="ghost" onClick={saveTracking} style={{ padding: "0 14px", whiteSpace: "nowrap" }}>
              <Save size={13} /> Guardar
            </Button>
          </div>
          {savedTracking && <div style={{ color: T.accent, fontSize: 12, marginTop: 6 }}>Guardado ✓</div>}
          {order.status === "shipped" && !trackingInput && (
            <div style={{ color: T.warn, fontSize: 12, marginTop: 6 }}>Esta encomenda está marcada como enviada mas ainda sem código de rastreio.</div>
          )}
          {trackingInput && (
            <div style={{ marginTop: 10 }}>
              <Button variant="ghost" onClick={notifyShipping} disabled={notifying} style={{ fontSize: 12.5, padding: "8px 14px" }}>
                <Send size={13} /> {notifying ? "A enviar..." : "Notificar cliente do envio"}
              </Button>
              {notifyResult && (
                <div style={{ color: notifyResult.startsWith("Erro") ? T.danger : T.accent, fontSize: 12, marginTop: 6 }}>{notifyResult}</div>
              )}
            </div>
          )}
        </div>

        <div style={{ marginTop: 18 }}>
          <div style={{ fontSize: 11.5, color: T.muted, textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 8 }}>Pagamento</div>
          <div style={{ fontSize: 13, color: "#cfd3cd" }}>
            {order.paymentMethod === "card" ? `Cartão terminado em •••• ${order.cardLast4 || "----"}` : order.paymentMethod === "mbway" ? "MB WAY" : "Transferência bancária"}
            {order.couponCode && <div style={{ marginTop: 4, color: T.accent, fontSize: 12.5 }}>Cupão aplicado: {order.couponCode} (−€{Number(order.discountAmount || 0).toFixed(2)})</div>}
          </div>
          <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{
              fontSize: 11.5, fontWeight: 600, padding: "3px 9px", borderRadius: 999,
              color: order.paymentStatus === "paid" ? T.accent : T.warn,
              background: order.paymentStatus === "paid" ? "rgba(201,255,63,0.1)" : "rgba(255,180,77,0.1)",
              border: `1px solid ${order.paymentStatus === "paid" ? T.accent : T.warn}55`,
            }}>
              {order.paymentStatus === "paid" ? "Pago" : "Aguarda pagamento"}
            </span>
          </div>
          {order.paymentMethod !== "card" && order.paymentStatus !== "paid" && (
            <Button
              variant="ghost"
              onClick={() => onMarkAsPaid(order.id)}
              style={{ marginTop: 10, fontSize: 12.5, padding: "8px 14px" }}
            >
              <CheckCircle2 size={13} /> Marcar pagamento como recebido
            </Button>
          )}
        </div>

        <div style={{ marginTop: 18 }}>
          <div style={{ fontSize: 11.5, color: T.muted, textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 8 }}>Artigos</div>
          {order.items.map((it, idx) => (
            <div key={idx} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderTop: `1px solid ${T.border}`, fontSize: 13 }}>
              <div>
                <div style={{ fontWeight: 600 }}>{it.productName}</div>
                <div style={{ color: T.muted, fontSize: 12 }}>{it.size} · {it.color} · x{it.quantity}</div>
              </div>
              <div>€{Number(it.lineTotal).toFixed(2)}</div>
            </div>
          ))}
          <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 10, marginTop: 6, fontSize: 13 }}>
            <div style={{ display: "flex", justifyContent: "space-between", color: T.muted, marginBottom: 4 }}><span>Subtotal</span><span>€{Number(order.subtotal).toFixed(2)}</span></div>
            <div style={{ display: "flex", justifyContent: "space-between", color: T.muted, marginBottom: 4 }}><span>Envio</span><span>€{Number(order.shippingCost).toFixed(2)}</span></div>
            <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: 15 }}><span>Total</span><span style={{ color: T.accent }}>€{Number(order.total).toFixed(2)}</span></div>
            {order.vatAmount != null && (
              <div style={{ fontSize: 11, color: T.muted, textAlign: "right", marginTop: 4 }}>
                {Number(order.vatRatePercent) === 0 ? "Isento de IVA" : `dos quais IVA (${order.vatRatePercent}%): €${Number(order.vatAmount).toFixed(2)}`}
              </div>
            )}
          </div>
        </div>

        <div style={{ marginTop: 22 }}>
          <div style={{ fontSize: 11.5, color: T.muted, textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 8 }}>Atualizar estado</div>
          <select style={inputStyle} value={order.status} onChange={(e) => onUpdateStatus(order.id, e.target.value)}>
            {Object.entries(STATUS_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        </div>
      </div>
    </div>
  );
}
