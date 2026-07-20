import React, { useState } from "react";
import { X, Upload } from "lucide-react";
import { T, Button } from "../lib/theme";
import { supabase } from "../lib/supabase";
import { parseNewsletterCsv } from "../lib/csvUtils";

export default function ImportNewsletterModal({ onClose, onDone }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleFile = async (f) => {
    setFile(f);
    setError("");
    setResult(null);
    try {
      const parsed = await parseNewsletterCsv(f);
      setPreview(parsed);
    } catch (err) {
      setError(err.message);
      setPreview(null);
    }
  };

  const doImport = async () => {
    if (!preview || preview.emails.length === 0) return;
    setImporting(true);
    try {
      const { error: err } = await supabase
        .from("newsletter_subscribers")
        .upsert(
          preview.emails.map((email) => ({ email, source: "importacao_csv" })),
          { onConflict: "email", ignoreDuplicates: true }
        );
      if (err) throw err;
      setResult({ imported: preview.emails.length });
      onDone?.();
    } catch (err) {
      setError(err.message || "Erro ao importar.");
    } finally {
      setImporting(false);
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }}>
      <div style={{ width: "100%", maxWidth: 460, background: T.bgRaised, border: `1px solid ${T.border}`, borderRadius: 14, padding: 26 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
          <h2 style={{ margin: 0, fontFamily: "'Bebas Neue', sans-serif", fontSize: 22 }}>Importar para a Newsletter</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", color: T.muted, cursor: "pointer" }}><X size={20} /></button>
        </div>

        {result ? (
          <div>
            <p style={{ fontSize: 14, color: T.accent, marginBottom: 20 }}>
              {result.imported} contacto{result.imported !== 1 ? "s" : ""} importado{result.imported !== 1 ? "s" : ""} com sucesso ✓
            </p>
            <Button onClick={onClose} style={{ width: "100%" }}>Fechar</Button>
          </div>
        ) : (
          <>
            <p style={{ fontSize: 12.5, color: T.muted, lineHeight: 1.6, marginBottom: 16 }}>
              Aceita qualquer CSV com uma coluna "Email" (ex: exportado do Shopify ou de outra loja). Só importa contactos com
              email válido e que tenham dado consentimento de marketing (coluna "Accepts Email Marketing" = yes, se existir no ficheiro).
            </p>

            <label style={{
              display: "flex", flexDirection: "column", alignItems: "center", gap: 8, border: `1px dashed ${T.border}`,
              borderRadius: 10, padding: 24, cursor: "pointer", marginBottom: 16, textAlign: "center",
            }}>
              <Upload size={20} color={T.muted} />
              <span style={{ fontSize: 13, color: T.muted }}>{file ? file.name : "Clica para escolher o ficheiro CSV"}</span>
              <input type="file" accept=".csv" style={{ display: "none" }} onChange={(e) => e.target.files[0] && handleFile(e.target.files[0])} />
            </label>

            {error && <div style={{ color: T.danger, fontSize: 13, marginBottom: 14 }}>{error}</div>}

            {preview && !error && (
              <div style={{ background: T.bg, border: `1px solid ${T.border}`, borderRadius: 8, padding: 14, fontSize: 12.5, color: T.muted, marginBottom: 20, lineHeight: 1.6 }}>
                Ficheiro com <strong style={{ color: T.text }}>{preview.total}</strong> linhas.
                Vão ser importados <strong style={{ color: T.accent }}>{preview.emails.length}</strong> contactos novos
                (com email válido e consentimento). {preview.skipped} ignorados (sem consentimento, duplicados, ou email inválido).
              </div>
            )}

            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <Button variant="ghost" onClick={onClose}>Cancelar</Button>
              <Button onClick={doImport} disabled={!preview || preview.emails.length === 0 || importing}>
                {importing ? "A importar..." : `Importar ${preview ? preview.emails.length : ""} contactos`}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
