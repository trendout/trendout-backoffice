import React, { useState } from "react";
import { LogOut, Package, Folder, ShoppingBag, ShoppingCart, Layers, Tag, FileText, Menu as MenuIcon, Palette, BarChart3, Settings, Image, Percent, Users, Radio, Star } from "lucide-react";
import { useAuth } from "./hooks/useAuth";
import { T } from "./lib/theme";
import ProductsPage from "./pages/ProductsPage";
import CategoriesPage from "./pages/CategoriesPage";
import OrdersPage from "./pages/OrdersPage";
import AbandonedCartsPage from "./pages/AbandonedCartsPage";
import CustomersPage from "./pages/CustomersPage";
import ReviewsPage from "./pages/ReviewsPage";
import CollectionsPage from "./pages/CollectionsPage";
import CouponsPage from "./pages/CouponsPage";
import PagesPage from "./pages/PagesPage";
import NavigationPage from "./pages/NavigationPage";
import ThemePage from "./pages/ThemePage";
import AnalyticsPage from "./pages/AnalyticsPage";
import LiveVisitorsPage from "./pages/LiveVisitorsPage";
import SettingsPage from "./pages/SettingsPage";
import HeroSlidesPage from "./pages/HeroSlidesPage";
import VatRatesPage from "./pages/VatRatesPage";
import { useNewOrdersCount } from "./hooks/useNewOrdersCount";
import logo from "./assets/logo.png";

const NAV = [
  { key: "products", label: "Produtos", icon: Package },
  { key: "categories", label: "Categorias", icon: Folder },
  { key: "collections", label: "Coleções", icon: Layers },
  { key: "coupons", label: "Cupões", icon: Tag },
  { key: "pages", label: "Páginas", icon: FileText },
  { key: "navigation", label: "Navegação", icon: MenuIcon },
  { key: "hero", label: "Hero", icon: Image },
  { key: "theme", label: "Tema", icon: Palette },
  { key: "analytics", label: "Análises", icon: BarChart3 },
  { key: "live", label: "Visitas ao Vivo", icon: Radio },
  { key: "orders", label: "Encomendas", icon: ShoppingBag },
  { key: "abandoned-carts", label: "Abandonados", icon: ShoppingCart },
  { key: "customers", label: "Clientes", icon: Users },
  { key: "reviews", label: "Avaliações", icon: Star },
  { key: "vat", label: "IVA por mercado", icon: Percent },
  { key: "settings", label: "Definições", icon: Settings },
];

export default function App() {
  const { user, isAdmin, loading: authLoading, login, logout } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [page, setPage] = useState("products");
  const newOrdersCount = useNewOrdersCount();

  if (authLoading) {
    return <div style={{ padding: 40, color: T.muted, background: T.bg, minHeight: "100vh" }}>A carregar...</div>;
  }

  if (!user) {
    return (
      <div style={{ minHeight: "100vh", background: T.bg, color: T.text, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "sans-serif" }}>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setError("");
            try {
              await login(email, password);
            } catch (err) {
              setError(err.message);
            }
          }}
          style={{ width: 320, background: T.bgRaised, border: `1px solid ${T.border}`, borderRadius: 14, padding: 28 }}
        >
          <img src={logo} alt="Trendout" style={{ height: 64, marginBottom: 14 }} />
          <h2 style={{ marginTop: 0, marginBottom: 18, fontFamily: "'Bebas Neue', sans-serif", letterSpacing: 1, fontSize: 15, color: T.muted, textTransform: "uppercase" }}>Backoffice</h2>
          <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: "100%", padding: 10, marginBottom: 10, background: T.bg, border: `1px solid ${T.border}`, borderRadius: 8, color: T.text, boxSizing: "border-box" }} />
          <input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: "100%", padding: 10, marginBottom: 10, background: T.bg, border: `1px solid ${T.border}`, borderRadius: 8, color: T.text, boxSizing: "border-box" }} />
          {error && <p style={{ color: T.danger, fontSize: 13 }}>{error}</p>}
          <button type="submit" style={{ width: "100%", padding: 10, background: T.accent, border: "none", borderRadius: 8, fontWeight: 700, cursor: "pointer" }}>
            Entrar
          </button>
        </form>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div style={{ padding: 40, color: T.text, background: T.bg, minHeight: "100vh" }}>
        <p>A tua conta ({user.email}) não tem acesso de admin.</p>
        <p style={{ color: T.muted, fontSize: 13 }}>
          Pede para adicionarem o teu user id ({user.id}) à tabela <code>admin_profiles</code> no Supabase.
        </p>
        <button onClick={logout}>Sair</button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: T.bg, color: T.text, fontFamily: "Inter, -apple-system, sans-serif", display: "flex" }}>
      <aside style={{ width: 200, flexShrink: 0, background: T.bgRaised, borderRight: `1px solid ${T.border}`, padding: "22px 16px", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "0 8px 20px" }}>
          <img src={logo} alt="Trendout" style={{ height: 48 }} />
        </div>
        <nav style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1 }}>
          {NAV.map((n) => {
            const Icon = n.icon;
            const active = page === n.key;
            return (
              <button
                key={n.key}
                onClick={() => setPage(n.key)}
                className={active ? "" : "side-nav-hover"}
                style={{
                  display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 8,
                  border: "none", cursor: "pointer", fontSize: 13.5, fontWeight: 600, textAlign: "left",
                  background: active ? "rgba(201,255,63,0.08)" : "transparent",
                  color: active ? T.accent : T.text,
                }}
              >
                <Icon size={16} /> {n.label}
                {n.key === "orders" && newOrdersCount > 0 && (
                  <span style={{
                    marginLeft: "auto", background: T.accent, color: T.bg, fontSize: 10.5, fontWeight: 700,
                    borderRadius: "50%", minWidth: 18, height: 18, display: "flex", alignItems: "center",
                    justifyContent: "center", padding: "0 2px",
                  }}>
                    {newOrdersCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
        <button
          onClick={logout}
          style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 8, border: `1px solid ${T.border}`, background: "transparent", color: T.muted, cursor: "pointer", fontSize: 13 }}
        >
          <LogOut size={15} /> Sair
        </button>
        <style>{`
          .side-nav-hover:hover { color: ${T.accent} !important; }
        `}</style>
      </aside>

      <main style={{ flex: 1, padding: "28px 32px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h1 style={{ margin: 0, fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, letterSpacing: 0.5 }}>
            {NAV.find((n) => n.key === page)?.label}
          </h1>
          <span style={{ fontSize: 12.5, color: T.muted }}>{user.email}</span>
        </div>

        {page === "products" ? <ProductsPage />
          : page === "categories" ? <CategoriesPage />
          : page === "collections" ? <CollectionsPage />
          : page === "coupons" ? <CouponsPage />
          : page === "pages" ? <PagesPage />
          : page === "navigation" ? <NavigationPage />
          : page === "hero" ? <HeroSlidesPage />
          : page === "theme" ? <ThemePage />
          : page === "analytics" ? <AnalyticsPage />
          : page === "live" ? <LiveVisitorsPage />
          : page === "vat" ? <VatRatesPage />
          : page === "customers" ? <CustomersPage />
          : page === "reviews" ? <ReviewsPage />
          : page === "settings" ? <SettingsPage />
          : page === "abandoned-carts" ? <AbandonedCartsPage />
          : page === "orders" ? <OrdersPage />
          : <OrdersPage />}
      </main>
    </div>
  );
}
