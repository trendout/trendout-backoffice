// supabase/functions/sitemap/index.ts
//
// Gera o sitemap.xml sempre atualizado, direto da base de dados —
// ao contrário de um ficheiro estático, nunca fica desatualizado quando
// adicionas ou removes produtos.
//
// URL a registar no Google Search Console e no robots.txt:
// https://<projeto>.supabase.co/functions/v1/sitemap

import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const STORE_URL = "https://loja.trendout.pt";

function escapeXml(str: string) {
  return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function urlEntry(loc: string, lastmod?: string, priority = "0.5") {
  return `  <url>
    <loc>${escapeXml(loc)}</loc>${lastmod ? `\n    <lastmod>${lastmod.slice(0, 10)}</lastmod>` : ""}
    <priority>${priority}</priority>
  </url>`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const [{ data: products }, { data: categories }, { data: collections }, { data: pages }] = await Promise.all([
    supabase.from("products").select("slug, updated_at").eq("is_active", true),
    supabase.from("categories").select("name"),
    supabase.from("collections").select("slug, updated_at").eq("is_active", true),
    supabase.from("pages").select("slug, updated_at").eq("status", "published"),
  ]);

  const entries: string[] = [urlEntry(STORE_URL, undefined, "1.0")];

  (categories || []).forEach((c) => entries.push(urlEntry(`${STORE_URL}/categoria/${encodeURIComponent(c.name)}`, undefined, "0.8")));
  (products || []).forEach((p) => entries.push(urlEntry(`${STORE_URL}/produto/${p.slug}`, p.updated_at, "0.7")));
  (collections || []).forEach((c) => entries.push(urlEntry(`${STORE_URL}/coleccao/${c.slug}`, c.updated_at, "0.6")));
  (pages || []).forEach((p) => entries.push(urlEntry(`${STORE_URL}/pagina/${p.slug}`, p.updated_at, "0.5")));

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join("\n")}
</urlset>`;

  return new Response(xml, {
    headers: { ...corsHeaders, "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=3600" },
    status: 200,
  });
});
