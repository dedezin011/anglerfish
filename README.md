# AnglerFish Landing Page

Landing page e ferramenta de validação de mercado para o AnglerFish, um ecossistema digital para campeonatos de pesca esportiva com ranking, recompensas, NFTs colecionáveis, criptomoedas e marketplace.

## Stack

- Next.js 16
- React 19
- Expo
- React Native
- TypeScript
- Tailwind CSS
- Supabase
- Vercel

## Funcionalidades

- Landing page responsiva e otimizada para SEO
- Captura de leads com nome e email
- Pesquisa pós-cadastro com 5 perguntas de validação e campo opcional de ideias
- Persistência no Supabase com relacionamento entre leads e respostas
- Dashboard administrativo protegido por login
- Métricas de validação de mercado
- Gráficos leves em CSS para carregamento rápido
- Exportação CSV em `/admin/export`
- Página de política de privacidade
- Sitemap, robots, Open Graph, canonical e JSON-LD

## Estrutura de pastas

```text
app/
  actions.ts
  globals.css
  layout.tsx
  page.tsx
  robots.ts
  sitemap.ts
  admin/
    actions.ts
    page.tsx
    export/
      route.ts
    login/
      LoginForm.tsx
      page.tsx
  components/
    WaitlistForm.tsx
  privacidade/
    page.tsx
lib/
  admin-auth.ts
  supabase.ts
supabase/
  schema.sql
apps/
  mobile/
    App.tsx
    README.md
```

## Variáveis de ambiente

Crie `.env.local` com base em `.env.example`:

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key
ADMIN_EMAIL=admin@anglerfish.com.br
ADMIN_PASSWORD=uma-senha-forte
ADMIN_SESSION_SECRET=um-segredo-aleatorio-longo
```

`SUPABASE_SERVICE_ROLE_KEY` deve ficar apenas no servidor. Não use `NEXT_PUBLIC_` nessa chave.

## Banco de dados Supabase

Execute o script:

```sql
-- supabase/schema.sql
```

Ele cria:

- `leads`
  - `id`
  - `nome`
  - `email`
  - `created_at`
- `survey_responses`
  - `id`
  - `lead_id`
  - `modalidade`
  - `interesse_campeonato`
  - `valor_participacao`
  - `tipo_premio`
  - `interesse_ranking`
  - `sugestao_plataforma`
  - `created_at`

O relacionamento é `survey_responses.lead_id -> leads.id`, com `on delete cascade`.

As perguntas 1, 3 e 4 aceitam múltiplas escolhas e são salvas como arrays (`text[]`) no Supabase.

A pesquisa também pode ser respondida anonimamente. Nesse caso, a resposta fica em `survey_responses` com `is_anonymous = true` e sem `lead_id`.

O campo `sugestao_plataforma` é opcional e guarda ideias livres enviadas pelos pescadores, com limite de 500 caracteres.

Se você já criou o banco antes desta alteração, execute também:

```sql
-- supabase/migrations/20260610_multi_select_survey.sql
-- supabase/migrations/20260612_anonymous_survey.sql
-- supabase/migrations/20260618_survey_suggestions.sql
-- supabase/migrations/20260625_mobile_mvp.sql
-- supabase/migrations/20260628_roles_and_tournament_organizers.sql
```

A migration `20260628_roles_and_tournament_organizers.sql` prepara a separação futura entre pescador, organizador e admin:

- `user_roles`: papéis globais do usuário (`angler`, `organizer`, `admin`)
- `tournament_organizers`: vínculo entre organizadores e torneios específicos
- políticas RLS para organizador ler/revisar apenas capturas dos torneios vinculados a ele

## App mobile

O MVP mobile fica em `apps/mobile` e foi criado com Expo + React Native.

Para rodar:

```bash
cd apps/mobile
npm install
npm run start
```

Configure `apps/mobile/.env` com:

```env
EXPO_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sua-chave-publicavel-ou-anon
```

O app mobile já tem login, tela do primeiro campeonato beta, envio de captura com foto/vídeo, ranking e perfil simples.

## Como executar localmente

```bash
npm install
npm run dev
```

Acesse:

```text
http://localhost:3000
```

Admin:

```text
http://localhost:3000/admin
```

## Build de produção

```bash
npm run build
npm run start
```

## Deploy na Vercel

1. Suba o projeto para um repositório Git.
2. Importe o repositório na Vercel.
3. Configure o framework como Next.js.
4. Adicione as variáveis de ambiente:

```env
NEXT_PUBLIC_SITE_URL=https://seu-dominio.com
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key
ADMIN_EMAIL=admin@anglerfish.com.br
ADMIN_PASSWORD=uma-senha-forte
ADMIN_SESSION_SECRET=um-segredo-aleatorio-longo
```

5. Execute o SQL de `supabase/schema.sql` no Supabase.
6. Faça o deploy.

Depois de configurar domínio próprio, atualize `NEXT_PUBLIC_SITE_URL` para a URL final.

## Métricas do dashboard

O dashboard administrativo mostra:

- Total de leads
- Total de pesquisas respondidas
- Taxa de conversão
- Crescimento por dia
- Modalidade mais popular
- Interesse em campeonatos online
- Interesse em cripto
- Faixa de preço mais escolhida
- Tipo de prêmio mais desejado
- Ideias recebidas da comunidade

## Exportação CSV

Depois de logado no admin, use o botão `Exportar CSV` ou acesse:

```text
/admin/export
```

O CSV inclui dados do lead, respostas da pesquisa e sugestões opcionais.

## Performance e SEO

- Server Components por padrão
- Interatividade isolada no formulário e login
- Gráficos em CSS, sem biblioteca pesada
- Metadata, Open Graph, canonical, sitemap, robots e JSON-LD configurados
- Estrutura compatível com Lighthouse acima de 90 em build de produção
