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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      const start = startDateFor(rangeKey).toISOString();

      const [{ data: pv }, { data: ord }] = await Promise.all([
        supabase.from("page_views").select("path, referrer, created_at").gte("created_at", start),
        supabase.from("orders").select("total, payment_status, created_at").gte("created_at", start),
      ]);

      if (cancelled) return;
      setPageViews(pv || []);
      setOrders(ord || []);
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
  const totalRevenue = orders.filter((o) => o.payment_status === "paid").reduce((s, o) => s + Number(o.total), 0);
  const conversion = totalVisits > 0 ? (totalOrders / totalVisits) * 100 : 0;

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

  return {
    loading,
    series: loading ? [] : bucketed(),
    totalVisits,
    totalOrders,
    totalRevenue,
    conversion,
    topPages,
    topReferrers,
  };
}
