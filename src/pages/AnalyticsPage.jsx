import React, { useState } from "react";
import { Calendar, TrendingUp, ShoppingBag, BarChart3, Link as LinkIcon } from "lucide-react";
import {
  ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { T } from "../lib/theme";
import { useRealAnalytics } from "../hooks/useRealAnalytics";

const RANGE_OPTIONS = [
  { key: "today", label: "Hoje" },
  { key: "7d", label: "Últimos 7 dias" },
  { key: "30d", label: "Últimos 30 dias" },
  { key: "90d", label: "Últimos 90 dias" },
  { key: "month", label: "Este mês" },
  { key: "year", label: "Este ano" },
];

function StatCard({ label, value, icon: Icon, accent }) {
  return (
    <div style={{ background: T.bgRaised, border: `1px solid ${T.border}`, borderRadius: 12, padding: 18, flex: "1 1 180px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ fontSize: 11.5, color: T.muted, textTransform: "uppercase", letterSpacing: 0.4 }}>{label}</div>
        <Icon size={16} color={accent ? T.accent : T.muted} />
      </div>
      <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 30, marginTop: 8, letterSpacing: 0.5 }}>{value}</div>
    </div>
  );
}

export default function AnalyticsPage() {
  const [range, setRange] = useState("30d");
  const { loading, series, totalVisits, totalOrders, totalRevenue, conversion, topPages, topReferrers } = useRealAnalytics(range);

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {RANGE_OPTIONS.map((r) => (
          <button
            key={r.key}
            onClick={() => setRange(r.key)}
            style={{
              padding: "8px 14px", borderRadius: 999, fontSize: 12.5, cursor: "pointer",
              border: `1px solid ${range === r.key ? T.accent : T.border}`,
              background: range === r.key ? "rgba(201,255,63,0.08)" : "transparent",
              color: range === r.key ? T.accent : T.muted,
              display: "flex", alignItems: "center", gap: 6,
            }}
          >
            <Calendar size={12} /> {r.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ color: T.muted, padding: 40, textAlign: "center" }}>A carregar dados reais...</div>
      ) : (
        <>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 20 }}>
            <StatCard label="Visitas" value={totalVisits.toLocaleString("pt-PT")} icon={TrendingUp} accent />
            <StatCard label="Encomendas" value={totalOrders} icon={ShoppingBag} />
            <StatCard label="Taxa de conversão" value={`${conversion.toFixed(1)}%`} icon={BarChart3} />
            <StatCard label="Receita paga no período" value={`€${totalRevenue.toLocaleString("pt-PT", { maximumFractionDigits: 0 })}`} icon={TrendingUp} accent />
          </div>

          <div style={{ background: T.bgRaised, border: `1px solid ${T.border}`, borderRadius: 12, padding: "20px 12px 8px", marginBottom: 16, height: 320 }}>
            <div style={{ fontSize: 11.5, color: T.muted, textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 10, paddingLeft: 8 }}>Evolução de visitas e encomendas</div>
            {totalVisits === 0 && totalOrders === 0 ? (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "80%", color: T.muted, fontSize: 13 }}>
                Ainda sem dados neste período — assim que houver visitas reais à loja, aparecem aqui.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="85%">
                <ComposedChart data={series} margin={{ top: 4, right: 16, left: -12, bottom: 0 }}>
                  <CartesianGrid stroke={T.border} vertical={false} />
                  <XAxis dataKey="label" tick={{ fill: T.muted, fontSize: 11 }} axisLine={{ stroke: T.border }} tickLine={false} interval={series.length > 30 ? Math.floor(series.length / 12) : 0} />
                  <YAxis yAxisId="left" tick={{ fill: T.muted, fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fill: T.muted, fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={{ background: T.bgRaised2, border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 12.5 }} labelStyle={{ color: T.text }} />
                  <Legend wrapperStyle={{ fontSize: 12, color: T.muted }} />
                  <Bar yAxisId="right" dataKey="orders" name="Encomendas" fill="#7c9a2e" radius={[3, 3, 0, 0]} barSize={series.length > 30 ? 3 : 10} />
                  <Line yAxisId="left" type="monotone" dataKey="visits" name="Visitas" stroke="#c9ff3f" strokeWidth={2} dot={false} />
                </ComposedChart>
              </ResponsiveContainer>
            )}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div style={{ background: T.bgRaised, border: `1px solid ${T.border}`, borderRadius: 12, padding: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11.5, color: T.muted, textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 14 }}>
                <LinkIcon size={12} /> De onde vêm os visitantes
              </div>
              {topReferrers.length === 0 ? (
                <div style={{ color: T.muted, fontSize: 13 }}>Sem dados ainda.</div>
              ) : (
                topReferrers.map((r) => (
                  <div key={r.label} style={{ marginBottom: 10 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, marginBottom: 4 }}>
                      <span>{r.label}</span>
                      <span style={{ color: T.muted }}>{r.count}</span>
                    </div>
                    <div style={{ height: 6, borderRadius: 4, background: T.bg, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${(r.count / topReferrers[0].count) * 100}%`, background: T.accent, borderRadius: 4 }} />
                    </div>
                  </div>
                ))
              )}
            </div>

            <div style={{ background: T.bgRaised, border: `1px solid ${T.border}`, borderRadius: 12, padding: 20 }}>
              <div style={{ fontSize: 11.5, color: T.muted, textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 14 }}>Páginas mais visitadas</div>
              {topPages.length === 0 ? (
                <div style={{ color: T.muted, fontSize: 13 }}>Sem dados ainda.</div>
              ) : (
                topPages.map((p) => (
                  <div key={p.path} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderTop: `1px solid ${T.border}`, fontSize: 13 }}>
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 220 }}>{p.path}</span>
                    <span style={{ color: T.muted }}>{p.views.toLocaleString("pt-PT")} visitas</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
