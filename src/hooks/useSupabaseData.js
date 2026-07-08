import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";

/**
 * Este hook substitui os `window.storage.get/set` do protótipo por
 * queries reais ao Supabase. Padrão para os restantes ficheiros
 * (categories, collections, discounts, pages, menus...): mesma ideia,
 * uma tabela por recurso.
 */
export function useProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("products")
      .select("*, product_variants(*)")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erro a carregar produtos:", error);
      setLoading(false);
      return;
    }

    // Adapta os nomes de coluna (snake_case na BD) para o formato usado no backoffice (camelCase)
    const mapped = data.map((p) => ({
      id: p.id,
      name: p.name,
      reference: p.reference,
      ean: p.ean,
      weightGrams: p.weight_grams,
      topCategory: p.top_category,
      category: p.category,
      description: p.description,
      basePrice: Number(p.base_price),
      compareAtPrice: p.compare_at_price ? Number(p.compare_at_price) : null,
      couponCode: p.coupon_code,
      availability: p.availability,
      features: p.features || [],
      images: p.images || [],
      active: p.is_active,
      variants: (p.product_variants || []).map((v) => ({
        id: v.id,
        size: v.size,
        color: v.color,
        sku: v.sku,
        ean: v.ean,
        stock: v.stock,
        soldRecently: v.sold_recently,
      })),
    }));

    setProducts(mapped);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  // Cria ou atualiza um produto + as suas variantes
  const saveProduct = async (product) => {
    const { data: savedProduct, error } = await supabase
      .from("products")
      .upsert({
        id: product.id,
        name: product.name,
        slug: product.slug || slugify(product.name),
        reference: product.reference,
        ean: product.ean,
        weight_grams: product.weightGrams,
        top_category: product.topCategory,
        category: product.category,
        description: product.description,
        base_price: product.basePrice,
        compare_at_price: product.compareAtPrice,
        coupon_code: product.couponCode,
        availability: product.availability,
        features: product.features,
        images: product.images,
        is_active: product.active,
      })
      .select()
      .single();

    if (error) throw error;

    // Substitui as variantes existentes pelas atuais (simples e seguro para um formulário pequeno)
    await supabase.from("product_variants").delete().eq("product_id", savedProduct.id);
    if (product.variants?.length) {
      await supabase.from("product_variants").insert(
        product.variants.map((v) => ({
          product_id: savedProduct.id,
          size: v.size,
          color: v.color,
          sku: v.sku,
          ean: v.ean,
          stock: v.stock,
          sold_recently: v.soldRecently || 0,
        }))
      );
    }

    await load();
  };

  const deleteProduct = async (id) => {
    await supabase.from("products").delete().eq("id", id);
    await load();
  };

  // Edição rápida de uma única coluna (usado na listagem: preço, EAN, disponibilidade...)
  const quickUpdate = async (id, patch) => {
    const columnMap = {
      basePrice: "base_price",
      compareAtPrice: "compare_at_price",
      reference: "reference",
      ean: "ean",
      active: "is_active",
      availability: "availability",
    };
    const dbPatch = {};
    Object.entries(patch).forEach(([k, v]) => { dbPatch[columnMap[k] || k] = v; });

    await supabase.from("products").update(dbPatch).eq("id", id);
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  };

  return { products, loading, saveProduct, deleteProduct, quickUpdate, reload: load };
}

export function useOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("orders")
      .select("*, order_items(*), shipping_addresses(*)")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erro a carregar encomendas:", error);
      setLoading(false);
      return;
    }

    setOrders(
      data.map((o) => ({
        id: o.id,
        orderNumber: o.order_number,
        customerName: o.customer_name,
        customerEmail: o.customer_email,
        status: o.status,
        paymentMethod: o.payment_method,
        cardLast4: o.card_last4,
        shippingCountry: o.shipping_country,
        shippingSpeed: o.shipping_speed,
        couponCode: o.coupon_code,
        discountAmount: Number(o.discount_amount || 0),
        estimatedDelivery: o.estimated_delivery,
        createdAt: o.created_at,
        subtotal: Number(o.subtotal),
        shippingCost: Number(o.shipping_cost),
        total: Number(o.total),
        items: (o.order_items || []).map((it) => ({
          productName: it.product_name,
          size: it.size,
          color: it.color,
          unitPrice: Number(it.unit_price),
          quantity: it.quantity,
          lineTotal: Number(it.line_total),
        })),
        shipping: o.shipping_addresses
          ? {
              fullName: o.shipping_addresses.full_name,
              address: o.shipping_addresses.address_line1,
              postalCode: o.shipping_addresses.postal_code,
              city: o.shipping_addresses.city,
              country: o.shipping_addresses.country,
              phone: o.shipping_addresses.phone,
            }
          : null,
      }))
    );
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const updateStatus = async (id, status) => {
    await supabase.from("orders").update({ status }).eq("id", id);
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
  };

  return { orders, loading, updateStatus, reload: load };
}

function slugify(s) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
