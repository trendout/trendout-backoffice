import React, { useState } from "react";
import { Calendar, TrendingUp, ShoppingBag, BarChart3 } from "lucide-react";
import {
  ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { T, inputStyle } from "../lib/theme";

const RANGE_OPTIONS = [
  { key: "today", label: "Hoje" },
  { key: "7d", label: "Últimos 7 dias" },
  { key: "30d", label: "Últimos 30 dias" },
  { key: "90d", label: "Últimos 90 dias" },
  { key: "month", label: "Este mês" },
  { key: "year", label: "Este ano" },
];

const SAMPLE_PAGES = [
  { path: "/", title: "Homepage" },
  { path: "/vestuario", title: "Vestuário" },
  { path: "/produto/t-shirt-performance-box-logo", title: "T-shirt Performance Box Logo" },
  { path: "/produto/top-de-treino-seamless", title: "Top de Treino Seamless" },
  { path: "/produto/leggings-high-waist", title: "Leggings High-Waist" },
  { path: "/carrinho", title: "Carrinho" },
  { path: "/checkout", title: "Checkout" },
];

// gerador determinístico (mesma seed -> mesmos valores, não "salta" a cada render)
function seededRandom(seed) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function generateAnalyticsData(rangeKey) {
  const now = new Date();

  if (rangeKey === "today") {
    return Array.from({ length: 24 }).map((_, h) => {
      const r = seededRandom(h * 13.37 + now.getDate());
      const active = h >= 9 && h <= 22;
      const visits = Math.round(active ? 18 + r * 30 : 2 + r * 8);
      const orders = Math.round(visits * (0.02 + r * 0.03));
      return { label: `${h}h`, visits, orders, revenue: +(orders * 27.4).toFixed(2) };
    });
  }

  if (rangeKey === "year") {
    return Array.from({ length: 12 }).map((_, m) => {
      const r = seededRandom(m * 7.77);
      const d = new Date(now.getFullYear(), m, 1);
      const visits = Math.round(1100 + r * 2200);
      const orders = Math.round(visits * (0.025 + r * 0.015));
      return { label: d.toLocaleDateString("pt-PT", { month: "short" }), visits, orders, revenue: +(orders * 27.4).toFixed(2) };
    });
  }

  const daysMap = { "7d": 7, "30d": 30, "90d": 90, month: now.getDate() };
  const days = daysMap[rangeKey] || 30;
  return Array.from({ length: days }).map((_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (days - 1 - i));
    const weekend = d.getDay() === 0 || d.getDay() === 6;
    const r = seededRandom(d.getFullYear() * 400 + d.getMonth() * 31 + d.getDate());
    const visits = Math.round((55 + r * 95) * (weekend ? 0.72 : 1));
    const orders = Math.round(visits * (0.02 + r * 0.025));
    return { label: d.toLocaleDateString("pt-PT", { day: "2-digit", month: "2-digit" }), visits, orders, revenue: +(orders * 27.4).toFixed(2) };
  });
}

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
  const data = generateAnalyticsData(range);

  const totalVisits = data.reduce((s, d) => s + d.visits, 0);
  const totalOrders = data.reduce((s, d) => s + d.orders, 0);
  const totalRevenue = data.reduce((s, d) => s + d.revenue, 0);
  const conversion = totalVisits > 0 ? (totalOrders / totalVisits) * 100 : 0;

  const countryBreakdown = ["Portugal", "Espanha", "França", "Alemanha", "Outros"].map((name, i) => {
    const r = seededRandom(i * 3.14 + range.length);
    return { name, pct: Math.round(10 + r * 55) };
  }).sort((a, b) => b.pct - a.pct);
  const countryTotal = countryBreakdown.reduce((s, c) => s + c.pct, 0);

  const topPages = SAMPLE_PAGES.slice(0, 6).map((p, i) => ({
    ...p, views: Math.round(totalVisits * (0.32 - i * 0.045) * (0.8 + seededRandom(i + 1) * 0.4)),
  }));

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

      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 20 }}>
        <StatCard label="Visitas" value={totalVisits.toLocaleString("pt-PT")} icon={TrendingUp} accent />
        <StatCard label="Encomendas" value={totalOrders} icon={ShoppingBag} />
        <StatCard label="Taxa de conversão" value={`${conversion.toFixed(1)}%`} icon={BarChart3} />
        <StatCard label="Receita no período" value={`€${totalRevenue.toLocaleString("pt-PT", { maximumFractionDigits: 0 })}`} icon={TrendingUp} accent />
      </div>

      <div style={{ background: T.bgRaised, border: `1px solid ${T.border}`, borderRadius: 12, padding: "20px 12px 8px", marginBottom: 16, height: 320 }}>
        <div style={{ fontSize: 11.5, color: T.muted, textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 10, paddingLeft: 8 }}>Evolução de visitas e encomendas</div>
        <ResponsiveContainer width="100%" height="85%">
          <ComposedChart data={data} margin={{ top: 4, right: 16, left: -12, bottom: 0 }}>
            <CartesianGrid stroke={T.border} vertical={false} />
            <XAxis dataKey="label" tick={{ fill: T.muted, fontSize: 11 }} axisLine={{ stroke: T.border }} tickLine={false} interval={data.length > 30 ? Math.floor(data.length / 12) : 0} />
            <YAxis yAxisId="left" tick={{ fill: T.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis yAxisId="right" orientation="right" tick={{ fill: T.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: T.bgRaised2, border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 12.5 }} labelStyle={{ color: T.text }} />
            <Legend wrapperStyle={{ fontSize: 12, color: T.muted }} />
            <Bar yAxisId="right" dataKey="orders" name="Encomendas" fill="#7c9a2e" radius={[3, 3, 0, 0]} barSize={data.length > 30 ? 3 : 10} />
            <Line yAxisId="left" type="monotone" dataKey="visits" name="Visitas" stroke="#c9ff3f" strokeWidth={2} dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div style={{ background: T.bgRaised, border: `1px solid ${T.border}`, borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 11.5, color: T.muted, textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 14 }}>Visitas por país</div>
          {countryBreakdown.map((c) => (
            <div key={c.name} style={{ marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, marginBottom: 4 }}>
                <span>{c.name}</span>
                <span style={{ color: T.muted }}>{((c.pct / countryTotal) * 100).toFixed(0)}%</span>
              </div>
              <div style={{ height: 6, borderRadius: 4, background: T.bg, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${(c.pct / countryTotal) * 100}%`, background: T.accent, borderRadius: 4 }} />
              </div>
            </div>
          ))}
        </div>

        <div style={{ background: T.bgRaised, border: `1px solid ${T.border}`, borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 11.5, color: T.muted, textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 14 }}>Páginas mais visitadas</div>
          {topPages.map((p) => (
            <div key={p.path} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderTop: `1px solid ${T.border}`, fontSize: 13 }}>
              <span>{p.title}</span>
              <span style={{ color: T.muted }}>{p.views.toLocaleString("pt-PT")} visitas</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 14, fontSize: 12, color: T.muted }}>
        Dados simulados — ainda não há heartbeat de visitas real a alimentar isto (fica para a peça "Visitas ao vivo").
      </div>
    </div>
  );
}
