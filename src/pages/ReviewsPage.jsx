import React, { useState } from "react";
import { Star, Check, X, Trash2 } from "lucide-react";
import { T, Button } from "../lib/theme";
import { useProductReviews } from "../hooks/useProductReviews";

const TABS = [
  { key: "pending", label: "Por moderar" },
  { key: "approved", label: "Aprovadas" },
  { key: "rejected", label: "Rejeitadas" },
];

function Stars({ rating }) {
  return (
    <div style={{ display: "flex", gap: 2 }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} size={14} fill={n <= rating ? T.accent : "none"} color={n <= rating ? T.accent : T.muted} />
      ))}
    </div>
  );
}

export default function ReviewsPage() {
  const { reviews, loading, updateStatus, remove } = useProductReviews();
  const [tab, setTab] = useState("pending");

  const filtered = reviews.filter((r) => r.status === tab);
  const pendingCount = reviews.filter((r) => r.status === "pending").length;

  if (loading) return <div style={{ color: T.muted, fontSize: 13.5 }}>A carregar avaliações...</div>;

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              padding: "8px 16px", borderRadius: 999, fontSize: 13, cursor: "pointer",
              border: `1px solid ${tab === t.key ? T.accent : T.border}`,
              background: tab === t.key ? "rgba(201,255,63,0.08)" : "transparent",
              color: tab === t.key ? T.accent : T.muted,
            }}
          >
            {t.label}{t.key === "pending" && pendingCount > 0 ? ` (${pendingCount})` : ""}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div style={{ background: T.bgRaised, border: `1px solid ${T.border}`, borderRadius: 12, padding: 40, textAlign: "center", color: T.muted }}>
          Sem avaliações nesta categoria.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {filtered.map((r) => (
            <div key={r.id} style={{ background: T.bgRaised, border: `1px solid ${T.border}`, borderRadius: 12, padding: 18 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 10 }}>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  {r.productImage && <img src={r.productImage} alt="" style={{ width: 44, height: 44, borderRadius: 8, objectFit: "cover" }} />}
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13.5 }}>{r.productName}</div>
                    <div style={{ fontSize: 12, color: T.muted }}>{r.customerName} · {new Date(r.createdAt).toLocaleDateString("pt-PT")}</div>
                  </div>
                </div>
                <Stars rating={r.rating} />
              </div>

              {r.comment && <p style={{ fontSize: 13.5, color: "#cfd3cd", margin: "0 0 14px", lineHeight: 1.5 }}>{r.comment}</p>}

              <div style={{ display: "flex", gap: 8 }}>
                {tab !== "approved" && (
                  <Button variant="ghost" onClick={() => updateStatus(r.id, "approved")} style={{ fontSize: 12.5, padding: "7px 12px" }}>
                    <Check size={13} /> Aprovar
                  </Button>
                )}
                {tab !== "rejected" && (
                  <Button variant="ghost" onClick={() => updateStatus(r.id, "rejected")} style={{ fontSize: 12.5, padding: "7px 12px" }}>
                    <X size={13} /> Rejeitar
                  </Button>
                )}
                <Button variant="ghost" onClick={() => confirm("Eliminar esta avaliação definitivamente?") && remove(r.id)} style={{ fontSize: 12.5, padding: "7px 12px", color: T.danger }}>
                  <Trash2 size={13} /> Eliminar
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
