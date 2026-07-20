// Exporta e importa listas em CSV — sem bibliotecas externas, só o essencial.

export function exportCustomersCsv(customers) {
  const headers = ["Nome", "Email", "Conta", "Encomendas", "Total gasto (€)", "Pontos", "Newsletter", "Última atividade"];
  const rows = customers.map((c) => [
    c.name || "",
    c.email,
    c.hasAccount ? (c.emailConfirmed ? "Confirmada" : "Por confirmar") : "Convidado",
    c.orderCount,
    c.totalSpent.toFixed(2),
    c.pointsBalance || 0,
    c.isNewsletterSubscriber ? "Sim" : "Não",
    (c.lastOrderDate || c.firstSeen) ? new Date(c.lastOrderDate || c.firstSeen).toLocaleDateString("pt-PT") : "",
  ]);

  const csv = [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n");

  downloadFile(csv, `clientes-trendout-${new Date().toISOString().slice(0, 10)}.csv`);
}

function downloadFile(content, filename) {
  const blob = new Blob(["\uFEFF" + content], { type: "text/csv;charset=utf-8;" }); // \uFEFF: o Excel abre acentos bem
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// Parser simples de CSV — lida com campos entre aspas e vírgulas dentro deles
function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (inQuotes) {
      if (char === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (char === '"') inQuotes = false;
      else field += char;
    } else {
      if (char === '"') inQuotes = true;
      else if (char === ",") { row.push(field); field = ""; }
      else if (char === "\n" || char === "\r") {
        if (field !== "" || row.length > 0) { row.push(field); rows.push(row); row = []; field = ""; }
      } else field += char;
    }
  }
  if (field !== "" || row.length > 0) { row.push(field); rows.push(row); }
  return rows;
}

/**
 * Lê um ficheiro CSV (ex: exportado do Shopify) e devolve só os emails
 * válidos que aceitaram marketing — nunca importa quem não deu consentimento.
 */
export async function parseNewsletterCsv(file) {
  const text = await file.text();
  const rows = parseCsv(text).filter((r) => r.length > 1 || (r.length === 1 && r[0].trim()));
  if (rows.length < 2) return { emails: [], total: 0, skipped: 0 };

  const header = rows[0].map((h) => h.trim().toLowerCase());
  const emailIdx = header.findIndex((h) => h === "email" || h.includes("email"));
  const consentIdx = header.findIndex((h) => h.includes("accepts") && h.includes("marketing") && !h.includes("sms"));

  if (emailIdx === -1) throw new Error('Não encontrei nenhuma coluna "Email" no ficheiro.');

  const dataRows = rows.slice(1);
  const seen = new Set();
  const emails = [];
  let skipped = 0;

  dataRows.forEach((r) => {
    const email = (r[emailIdx] || "").trim().toLowerCase();
    const hasConsent = consentIdx === -1 ? true : (r[consentIdx] || "").trim().toLowerCase() === "yes";
    if (!email || !email.includes("@")) { skipped++; return; }
    if (!hasConsent) { skipped++; return; }
    if (seen.has(email)) { skipped++; return; }
    seen.add(email);
    emails.push(email);
  });

  return { emails, total: dataRows.length, skipped };
}
