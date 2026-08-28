import React, { useState } from "react";
import { Calendar, TrendingUp, ShoppingBag, BarChart3, Link as LinkIcon, Eye, Award, Search, ShoppingCart, Percent, CreditCard, Globe2, UserCircle2, Heart, Filter, PiggyBank } from "lucide-react";
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
  const { loading, series, totalVisits, totalOrders, totalRevenue, conversion, averageOrderValue, cartAbandonmentRate, topPages, topReferrers, topProducts, bestSellers, topSearches, mostAddedToCart, topCustomers, salesByPaymentMethod, salesByCountry, mostFavorited, conversionBySource, funnel, totalProfit, profitMargin, revenueWithoutCost, mostProfitableProducts } = useRealAnalytics(range);

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
            <StatCard label="Valor médio por encomenda" value={`€${averageOrderValue.toLocaleString("pt-PT", { maximumFractionDigits: 2 })}`} icon={CreditCard} />
            <StatCard label="Taxa de abandono de carrinho" value={`${cartAbandonmentRate.toFixed(1)}%`} icon={Percent} />
            <StatCard label="Lucro real (produtos com custo definido)" value={`€${(totalProfit || 0).toLocaleString("pt-PT", { maximumFractionDigits: 0 })}`} icon={PiggyBank} accent />
            <StatCard label="Margem de lucro" value={`${(profitMargin || 0).toFixed(1)}%`} icon={Percent} />
          </div>
          {(revenueWithoutCost || 0) > 0 && (
            <p style={{ fontSize: 11.5, color: T.muted, margin: "0 0 16px", lineHeight: 1.5 }}>
              €{revenueWithoutCost.toLocaleString("pt-PT", { maximumFractionDigits: 0 })} de receita neste período vêm de produtos sem custo definido — não entram no cálculo do lucro. Preenche o custo nesses produtos para veres o lucro completo.
            </p>
          )}

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

          <div style={{ background: T.bgRaised, border: `1px solid ${T.border}`, borderRadius: 12, padding: 20, marginBottom: 16 }}>
            <div style={{ fontSize: 11.5, color: T.muted, textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 16 }}>Funil — do visitante à compra</div>
            {funnel[0].value === 0 ? (
              <div style={{ color: T.muted, fontSize: 13, textAlign: "center", padding: "20px 0" }}>Sem dados ainda neste período.</div>
            ) : (
              <div style={{ display: "flex", gap: 4 }}>
                {funnel.map((stage, i) => {
                  const pctOfFirst = funnel[0].value > 0 ? (stage.value / funnel[0].value) * 100 : 0;
                  const pctOfPrev = i > 0 && funnel[i - 1].value > 0 ? (stage.value / funnel[i - 1].value) * 100 : 100;
                  return (
                    <div key={stage.label} style={{ flex: 1, textAlign: "center" }}>
                      <div style={{ height: 90, display: "flex", alignItems: "flex-end", justifyContent: "center", marginBottom: 10 }}>
                        <div style={{ width: "70%", height: `${Math.max(6, pctOfFirst)}%`, background: i === funnel.length - 1 ? T.accent : T.accentDim, borderRadius: "6px 6px 0 0" }} />
                      </div>
                      <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22 }}>{stage.value.toLocaleString("pt-PT")}</div>
                      <div style={{ fontSize: 11.5, color: T.muted, marginTop: 2 }}>{stage.label}</div>
                      {i > 0 && <div style={{ fontSize: 10.5, color: T.muted, marginTop: 2 }}>{pctOfPrev.toFixed(0)}% da etapa anterior</div>}
                    </div>
                  );
                })}
              </div>
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

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16, marginTop: 16 }}>
            <div style={{ background: T.bgRaised, border: `1px solid ${T.border}`, borderRadius: 12, padding: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11.5, color: T.muted, textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 14 }}>
                <Eye size={12} /> Produtos mais visitados
              </div>
              {topProducts.length === 0 ? (
                <div style={{ color: T.muted, fontSize: 13 }}>Sem dados ainda.</div>
              ) : (
                topProducts.map((p, i) => (
                  <div key={p.slug} style={{ display: "flex", justifyContent: "space-between", gap: 10, padding: "8px 0", borderTop: i > 0 ? `1px solid ${T.border}` : "none", fontSize: 13 }}>
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</span>
                    <span style={{ color: T.muted, flexShrink: 0 }}>{p.views.toLocaleString("pt-PT")} visitas</span>
                  </div>
                ))
              )}
            </div>

            <div style={{ background: T.bgRaised, border: `1px solid ${T.border}`, borderRadius: 12, padding: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11.5, color: T.muted, textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 14 }}>
                <ShoppingCart size={12} /> Mais adicionados ao carrinho
              </div>
              {mostAddedToCart.length === 0 ? (
                <div style={{ color: T.muted, fontSize: 13 }}>Sem dados ainda.</div>
              ) : (
                mostAddedToCart.map((p, i) => (
                  <div key={p.name + i} style={{ display: "flex", justifyContent: "space-between", gap: 10, padding: "8px 0", borderTop: i > 0 ? `1px solid ${T.border}` : "none", fontSize: 13 }}>
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</span>
                    <span style={{ color: T.muted, flexShrink: 0 }}>{p.count}×</span>
                  </div>
                ))
              )}
            </div>

            <div style={{ background: T.bgRaised, border: `1px solid ${T.border}`, borderRadius: 12, padding: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11.5, color: T.muted, textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 14 }}>
                <Award size={12} /> Produtos mais vendidos
              </div>
              {bestSellers.length === 0 ? (
                <div style={{ color: T.muted, fontSize: 13 }}>Sem vendas pagas ainda neste período.</div>
              ) : (
                bestSellers.map((p, i) => (
                  <div key={p.name + i} style={{ display: "flex", justifyContent: "space-between", gap: 10, padding: "8px 0", borderTop: i > 0 ? `1px solid ${T.border}` : "none", fontSize: 13 }}>
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</span>
                    <span style={{ color: T.muted, flexShrink: 0 }}>{p.qty} vendido{p.qty !== 1 ? "s" : ""}</span>
                  </div>
                ))
              )}
            </div>

            <div style={{ background: T.bgRaised, border: `1px solid ${T.border}`, borderRadius: 12, padding: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11.5, color: T.muted, textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 14 }}>
                <Search size={12} /> Mais pesquisado na loja
              </div>
              {topSearches.length === 0 ? (
                <div style={{ color: T.muted, fontSize: 13 }}>Sem pesquisas registadas ainda.</div>
              ) : (
                topSearches.map((s, i) => (
                  <div key={s.query} style={{ display: "flex", justifyContent: "space-between", gap: 10, padding: "8px 0", borderTop: i > 0 ? `1px solid ${T.border}` : "none", fontSize: 13 }}>
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>"{s.query}"</span>
                    <span style={{ color: T.muted, flexShrink: 0 }}>{s.count}×</span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16, marginTop: 16 }}>
            <div style={{ background: T.bgRaised, border: `1px solid ${T.border}`, borderRadius: 12, padding: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11.5, color: T.muted, textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 14 }}>
                <UserCircle2 size={12} /> Clientes que mais gastaram
              </div>
              {topCustomers.length === 0 ? (
                <div style={{ color: T.muted, fontSize: 13 }}>Sem vendas pagas ainda neste período.</div>
              ) : (
                topCustomers.map((c, i) => (
                  <div key={c.email} style={{ display: "flex", justifyContent: "space-between", gap: 10, padding: "8px 0", borderTop: i > 0 ? `1px solid ${T.border}` : "none", fontSize: 13 }}>
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.name}</span>
                    <span style={{ color: T.muted, flexShrink: 0 }}>€{c.total.toFixed(2)}</span>
                  </div>
                ))
              )}
            </div>

            <div style={{ background: T.bgRaised, border: `1px solid ${T.border}`, borderRadius: 12, padding: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11.5, color: T.muted, textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 14 }}>
                <CreditCard size={12} /> Vendas por método de pagamento
              </div>
              {salesByPaymentMethod.length === 0 ? (
                <div style={{ color: T.muted, fontSize: 13 }}>Sem vendas pagas ainda neste período.</div>
              ) : (
                salesByPaymentMethod.map((m, i) => (
                  <div key={m.label} style={{ marginBottom: 10 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, marginBottom: 4 }}>
                      <span>{m.label} ({m.count})</span>
                      <span style={{ color: T.muted }}>€{m.total.toFixed(2)}</span>
                    </div>
                    <div style={{ height: 6, borderRadius: 4, background: T.bg, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${(m.total / salesByPaymentMethod[0].total) * 100}%`, background: T.accent, borderRadius: 4 }} />
                    </div>
                  </div>
                ))
              )}
            </div>

            <div style={{ background: T.bgRaised, border: `1px solid ${T.border}`, borderRadius: 12, padding: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11.5, color: T.muted, textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 14 }}>
                <Globe2 size={12} /> Vendas por país
              </div>
              {salesByCountry.length === 0 ? (
                <div style={{ color: T.muted, fontSize: 13 }}>Sem vendas pagas ainda neste período.</div>
              ) : (
                salesByCountry.map((c, i) => (
                  <div key={c.country} style={{ display: "flex", justifyContent: "space-between", gap: 10, padding: "8px 0", borderTop: i > 0 ? `1px solid ${T.border}` : "none", fontSize: 13 }}>
                    <span>{c.country} ({c.count})</span>
                    <span style={{ color: T.muted, flexShrink: 0 }}>€{c.total.toFixed(2)}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 16 }}>
            <div style={{ background: T.bgRaised, border: `1px solid ${T.border}`, borderRadius: 12, padding: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11.5, color: T.muted, textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 14 }}>
                <Heart size={12} /> Mais guardados como favoritos
              </div>
              {mostFavorited.length === 0 ? (
                <div style={{ color: T.muted, fontSize: 13 }}>Sem favoritos guardados ainda neste período.</div>
              ) : (
                mostFavorited.map((f, i) => (
                  <div key={f.name + i} style={{ display: "flex", justifyContent: "space-between", gap: 10, padding: "8px 0", borderTop: i > 0 ? `1px solid ${T.border}` : "none", fontSize: 13 }}>
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.name}</span>
                    <span style={{ color: T.muted, flexShrink: 0 }}>{f.count}×</span>
                  </div>
                ))
              )}
            </div>

            <div style={{ background: T.bgRaised, border: `1px solid ${T.border}`, borderRadius: 12, padding: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11.5, color: T.muted, textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 14 }}>
                <Filter size={12} /> Conversão por origem de tráfego
              </div>
              {conversionBySource.length === 0 ? (
                <div style={{ color: T.muted, fontSize: 13 }}>Sem dados ainda.</div>
              ) : (
                <>
                  {conversionBySource.map((s, i) => (
                    <div key={s.label} style={{ display: "flex", justifyContent: "space-between", gap: 10, padding: "8px 0", borderTop: i > 0 ? `1px solid ${T.border}` : "none", fontSize: 13 }}>
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.label}</span>
                      <span style={{ color: T.muted, flexShrink: 0 }}>{s.sessions} visitas · {s.orders} compras · {s.rate.toFixed(1)}%</span>
                    </div>
                  ))}
                  <p style={{ fontSize: 11, color: T.muted, margin: "12px 0 0", lineHeight: 1.5 }}>
                    As compras só contam a partir de agora — encomendas feitas antes desta funcionalidade não têm origem identificada.
                  </p>
                </>
              )}
            </div>
          </div>

          <div style={{ background: T.bgRaised, border: `1px solid ${T.border}`, borderRadius: 12, padding: 20, marginTop: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11.5, color: T.muted, textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 14 }}>
              <PiggyBank size={12} /> Produtos mais lucrativos
            </div>
            {(mostProfitableProducts || []).length === 0 ? (
              <div style={{ color: T.muted, fontSize: 13 }}>Sem produtos com custo definido e vendidos neste período.</div>
            ) : (
              mostProfitableProducts.map((p, i) => (
                <div key={p.name + i} style={{ display: "flex", justifyContent: "space-between", gap: 10, padding: "8px 0", borderTop: i > 0 ? `1px solid ${T.border}` : "none", fontSize: 13 }}>
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</span>
                  <span style={{ color: T.muted, flexShrink: 0 }}>€{p.profit.toFixed(2)} lucro · {p.margin.toFixed(0)}% margem</span>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
