import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

function startDateFor(rangeKey) {
  const now = new Date();
  const start = new Date(now);
  if (rangeKey === "today") { start.setHours(0, 0, 0, 0); return start; }
  if (rangeKey === "7d") { start.setDate(start.getDate() - 6); start.setHours(0, 0, 0, 0); return start; }
  if (rangeKey === "30d") { start.setDate(start.getDate() - 29); start.setHours(0, 0, 0, 0); return start; }
  if (rangeKey === "90d") { start.setDate(start.getDate() - 89); start.setHours(0, 0, 0, 0); return start; }
  if (rangeKey === "month") { start.setDate(1); start.setHours(0, 0, 0, 0); return start; }
  if (rangeKey === "year") { start.setMonth(0, 1); start.setHours(0, 0, 0, 0); return start; }
  return start;
}

function referrerLabel(ref) {
  if (!ref) return "Direto";
  try {
    const host = new URL(ref).hostname.replace("www.", "");
    return host;
  } catch {
    return "Direto";
  }
}

export function useRealAnalytics(rangeKey) {
  const [pageViews, setPageViews] = useState([]);
  const [orders, setOrders] = useState([]);
  const [soldItems, setSoldItems] = useState([]);
  const [searchQueries, setSearchQueries] = useState([]);
  const [products, setProducts] = useState([]);
  const [cartAdds, setCartAdds] = useState([]);
  const [carts, setCarts] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      const start = startDateFor(rangeKey).toISOString();

      const [{ data: pv }, { data: ord }, { data: items }, { data: searches }, { data: prods }, { data: cartAdds }, { data: carts }, { data: favs }] = await Promise.all([
        supabase.from("page_views").select("path, session_id, referrer, created_at").gte("created_at", start),
        supabase.from("orders").select("total, payment_status, payment_method, shipping_country, customer_name, customer_email, landing_referrer, created_at").gte("created_at", start),
        supabase.from("order_items")
          .select("product_id, product_name, quantity, unit_price, orders!inner(created_at, payment_status)")
          .eq("orders.payment_status", "paid")
          .gte("orders.created_at", start),
        supabase.from("search_queries").select("query, created_at").gte("created_at", start),
        supabase.from("products").select("id, slug, name"),
        supabase.from("cart_add_events").select("product_id, product_name, quantity, created_at").gte("created_at", start),
        supabase.from("cart_snapshots").select("id, updated_at").gte("updated_at", start),
        supabase.from("favorites").select("product_id, created_at").gte("created_at", start),
      ]);

      if (cancelled) return;
      setPageViews(pv || []);
      setOrders(ord || []);
      setSoldItems(items || []);
      setSearchQueries(searches || []);
      setProducts(prods || []);
      setCartAdds(cartAdds || []);
      setCarts(carts || []);
      setFavorites(favs || []);
      setLoading(false);
    }

    load();
    return () => { cancelled = true; };
  }, [rangeKey]);

  // agrupa por hora (hoje), dia (7d/30d/90d/mês) ou mês (ano)
  const bucketed = () => {
    const now = new Date();
    const buckets = [];

    if (rangeKey === "today") {
      for (let h = 0; h < 24; h++) buckets.push({ label: `${h}h`, key: h });
      const bucketOf = (d) => new Date(d).getHours();
      return buildSeries(buckets, bucketOf);
    }

    if (rangeKey === "year") {
      for (let m = 0; m < 12; m++) {
        const d = new Date(now.getFullYear(), m, 1);
        buckets.push({ label: d.toLocaleDateString("pt-PT", { month: "short" }), key: m });
      }
      const bucketOf = (d) => new Date(d).getMonth();
      return buildSeries(buckets, bucketOf);
    }

    // dias (7d / 30d / 90d / mês)
    const start = startDateFor(rangeKey);
    const days = Math.round((now - start) / (1000 * 60 * 60 * 24)) + 1;
    for (let i = 0; i < days; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      buckets.push({ label: d.toLocaleDateString("pt-PT", { day: "2-digit", month: "2-digit" }), key: d.toDateString() });
    }
    const bucketOf = (d) => new Date(d).toDateString();
    return buildSeries(buckets, bucketOf);
  };

  function buildSeries(buckets, bucketOf) {
    const visitsMap = {};
    const ordersMap = {};
    const revenueMap = {};

    pageViews.forEach((v) => {
      const k = bucketOf(v.created_at);
      visitsMap[k] = (visitsMap[k] || 0) + 1;
    });
    orders.forEach((o) => {
      const k = bucketOf(o.created_at);
      ordersMap[k] = (ordersMap[k] || 0) + 1;
      if (o.payment_status === "paid") revenueMap[k] = (revenueMap[k] || 0) + Number(o.total);
    });

    return buckets.map((b) => ({
      label: b.label,
      visits: visitsMap[b.key] || 0,
      orders: ordersMap[b.key] || 0,
      revenue: +(revenueMap[b.key] || 0).toFixed(2),
    }));
  }

  const totalVisits = pageViews.length;
  const totalOrders = orders.length;
  const paidOrders = orders.filter((o) => o.payment_status === "paid");
  const totalRevenue = paidOrders.reduce((s, o) => s + Number(o.total), 0);
  const conversion = totalVisits > 0 ? (totalOrders / totalVisits) * 100 : 0;
  const averageOrderValue = paidOrders.length > 0 ? totalRevenue / paidOrders.length : 0;

  const topPages = Object.entries(
    pageViews.reduce((acc, v) => {
      acc[v.path] = (acc[v.path] || 0) + 1;
      return acc;
    }, {})
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([path, views]) => ({ path, views }));

  const topReferrers = Object.entries(
    pageViews.reduce((acc, v) => {
      const label = referrerLabel(v.referrer);
      acc[label] = (acc[label] || 0) + 1;
      return acc;
    }, {})
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([label, count]) => ({ label, count }));

  // produtos mais visitados — cruza os caminhos /produto/<slug> das visitas com o nome real do produto
  const slugToName = Object.fromEntries(products.map((p) => [p.slug, p.name]));
  const topProducts = Object.entries(
    pageViews.reduce((acc, v) => {
      const match = v.path.match(/^\/produto\/([^/?#]+)/);
      if (!match) return acc;
      const slug = match[1];
      acc[slug] = (acc[slug] || 0) + 1;
      return acc;
    }, {})
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([slug, views]) => ({ slug, name: slugToName[slug] || slug, views }));

  // produtos mais vendidos — quantidade real, só de encomendas pagas
  const bestSellersMap = {};
  soldItems.forEach((it) => {
    const key = it.product_id || it.product_name;
    if (!bestSellersMap[key]) bestSellersMap[key] = { name: it.product_name, qty: 0, revenue: 0 };
    bestSellersMap[key].qty += it.quantity;
    bestSellersMap[key].revenue += it.quantity * (it.unit_price || 0);
  });
  const bestSellers = Object.values(bestSellersMap)
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 10);

  // termos mais pesquisados na loja — agrupados sem distinguir maiúsculas/minúsculas
  const topSearches = Object.entries(
    searchQueries.reduce((acc, s) => {
      const key = s.query.trim().toLowerCase();
      if (!key) return acc;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {})
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([query, count]) => ({ query, count }));

  // produtos mais adicionados ao carrinho — inclui os que nunca chegaram a ser comprados
  const mostAddedMap = {};
  cartAdds.forEach((c) => {
    const key = c.product_id || c.product_name;
    if (!mostAddedMap[key]) mostAddedMap[key] = { name: c.product_name, count: 0 };
    mostAddedMap[key].count += c.quantity;
  });
  const mostAddedToCart = Object.values(mostAddedMap)
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // taxa de abandono de carrinho — carrinhos guardados no período vs. encomendas pagas concluídas
  const cartAbandonmentRate = carts.length > 0
    ? Math.max(0, (1 - paidOrders.length / carts.length) * 100)
    : 0;

  // clientes que mais gastaram no período (só encomendas pagas)
  const topCustomersMap = {};
  paidOrders.forEach((o) => {
    const key = o.customer_email;
    if (!key) return;
    if (!topCustomersMap[key]) topCustomersMap[key] = { name: o.customer_name || key, email: key, total: 0, orders: 0 };
    topCustomersMap[key].total += Number(o.total);
    topCustomersMap[key].orders += 1;
  });
  const topCustomers = Object.values(topCustomersMap)
    .sort((a, b) => b.total - a.total)
    .slice(0, 10);

  // vendas por método de pagamento (só pagas)
  const paymentMethodLabels = { card: "Cartão", mbway: "MB WAY", bank_transfer: "Transferência" };
  const salesByPaymentMethod = Object.entries(
    paidOrders.reduce((acc, o) => {
      const key = o.payment_method || "outro";
      if (!acc[key]) acc[key] = { total: 0, count: 0 };
      acc[key].total += Number(o.total);
      acc[key].count += 1;
      return acc;
    }, {})
  )
    .sort((a, b) => b[1].total - a[1].total)
    .map(([method, v]) => ({ label: paymentMethodLabels[method] || method, ...v }));

  // vendas por país de entrega (só pagas)
  const salesByCountry = Object.entries(
    paidOrders.reduce((acc, o) => {
      const key = o.shipping_country || "—";
      if (!acc[key]) acc[key] = { total: 0, count: 0 };
      acc[key].total += Number(o.total);
      acc[key].count += 1;
      return acc;
    }, {})
  )
    .sort((a, b) => b[1].total - a[1].total)
    .map(([country, v]) => ({ country, ...v }));

  // produtos mais guardados como favoritos no período
  const idToName = Object.fromEntries(products.map((p) => [p.id, p.name]));
  const mostFavoritedMap = {};
  favorites.forEach((f) => {
    mostFavoritedMap[f.product_id] = (mostFavoritedMap[f.product_id] || 0) + 1;
  });
  const mostFavorited = Object.entries(mostFavoritedMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([productId, count]) => ({ name: idToName[productId] || "(produto removido)", count }));

  // taxa de conversão por origem de tráfego — sessões únicas de cada origem,
  // vs. encomendas cuja sessão de chegada foi identificada com essa origem
  // (só disponível para encomendas feitas depois desta funcionalidade existir)
  const sessionsBySource = {};
  const seenSessions = new Set();
  pageViews.forEach((v) => {
    const sessionKey = v.session_id;
    if (!sessionKey || seenSessions.has(sessionKey)) return;
    seenSessions.add(sessionKey);
    const label = referrerLabel(v.referrer);
    sessionsBySource[label] = (sessionsBySource[label] || 0) + 1;
  });
  const ordersBySource = {};
  orders.forEach((o) => {
    if (!o.landing_referrer) return;
    ordersBySource[o.landing_referrer] = (ordersBySource[o.landing_referrer] || 0) + 1;
  });
  const conversionBySource = Object.entries(sessionsBySource)
    .map(([label, sessions]) => ({
      label,
      sessions,
      orders: ordersBySource[label] || 0,
      rate: sessions > 0 ? ((ordersBySource[label] || 0) / sessions) * 100 : 0,
    }))
    .sort((a, b) => b.sessions - a.sessions)
    .slice(0, 8);

  // funil: visitas (sessões únicas) → carrinho → checkout iniciado → compra concluída
  const funnelVisitors = seenSessions.size;
  const funnel = [
    { label: "Visitantes", value: funnelVisitors },
    { label: "Carrinho", value: carts.length },
    { label: "Checkout iniciado", value: totalOrders },
    { label: "Compra concluída", value: paidOrders.length },
  ];

  return {
    loading,
    series: loading ? [] : bucketed(),
    totalVisits,
    totalOrders,
    totalRevenue,
    conversion,
    averageOrderValue,
    cartAbandonmentRate,
    topPages,
    topReferrers,
    topProducts,
    bestSellers,
    topSearches,
    mostAddedToCart,
    topCustomers,
    salesByPaymentMethod,
    salesByCountry,
    mostFavorited,
    conversionBySource,
    funnel,
  };
}
