# marketing-campaign-dashboard

Dashboard para agências e freelancers acompanharem campanhas de marketing:
KPIs financeiros, alerta de campanhas terminando na semana e **histórico de
auditoria** por campanha (quem mudou o quê e quando). 11–14/08/2026.

Único projeto do workspace com frontend e backend separados em pastas irmãs.

## Stack

**Backend:** Node + Express 4 (**CommonJS** — os outros projetos são ESM),
MySQL 8, JWT, bcryptjs, **Joi** (os outros usam Zod), morgan, Jest + Supertest.
**Frontend:** HTML/CSS/JS puro em ES Modules, Chart.js, sem build.

## Documentação existente — é extensa, ler antes de mexer

| Arquivo | Conteúdo |
|---|---|
| [docs/PLANEJAMENTO.md](docs/PLANEJAMENTO.md) | Produto: problema, casos de uso, modelagem, wireframes, design system, roadmap |
| [docs/ARQUITETURA.md](docs/ARQUITETURA.md) | Camadas, fluxos, decisões técnicas, onde adicionar coisas |
| [docs/BANCO_DE_DADOS.md](docs/BANCO_DE_DADOS.md) | ER, cada coluna explicada, índices |
| [docs/API.md](docs/API.md) | Referência dos endpoints com request/response reais |
| [docs/GUIA_TECNICO.md](docs/GUIA_TECNICO.md) | Guia de estudo de cada tecnologia usada |
| [docs/obsidian/](docs/obsidian/) | O projeto explicado sem jargão, em notas interligadas (frontend = "salão", backend = "cozinha", banco = "almoxarifado") |

## Estrutura

```
backend/
  server.js  →  src/app.js
  src/config/       database.js (pool mysql2), env.js
  src/routes/  →  controllers/  →  services/  →  models/
  src/models/       user, client, campaign, campaignHistory, campaignMilestone
  src/middlewares/  auth, error, notFound, validate
  src/validators/   Joi
  src/utils/        ApiError, asyncHandler
  src/database/     schema.sql, runSchema.js, seeds/seed.js (@faker-js/faker)
  tests/            campaign.test.js, health.test.js (Jest, --runInBand)
frontend/
  public/           login, index, campaigns, campaign-detail, financial (.html)
  src/css/          tokens.css → base.css → components.css → themes.css
  src/js/api/       apiClient.js
  src/js/pages/     um módulo por página, carregado direto pelo HTML
  src/js/components/ charts, layout, modal, toast
  src/js/utils/     formatCurrency, formatDate, theme
```

Não há bundler: cada HTML carrega só o seu módulo de página com
`<script type="module">` e o navegador resolve os imports.

## Domínio

- **Papéis**: `admin`, `manager`.
- **Tabelas**: `users`, `clients`, `campaigns`, `campaign_history`,
  `campaign_milestones`.
- **Plataformas**: instagram, facebook, google_ads, tiktok, linkedin, other.
- **Status de campanha**: planned, active, paused, completed, cancelled.
- **Auditoria**: toda alteração de nome, orçamento, status, datas ou responsável
  grava linha em `campaign_history`. É o diferencial do projeto — qualquer
  caminho novo de escrita em campanha precisa registrar histórico também.

## Comandos

```bash
cd backend
npm run db:schema && npm run db:seed
npm run dev            # node --watch, porta 3000
npm test               # jest --runInBand
```

Preview pelo `launch.json` da raiz: `backend-api` (3000) + `frontend-static`
(5510). A 3000 conflita com o `helpdesk-api` — não subir os dois juntos.
O `CORS_ORIGIN` do `.env` precisa bater com a porta em que o front está servido.

## Estado

Funcional, documentado e **tudo commitado** — 80 arquivos rastreados (código,
frontend e os 6 documentos), árvore de trabalho limpa. Um único commit:
`5110ec7 Initial commit: Marketing Campaign Dashboard MVP` (11/08/2026), com
`origin` configurado.

Duas divergências em relação ao resto do workspace, para não tropeçar:

- A branch aqui é **`master`** (os outros projetos usam `main`).
- A mensagem do commit está em inglês e fora do padrão `tipo: descrição`. Do
  próximo commit em diante, seguir a convenção do workspace.

O erro `detected dubious ownership` (dono de arquivo herdado do perfil anterior à
formatação) foi resolvido em 18/08/2026 com:

```bash
git config --global --add safe.directory E:/projetos/marketing-campaign-dashboard
```
