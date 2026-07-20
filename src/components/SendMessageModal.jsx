import React, { useState } from "react";
import { X, Send } from "lucide-react";
import { T, inputStyle, Field, Button } from "../lib/theme";
import { supabase } from "../lib/supabase";

/**
 * mode: "single" (para um cliente, com o email/favoritos já conhecidos)
 *    ou "selected" (para uma lista de contactos escolhidos na página de Clientes)
 *    ou "broadcast" (para todos os subscritores ativos da newsletter)
 */
export default function SendMessageModal({ mode, customer, subscriberCount, selectedEmails, onClose, onSent }) {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [confirming, setConfirming] = useState(false);

  const send = async () => {
    setSending(true);
    setError("");
    try {
      const body =
        mode === "single" ? { mode: "single", toEmail: customer.email, subject, message }
        : mode === "selected" ? { mode: "selected", emails: selectedEmails, subject, message }
        : { mode: "broadcast", subject, message };

      const { data, error: err } = await supabase.functions.invoke("send-campaign", { body });
      if (err) throw err;
      if (data?.error) throw new Error(data.error);
      setResult(data);
      onSent?.();
    } catch (err) {
      setError(err.message || "Erro ao enviar.");
    } finally {
      setSending(false);
    }
  };

  const title =
    mode === "single" ? `Enviar a ${customer.name || customer.email}`
    : mode === "selected" ? `Enviar aos ${subscriberCount} selecionados`
    : "Enviar campanha";

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300 }}>
      <div style={{ width: "100%", maxWidth: 480, background: T.bgRaised, border: `1px solid ${T.border}`, borderRadius: 14, padding: 26 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
          <h2 style={{ margin: 0, fontFamily: "'Bebas Neue', sans-serif", fontSize: 20 }}>{title}</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", color: T.muted, cursor: "pointer" }}><X size={20} /></button>
        </div>

        {result ? (
          <div>
            <p style={{ fontSize: 14, color: T.accent, marginBottom: 20 }}>
              {mode === "single" ? "Email enviado ✓" : `Enviado a ${result.sent} de ${result.total} contactos ✓`}
            </p>
            {result.updateError && (
              <p style={{ fontSize: 12.5, color: T.warn, marginBottom: 20 }}>
                ⚠ O envio funcionou, mas não foi possível marcar como "contactado": {result.updateError}
              </p>
            )}
            {result.sendErrors && (
              <div style={{ fontSize: 12, color: T.danger, marginBottom: 20, background: "rgba(255,107,94,0.08)", border: `1px solid ${T.danger}55`, borderRadius: 8, padding: 12 }}>
                O Resend recusou parte do envio:
                {result.sendErrors.map((e, i) => <div key={i} style={{ marginTop: 6 }}>{e}</div>)}
              </div>
            )}
            <Button onClick={onClose} style={{ width: "100%" }}>Fechar</Button>
          </div>
        ) : (
          <>
            {mode === "broadcast" && (
              <div style={{ background: "rgba(255,180,77,0.08)", border: `1px solid ${T.warn}55`, borderRadius: 8, padding: 12, fontSize: 12.5, color: T.warn, marginBottom: 16, lineHeight: 1.5 }}>
                ⚠ Vai ser enviado a todos os <strong>{subscriberCount}</strong> subscritores ativos da newsletter — se o número for grande, confirma que não excedes o limite diário do teu plano no Resend.
                O link de cancelar subscrição é adicionado automaticamente.
              </div>
            )}

            {mode === "selected" && (
              <div style={{ background: "rgba(201,255,63,0.06)", border: `1px solid ${T.accent}55`, borderRadius: 8, padding: 12, fontSize: 12.5, color: T.muted, marginBottom: 16, lineHeight: 1.5 }}>
                Vai ser enviado só aos <strong style={{ color: T.accent }}>{subscriberCount}</strong> contactos que selecionaste. O link de cancelar subscrição é adicionado automaticamente.
              </div>
            )}

            {mode === "single" && customer.favoriteNames?.length > 0 && (
              <div style={{ fontSize: 12, color: T.muted, marginBottom: 14, lineHeight: 1.5 }}>
                Favoritos deste cliente, para referires na mensagem: <strong style={{ color: T.text }}>{customer.favoriteNames.join(", ")}</strong>
              </div>
            )}

            <Field label="Assunto">
              <input style={inputStyle} value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Ex: Um desconto especial para ti" />
            </Field>
            <Field label="Mensagem">
              <textarea
                style={{ ...inputStyle, minHeight: 140, resize: "vertical" }}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Escreve a mensagem — cada linha nova fica separada no email."
              />
            </Field>

            {error && <div style={{ color: T.danger, fontSize: 13, marginBottom: 14 }}>{error}</div>}

            {!confirming ? (
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <Button variant="ghost" onClick={onClose}>Cancelar</Button>
                <Button onClick={() => subject && message && setConfirming(true)}>Continuar</Button>
              </div>
            ) : (
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <Button variant="ghost" onClick={() => setConfirming(false)}>Voltar</Button>
                <Button onClick={send} disabled={sending}>
                  <Send size={13} /> {sending ? "A enviar..." : mode === "single" ? "Confirmar envio" : `Enviar a ${subscriberCount} contactos`}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
