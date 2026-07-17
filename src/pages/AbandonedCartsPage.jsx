import React, { useState } from "react";
import { ShoppingCart, Send, Clock } from "lucide-react";
import { T, Button } from "../lib/theme";
import { useAbandonedCarts } from "../hooks/useAbandonedCarts";

function timeSince(dateStr) {
  const hours = Math.round((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60));
  if (hours < 1) return "há menos de 1h";
  if (hours < 24) return `há ${hours}h`;
  return `há ${Math.round(hours / 24)} dia(s)`;
}

export default function AbandonedCartsPage() {
  const { carts, loading, sendReminderNow } = useAbandonedCarts();
  const [sendingId, setSendingId] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSend = async (cartId) => {
    setSendingId(cartId);
    setErrorMsg("");
    try {
      await sendReminderNow(cartId);
    } catch (err) {
      setErrorMsg(err.message || "Erro ao enviar o email.");
    } finally {
      setSendingId(null);
    }
  };

  const pendingReminders = carts.filter((c) => !c.reminderSentAt).length;

  return (
    <div>
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 20 }}>
        <div style={{ background: T.bgRaised, border: `1px solid ${T.border}`, borderRadius: 12, padding: 18, flex: "1 1 180px" }}>
          <div style={{ fontSize: 11.5, color: T.muted, textTransform: "uppercase", letterSpacing: 0.4 }}>Carrinhos ativos</div>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 30, marginTop: 6, color: T.accent }}>{carts.length}</div>
        </div>
        <div style={{ background: T.bgRaised, border: `1px solid ${T.border}`, borderRadius: 12, padding: 18, flex: "1 1 180px" }}>
          <div style={{ fontSize: 11.5, color: T.muted, textTransform: "uppercase", letterSpacing: 0.4 }}>Ainda sem aviso enviado</div>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 30, marginTop: 6 }}>{pendingReminders}</div>
        </div>
      </div>

      <p style={{ fontSize: 12.5, color: T.muted, margin: "0 0 16px", lineHeight: 1.6 }}>
        Só aparecem aqui clientes com <strong>sessão iniciada</strong> na loja que tenham artigos no carrinho — carrinhos de visitantes anónimos
        não têm email associado, por isso não conseguimos avisá-los. O aviso automático é enviado sozinho ao fim de 10 horas sem alterações no carrinho.
      </p>

      {errorMsg && <div style={{ color: T.danger, fontSize: 13, marginBottom: 14 }}>{errorMsg}</div>}

      {loading ? (
        <div style={{ color: T.muted, fontSize: 13.5 }}>A carregar...</div>
      ) : carts.length === 0 ? (
        <div style={{ background: T.bgRaised, border: `1px solid ${T.border}`, borderRadius: 12, padding: 40, textAlign: "center", color: T.muted }}>
          Sem carrinhos abandonados neste momento.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {carts.map((c) => (
            <div key={c.id} style={{ background: T.bgRaised, border: `1px solid ${T.border}`, borderRadius: 12, padding: 18 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{c.customerEmail}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: T.muted, marginTop: 3 }}>
                    <Clock size={12} /> Parado {timeSince(c.updatedAt)}
                    {c.reminderSentAt && <span style={{ color: T.accent, marginLeft: 8 }}>· Aviso já enviado</span>}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, color: T.accent }}>€{c.subtotal.toFixed(2)}</div>
                  <Button
                    variant="ghost"
                    onClick={() => handleSend(c.id)}
                    disabled={sendingId === c.id}
                    style={{ fontSize: 12, padding: "6px 12px", marginTop: 6 }}
                  >
                    <Send size={12} /> {sendingId === c.id ? "A enviar..." : "Enviar aviso agora"}
                  </Button>
                </div>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {c.items.map((it, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, background: T.bg, border: `1px solid ${T.border}`, borderRadius: 8, padding: "6px 10px" }}>
                    {it.image && <img src={it.image} alt="" style={{ width: 28, height: 28, borderRadius: 4, objectFit: "cover" }} />}
                    <span style={{ fontSize: 12 }}>{it.name} {it.size ? `· ${it.size}` : ""} × {it.qty}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
