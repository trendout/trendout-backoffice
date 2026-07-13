import React, { useState, useEffect } from "react";
import { Save, Globe, Building2, Code2, CreditCard, Zap, AlertTriangle, Search } from "lucide-react";
import { T, inputStyle, Field, Button } from "../lib/theme";
import { useStoreSettings } from "../hooks/useStoreSettings";

export default function SettingsPage() {
  const { settings, loading, updateSettings } = useStoreSettings();
  const [form, setForm] = useState(null);
  const [saved, setSaved] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (settings) setForm(settings);
  }, [settings]);

  if (loading || !form) return <div style={{ color: T.muted, fontSize: 13.5 }}>A carregar definições...</div>;

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async () => {
    setErrorMsg("");
    try {
      await updateSettings({
        storeName: form.storeName,
        currency: form.currency,
        freeShippingThreshold: parseFloat(form.freeShippingThreshold) || 0,
        companyAddress: form.companyAddress,
        companyPhone: form.companyPhone,
        companyEmail: form.companyEmail,
        companyNif: form.companyNif,
        showCompanyInfoFooter: form.showCompanyInfoFooter,
        analyticsScripts: form.analyticsScripts,
        enableCardPayment: form.enableCardPayment,
        enableBankTransfer: form.enableBankTransfer,
        companyIban: form.companyIban,
        paymentMethodsAccepted: form.paymentMethodsAccepted,
        enableStripe: form.enableStripe,
        stripePublishableKey: form.stripePublishableKey,
        enableMultibanco: form.enableMultibanco,
        multibancoEntity: form.multibancoEntity,
        enableMbway: form.enableMbway,
        googleMerchantId: form.googleMerchantId,
        googleSiteVerification: form.googleSiteVerification,
        enableGoogleAds: form.enableGoogleAds,
        googleAdsConversionId: form.googleAdsConversionId,
        googleAdsConversionLabel: form.googleAdsConversionLabel,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setErrorMsg(err.message || "Erro ao guardar definições.");
    }
  };

  return (
    <div style={{ maxWidth: 640 }}>
      <div style={{ background: T.bgRaised, border: `1px solid ${T.border}`, borderRadius: 12, padding: 24, marginBottom: 18 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18, color: T.muted, fontSize: 12, textTransform: "uppercase", letterSpacing: 0.4 }}>
          <Globe size={14} /> Domínio & identidade
        </div>
        <Field label="Nome da loja">
          <input style={inputStyle} value={form.storeName || ""} onChange={(e) => update("storeName", e.target.value)} />
        </Field>
        <Field label="Domínio">
          <input style={{ ...inputStyle, color: T.muted }} value={form.domain || ""} disabled />
        </Field>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <Field label="Moeda">
            <select style={inputStyle} value={form.currency || "EUR"} onChange={(e) => update("currency", e.target.value)}>
              <option value="EUR">Euro (€)</option>
            </select>
          </Field>
          <Field label="Envio grátis a partir de (€)">
            <input style={inputStyle} type="number" step="0.01" value={form.freeShippingThreshold ?? ""} onChange={(e) => update("freeShippingThreshold", e.target.value)} />
          </Field>
        </div>
      </div>

      <div style={{ background: T.bgRaised, border: `1px solid ${T.border}`, borderRadius: 12, padding: 24, marginBottom: 18 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18, color: T.muted, fontSize: 12, textTransform: "uppercase", letterSpacing: 0.4 }}>
          <Building2 size={14} /> Dados da empresa
        </div>
        <Field label="Morada">
          <input style={inputStyle} value={form.companyAddress || ""} onChange={(e) => update("companyAddress", e.target.value)} placeholder="Rua das Indústrias, 45 · 4450-100 Matosinhos, Portugal" />
        </Field>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <Field label="Telefone">
            <input style={inputStyle} value={form.companyPhone || ""} onChange={(e) => update("companyPhone", e.target.value)} placeholder="+351 220 123 456" />
          </Field>
          <Field label="Email">
            <input style={inputStyle} value={form.companyEmail || ""} onChange={(e) => update("companyEmail", e.target.value)} placeholder="geral@trendout.pt" />
          </Field>
        </div>
        <Field label="NIF da empresa">
          <input style={inputStyle} value={form.companyNif || ""} onChange={(e) => update("companyNif", e.target.value)} placeholder="500000000" />
        </Field>

        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: T.muted, cursor: "pointer", marginTop: 4 }}>
          <input
            type="checkbox"
            checked={!!form.showCompanyInfoFooter}
            onChange={(e) => update("showCompanyInfoFooter", e.target.checked)}
            style={{ accentColor: T.accent }}
          />
          Mostrar estes dados no rodapé da loja
        </label>
      </div>

      <div style={{ background: T.bgRaised, border: `1px solid ${T.border}`, borderRadius: 12, padding: 24, marginBottom: 18 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18, color: T.muted, fontSize: 12, textTransform: "uppercase", letterSpacing: 0.4 }}>
          <CreditCard size={14} /> Métodos de pagamento
        </div>

        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: T.text, cursor: "pointer", marginBottom: 4 }}>
          <input type="checkbox" checked={!!form.enableCardPayment} onChange={(e) => update("enableCardPayment", e.target.checked)} style={{ accentColor: T.accent }} />
          Cartão de crédito/débito
        </label>
        <p style={{ fontSize: 11.5, color: T.muted, margin: "0 0 14px 24px" }}>
          Aparece no checkout, mas ainda não processa pagamentos reais (falta a integração Stripe).
        </p>

        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: T.text, cursor: "pointer", marginBottom: 4 }}>
          <input type="checkbox" checked={!!form.enableBankTransfer} onChange={(e) => update("enableBankTransfer", e.target.checked)} style={{ accentColor: T.accent }} />
          Transferência bancária
        </label>
        <p style={{ fontSize: 11.5, color: T.muted, margin: "0 0 14px 24px" }}>
          Já cria encomendas reais (estado "Pendente" até confirmares o pagamento).
        </p>

        {form.enableBankTransfer && (
          <Field label="IBAN (mostrado ao cliente no checkout)">
            <input style={inputStyle} value={form.companyIban || ""} onChange={(e) => update("companyIban", e.target.value)} placeholder="PT50 0000 0000 0000 0000 0000 0" />
          </Field>
        )}

        <div style={{ fontSize: 12, color: T.muted, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.3, margin: "18px 0 10px" }}>
          Selos visíveis no rodapé da loja
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 14 }}>
          {[
            { key: "visa", label: "VISA" },
            { key: "mastercard", label: "Mastercard" },
            { key: "amex", label: "AMEX" },
            { key: "transfer", label: "Transferência" },
          ].map((m) => (
            <label key={m.key} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12.5, color: T.text, cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={(form.paymentMethodsAccepted || []).includes(m.key)}
                onChange={(e) => {
                  const current = form.paymentMethodsAccepted || [];
                  update("paymentMethodsAccepted", e.target.checked ? [...current, m.key] : current.filter((k) => k !== m.key));
                }}
                style={{ accentColor: T.accent }}
              />
              {m.label}
            </label>
          ))}
        </div>
      </div>

      <div style={{ background: T.bgRaised, border: `1px solid ${T.border}`, borderRadius: 12, padding: 24, marginBottom: 18 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, color: T.muted, fontSize: 12, textTransform: "uppercase", letterSpacing: 0.4 }}>
          <Zap size={14} /> Integrações de pagamento (Portugal)
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "flex-start", background: "rgba(255,180,77,0.08)", border: `1px solid ${T.warn}55`, borderRadius: 8, padding: 12, marginBottom: 18, fontSize: 12, color: T.warn, lineHeight: 1.6 }}>
          <AlertTriangle size={14} style={{ flexShrink: 0, marginTop: 2 }} />
          <span>
            Estas integrações ficam <strong>preparadas</strong> no checkout, mas ainda não processam pagamentos reais.
            Chaves secretas (Stripe secret key, webhook secret, chaves de API do Multibanco/MB WAY) nunca se colam aqui —
            configuram-se como <em>Edge Function secrets</em> no Supabase, porque esta tabela é lida pela loja pública.
          </span>
        </div>

        <div style={{ borderBottom: `1px solid ${T.border}`, paddingBottom: 18, marginBottom: 18 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: T.text, cursor: "pointer", marginBottom: 10 }}>
            <input type="checkbox" checked={!!form.enableStripe} onChange={(e) => update("enableStripe", e.target.checked)} style={{ accentColor: T.accent }} />
            Stripe (cartão de crédito/débito)
          </label>
          {form.enableStripe && (
            <Field label="Stripe Publishable Key (chave pública — segura para expor)">
              <input style={inputStyle} value={form.stripePublishableKey || ""} onChange={(e) => update("stripePublishableKey", e.target.value)} placeholder="pk_live_..." />
            </Field>
          )}
        </div>

        <div style={{ borderBottom: `1px solid ${T.border}`, paddingBottom: 18, marginBottom: 18 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: T.text, cursor: "pointer", marginBottom: 10 }}>
            <input type="checkbox" checked={!!form.enableMultibanco} onChange={(e) => update("enableMultibanco", e.target.checked)} style={{ accentColor: T.accent }} />
            Multibanco
          </label>
          {form.enableMultibanco && (
            <Field label="Nº de entidade (mostrado ao cliente, não é secreto)">
              <input style={inputStyle} value={form.multibancoEntity || ""} onChange={(e) => update("multibancoEntity", e.target.value)} placeholder="12345" />
            </Field>
          )}
        </div>

        <div>
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: T.text, cursor: "pointer" }}>
            <input type="checkbox" checked={!!form.enableMbway} onChange={(e) => update("enableMbway", e.target.checked)} style={{ accentColor: T.accent }} />
            MB WAY
          </label>
        </div>
      </div>

      <div style={{ background: T.bgRaised, border: `1px solid ${T.border}`, borderRadius: 12, padding: 24, marginBottom: 18 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, color: T.muted, fontSize: 12, textTransform: "uppercase", letterSpacing: 0.4 }}>
          <Search size={14} /> Google Merchant Center & Google Ads
        </div>

        <p style={{ fontSize: 12.5, color: T.muted, margin: "0 0 18px", lineHeight: 1.6 }}>
          Nenhum destes valores é secreto — são IDs públicos usados pelo Google para identificar a tua loja.
          Falta ainda construir o feed de produtos (URL que o Merchant Center vai buscar automaticamente) — isso é o próximo passo depois de preencheres isto.
        </p>

        <Field label="ID do Merchant Center">
          <input style={inputStyle} value={form.googleMerchantId || ""} onChange={(e) => update("googleMerchantId", e.target.value)} placeholder="123456789" />
        </Field>

        <Field label="Meta tag de verificação do domínio (Search Console)">
          <input style={inputStyle} value={form.googleSiteVerification || ""} onChange={(e) => update("googleSiteVerification", e.target.value)} placeholder="ex: AbCdEfGhIjKlMnOpQrStUvWxYz" />
        </Field>
        <p style={{ fontSize: 11.5, color: T.muted, margin: "-10px 0 18px", lineHeight: 1.5 }}>
          No Search Console, escolhe verificar por "Tag HTML" — cola aqui só o valor do atributo <code>content</code>, não a tag toda.
        </p>

        <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 16 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: T.text, cursor: "pointer", marginBottom: 10 }}>
            <input type="checkbox" checked={!!form.enableGoogleAds} onChange={(e) => update("enableGoogleAds", e.target.checked)} style={{ accentColor: T.accent }} />
            Google Ads (rastreio de conversões)
          </label>
          {form.enableGoogleAds && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <Field label="Conversion ID">
                <input style={inputStyle} value={form.googleAdsConversionId || ""} onChange={(e) => update("googleAdsConversionId", e.target.value)} placeholder="AW-123456789" />
              </Field>
              <Field label="Conversion Label">
                <input style={inputStyle} value={form.googleAdsConversionLabel || ""} onChange={(e) => update("googleAdsConversionLabel", e.target.value)} placeholder="AbCdEfGhIjKlMnOp" />
              </Field>
            </div>
          )}
        </div>
      </div>

      <div style={{ background: T.bgRaised, border: `1px solid ${T.border}`, borderRadius: 12, padding: 24, marginBottom: 18 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, color: T.muted, fontSize: 12, textTransform: "uppercase", letterSpacing: 0.4 }}>
          <Code2 size={14} /> Scripts de analytics
        </div>
        <p style={{ fontSize: 12.5, color: T.muted, margin: "0 0 12px", lineHeight: 1.6 }}>
          Cola aqui o código do Google Analytics, Meta Pixel, ou outro script de rastreio.
          É injetado automaticamente em todas as páginas da loja pública.
        </p>
        <textarea
          style={{ ...inputStyle, minHeight: 140, fontFamily: "monospace", fontSize: 12.5, resize: "vertical" }}
          value={form.analyticsScripts || ""}
          onChange={(e) => update("analyticsScripts", e.target.value)}
          placeholder={'<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXX"></script>\n<script>\n  window.dataLayer = window.dataLayer || [];\n  function gtag(){dataLayer.push(arguments);}\n  gtag(\'js\', new Date());\n  gtag(\'config\', \'G-XXXXXXX\');\n</script>'}
        />
      </div>

      {errorMsg && <div style={{ color: T.danger, fontSize: 13, marginBottom: 12 }}>{errorMsg}</div>}
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <Button onClick={submit}><Save size={14} /> Guardar definições</Button>
        {saved && <span style={{ color: T.accent, fontSize: 13 }}>Guardado ✓</span>}
      </div>
    </div>
  );
}
