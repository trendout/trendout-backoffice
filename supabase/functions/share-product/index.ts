// supabase/functions/share-product/index.ts
//
// Os robôs do Facebook/WhatsApp/Instagram não correm JavaScript, por isso
// nunca veem os meta tags que a loja (uma SPA React) define via JS. Esta
// função devolve HTML já pronto com Open Graph, e redireciona pessoas reais
// para a página verdadeira do produto.
//
// Link a partilhar (em vez do link direto da loja):
// https://<projeto>.supabase.co/functions/v1/share-product?slug=<slug-do-produto>

import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const STORE_URL = "https://loja.trendout.pt";

function escapeHtml(str: string) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const url = new URL(req.url);
  const slug = url.searchParams.get("slug");
  const productUrl = slug ? `${STORE_URL}/produto/${slug}` : STORE_URL;

  if (!slug) {
    return Response.redirect(STORE_URL, 302);
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const { data: product } = await supabase
    .from("products")
    .select("name, description, images, base_price")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (!product) {
    return Response.redirect(STORE_URL, 302);
  }

  const title = `${product.name} — Trendout`;
  const description = (product.description || `Compra ${product.name} na Trendout.`).slice(0, 155);
  const image = product.images?.[0] || `${STORE_URL}/assets/logo.png`;
  const price = Number(product.base_price).toFixed(2);

  const html = `<!doctype html>
<html lang="pt">
<head>
<meta charset="utf-8" />
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(description)}" />

<meta property="og:type" content="product" />
<meta property="og:title" content="${escapeHtml(title)}" />
<meta property="og:description" content="${escapeHtml(description)}" />
<meta property="og:image" content="${escapeHtml(image)}" />
<meta property="og:url" content="${escapeHtml(productUrl)}" />
<meta property="og:site_name" content="Trendout" />
<meta property="product:price:amount" content="${price}" />
<meta property="product:price:currency" content="EUR" />

<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${escapeHtml(title)}" />
<meta name="twitter:description" content="${escapeHtml(description)}" />
<meta name="twitter:image" content="${escapeHtml(image)}" />

<meta http-equiv="refresh" content="0; url=${escapeHtml(productUrl)}" />
<script>window.location.replace(${JSON.stringify(productUrl)});</script>
</head>
<body>
  <p>A abrir <a href="${escapeHtml(productUrl)}">${escapeHtml(product.name)}</a>...</p>
</body>
</html>`;

  return new Response(html, {
    headers: { ...corsHeaders, "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store, must-revalidate" },
    status: 200,
  });
});
