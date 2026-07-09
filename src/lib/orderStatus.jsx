import React from "react";
import { Clock, CheckCircle2, Package, Truck, Ban } from "lucide-react";
import { T } from "./theme";

export const STATUS_META = {
  pending: { label: "Pendente", color: T.muted, icon: Clock },
  confirmed: { label: "Confirmada", color: T.warn, icon: CheckCircle2 },
  production: { label: "Em produção", color: "#6fb1ff", icon: Package },
  shipped: { label: "Enviada", color: "#6fb1ff", icon: Truck },
  delivered: { label: "Entregue", color: T.accent, icon: CheckCircle2 },
  cancelled: { label: "Cancelada", color: T.danger, icon: Ban },
};

export function Badge({ status }) {
  const meta = STATUS_META[status] || STATUS_META.pending;
  const Icon = meta.icon;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      padding: "4px 10px", borderRadius: 999, fontSize: 12, fontWeight: 600,
      color: meta.color, background: `${meta.color}1a`, border: `1px solid ${meta.color}55`,
    }}>
      <Icon size={12} /> {meta.label}
    </span>
  );
}
