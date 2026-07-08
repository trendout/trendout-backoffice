# Trendout Backoffice — plano por fases

Este projeto liga o backoffice a dados reais (Supabase) e a um repositório Git com deploy automático.

## Fase 1 — Supabase

1. Cria o projeto em [supabase.com](https://supabase.com) (região Europe/Frankfurt).
2. SQL Editor → cola o conteúdo de `schema.sql` (o ficheiro que já tens) → corre.
3. Project Settings → API → copia `Project URL` e `anon public key`.
4. Cria o teu utilizador admin em Authentication → Users → Add user.
5. SQL Editor, corre isto substituindo o UUID pelo do utilizador criado:
   ```sql
   insert into admin_profiles (id, full_name, role)
   values ('COLA-AQUI-O-UUID-DO-USER', 'Romeu', 'admin');
   ```

## Fase 2 — Git

```bash
cd trendout-backoffice
git init
git add .
git commit -m "Setup inicial do backoffice"
```

Cria um repositório vazio no GitHub (ex: `trendout-backoffice`), depois:

```bash
git remote add origin https://github.com/<teu-user>/trendout-backoffice.git
git branch -M main
git push -u origin main
```

## Fase 3 — Ambiente local

```bash
cp .env.example .env.local
# edita .env.local com a URL e a anon key do Supabase
npm install
npm run dev
```

Abre `http://localhost:5173` — deves conseguir entrar com o email/password do utilizador admin criado na Fase 1.

## Fase 4 — Trazer o backoffice completo

O `src/App.jsx` atual é só um esqueleto de confirmação. Substitui-o pelo conteúdo do `backoffice.jsx`
que já tens (dashboard, produtos, encomendas, coleções, cupões, páginas, etc.), com estas trocas:

- Cada `useState([])` alimentado por `window.storage` → usa `useProducts()` / `useOrders()`
  (já prontos em `src/hooks/useSupabaseData.js`) ou cria o mesmo padrão para as outras tabelas
  (`categories`, `collections`, `coupons`, `pages`, `menus`, `shipping_rates`, `store_settings`).
- O ecrã de login mock → usa `useAuth()` (já pronto em `src/hooks/useAuth.js`).
- Upload de imagens (produtos, páginas) → troca o `FileReader` por upload para um bucket do
  Supabase Storage:
  ```js
  const { data, error } = await supabase.storage
    .from('product-images')
    .upload(`${crypto.randomUUID()}.jpg`, file);
  const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(data.path);
  ```

## Fase 5 — Deploy automático

1. No GitHub: Settings → Pages → Source: "GitHub Actions".
2. Settings → Secrets and variables → Actions → adiciona:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Faz push para `main` — o workflow em `.github/workflows/deploy.yml` publica automaticamente.
4. Se quiseres domínio próprio (ex: `admin.trendout.pt`), configura um registo CNAME a apontar
   para `<teu-user>.github.io` e adiciona o domínio em Settings → Pages.

## Fase 6 — Visitas ao vivo e analytics reais

A tabela `visitor_sessions` já existe no schema. Falta:
1. Um pequeno script no frontoffice (loja pública) que envia um heartbeat a cada ~10s com
   `session_id`, página atual e estado do carrinho.
2. Uma Edge Function que recebe esse heartbeat, resolve a geolocalização por IP, e faz upsert
   em `visitor_sessions`.
3. No backoffice, trocar a simulação por uma subscrição Supabase Realtime a essa tabela.

Isto fica para depois do checkout (Stripe) estar a funcionar — é a peça de maior prioridade agora.
