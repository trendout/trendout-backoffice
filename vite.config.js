import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Serve a partir da raiz de admin.trendout.pt — se voltares a testar em
// <user>.github.io/trendout-backoffice/ sem domínio próprio, muda para "/trendout-backoffice/".
export default defineConfig({
  plugins: [react()],
  base: "/",
});
