import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";

const DEFAULT_THEME = { accentColor: "#c9ff3f", bgColor: "#0f1210", textColor: "#eef0ec", headingFont: "Bebas Neue", bodyFont: "Inter" };

export function useStoreSettings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from("store_settings").select("*").eq("id", 1).single();

    if (error) {
      console.error("Erro a carregar definições da loja:", error);
      setLoading(false);
      return;
    }

    setSettings({
      storeName: data.store_name,
      domain: data.domain,
      currency: data.currency,
      freeShippingThreshold: Number(data.free_shipping_threshold),
      companyAddress: data.company_address,
      companyPhone: data.company_phone,
      companyEmail: data.company_email,
      companyNif: data.company_nif,
      showCompanyInfoFooter: data.show_company_info_footer,
      analyticsScripts: data.analytics_scripts || "",
      enableCardPayment: data.enable_card_payment,
      enableBankTransfer: data.enable_bank_transfer,
      companyIban: data.company_iban || "",
      paymentMethodsAccepted: data.payment_methods_accepted || [],
      enableStripe: data.enable_stripe,
      stripePublishableKey: data.stripe_publishable_key || "",
      enableMultibanco: data.enable_multibanco,
      multibancoEntity: data.multibanco_entity || "",
      enableMbway: data.enable_mbway,
      mbwayPhone: data.mbway_phone || "",
      googleMerchantId: data.google_merchant_id || "",
      googleSiteVerification: data.google_site_verification || "",
      enableGoogleAds: data.enable_google_ads,
      googleAdsConversionId: data.google_ads_conversion_id || "",
      googleAdsConversionLabel: data.google_ads_conversion_label || "",
      metaPixelId: data.meta_pixel_id || "",
      homepageProductsPerCategory: data.homepage_products_per_category ?? 8,
      maintenanceModeEnabled: data.maintenance_mode_enabled,
      maintenanceMessage: data.maintenance_message || "",
      announcementEnabled: data.announcement_enabled,
      announcementMessage: data.announcement_message || "",
      loyaltyPointsEnabled: data.loyalty_points_enabled,
      pointsPerEuroSpent: data.points_per_euro_spent ?? 2,
      pointsPerEuroDiscount: data.points_per_euro_discount ?? 100,
      promoPopupEnabled: data.promo_popup_enabled,
      promoPopupMessage: data.promo_popup_message || "",
      promoPopupCouponCode: data.promo_popup_coupon_code || "",
      theme: data.theme || DEFAULT_THEME,
    });
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const updateSettings = async (patch) => {
    const columnMap = {
      storeName: "store_name",
      domain: "domain",
      currency: "currency",
      freeShippingThreshold: "free_shipping_threshold",
      companyAddress: "company_address",
      companyPhone: "company_phone",
      companyEmail: "company_email",
      companyNif: "company_nif",
      showCompanyInfoFooter: "show_company_info_footer",
      analyticsScripts: "analytics_scripts",
      enableCardPayment: "enable_card_payment",
      enableBankTransfer: "enable_bank_transfer",
      companyIban: "company_iban",
      paymentMethodsAccepted: "payment_methods_accepted",
      enableStripe: "enable_stripe",
      stripePublishableKey: "stripe_publishable_key",
      enableMultibanco: "enable_multibanco",
      multibancoEntity: "multibanco_entity",
      enableMbway: "enable_mbway",
      mbwayPhone: "mbway_phone",
      googleMerchantId: "google_merchant_id",
      googleSiteVerification: "google_site_verification",
      enableGoogleAds: "enable_google_ads",
      googleAdsConversionId: "google_ads_conversion_id",
      googleAdsConversionLabel: "google_ads_conversion_label",
      metaPixelId: "meta_pixel_id",
      homepageProductsPerCategory: "homepage_products_per_category",
      maintenanceModeEnabled: "maintenance_mode_enabled",
      maintenanceMessage: "maintenance_message",
      announcementEnabled: "announcement_enabled",
      announcementMessage: "announcement_message",
      loyaltyPointsEnabled: "loyalty_points_enabled",
      pointsPerEuroSpent: "points_per_euro_spent",
      pointsPerEuroDiscount: "points_per_euro_discount",
      promoPopupEnabled: "promo_popup_enabled",
      promoPopupMessage: "promo_popup_message",
      promoPopupCouponCode: "promo_popup_coupon_code",
      theme: "theme",
    };
    const dbPatch = {};
    Object.entries(patch).forEach(([k, v]) => { dbPatch[columnMap[k] || k] = v; });

    const { error } = await supabase.from("store_settings").update(dbPatch).eq("id", 1);
    if (error) throw error;
    setSettings((s) => ({ ...s, ...patch }));
  };

  return { settings, loading, updateSettings, reload: load };
}
