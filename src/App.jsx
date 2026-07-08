import React, { useState } from "react";
import { useAuth } from "./hooks/useAuth";
import { useProducts, useOrders } from "./hooks/useSupabaseData";

// PASSO SEGUINTE: cola aqui dentro o backoffice.jsx completo (o dashboard, produtos,
// encomendas, coleções, etc.) e troca cada `useState([])` alimentado por window.storage
// pelos hooks useProducts()/useOrders() (e o mesmo padrão para categorias, coleções,
// cupões, páginas e menus — uma tabela Supabase por recurso).

export default function App() {
  const { user, isAdmin, loading: authLoading, login, logout } = useAuth();
  const { products, loading: productsLoading, quickUpdate } = useProducts();
  const { orders, loading: ordersLoading } = useOrders();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  if (authLoading) return <div style={{ padding: 40, color: "#8a9089" }}>A carregar...</div>;

  if (!user) {
    return (
      <div style={{ minHeight: "100vh", background: "#0f1210", color: "#eef0ec", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "sans-serif" }}>
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
          style={{ width: 320, background: "#171b18", border: "1px solid #262b26", borderRadius: 14, padding: 28 }}
        >
          <h2 style={{ marginTop: 0 }}>Trendout Backoffice</h2>
          <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: "100%", padding: 10, marginBottom: 10 }} />
          <input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: "100%", padding: 10, marginBottom: 10 }} />
          {error && <p style={{ color: "#ff6b5e", fontSize: 13 }}>{error}</p>}
          <button type="submit" style={{ width: "100%", padding: 10, background: "#c9ff3f", border: "none", borderRadius: 8, fontWeight: 700 }}>
            Entrar
          </button>
        </form>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div style={{ padding: 40, color: "#eef0ec", background: "#0f1210", minHeight: "100vh" }}>
        <p>A tua conta ({user.email}) não tem acesso de admin.</p>
        <p style={{ color: "#8a9089", fontSize: 13 }}>
          Pede para adicionarem o teu user id ({user.id}) à tabela <code>admin_profiles</code> no Supabase.
        </p>
        <button onClick={logout}>Sair</button>
      </div>
    );
  }

  return (
    <div style={{ padding: 40, color: "#eef0ec", background: "#0f1210", minHeight: "100vh" }}>
      <h2>Ligado ao Supabase com sucesso 🎉</h2>
      <p style={{ color: "#8a9089" }}>{user.email} — {productsLoading ? "a carregar produtos..." : `${products.length} produtos`} — {ordersLoading ? "a carregar encomendas..." : `${orders.length} encomendas`}</p>
      <button onClick={logout}>Sair</button>
    </div>
  );
}
