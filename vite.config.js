import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Se fores publicar em GitHub Pages num subcaminho (ex: username.github.io/trendout-backoffice),
// define `base: "/trendout-backoffice/"`. Se usares domínio próprio (ex: admin.trendout.pt), deixa "/".
export default defineConfig({
  plugins: [react()],
  base: "/",
});
