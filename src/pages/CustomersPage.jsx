import React, { useState, useMemo, useEffect } from "react";
import { Search, Mail, ArrowUpDown, Download, Upload, Send, ChevronLeft, ChevronRight, CheckSquare, Square } from "lucide-react";
import { T, inputStyle, Button } from "../lib/theme";
import { useCustomers } from "../hooks/useCustomers";
import CustomerDetailModal from "../components/CustomerDetailModal";
import ImportNewsletterModal from "../components/ImportNewsletterModal";
import SendMessageModal from "../components/SendMessageModal";
import { exportCustomersCsv } from "../lib/csvUtils";

const PAGE_SIZES = [25, 50, 100];

export default function CustomersPage() {
  const { customers, loading, reload } = useCustomers();
  const [query, setQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("recent"); // 'recent' | 'oldest'
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [importOpen, setImportOpen] = useState(false);
  const [campaignOpen, setCampaignOpen] = useState(false);
  const [campaignMode, setCampaignMode] = useState("broadcast"); // 'broadcast' | 'selected'
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [checkedEmails, setCheckedEmails] = useState(new Set());

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

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageItems = filtered.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => { setPage(1); }, [query, sortOrder, pageSize]);

  if (loading) return <div style={{ color: T.muted, fontSize: 13.5 }}>A carregar clientes...</div>;

  const totalNewsletter = customers.filter((c) => c.isNewsletterSubscriber).length;

  const toggleCheck = (email) => {
    setCheckedEmails((prev) => {
      const next = new Set(prev);
      if (next.has(email)) next.delete(email);
      else next.add(email);
      return next;
    });
  };

  const toggleCheckAllOnPage = () => {
    const pageEmails = pageItems.filter((c) => c.isNewsletterSubscriber).map((c) => c.email);
    const allChecked = pageEmails.every((e) => checkedEmails.has(e));
    setCheckedEmails((prev) => {
      const next = new Set(prev);
      pageEmails.forEach((e) => (allChecked ? next.delete(e) : next.add(e)));
      return next;
    });
  };

  // Seleciona os próximos N subscritores da newsletter que ainda nunca foram contactados
  // (ou contactados há mais tempo) — pensado para gerires o limite diário do Resend.
  const selectNextUncontacted = (n) => {
    const candidates = customers
      .filter((c) => c.isNewsletterSubscriber)
      .sort((a, b) => {
        const da = a.lastContactedAt ? new Date(a.lastContactedAt).getTime() : 0;
        const db = b.lastContactedAt ? new Date(b.lastContactedAt).getTime() : 0;
        return da - db; // nunca contactados (0) primeiro, depois os mais antigos
      })
      .slice(0, n)
      .map((c) => c.email);
    setCheckedEmails(new Set(candidates));
  };

  const checkedCount = checkedEmails.size;

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
        <div style={{ background: T.bgRaised, border: `1px solid ${T.border}`, borderRadius: 12, padding: 18, flex: "1 1 180px" }}>
          <div style={{ fontSize: 11.5, color: T.muted, textTransform: "uppercase", letterSpacing: 0.4 }}>Nunca contactados</div>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, marginTop: 6 }}>
            {customers.filter((c) => c.isNewsletterSubscriber && !c.lastContactedAt).length}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 12 }}>
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
        <div style={{ display: "flex", gap: 10 }}>
          <Button variant="ghost" onClick={() => { setCampaignMode("broadcast"); setCampaignOpen(true); }}><Send size={14} /> Enviar campanha</Button>
          <Button variant="ghost" onClick={() => setImportOpen(true)}><Upload size={14} /> Importar newsletter</Button>
          <Button variant="ghost" onClick={() => exportCustomersCsv(filtered)}><Download size={14} /> Exportar CSV</Button>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 10 }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <span style={{ fontSize: 12, color: T.muted }}>Selecionar rapidamente:</span>
          {[25, 50, 100].map((n) => (
            <button
              key={n}
              onClick={() => selectNextUncontacted(n)}
              style={{ fontSize: 12, background: "none", border: `1px solid ${T.border}`, borderRadius: 999, color: T.text, padding: "5px 12px", cursor: "pointer" }}
            >
              Próximos {n} não contactados
            </button>
          ))}
          {checkedCount > 0 && (
            <button onClick={() => setCheckedEmails(new Set())} style={{ fontSize: 12, color: T.muted, background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>
              Limpar seleção
            </button>
          )}
        </div>

        {checkedCount > 0 && (
          <Button onClick={() => { setCampaignMode("selected"); setCampaignOpen(true); }} style={{ fontSize: 12.5 }}>
            <Send size={13} /> Enviar aos {checkedCount} selecionados
          </Button>
        )}
      </div>

      <div style={{ background: T.bgRaised, border: `1px solid ${T.border}`, borderRadius: 12, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
          <thead>
            <tr style={{ background: T.bgRaised2, textAlign: "left" }}>
              <th style={{ padding: "12px 10px", width: 36 }}>
                <button onClick={toggleCheckAllOnPage} style={{ background: "none", border: "none", cursor: "pointer", color: T.muted, display: "flex" }} title="Selecionar todos os subscritores nesta página">
                  {pageItems.filter((c) => c.isNewsletterSubscriber).length > 0 && pageItems.filter((c) => c.isNewsletterSubscriber).every((c) => checkedEmails.has(c.email))
                    ? <CheckSquare size={16} color={T.accent} />
                    : <Square size={16} />}
                </button>
              </th>
              {["Cliente", "Email", "Conta", "Encomendas", "Total gasto", "Pontos", "Newsletter", "Contacto", "Última atividade"].map((h) => (
                <th key={h} style={{ padding: "12px 16px", color: T.muted, fontWeight: 600, fontSize: 11.5, textTransform: "uppercase", letterSpacing: 0.4 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageItems.map((c) => (
              <tr key={c.email} style={{ borderTop: `1px solid ${T.border}` }}>
                <td style={{ padding: "12px 10px", textAlign: "center" }}>
                  {c.isNewsletterSubscriber && (
                    <button onClick={() => toggleCheck(c.email)} style={{ background: "none", border: "none", cursor: "pointer", color: T.muted, display: "flex", margin: "0 auto" }}>
                      {checkedEmails.has(c.email) ? <CheckSquare size={16} color={T.accent} /> : <Square size={16} />}
                    </button>
                  )}
                </td>
                <td style={{ padding: "12px 16px", fontWeight: 600 }}>
                  <button onClick={() => setSelectedCustomer(c)} style={{ background: "none", border: "none", color: T.text, cursor: "pointer", fontWeight: 600, fontSize: 13.5, textAlign: "left", padding: 0 }}>
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
                <td style={{ padding: "12px 16px" }}>
                  {!c.isNewsletterSubscriber ? (
                    <span style={{ color: T.muted, fontSize: 12 }}>—</span>
                  ) : c.lastContactedAt ? (
                    <span style={{ fontSize: 11.5, color: T.muted }}>Contactado {new Date(c.lastContactedAt).toLocaleDateString("pt-PT")}</span>
                  ) : (
                    <span style={{ fontSize: 11.5, color: T.warn }}>Não contactado</span>
                  )}
                </td>
                <td style={{ padding: "12px 16px", color: T.muted }}>
                  {(c.lastOrderDate || c.firstSeen) ? new Date(c.lastOrderDate || c.firstSeen).toLocaleDateString("pt-PT") : "—"}
                </td>
              </tr>
            ))}
            {pageItems.length === 0 && (
              <tr><td colSpan={10} style={{ padding: 28, textAlign: "center", color: T.muted }}>Sem clientes encontrados.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16, flexWrap: "wrap", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: T.muted }}>
          Por página:
          {PAGE_SIZES.map((n) => (
            <button
              key={n}
              onClick={() => setPageSize(n)}
              style={{
                background: pageSize === n ? "rgba(201,255,63,0.1)" : "none",
                border: `1px solid ${pageSize === n ? T.accent : T.border}`,
                color: pageSize === n ? T.accent : T.text,
                borderRadius: 6, padding: "4px 10px", cursor: "pointer", fontSize: 12,
              }}
            >
              {n}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13 }}>
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} style={{ background: "none", border: "none", color: page === 1 ? "#3a3f3a" : T.text, cursor: page === 1 ? "default" : "pointer", display: "flex" }}>
            <ChevronLeft size={18} />
          </button>
          <span style={{ color: T.muted }}>Página {page} de {totalPages}</span>
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={{ background: "none", border: "none", color: page === totalPages ? "#3a3f3a" : T.text, cursor: page === totalPages ? "default" : "pointer", display: "flex" }}>
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {selectedCustomer && <CustomerDetailModal customer={selectedCustomer} onClose={() => setSelectedCustomer(null)} onSent={reload} />}
      {importOpen && <ImportNewsletterModal onClose={() => setImportOpen(false)} onDone={reload} />}
      {campaignOpen && (
        <SendMessageModal
          mode={campaignMode}
          subscriberCount={campaignMode === "selected" ? checkedCount : totalNewsletter}
          selectedEmails={[...checkedEmails]}
          onClose={() => setCampaignOpen(false)}
          onSent={() => { setCheckedEmails(new Set()); reload(); }}
        />
      )}
    </div>
  );
}
