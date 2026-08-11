# Marketing Campaign Dashboard

Dashboard para pequenas empresas, agências e freelancers organizarem e acompanharem campanhas de marketing em um único lugar — com KPIs financeiros, alertas de vencimento e histórico de auditoria por campanha.

![Node](https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-4-000000?logo=express&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-8-4479A1?logo=mysql&logoColor=white)
![Vanilla JS](https://img.shields.io/badge/JavaScript-ES%20Modules-F7DF1E?logo=javascript&logoColor=black)
![License](https://img.shields.io/badge/license-MIT-blue)

## Por que este projeto existe

Pequenas agências e freelancers costumam controlar campanhas em planilhas soltas e prints — o que causa perda de visibilidade financeira, prazos perdidos e falta de histórico ("por que essa campanha foi pausada em maio?"). Este dashboard resolve isso com:

- KPIs financeiros e operacionais em tempo real (investido, orçamento restante, campanhas por status).
- Alerta de campanhas terminando na semana.
- **Histórico de auditoria** por campanha: toda alteração de nome, orçamento, status, datas ou responsável fica registrada com quem mudou e quando.

## Documentação

Este projeto é documentado como se fosse um software real, para servir de guia durante o desenvolvimento e de material de estudo:

| Documento | Conteúdo |
|---|---|
| [docs/PLANEJAMENTO.md](docs/PLANEJAMENTO.md) | Planejamento de produto: problema, casos de uso, modelagem de dados, wireframes, design system, roadmap. |
| [docs/ARQUITETURA.md](docs/ARQUITETURA.md) | Como as camadas do backend se encaixam, diagramas de fluxo, decisões técnicas e onde adicionar novas funcionalidades. |
| [docs/BANCO_DE_DADOS.md](docs/BANCO_DE_DADOS.md) | Diagrama ER, cada tabela/coluna explicada, índices e integridade referencial. |
| [docs/API.md](docs/API.md) | Referência completa de cada endpoint REST, com exemplos reais de request/response. |
| [docs/GUIA_TECNICO.md](docs/GUIA_TECNICO.md) | **Guia de estudo:** explica cada tecnologia usada (Express, JWT, bcrypt, Joi, CORS, ES Modules, CSS variables, Chart.js...) — o quê, por quê e como funciona. |
| [docs/obsidian/](docs/obsidian/Mapa%20do%20Projeto.md) | **Para quem não é de tecnologia:** o mesmo projeto explicado do zero, com analogias (frontend = "salão", backend = "cozinha", banco de dados = "almoxarifado"), em notas interligadas prontas para importar num vault do Obsidian. |

Se você está aprendendo a stack, comece pelo [Guia Técnico](docs/GUIA_TECNICO.md) — ele foi escrito para ensinar, não só para referenciar. Se você não tem background técnico nenhum, comece pelo [Mapa do Projeto](docs/obsidian/Mapa%20do%20Projeto.md).

## Stack

- **Frontend:** HTML, CSS e JavaScript puro (ES Modules), Chart.js para os gráficos.
- **Backend:** Node.js + Express, arquitetura em camadas (routes → controllers → services → models).
- **Banco de dados:** MySQL 8.
- **Autenticação:** JWT.

## Rodando localmente

### Pré-requisitos

- Node.js 18+
- MySQL Server rodando localmente (ou acessível via rede)

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
```

Edite `.env` com as credenciais do seu MySQL. Depois, crie o schema e popule com dados de exemplo:

```bash
npm run db:schema
npm run db:seed
```

Inicie a API:

```bash
npm start
```

A API sobe em `http://localhost:3000`. Login de demonstração criado pelo seed: `caio@agencia.com` / `senha123`.

### 2. Frontend

O frontend é HTML/CSS/JS estático e referencia `../src/...` a partir de `public/`, então precisa ser servido a partir da pasta `frontend/` (não de `frontend/public/`) para os caminhos relativos resolverem:

```bash
npx serve frontend -l 5500
```

Abra `http://localhost:5500/public/login.html`. Um arquivo `frontend/serve.json` com `"cleanUrls": false` já está incluso — sem ele, servidores estáticos que reescrevem URLs (como o `serve`) podem descartar query strings (`?id=...`) em redirects e quebrar a navegação para o detalhe da campanha.

Se usar outra porta para o frontend, atualize `CORS_ORIGIN` em `backend/.env`.

### 3. Testes

```bash
cd backend
npm test
```

Roda a suíte Jest + Supertest contra um `app` Express em memória (não precisa do `npm start` rodando), incluindo testes de regressão para os dois bugs encontrados durante o desenvolvimento (ver [docs/GUIA_TECNICO.md](docs/GUIA_TECNICO.md#15-os-dois-bugs-reais-e-a-lição-de-cada-um)).

## Estrutura do projeto

```
marketing-campaign-dashboard/
├── backend/     # API REST (Express + MySQL) — ver docs/ARQUITETURA.md
├── frontend/    # HTML/CSS/JS servido estaticamente
└── docs/        # Documentação completa (índice acima)
```

## Principais decisões técnicas

- **Soft delete em campanhas** (`deleted_at`): permite manter histórico e integridade referencial mesmo após exclusão.
- **Histórico por diff**: ao editar uma campanha, o backend compara campo a campo o estado anterior com o novo e só grava no `campaign_history` o que realmente mudou — inclusive normalizando tipos (ex: orçamento vindo do MySQL como string `"1000.00"` vs número `1000` do formulário) para evitar entradas falsas de auditoria.
- **Datas como string, não `Date`**: os validadores tratam datas como string `AAAA-MM-DD` em vez de objetos `Date`, evitando o deslocamento de um dia causado pela conversão de fuso horário do driver do MySQL.

Explicação completa de cada decisão, com o raciocínio por trás, em [docs/ARQUITETURA.md](docs/ARQUITETURA.md#decisões-técnicas-e-o-porquê-de-cada-uma).

## Licença

MIT — veja [LICENSE](LICENSE).
