# Referência da API REST

> URL base: `http://localhost:3000`. Todas as rotas de negócio ficam sob `/api`. Formato de resposta, autenticação e cada endpoint estão documentados abaixo com exemplos reais.

## Convenções

### Formato de resposta

Toda resposta é um JSON com o campo `success`:

```json
{ "success": true, "data": { /* ... */ } }
```

```json
{ "success": false, "error": { "message": "Campanha não encontrada", "code": "CAMPAIGN_NOT_FOUND" } }
```

Nunca um array "solto" na raiz, nunca um erro sem `code` — o `code` é o que o frontend usa para decidir *o que fazer* com o erro (ex.: `code === 'UNAUTHORIZED'` dispara logout automático em `apiClient.js`).

### Autenticação

Toda rota sob `/api`, exceto `POST /api/auth/login`, exige o header:

```
Authorization: Bearer <token>
```

O token é obtido no login e expira em 7 dias (`JWT_EXPIRES_IN` no `.env`). Uma requisição sem token, ou com token expirado/inválido, recebe `401` com `code: "UNAUTHORIZED"`.

### Erros comuns a todas as rotas

| Status | `code` | Quando acontece |
|---|---|---|
| 400 | `VALIDATION_ERROR` | Body não passou na validação Joi. `message` traz o(s) campo(s) inválido(s). |
| 401 | `UNAUTHORIZED` | Token ausente, inválido ou expirado. |
| 404 | `ROUTE_NOT_FOUND` | Caminho não existe na API. |
| 500 | `INTERNAL_ERROR` | Erro inesperado (bug, banco fora do ar, etc.) — detalhes ficam só no log do servidor, nunca na resposta. |

---

## `GET /health`

Fora de `/api`, sem autenticação. Usado para checar se o processo está de pé (útil em monitoramento/deploy).

```
GET /health

200 OK
{ "success": true, "data": { "status": "ok" } }
```

---

## Autenticação

### `POST /api/auth/login`

| | |
|---|---|
| Autenticação | Não exige |
| Body | `{ email: string, password: string }` |

```
POST /api/auth/login
Content-Type: application/json

{ "email": "caio@agencia.com", "password": "senha123" }
```

```json
200 OK
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": { "id": 1, "name": "Caio Martins", "email": "caio@agencia.com", "role": "admin" }
  }
}
```

Credenciais erradas → `401 UNAUTHORIZED` / `code: "INVALID_CREDENTIALS"`.

---

## Campanhas

### `GET /api/campaigns`

Lista paginada, com filtro, busca e ordenação.

| Query param | Tipo | Padrão | Descrição |
|---|---|---|---|
| `status` | `planned\|active\|paused\|completed\|cancelled` | — | Filtra por status exato. |
| `platform` | `instagram\|facebook\|google_ads\|tiktok\|linkedin\|other` | — | Filtra por plataforma exata. |
| `search` | string | — | Busca por substring no nome da campanha **ou** no nome do cliente (`LIKE '%...%'`). |
| `sortBy` | `name\|budget\|start_date\|end_date\|status\|created_at` | `created_at` | Qualquer outro valor é ignorado silenciosamente (whitelist, ver nota de segurança abaixo). |
| `order` | `asc\|desc` | `desc` | |
| `page` | inteiro ≥ 1 | `1` | |
| `limit` | inteiro, 1–100 | `10` | Limitado a 100 para impedir que alguém peça `limit=999999` e sobrecarregue o banco. |

```
GET /api/campaigns?status=active&sortBy=budget&order=desc&page=1&limit=2
Authorization: Bearer <token>
```

```json
200 OK
{
  "success": true,
  "data": {
    "rows": [
      {
        "id": 12, "name": "Handmade Shoes", "client_id": 4,
        "description": "...", "objective": "Conversão de vendas",
        "platform": "tiktok", "budget": "14888.00", "spent_amount": "14888.00",
        "start_date": "2026-03-02", "end_date": "2026-03-28",
        "status": "active", "responsible_id": 3, "notes": "...",
        "created_at": "2026-08-05 23:30:03", "updated_at": "2026-08-05 23:30:03",
        "deleted_at": null,
        "client_name": "Funk - Schiller", "responsible_name": "Bruno Lima"
      }
    ],
    "total": 5,
    "page": 1,
    "limit": 2
  }
}
```

> Nota sobre `budget`/`spent_amount` virem como **string** (`"14888.00"`): é o driver `mysql2` preservando a precisão exata de uma coluna `DECIMAL`. O frontend converte com `Number(...)` onde precisa calcular; ver [BANCO_DE_DADOS.md](BANCO_DE_DADOS.md) para o bug que isso já causou.

> **Nota de segurança:** `sortBy` é validado contra uma whitelist fixa (`SORTABLE_COLUMNS` em `campaign.model.js`) antes de entrar na query SQL. Isso existe especificamente para impedir *SQL injection* via esse parâmetro — nunca interpole um valor vindo de `req.query` direto num `ORDER BY`.

### `POST /api/campaigns`

| | |
|---|---|
| Body | ver tabela abaixo |

| Campo | Tipo | Obrigatório | Observação |
|---|---|---|---|
| `name` | string, máx 160 | sim | |
| `clientId` | inteiro | sim | Deve existir em `clients`. |
| `description` | string | não | |
| `objective` | string, máx 160 | não | |
| `platform` | enum | sim | `instagram\|facebook\|google_ads\|tiktok\|linkedin\|other` |
| `budget` | número ≥ 0 | sim | |
| `spentAmount` | número ≥ 0 | não | Padrão `0`. |
| `startDate` | string `AAAA-MM-DD` | sim | Não é `Date` — ver nota em [BANCO_DE_DADOS.md](BANCO_DE_DADOS.md#uma-pegadinha-do-driver-que-virou-bug-real-e-o-que-aprender-com-ela). |
| `endDate` | string `AAAA-MM-DD` | sim | Deve ser ≥ `startDate` (validado). |
| `status` | enum | não | Padrão `planned`. |
| `responsibleId` | inteiro | sim | Deve existir em `users`. |
| `notes` | string | não | |

```
POST /api/campaigns
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Black Friday Loja X",
  "clientId": 7,
  "platform": "instagram",
  "budget": 5000,
  "startDate": "2026-11-20",
  "endDate": "2026-11-30",
  "responsibleId": 1
}
```

```json
201 Created
{
  "success": true,
  "data": {
    "id": 31, "name": "Black Friday Loja X", "client_id": 7,
    "description": null, "objective": null, "platform": "instagram",
    "budget": "5000.00", "spent_amount": "0.00",
    "start_date": "2026-11-20", "end_date": "2026-11-30",
    "status": "planned", "responsible_id": 1, "notes": null,
    "created_at": "2026-08-06 10:00:00", "updated_at": "2026-08-06 10:00:00", "deleted_at": null,
    "client_name": "Auer LLC", "responsible_name": "Caio Martins"
  }
}
```

Ao criar, o backend já grava a primeira linha do histórico (`status: null → planned`) automaticamente — ver `campaign.service.js#create`.

### `GET /api/campaigns/:id`

Retorna a campanha com `client_name` e `responsible_name` já resolvidos (join). `404 CAMPAIGN_NOT_FOUND` se não existir ou estiver soft-deletada.

### `PUT /api/campaigns/:id`

Mesmos campos do `POST`, todos **opcionais** — envie só o que quer mudar. Campos omitidos mantêm o valor atual.

```
PUT /api/campaigns/31
Authorization: Bearer <token>
Content-Type: application/json

{ "status": "active", "spentAmount": 1200 }
```

```json
200 OK
{ "success": true, "data": { "id": 31, "status": "active", "spent_amount": "1200.00", "...": "..." } }
```

Por baixo dos panos, isso compara `name`, `budget`, `status`, `startDate`, `endDate` e `responsibleId` com o estado anterior e grava uma linha em `campaign_history` **para cada campo que realmente mudou** (não para `spentAmount`, que não é rastreado no histórico). Ver `TRACKED_FIELDS` em `campaign.service.js`.

### `DELETE /api/campaigns/:id`

Soft delete (`deleted_at = NOW()`). `204 No Content` sem body. A partir daí, `GET /api/campaigns/:id` para esse id retorna `404`.

### `GET /api/campaigns/:id/history`

```json
200 OK
{
  "success": true,
  "data": [
    {
      "id": 45, "campaign_id": 31, "changed_by": 1,
      "field_changed": "status", "old_value": "planned", "new_value": "active",
      "changed_at": "2026-08-06 10:05:00", "changed_by_name": "Caio Martins"
    },
    {
      "id": 44, "campaign_id": 31, "changed_by": 1,
      "field_changed": "status", "old_value": null, "new_value": "planned",
      "changed_at": "2026-08-06 10:00:00", "changed_by_name": "Caio Martins"
    }
  ]
}
```

Ordenado do mais recente para o mais antigo (`ORDER BY changed_at DESC`).

### `GET /api/campaigns/:id/milestones` / `POST /api/campaigns/:id/milestones`

```
POST /api/campaigns/31/milestones
Authorization: Bearer <token>
Content-Type: application/json

{ "label": "Aprovação do criativo", "milestoneDate": "2026-11-22" }
```

```json
201 Created
{ "success": true, "data": { "id": 5, "campaign_id": 31, "label": "Aprovação do criativo", "milestone_date": "2026-11-22", "created_at": "..." } }
```

Usado pela página de detalhe para enriquecer a linha do tempo além de início/fim.

---

## Clientes

### `GET /api/clients`

Lista completa, sem paginação (uso: preencher `<select>` de cliente no formulário de campanha).

### `POST /api/clients` / `PUT /api/clients/:id`

| Campo | Tipo | Obrigatório |
|---|---|---|
| `name` | string, máx 160 | sim |
| `contactEmail` | e-mail válido | não |
| `contactPhone` | string, máx 30 | não |

```
POST /api/clients
Authorization: Bearer <token>
Content-Type: application/json

{ "name": "Loja X", "contactEmail": "contato@lojax.com" }
```

```json
201 Created
{ "success": true, "data": { "id": 9, "name": "Loja X", "contact_email": "contato@lojax.com", "contact_phone": null, "created_at": "..." } }
```

### `DELETE /api/clients/:id`

`204 No Content`. **Atenção:** se o cliente tiver campanhas associadas, o MySQL rejeita a exclusão (violação de `FOREIGN KEY`) e a API devolve `500` — não há hoje uma mensagem amigável específica para esse caso (oportunidade de melhoria: capturar o erro `ER_ROW_IS_REFERENCED` e devolver um `400` com mensagem clara).

---

## Usuários

### `GET /api/users`

Lista `{ id, name, email, role }` de todos os usuários — usado para preencher o `<select>` de "responsável" no formulário de campanha. Não existe endpoint de cadastro de usuário pela API (usuários são criados só pelo seed, de propósito — é um sistema interno de equipe, não auto-cadastro público).

---

## Dashboard

### `GET /api/dashboard/summary`

```json
200 OK
{
  "success": true,
  "data": {
    "totalCampaigns": 30, "active": 5, "paused": 8, "completed": 4,
    "planned": 9, "cancelled": 4,
    "totalInvested": 132370, "remainingBudget": 99647,
    "endingThisWeek": [
      { "id": 12, "name": "Black Friday Loja X", "end_date": "2026-08-10" }
    ]
  }
}
```

`endingThisWeek` filtra campanhas com `status IN ('active','planned')` e `end_date` entre hoje e os próximos 7 dias — ver `campaign.model.js#getSummary`.

### `GET /api/dashboard/charts`

```json
200 OK
{
  "success": true,
  "data": {
    "byStatus": [
      { "status": "active", "count": 5 },
      { "status": "paused", "count": 8 }
    ],
    "investmentByMonth": [
      { "month": "2026-03", "total": "18200.00" },
      { "month": "2026-04", "total": "22100.00" }
    ]
  }
}
```

Alimenta os dois gráficos do dashboard geral (`renderStatusChart` e `renderInvestmentByMonthChart` em `charts.js`).

### `GET /api/dashboard/financial`

```json
200 OK
{
  "success": true,
  "data": {
    "totalInvested": 132370, "totalBudget": 232017, "remaining": 99647,
    "budgetUsedPct": 57,
    "topCampaigns": [
      { "id": 12, "name": "Handmade Shoes", "spent_amount": "14888.00", "client_name": "Funk - Schiller" }
    ],
    "byPlatform": [
      { "platform": "tiktok", "total": "49036.00" },
      { "platform": "facebook", "total": "36713.00" }
    ]
  }
}
```

---

## Testando manualmente com `curl`

```bash
# login e captura do token em uma variável de ambiente
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"caio@agencia.com","password":"senha123"}' \
  | node -e "process.stdin.on('data',d=>console.log(JSON.parse(d).data.token))")

# usando o token
curl -s http://localhost:3000/api/dashboard/summary -H "Authorization: Bearer $TOKEN"
```

Os testes automatizados em [`backend/tests/`](../backend/tests) cobrem os mesmos fluxos via `supertest`, sem precisar do servidor rodando (chamam o `app` do Express diretamente em memória).
