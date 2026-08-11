# Marketing Campaign Dashboard — Planejamento Completo do MVP

> Documento de referência do projeto. Objetivo: dashboard para pequenas empresas, agências, social media e freelancers organizarem e acompanharem campanhas de marketing em um só lugar — com qualidade e apresentação suficientes para se destacar em portfólio.

---

## 0. Problema real que o projeto resolve

Pequenas agências e freelancers hoje controlam campanhas em planilhas soltas, prints de anúncios e conversas de WhatsApp. Isso gera três dores concretas:

1. **Perda de visibilidade financeira** — ninguém sabe rápido quanto já foi investido vs. quanto resta de orçamento.
2. **Prazos perdidos** — campanhas que deveriam terminar não são encerradas a tempo (ex: continuar pagando por um anúncio já vencido).
3. **Falta de histórico** — quando um cliente pergunta "por que essa campanha foi pausada em maio?", ninguém lembra.

O produto resolve isso com: KPIs financeiros e operacionais em tempo real, alertas de campanhas vencendo, e histórico de alterações (auditoria) por campanha. Esse é o gancho que você usa no README e no post do LinkedIn — não é "só um CRUD", é gestão financeira e operacional de campanhas.

---

## 1. Arquitetura de Pastas

Estrutura de **monorepo simples** (duas pastas na raiz, sem necessidade de workspaces/lerna — não vale a complexidade para um MVP solo):

```
marketing-campaign-dashboard/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js          # pool de conexão MySQL
│   │   │   └── env.js               # validação/carregamento de variáveis de ambiente
│   │   ├── controllers/
│   │   │   ├── auth.controller.js
│   │   │   ├── campaign.controller.js
│   │   │   ├── client.controller.js
│   │   │   ├── dashboard.controller.js
│   │   │   └── user.controller.js
│   │   ├── services/                # regra de negócio (controllers ficam finos)
│   │   │   ├── campaign.service.js
│   │   │   ├── dashboard.service.js
│   │   │   └── campaignHistory.service.js
│   │   ├── models/                  # camada de acesso a dados (queries SQL)
│   │   │   ├── campaign.model.js
│   │   │   ├── client.model.js
│   │   │   ├── campaignHistory.model.js
│   │   │   └── user.model.js
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   ├── campaign.routes.js
│   │   │   ├── client.routes.js
│   │   │   ├── dashboard.routes.js
│   │   │   └── index.js             # agrega todas as rotas em /api
│   │   ├── middlewares/
│   │   │   ├── auth.middleware.js
│   │   │   ├── error.middleware.js
│   │   │   ├── validate.middleware.js
│   │   │   └── notFound.middleware.js
│   │   ├── validators/              # schemas de validação (Joi ou express-validator)
│   │   │   └── campaign.validator.js
│   │   ├── utils/
│   │   │   ├── ApiError.js
│   │   │   └── asyncHandler.js
│   │   ├── database/
│   │   │   ├── migrations/
│   │   │   ├── seeds/
│   │   │   └── schema.sql
│   │   └── app.js                   # instância do Express, middlewares globais
│   ├── server.js                    # ponto de entrada (start do servidor)
│   ├── .env.example
│   ├── package.json
│   └── tests/
│       ├── campaign.test.js
│       └── dashboard.test.js
│
├── frontend/
│   ├── public/
│   │   ├── index.html               # dashboard
│   │   ├── campaigns.html           # lista de campanhas
│   │   ├── campaign-detail.html     # detalhe/timeline
│   │   ├── financial.html           # dashboard financeiro
│   │   └── login.html
│   ├── src/
│   │   ├── css/
│   │   │   ├── tokens.css           # variáveis de design system (cores, spacing)
│   │   │   ├── base.css
│   │   │   ├── components.css       # cards, botões, badges, modais
│   │   │   └── themes.css           # tema claro/escuro (data-theme)
│   │   ├── js/
│   │   │   ├── api/
│   │   │   │   └── apiClient.js     # wrapper de fetch centralizado
│   │   │   ├── components/
│   │   │   │   ├── campaignCard.js
│   │   │   │   ├── modal.js
│   │   │   │   ├── toast.js
│   │   │   │   └── charts.js        # wrappers do Chart.js
│   │   │   ├── pages/
│   │   │   │   ├── dashboard.page.js
│   │   │   │   ├── campaigns.page.js
│   │   │   │   ├── campaignDetail.page.js
│   │   │   │   └── financial.page.js
│   │   │   ├── utils/
│   │   │   │   ├── formatCurrency.js
│   │   │   │   ├── formatDate.js
│   │   │   │   └── theme.js         # toggle + persistência em localStorage
│   │   │   └── main.js
│   │   └── assets/
│   │       └── icons/
│   └── package.json                 # só para live-server/vite se quiser bundling leve
│
├── docs/
│   ├── PLANEJAMENTO.md              # este arquivo
│   ├── screenshots/
│   └── er-diagram.png
├── .gitignore
├── LICENSE
└── README.md
```

**Por que separar `controllers` de `services` de `models`?** Em um projeto de portfólio, isso demonstra que você entende separação de responsabilidades mesmo em uma stack simples (Express puro, sem framework tipo NestJS). Controller recebe request/response, service tem a regra de negócio, model conversa com o banco.

---

## 2. Modelagem do Banco de Dados (MySQL)

```sql
-- USERS: quem usa o sistema (responsáveis pelas campanhas)
CREATE TABLE users (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(120) NOT NULL,
  email         VARCHAR(160) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role          ENUM('admin', 'manager') NOT NULL DEFAULT 'manager',
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CLIENTS: os clientes da agência/freelancer (dono da campanha)
CREATE TABLE clients (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(160) NOT NULL,
  contact_email VARCHAR(160),
  contact_phone VARCHAR(30),
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CAMPAIGNS: entidade central
CREATE TABLE campaigns (
  id                INT AUTO_INCREMENT PRIMARY KEY,
  name              VARCHAR(160) NOT NULL,
  client_id         INT NOT NULL,
  description       TEXT,
  objective         VARCHAR(160),         -- ex: "Geração de leads", "Reconhecimento de marca"
  platform          ENUM('instagram','facebook','google_ads','tiktok','linkedin','other') NOT NULL,
  budget            DECIMAL(12,2) NOT NULL DEFAULT 0,
  spent_amount      DECIMAL(12,2) NOT NULL DEFAULT 0,
  start_date        DATE NOT NULL,
  end_date          DATE NOT NULL,
  status            ENUM('planned','active','paused','completed','cancelled') NOT NULL DEFAULT 'planned',
  responsible_id    INT NOT NULL,
  notes             TEXT,
  created_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at        DATETIME NULL,        -- soft delete

  CONSTRAINT fk_campaign_client FOREIGN KEY (client_id) REFERENCES clients(id),
  CONSTRAINT fk_campaign_user   FOREIGN KEY (responsible_id) REFERENCES users(id),
  INDEX idx_campaign_status (status),
  INDEX idx_campaign_dates (start_date, end_date)
);

-- CAMPAIGN_HISTORY: auditoria/timeline de alterações
CREATE TABLE campaign_history (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  campaign_id   INT NOT NULL,
  changed_by    INT NOT NULL,
  field_changed VARCHAR(60) NOT NULL,     -- ex: "status", "budget"
  old_value     VARCHAR(255),
  new_value     VARCHAR(255),
  changed_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_history_campaign FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE,
  CONSTRAINT fk_history_user     FOREIGN KEY (changed_by) REFERENCES users(id)
);

-- CAMPAIGN_MILESTONES: datas importantes na linha do tempo (além de início/fim)
CREATE TABLE campaign_milestones (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  campaign_id   INT NOT NULL,
  label         VARCHAR(160) NOT NULL,    -- ex: "Aprovação do criativo", "Início do boost"
  milestone_date DATE NOT NULL,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_milestone_campaign FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE
);
```

### 3. Relacionamentos

- `clients (1) ─── (N) campaigns` — um cliente tem várias campanhas.
- `users (1) ─── (N) campaigns` — um usuário responde por várias campanhas.
- `campaigns (1) ─── (N) campaign_history` — cada alteração relevante gera uma linha (populada no `service`, não no trigger, para manter a lógica em JS/testável).
- `campaigns (1) ─── (N) campaign_milestones` — linha do tempo com marcos além de start/end.

Não modelei "platform" como tabela separada (M:N) no MVP porque a exigência é uma plataforma por campanha — isso simplifica o schema. Se no futuro uma campanha rodar em múltiplas plataformas simultâneas, vira tabela `campaign_platforms` (M:N) — já deixo isso na seção de funcionalidades futuras.

`spent_amount` fica na própria campanha (atualizado manualmente pelo usuário no MVP) em vez de calculado — evita a complexidade de integrar com APIs de anúncios reais agora, mas deixa a porta aberta para isso depois.

---

## 4. Fluxo Completo do Sistema

```
[Login] ─▶ [Dashboard Geral]
                │
    ┌───────────┼──────────────────┐
    ▼           ▼                  ▼
[Campanhas]  [Financeiro]     [Configurações/Tema]
    │
    ├─▶ Criar campanha (modal/form) ─▶ grava em `campaigns` + 1ª entrada em `campaign_history`
    ├─▶ Filtrar/pesquisar/ordenar (client-side ou query params na API)
    ├─▶ Editar campanha ─▶ diff de campos alterados ─▶ grava em `campaign_history`
    ├─▶ Excluir (soft delete via `deleted_at`)
    └─▶ Clicar em uma campanha ─▶ [Detalhe da Campanha]
                                        ├─ Informações completas
                                        ├─ Linha do tempo (start, milestones, end, mudanças de status)
                                        ├─ Histórico de alterações (campaign_history)
                                        └─ Ações rápidas (mudar status, editar, excluir)
```

---

## 5. Casos de Uso

| # | Caso de uso | Ator | Resultado |
|---|---|---|---|
| UC01 | Fazer login | Usuário | Sessão autenticada (JWT) |
| UC02 | Ver dashboard geral | Usuário | KPIs + gráficos carregados |
| UC03 | Criar campanha | Usuário | Nova campanha + entrada de histórico "criada" |
| UC04 | Editar campanha | Usuário | Campos atualizados + histórico de diffs |
| UC05 | Mudar status da campanha | Usuário | Status atualizado + histórico |
| UC06 | Excluir campanha | Usuário | Soft delete, some das listagens |
| UC07 | Pesquisar/filtrar/ordenar campanhas | Usuário | Lista filtrada |
| UC08 | Ver detalhe + timeline de campanha | Usuário | Página de detalhe |
| UC09 | Ver dashboard financeiro | Usuário | Totais e ranking de investimento |
| UC10 | Alternar tema claro/escuro | Usuário | Preferência persistida |
| UC11 (futuro) | Receber alerta de campanha vencendo | Sistema | Notificação/e-mail |

---

## 6. Wireframes (texto)

### 6.1 Dashboard Geral

```
┌─────────────────────────────────────────────────────────────────┐
│ ☰  Marketing Dashboard                      🔍 Buscar   🌙  👤   │
├───────────┬─────────────────────────────────────────────────────┤
│ ▸ Dashboard│  Olá, Caio 👋  Aqui está o resumo das suas campanhas │
│  Campanhas│                                                       │
│  Financeiro│ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐     │
│  Clientes │ │ Total   │ │ Ativas  │ │ Pausadas│ │Finalizad│     │
│           │ │  32     │ │  18     │ │   4     │ │   10    │     │
│           │ └─────────┘ └─────────┘ └─────────┘ └─────────┘     │
│           │ ┌─────────┐ ┌─────────┐                             │
│           │ │Invest.  │ │Orçamento│                             │
│           │ │R$48.200 │ │restante │                             │
│           │ │         │ │R$12.400 │                             │
│           │ └─────────┘ └─────────┘                             │
│           │                                                       │
│           │ ┌───────────────────────┐ ┌─────────────────────┐   │
│           │ │ Campanhas por status  │ │ Investimento/mês     │   │
│           │ │      (donut chart)    │ │     (bar chart)      │   │
│           │ └───────────────────────┘ └─────────────────────┘   │
│           │                                                       │
│           │ ⚠ Campanhas terminando esta semana                   │
│           │ ┌───────────────────────────────────────────────┐   │
│           │ │ Black Friday Loja X   • termina em 2 dias      │   │
│           │ │ Institucional Y      • termina em 5 dias       │   │
│           │ └───────────────────────────────────────────────┘   │
└───────────┴─────────────────────────────────────────────────────┘
```

### 6.2 Lista de Campanhas

```
┌─────────────────────────────────────────────────────────────────┐
│  Campanhas                                    [+ Nova Campanha]  │
│  🔍 [buscar por nome/cliente]  Status ▾  Plataforma ▾  Ordenar ▾ │
├─────────────────────────────────────────────────────────────────┤
│ Nome            Cliente     Plataforma  Status    Orçamento  ⋮  │
│ Black Friday    Loja X      Instagram   ● Ativa   R$5.000    ⋮  │
│ Institucional   Studio Y    Google Ads  ● Pausada R$2.000    ⋮  │
│ Lançamento Z    Marca Z     TikTok      ● Finaliz. R$8.000   ⋮  │
├─────────────────────────────────────────────────────────────────┤
│                         ◂ 1 2 3 ▸                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 6.3 Detalhe da Campanha

```
┌─────────────────────────────────────────────────────────────────┐
│ ◂ Voltar        Black Friday Loja X               [Editar] [⋮]  │
│                 ● Ativa · Instagram · Responsável: Caio          │
├─────────────────────────────────────────────────────────────────┤
│ Objetivo: Geração de leads                                        │
│ Descrição: Campanha de conversão para black friday...            │
│ Período: 20/11 → 30/11        Orçamento: R$5.000 (R$3.200 usado) │
│ Observações: aguardando aprovação do criativo v2                 │
├─────────────────────────────────────────────────────────────────┤
│ Linha do tempo                                                    │
│  ●──────●───────────●───────────────●                            │
│  Criada  Início      Marco: criativo Fim previsto                │
│  10/11   20/11       aprovado 22/11  30/11                       │
├─────────────────────────────────────────────────────────────────┤
│ Histórico de alterações                                          │
│  22/11 14:02 — Caio alterou status: planned → active             │
│  25/11 09:10 — Caio alterou orçamento: R$4.000 → R$5.000         │
└─────────────────────────────────────────────────────────────────┘
```

### 6.4 Dashboard Financeiro

```
┌─────────────────────────────────────────────────────────────────┐
│ Financeiro                                                        │
│ ┌───────────────┐ ┌───────────────┐ ┌───────────────┐            │
│ │ Investido total│ │ Orçamento usado│ │ Restante      │           │
│ │  R$48.200      │ │     71%        │ │  R$12.400     │           │
│ └───────────────┘ └───────────────┘ └───────────────┘            │
│ ┌─────────────────────────────┐ ┌─────────────────────────────┐  │
│ │ Top 5 campanhas por invest.  │ │ Investimento por plataforma │  │
│ │ (bar chart horizontal)       │ │ (pie chart)                  │  │
│ └─────────────────────────────┘ └─────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 7. Design System

**Inspiração:** Linear, Notion, Vercel Dashboard — minimalista, bastante espaço em branco, cantos arredondados suaves, sombras discretas.

### Cores (tokens CSS)

```css
:root {
  /* Light */
  --bg: #f7f8fa;
  --surface: #ffffff;
  --border: #e5e7eb;
  --text-primary: #111827;
  --text-secondary: #6b7280;

  --brand-500: #4f46e5;   /* indigo — cor primária */
  --brand-600: #4338ca;

  --success-500: #16a34a; /* ativa */
  --warning-500: #d97706; /* pausada */
  --info-500:    #2563eb; /* planejada */
  --neutral-500: #6b7280; /* finalizada */
  --danger-500:  #dc2626; /* cancelada / alertas */
}

[data-theme="dark"] {
  --bg: #0f1115;
  --surface: #1a1d23;
  --border: #2a2e37;
  --text-primary: #f3f4f6;
  --text-secondary: #9ca3af;
}
```

### Tipografia

- Fonte: **Inter** (Google Fonts) — padrão de SaaS moderno, ótima legibilidade em tabelas.
- Escala: `12px` (labels/badges) · `14px` (corpo) · `16px` (corpo destacado) · `20px` (título de card) · `28px` (título de página) · `32px` (número de KPI).
- Peso: 400 corpo, 600 títulos/labels de KPI, 700 números grandes.

### Componentes-base

- **Stat Card**: ícone + label + número grande + variação opcional (▲/▼).
- **Badge de status**: pílula colorida (`Ativa` verde, `Pausada` âmbar, `Planejada` azul, `Finalizada` cinza, `Cancelada` vermelho).
- **Card de gráfico**: título + área do canvas (Chart.js) + legenda.
- **Tabela de dados**: cabeçalho fixo, hover na linha, ordenação por clique no header.
- **Modal**: usado para criar/editar campanha (evita navegação de página, comum em SaaS).
- **Toast**: feedback de sucesso/erro nas ações.
- **Sidebar** fixa à esquerda + **Topbar** com busca global e toggle de tema.

---

## 8. Funcionalidades do MVP

- [x] Login simples (1 tabela `users`, JWT, sem recuperação de senha)
- [x] CRUD completo de campanhas (criar, editar, excluir com soft delete)
- [x] CRUD simples de clientes (nome + contato)
- [x] Listagem com busca, filtro (status/plataforma) e ordenação
- [x] Página de detalhe com timeline e histórico de alterações
- [x] Dashboard geral com KPIs e 2 gráficos (status e investimento por período)
- [x] Dashboard financeiro com KPIs e 2 gráficos (top campanhas, investimento por plataforma)
- [x] Alerta de "campanhas terminando esta semana"
- [x] Tema claro/escuro persistido
- [x] Responsivo (mobile/tablet/desktop)

## 9. Funcionalidades Futuras (pós-MVP)

- Múltiplas plataformas por campanha (M:N)
- Papéis e permissões (admin vs. membro da equipe, multi-tenant por agência)
- Notificações por e-mail de campanhas vencendo (cron job)
- Exportação de relatórios em PDF/Excel
- Visão Kanban (arrastar campanha entre status)
- Visão de calendário
- Comentários e anexos (criativos) por campanha
- Integração real com Meta Ads / Google Ads API para puxar gasto automaticamente
- Customização de dashboard (arrastar/reorganizar cards)

---

## 10-11. Rotas da API / Endpoints REST

Prefixo: `/api`. Autenticação via `Authorization: Bearer <token>` (exceto `/auth/login`).

```
POST   /api/auth/login              → { token, user }

GET    /api/campaigns               → lista (query: ?status=&platform=&search=&sortBy=&order=&page=)
POST   /api/campaigns               → cria campanha
GET    /api/campaigns/:id           → detalhe
PUT    /api/campaigns/:id           → atualiza (gera histórico dos campos alterados)
DELETE /api/campaigns/:id           → soft delete
GET    /api/campaigns/:id/history   → histórico de alterações
GET    /api/campaigns/:id/milestones→ marcos da linha do tempo
POST   /api/campaigns/:id/milestones→ adiciona marco

GET    /api/clients                 → lista de clientes
POST   /api/clients                 → cria cliente
PUT    /api/clients/:id             → atualiza
DELETE /api/clients/:id             → remove

GET    /api/users                   → lista (para dropdown de "responsável")

GET    /api/dashboard/summary       → { totalCampaigns, active, paused, completed, totalInvested, remainingBudget, endingThisWeek }
GET    /api/dashboard/charts        → { byStatus: [...], investmentByMonth: [...] }
GET    /api/dashboard/financial     → { totalInvested, budgetUsedPct, remaining, topCampaigns: [...], byPlatform: [...] }
```

Formato de resposta padronizado:

```json
{ "success": true, "data": { ... } }
{ "success": false, "error": { "message": "Campanha não encontrada", "code": "CAMPAIGN_NOT_FOUND" } }
```

---

## 12. Estrutura das Telas

1. **Login** — formulário simples, sem cadastro público (usuário é seedado no banco).
2. **Dashboard** (`/`) — KPIs, gráficos, alerta de vencimento.
3. **Campanhas** (`/campaigns`) — tabela + filtros + botão "Nova Campanha" (abre modal).
4. **Detalhe da Campanha** (`/campaigns/:id`) — info completa, timeline, histórico.
5. **Financeiro** (`/financial`) — KPIs financeiros + gráficos.
6. **Clientes** (`/clients`) — CRUD simples, lista lateral usada nos formulários de campanha.

---

## 13-14-15. Organização do Código, Boas Práticas e Convenções

**Backend**
- Controllers finos (só orquestram request → service → response), regra de negócio no `service`.
- Toda query SQL isolada em `models/*.model.js` — nunca SQL solto dentro de controller.
- `asyncHandler` para evitar `try/catch` repetido em toda rota async.
- Middleware central de erro (`error.middleware.js`) retornando sempre o formato padronizado acima.
- Validação de entrada com **Joi** ou **express-validator** antes de chegar no controller.
- Variáveis sensíveis só em `.env` (nunca commitado — só `.env.example`).
- Paginação obrigatória em `GET /campaigns` (`page`, `limit`) para não devolver tudo de uma vez.
- Índices no banco em `status`, `start_date`/`end_date` e chaves estrangeiras (já no schema).
- Testes com Jest + Supertest cobrindo pelo menos: criação de campanha, atualização de status gera histórico, cálculo do dashboard financeiro.

**Frontend**
- Sem framework, mas organizado por "página" (`pages/*.page.js`) — cada página inicializa seus próprios listeners e chama a API.
- `apiClient.js` único ponto de `fetch` (facilita trocar para axios ou adicionar interceptors depois).
- CSS com variáveis (tokens) — nunca cor "hardcoded" espalhada pelos componentes.
- Sem manipulação de DOM duplicada: componentes pequenos (`campaignCard.js`, `modal.js`) reutilizáveis entre páginas.

**Convenções de nomenclatura**
- Banco de dados: tabelas e colunas em `snake_case`, tabelas no plural (`campaigns`, `campaign_history`).
- JavaScript: variáveis/funções em `camelCase`, classes em `PascalCase`, constantes globais em `UPPER_SNAKE_CASE`.
- Arquivos: `kebab-case` para HTML/CSS, `camelCase.page.js` / `camelCase.service.js` para módulos JS (sufixo indica a camada).
- Rotas REST: substantivos no plural, sem verbos (`/campaigns`, não `/getCampaigns`).
- Commits: **Conventional Commits** (`feat:`, `fix:`, `refactor:`, `docs:`) — importante para o histórico do GitHub parecer profissional.

---

## 16. Deixando o projeto com cara de portfólio profissional

1. **README matador**: problema que resolve → GIF/screenshot do dashboard → stack badges (shields.io) → como rodar localmente → link do deploy ao vivo → decisões técnicas ("por que soft delete", "por que histórico de auditoria").
2. **Deploy real**: backend + MySQL no Railway ou Render (free tier), frontend estático na Vercel/Netlify. Um link clicável vale mais que 10 prints.
3. **Dados de seed realistas**: script com `@faker-js/faker` gerando ~30 campanhas, 8 clientes, 3 usuários — o recrutador não vai testar um dashboard vazio.
4. **Diagrama ER** (dbdiagram.io ou drawio) exportado como imagem em `docs/`.
5. **Coleção Postman ou Swagger/OpenAPI** documentando os endpoints.
6. **Testes automatizados visíveis** (badge de "tests passing" no README, mesmo que poucos).
7. **Lint + Prettier configurados** — sinal de disciplina, não de tamanho de projeto.
8. **Vídeo curto (30-60s) de uso** para o post do LinkedIn — mostra fluxo real: criar campanha → ver refletido no dashboard → mudar status → ver no histórico.
9. **Commits incrementais e bem descritos** ao longo de "semanas" — não um único commit "projeto pronto".
10. **LICENSE (MIT)** e `.gitignore` corretos (sem `node_modules`, `.env`).

---

## Cronograma sugerido (solo, poucas semanas)

- **Semana 1**: schema do banco, backend (auth + CRUD campanhas/clientes), seed de dados.
- **Semana 2**: endpoints de dashboard/financeiro, frontend base (layout, tema, componentes).
- **Semana 3**: páginas de campanhas/detalhe/financeiro conectadas à API, gráficos com Chart.js.
- **Semana 4**: polimento visual, responsividade, testes, README, deploy, gravação do vídeo.

---

## Melhorias sugeridas (opcionais, não bloqueiam o MVP)

- Trocar ENUM de `platform` por tabela `platforms` só se quiser permitir o usuário cadastrar novas plataformas sem alterar código.
- Adicionar `budget_alert_threshold` na campanha (ex: avisar quando 90% do orçamento for usado) — pequeno diferencial de produto "real".
- Usar `Chart.js` (leve, sem dependência de build) em vez de bibliotecas mais pesadas — combina com a stack vanilla JS pedida.
