import React, { useState, useEffect } from "react";
import { Save } from "lucide-react";
import { T, inputStyle, Field, Button } from "../lib/theme";
import { useStoreSettings } from "../hooks/useStoreSettings";

const DEFAULT_THEME = { accentColor: "#c9ff3f", bgColor: "#0f1210", textColor: "#eef0ec", headingFont: "Bebas Neue", bodyFont: "Inter" };

const THEME_PRESETS = [
  { name: "Trendout (padrão)", accentColor: "#c9ff3f", bgColor: "#0f1210", textColor: "#eef0ec" },
  { name: "Contraste quente", accentColor: "#ff8a3d", bgColor: "#141414", textColor: "#f5f0e8" },
  { name: "Claro minimal", accentColor: "#2f6f4f", bgColor: "#f7f5f0", textColor: "#1a1a1a" },
  { name: "Azul noturno", accentColor: "#5cc2ff", bgColor: "#0b1220", textColor: "#e8f0fb" },
];

export default function ThemePage() {
  const { settings, loading, updateSettings } = useStoreSettings();
  const [theme, setTheme] = useState(DEFAULT_THEME);
  const [saved, setSaved] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (settings?.theme) setTheme(settings.theme);
  }, [settings]);

  if (loading || !settings) return <div style={{ color: T.muted, fontSize: 13.5 }}>A carregar tema...</div>;

  const update = (k, v) => setTheme((t) => ({ ...t, [k]: v }));
  const applyPreset = (preset) => setTheme((t) => ({ ...t, accentColor: preset.accentColor, bgColor: preset.bgColor, textColor: preset.textColor }));

  const submit = async () => {
    try {
      await updateSettings({ theme });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setErrorMsg(err.message || "Erro ao guardar o tema.");
    }
  };

  const reset = () => setTheme(DEFAULT_THEME);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, maxWidth: 980 }}>
      <div>
        <div style={{ background: T.bgRaised, border: `1px solid ${T.border}`, borderRadius: 12, padding: 24, marginBottom: 16 }}>
          <div style={{ fontSize: 11.5, color: T.muted, textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 14 }}>Paletas prontas</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {THEME_PRESETS.map((preset) => (
              <button
                key={preset.name}
                onClick={() => applyPreset(preset)}
                style={{
                  display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 8,
                  border: `1px solid ${theme.accentColor === preset.accentColor && theme.bgColor === preset.bgColor ? T.accent : T.border}`,
                  background: "none", cursor: "pointer", color: T.text, fontSize: 13,
                }}
              >
                <span style={{ display: "flex", gap: 3 }}>
                  <span style={{ width: 16, height: 16, borderRadius: "50%", background: preset.bgColor, border: `1px solid ${T.border}` }} />
                  <span style={{ width: 16, height: 16, borderRadius: "50%", background: preset.accentColor }} />
                </span>
                {preset.name}
              </button>
            ))}
          </div>
        </div>

        <div style={{ background: T.bgRaised, border: `1px solid ${T.border}`, borderRadius: 12, padding: 24, marginBottom: 16 }}>
          <div style={{ fontSize: 11.5, color: T.muted, textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 14 }}>Cores</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
            <Field label="Cor de destaque">
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input type="color" value={theme.accentColor} onChange={(e) => update("accentColor", e.target.value)} style={{ width: 40, height: 36, border: `1px solid ${T.border}`, borderRadius: 6, background: "none", cursor: "pointer" }} />
                <input style={{ ...inputStyle, fontSize: 12 }} value={theme.accentColor} onChange={(e) => update("accentColor", e.target.value)} />
              </div>
            </Field>
            <Field label="Cor de fundo">
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input type="color" value={theme.bgColor} onChange={(e) => update("bgColor", e.target.value)} style={{ width: 40, height: 36, border: `1px solid ${T.border}`, borderRadius: 6, background: "none", cursor: "pointer" }} />
                <input style={{ ...inputStyle, fontSize: 12 }} value={theme.bgColor} onChange={(e) => update("bgColor", e.target.value)} />
              </div>
            </Field>
          </div>
          <Field label="Cor do texto">
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input type="color" value={theme.textColor} onChange={(e) => update("textColor", e.target.value)} style={{ width: 40, height: 36, border: `1px solid ${T.border}`, borderRadius: 6, background: "none", cursor: "pointer" }} />
              <input style={{ ...inputStyle, fontSize: 12 }} value={theme.textColor} onChange={(e) => update("textColor", e.target.value)} />
            </div>
          </Field>
        </div>

        <div style={{ background: T.bgRaised, border: `1px solid ${T.border}`, borderRadius: 12, padding: 24, marginBottom: 16 }}>
          <div style={{ fontSize: 11.5, color: T.muted, textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 14 }}>Tipografia</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <Field label="Fonte de títulos">
              <select style={inputStyle} value={theme.headingFont} onChange={(e) => update("headingFont", e.target.value)}>
                {["Bebas Neue", "Oswald", "Poppins", "Playfair Display", "Montserrat"].map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
            </Field>
            <Field label="Fonte de texto">
              <select style={inputStyle} value={theme.bodyFont} onChange={(e) => update("bodyFont", e.target.value)}>
                {["Inter", "Roboto", "Open Sans", "Lato", "Nunito"].map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
            </Field>
          </div>
        </div>

        {errorMsg && <div style={{ color: T.danger, fontSize: 13, marginBottom: 10 }}>{errorMsg}</div>}
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <Button onClick={submit}><Save size={14} /> Guardar tema</Button>
          <Button variant="ghost" onClick={reset}>Repor padrão</Button>
          {saved && <span style={{ color: T.accent, fontSize: 13 }}>Guardado ✓</span>}
        </div>
      </div>

      <div>
        <div style={{ fontSize: 11.5, color: T.muted, textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 14 }}>Pré-visualização — página de produto</div>
        <div style={{ background: theme.bgColor, border: `1px solid ${T.border}`, borderRadius: 12, padding: 24, position: "sticky", top: 0 }}>
          <div style={{ fontFamily: `'${theme.headingFont}', sans-serif`, color: theme.textColor, fontSize: 13, opacity: 0.6, marginBottom: 10 }}>
            Home / Vestuário / T-shirts técnicas
          </div>
          <div style={{ fontFamily: `'${theme.headingFont}', sans-serif`, color: theme.textColor, fontSize: 26, marginBottom: 8, letterSpacing: 0.5 }}>
            T-shirt Performance Box Logo
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 14 }}>
            <span style={{ fontFamily: `'${theme.bodyFont}', sans-serif`, color: theme.accentColor, fontSize: 20, fontWeight: 700 }}>€22.41</span>
            <span style={{ fontFamily: `'${theme.bodyFont}', sans-serif`, color: theme.textColor, opacity: 0.4, fontSize: 14, textDecoration: "line-through" }}>€24.90</span>
          </div>
          <div style={{ fontFamily: `'${theme.bodyFont}', sans-serif`, color: theme.textColor, opacity: 0.75, fontSize: 13.5, lineHeight: 1.6, marginBottom: 18 }}>
            Tecido em algodão pentado de 220g, corte reto e mangas curtas com acabamento reforçado.
          </div>
          <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
            {["XS", "S", "M", "L"].map((s, i) => (
              <span key={s} style={{
                width: 36, height: 36, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: `'${theme.bodyFont}', sans-serif`, fontSize: 12.5, color: i === 1 ? theme.bgColor : theme.textColor,
                background: i === 1 ? theme.accentColor : "transparent",
                border: `1px solid ${i === 1 ? theme.accentColor : theme.textColor + "40"}`,
              }}>{s}</span>
            ))}
          </div>
          <button style={{ width: "100%", background: theme.accentColor, color: theme.bgColor, border: "none", borderRadius: 8, padding: "13px 18px", fontWeight: 700, fontSize: 14, fontFamily: `'${theme.bodyFont}', sans-serif`, marginBottom: 10 }}>
            Adicionar ao carrinho
          </button>
          <div style={{ fontFamily: `'${theme.bodyFont}', sans-serif`, color: theme.textColor, opacity: 0.5, fontSize: 11.5, textAlign: "center" }}>
            Envio grátis acima de €{settings.freeShippingThreshold}
          </div>
        </div>
      </div>
    </div>
  );
}
