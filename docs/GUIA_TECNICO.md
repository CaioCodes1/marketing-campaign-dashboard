# Guia Técnico — o que foi usado e por quê

> Este documento existe para ensinar, não só documentar. Cada tecnologia usada no projeto aparece aqui com: **o que é**, **por que foi escolhida para este projeto** e **como funciona na prática**, apontando para o arquivo real onde ela aparece. A ideia é que você consiga explicar qualquer linha deste projeto em uma entrevista técnica.

---

## Índice

1. [Backend: Node.js e o ecossistema npm](#1-backend-nodejs-e-o-ecossistema-npm)
2. [Express e o padrão de middleware](#2-express-e-o-padrão-de-middleware)
3. [MySQL e o driver `mysql2`](#3-mysql-e-o-driver-mysql2)
4. [Autenticação: JWT e bcrypt](#4-autenticação-jwt-e-bcrypt)
5. [Validação de entrada: Joi](#5-validação-de-entrada-joi)
6. [CORS — por que o navegador bloqueia e como liberamos](#6-cors--por-que-o-navegador-bloqueia-e-como-liberamos)
7. [Variáveis de ambiente: dotenv](#7-variáveis-de-ambiente-dotenv)
8. [Testes automatizados: Jest e Supertest](#8-testes-automatizados-jest-e-supertest)
9. [Frontend: JavaScript puro com ES Modules](#9-frontend-javascript-puro-com-es-modules)
10. [Persistência no navegador: `localStorage`](#10-persistência-no-navegador-localstorage)
11. [CSS: variáveis (design tokens) e tema claro/escuro](#11-css-variáveis-design-tokens-e-tema-claroescuro)
12. [Gráficos: Chart.js](#12-gráficos-chartjs)
13. [Servindo o frontend: por que precisa de um servidor estático](#13-servindo-o-frontend-por-que-precisa-de-um-servidor-estático)
14. [Padrões de arquitetura aplicados](#14-padrões-de-arquitetura-aplicados)
15. [Os dois bugs reais e a lição de cada um](#15-os-dois-bugs-reais-e-a-lição-de-cada-um)

---

## 1. Backend: Node.js e o ecossistema npm

**O que é:** Node.js é um runtime que executa JavaScript fora do navegador (no servidor). `npm` é o gerenciador de pacotes que vem junto — é como você instala bibliotecas de terceiros (`express`, `mysql2`, etc.) e organiza scripts do projeto.

**Onde aparece:** [`backend/package.json`](../backend/package.json).

```json
"scripts": {
  "start": "node server.js",
  "dev": "node --watch server.js",
  "db:schema": "node src/database/runSchema.js",
  "db:seed": "node src/database/seeds/seed.js",
  "test": "jest --runInBand"
}
```

Cada chave vira um comando `npm run <chave>` (ex.: `npm run db:seed`). `npm start` e `npm test` são especiais — não precisam do `run` (`npm start` funciona, `npm run start` também).

**`dependencies` vs `devDependencies`:** `dependencies` (express, mysql2, jsonwebtoken...) são necessárias para o app **rodar em produção**. `devDependencies` (jest, supertest, faker) só são necessárias **durante o desenvolvimento** (testes, geração de dados fake) — nunca vão para o servidor de produção se você rodar `npm install --production`.

**`node --watch`:** flag nativa do Node (sem precisar de `nodemon`) que reinicia o processo sozinho quando um arquivo `.js` muda — usada no script `dev`.

---

## 2. Express e o padrão de middleware

**O que é:** Express é um framework HTTP minimalista para Node — ele não decide como você organiza pastas nem como você acessa o banco, só resolve "receber uma requisição HTTP e devolver uma resposta" de forma organizada.

**O conceito central: middleware.** Um middleware é uma função `(req, res, next) => {}` que roda **no meio do caminho** entre a requisição chegar e a resposta ser enviada. Cada middleware decide: processar e chamar `next()` (passa para o próximo da fila), ou responder diretamente (`res.json(...)`) e encerrar ali.

```js
// backend/src/app.js
app.use(cors({ origin: env.corsOrigin }));  // middleware global 1: libera CORS
app.use(express.json());                    // middleware global 2: faz parse do body JSON
app.use('/api', routes);                    // a partir daqui, delega para as rotas
app.use(notFoundMiddleware);                // roda se nenhuma rota bateu
app.use(errorMiddleware);                   // roda se algo chamou next(erro)
```

A **ordem importa**: `express.json()` precisa vir antes de qualquer rota que leia `req.body`, senão `req.body` chega `undefined`. O `errorMiddleware` precisa ser o **último** `app.use()` — o Express identifica "middleware de erro" pela assinatura de 4 argumentos (`(err, req, res, next)`) e só o chama quando algo faz `next(erro)`.

**Middlewares específicos de rota:** em [`campaign.routes.js`](../backend/src/routes/campaign.routes.js):

```js
router.use(authMiddleware);                              // roda em toda rota deste arquivo
router.post('/', validate(createSchema), campaignController.create);  // roda só nesta rota
```

`validate(createSchema)` é um exemplo de **middleware factory** — uma função que *retorna* um middleware, permitindo parametrizar (aqui, qual schema Joi usar). Veja [`validate.middleware.js`](../backend/src/middlewares/validate.middleware.js).

**Roteamento (`express.Router()`):** cada arquivo em `routes/` exporta um "mini app" de rotas relacionadas, que é "plugado" no app principal via `router.use('/campaigns', campaignRoutes)` em [`routes/index.js`](../backend/src/routes/index.js). Isso é o que permite que `GET /api/campaigns` funcione: `/api` (em `app.js`) + `/campaigns` (em `routes/index.js`) + `/` (em `campaign.routes.js`).

---

## 3. MySQL e o driver `mysql2`

**O que é:** MySQL é o banco de dados relacional. `mysql2` é a biblioteca Node que fala o protocolo do MySQL — a ponte entre `SELECT * FROM campaigns` e uma função JavaScript que você pode chamar.

**Por que `mysql2` e não um ORM (Sequelize, Prisma)?** Este projeto escreve SQL puro de propósito — é um MVP de portfólio, e escrever as próprias queries mostra que você entende SQL, não só a API de um ORM. Isso também elimina uma camada de "mágica" entre o código e o banco, o que ajuda a debugar (o bug de fuso horário nas datas, por exemplo, foi mais fácil de rastrear porque dava para ver exatamente o valor sendo passado para a query).

**Pool de conexões**, em [`config/database.js`](../backend/src/config/database.js):

```js
const pool = mysql.createPool({ host, port, user, password, database, connectionLimit: 10 });
```

Uma única conexão MySQL só processa uma query por vez. Se a API recebe 5 requisições simultâneas, ela precisa de até 5 conexões abertas ao mesmo tempo — o *pool* mantém um conjunto de conexões reutilizáveis e empresta uma para cada query, devolvendo ao pool quando termina. `connectionLimit: 10` é o teto de conexões simultâneas.

**Prepared statements (proteção contra SQL Injection).** Toda query no projeto usa `?` como placeholder:

```js
// backend/src/models/campaign.model.js
pool.query('SELECT * FROM campaigns WHERE id = ? AND deleted_at IS NULL', [id]);
```

O `mysql2` separa o SQL dos valores e envia os dois para o banco separadamente — o banco nunca interpreta `id` como parte do comando SQL, então não importa o que o usuário mande em `id`, não tem como ele "escapar" da query e injetar comandos maliciosos. **Nunca** faça `pool.query(\`SELECT * FROM campaigns WHERE id = ${id}\`)` (interpolação de string) — é a porta de entrada clássica de SQL injection.

A única exceção onde isso *quase* seria um risco é o `sortBy` de `GET /api/campaigns`, porque nome de coluna não pode ser um `?` (prepared statements só parametrizam *valores*, não identificadores de coluna/tabela). A solução, em [`campaign.model.js`](../backend/src/models/campaign.model.js), é uma **whitelist**:

```js
const SORTABLE_COLUMNS = { name: 'c.name', budget: 'c.budget', /* ... */ };
const orderColumn = SORTABLE_COLUMNS[sortBy] || 'c.created_at';
```

Se `sortBy` não bater com nenhuma chave conhecida, cai no padrão seguro — o valor do usuário nunca é concatenado direto na query.

**`dateStrings: true`:** opção do pool que faz colunas `DATE`/`DATETIME` voltarem como string (`"2026-08-10"`) em vez de objeto `Date` do JS nos resultados de `SELECT`. Ver a seção 15 para o porquê disso ser importante.

---

## 4. Autenticação: JWT e bcrypt

### JWT (JSON Web Token)

**O que é:** um token é uma string tipo `xxxxx.yyyyy.zzzzz` — três partes em Base64 separadas por ponto: **header** (algoritmo), **payload** (os dados, ex. `{ sub: 1, name: "Caio", role: "admin" }`) e **assinatura** (um hash criptográfico do header+payload usando uma chave secreta que só o servidor conhece).

**Por que funciona como autenticação:** qualquer um pode *ler* o payload (é só Base64, não é criptografia) — mas ninguém sem a `JWT_SECRET` consegue *forjar* uma assinatura válida para um payload alterado. Se alguém editar o token para trocar `role: "manager"` por `role: "admin"`, a assinatura não vai mais bater, e `jwt.verify()` rejeita.

```js
// backend/src/controllers/auth.controller.js
const token = jwt.sign({ sub: user.id, name: user.name, role: user.role }, env.jwt.secret, { expiresIn: '7d' });
```

```js
// backend/src/middlewares/auth.middleware.js
const payload = jwt.verify(token, env.jwt.secret);  // lança erro se inválido/expirado
req.user = payload;  // fica disponível para os controllers como req.user.sub, req.user.role
```

**"Stateless":** o servidor não guarda nenhuma lista de "tokens ativos" — validar um token é uma operação matemática local (`jwt.verify`), sem consultar o banco. A desvantagem: não dá para "deslogar" um usuário à força antes do token expirar (não implementado neste MVP; exigiria uma lista de revogação).

### bcrypt

**O que é:** um algoritmo de *hash* para senhas, desenhado para ser **lento de propósito** (ajustável via "rounds" — este projeto usa 10). Hash é uma via de mão única: dá para verificar se uma senha bate com um hash, mas não dá para "descriptografar" o hash de volta para a senha original.

```js
// seed.js — ao criar o usuário
const passwordHash = await bcrypt.hash('senha123', 10);

// auth.controller.js — ao logar
const valid = await bcrypt.compare(password, user.password_hash);
```

**Por que não `SHA-256` puro ou criptografia reversível (AES)?** Hashes rápidos (`SHA-256`, `MD5`) permitem que um atacante, se roubar o banco, teste bilhões de senhas por segundo até achar uma que bata (*brute-force*). O bcrypt é deliberadamente lento (e o "custo" cresce exponencialmente com o número de rounds), tornando esse ataque impraticável. Criptografia reversível seria pior ainda: se alguém roubar a chave, recupera todas as senhas originais — bcrypt nunca guarda a senha original, nem cifrada.

---

## 5. Validação de entrada: Joi

**O que é:** uma biblioteca para descrever "a forma que um objeto deveria ter" e validar automaticamente.

```js
// backend/src/validators/campaign.validator.js
const createSchema = Joi.object({
  name: Joi.string().max(160).required(),
  budget: Joi.number().min(0).required(),
  platform: Joi.string().valid('instagram', 'facebook', /* ... */).required(),
  // ...
});
```

**Por que validar no backend se o frontend já tem `required` nos `<input>`?** Porque o HTML do formulário é só uma barreira de UX — qualquer pessoa pode chamar a API diretamente (via `curl`, Postman, ou um frontend malicioso) pulando o formulário inteiro. O backend é a única barreira que **não pode ser contornada**. Regra geral: nunca confie em validação só do lado do cliente.

**Onde ela entra no fluxo:** o middleware `validate(schema)` (seção 2) roda **antes** do controller. Se a validação falhar, o controller nem chega a ser chamado — o middleware já responde `400` com `code: "VALIDATION_ERROR"`.

**Detalhe de projeto (bug evitado):** as datas (`startDate`, `endDate`) usam `Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/)` em vez de `Joi.date()`. Isso é intencional — ver seção 15.

---

## 6. CORS — por que o navegador bloqueia e como liberamos

**O problema:** por padrão, um navegador bloqueia uma página carregada em `http://localhost:5510` de fazer `fetch()` para `http://localhost:3000` — são "origens" diferentes (porta diferente já conta como origem diferente). Essa é a *Same-Origin Policy*, uma proteção contra sites maliciosos lendo dados de outros sites em nome do usuário logado.

**CORS (Cross-Origin Resource Sharing)** é o mecanismo que permite o servidor **autorizar explicitamente** outras origens:

```js
// backend/src/app.js
app.use(cors({ origin: env.corsOrigin }));  // env.corsOrigin = "http://localhost:5510"
```

O middleware `cors` adiciona o header `Access-Control-Allow-Origin: http://localhost:5510` em toda resposta. Sem isso, o navegador recebe a resposta da API normalmente (a requisição *acontece*), mas bloqueia o JavaScript do frontend de **ler** o resultado.

**As requisições `OPTIONS` que você vê no Network tab:** para métodos como `PUT`/`DELETE` ou requisições com headers customizados (`Authorization`), o navegador manda antes uma requisição `OPTIONS` "de sondagem" (*preflight*) perguntando "o servidor aceita isso?". O pacote `cors` responde esses `OPTIONS` automaticamente — é por isso que você vê pares de requisições (`OPTIONS` seguido do `PUT`/`DELETE` real) no console de rede.

---

## 7. Variáveis de ambiente: dotenv

**O que é:** configuração (senha de banco, chave JWT, porta) não deve ficar escrita direto no código — muda entre ambientes (sua máquina, produção) e nunca deve ir para o Git (senhas!). `dotenv` lê um arquivo `.env` (ignorado pelo Git via `.gitignore`) e injeta os valores em `process.env`.

```js
// backend/src/config/env.js
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });
```

O projeto versiona um `.env.example` (com valores fictícios/vazios) — é o "molde" que qualquer pessoa clonando o repositório copia para `.env` e preenche com os próprios valores (`cp .env.example .env`). O arquivo real `.env` nunca é commitado.

**Por que `path.join(__dirname, ...)` em vez de só `require('dotenv').config()`?** Sem isso, o `dotenv` procura o `.env` relativo ao diretório de onde o comando `node` foi executado (`process.cwd()`), que pode não ser a pasta `backend/` dependendo de como o processo é iniciado. Usando `__dirname` (sempre a pasta do próprio arquivo `env.js`), o caminho para o `.env` funciona não importa de onde o `node server.js` seja disparado.

---

## 8. Testes automatizados: Jest e Supertest

**Jest** é o test runner (organiza `describe`/`it`, roda os arquivos `*.test.js`, mostra o relatório). **Supertest** simula requisições HTTP contra o app Express **sem precisar de um servidor rodando de verdade** — ele injeta a requisição diretamente no objeto `app`.

```js
// backend/tests/health.test.js
const app = require('../src/app');  // note: não é o server.js, é só o app Express
const res = await request(app).get('/health');
expect(res.status).toBe(200);
```

Repare que os testes importam `src/app.js`, não `server.js` — `app.js` é só a configuração do Express (rotas, middlewares), enquanto `server.js` é quem chama `app.listen(porta)`. Separar os dois é o que permite testar sem abrir uma porta de rede de verdade.

**Testes de regressão:** [`campaign.test.js`](../backend/tests/campaign.test.js) tem um teste que existe *só* porque um bug real aconteceu:

```js
it('does not log a spurious history entry when budget is resent unchanged', async () => {
  // edita a campanha reenviando o MESMO orçamento
  // e verifica que NENHUMA entrada de histórico de "budget" foi criada
});
```

Esse é o valor de um teste de regressão: ele documenta "isso já quebrou uma vez, não pode quebrar de novo" de um jeito que roda automaticamente, em vez de depender de alguém lembrar de testar manualmente.

---

## 9. Frontend: JavaScript puro com ES Modules

**O que é "ES Modules":** o sistema de módulos nativo do JavaScript moderno — `export function foo() {}` em um arquivo, `import { foo } from './arquivo.js'` em outro. Antes disso existir no navegador, era preciso um bundler (Webpack) só para ter arquivos JS separados que se importam.

```html
<script type="module" src="../src/js/pages/dashboard.page.js"></script>
```

O `type="module"` é o que habilita `import`/`export` **e** muda o comportamento de carregamento: módulos são carregados de forma assíncrona e só executam depois que o HTML terminou de ser processado (comportamento parecido com `defer`).

```js
// frontend/src/js/pages/dashboard.page.js
import { api, requireAuth } from '../api/apiClient.js';
import { renderLayout } from '../components/layout.js';
```

Cada `import` dispara uma requisição HTTP separada para buscar aquele arquivo `.js` — é por isso que, no Network tab do navegador, você vê dezenas de arquivos `.js` pequenos sendo baixados em vez de um `bundle.js` único. Para um projeto deste tamanho isso é totalmente aceitável; em um projeto muito maior, um bundler passaria a valer a pena (menos requisições, minificação).

**`fetch()` e `async/await`:** toda comunicação com a API passa por [`apiClient.js`](../frontend/src/js/api/apiClient.js), que centraliza a lógica repetitiva (montar a URL, adicionar o header `Authorization`, tratar erro `401`):

```js
async function request(path, { method = 'GET', body, params } = {}) {
  const response = await fetch(url, { method, headers, body: body ? JSON.stringify(body) : undefined });
  // ...
}
```

Sem esse wrapper, cada página teria que repetir "adicionar token, tratar erro, fazer `JSON.stringify`" toda vez que chamasse a API — um exemplo prático do princípio **DRY** (Don't Repeat Yourself).

---

## 10. Persistência no navegador: `localStorage`

**O que é:** um armazenamento chave-valor simples, no navegador, que sobrevive a fechar a aba/navegador (diferente de uma variável JS comum, que morre ao recarregar a página).

```js
// apiClient.js
localStorage.setItem('mcd-token', token);
localStorage.setItem('mcd-user', JSON.stringify(user));
```

É assim que o login "persiste": ao recarregar `campaigns.html`, `requireAuth()` verifica `localStorage.getItem('mcd-token')` — se existir, o usuário continua "logado" sem precisar refazer o login. O tema (claro/escuro) usa a mesma técnica (`mcd-theme`).

**Isso é seguro?** Para um MVP/portfólio, sim. Em produção com dados sensíveis, `localStorage` é acessível por qualquer script JS rodando na página (vulnerável a XSS) — um app mais rigoroso usaria um cookie `httpOnly` para o token, que scripts JS não conseguem ler. É uma das primeiras coisas a evoluir se este projeto virasse produto real (ver [PLANEJAMENTO.md](PLANEJAMENTO.md)).

---

## 11. CSS: variáveis (design tokens) e tema claro/escuro

**Custom properties do CSS** (`--nome: valor`) funcionam como variáveis que **casca­teiam e podem ser redefinidas** em qualquer seletor:

```css
/* frontend/src/css/tokens.css */
:root { --bg: #f7f8fa; --text-primary: #111827; }
[data-theme='dark'] { --bg: #0f1115; --text-primary: #f3f4f6; }
```

```css
/* base.css */
body { background: var(--bg); color: var(--text-primary); }
```

O `body` nunca precisa saber se o tema é claro ou escuro — ele só usa `var(--bg)`. Trocar o tema é só mudar **qual valor** `--bg` resolve para, em um lugar central (`tokens.css`), em vez de caçar cada `background: #fff` espalhado pelo código.

**Como o tema muda em runtime:**

```js
// frontend/src/js/utils/theme.js
document.documentElement.setAttribute('data-theme', 'dark');
```

Ao mudar o atributo `data-theme` no `<html>`, o seletor CSS `[data-theme='dark']` passa a bater, e todo `var(--bg)` na página é recalculado automaticamente pelo navegador — sem nenhum JavaScript adicional tocando em estilos.

**Modo automático via `prefers-color-scheme`:** se o usuário nunca escolheu um tema manualmente, o CSS usa a preferência do sistema operacional:

```css
@media (prefers-color-scheme: dark) {
  :root:not([data-theme='light']) { --bg: #0f1115; /* ... */ }
}
```

Isso só aplica o tema escuro automaticamente **se** o usuário não tiver forçado `data-theme="light"` manualmente — a escolha explícita do usuário sempre vence a preferência do sistema.

---

## 12. Gráficos: Chart.js

**O que é:** uma biblioteca que desenha gráficos em um elemento `<canvas>`. Carregada via CDN (`<script src="https://cdn.jsdelivr.net/npm/chart.js@4">`) diretamente no HTML — não é um módulo ES, então vira uma variável global `Chart` disponível para qualquer script depois dela.

```js
// frontend/src/js/components/charts.js
new Chart(canvas, {
  type: 'doughnut',
  data: { labels, datasets: [{ data, backgroundColor: colors }] },
  options: { plugins: { legend: { position: 'bottom' } } },
});
```

Cada gráfico do projeto (rosca de status, barras de investimento por mês, barras horizontais de top campanhas, pizza por plataforma) é uma chamada de `new Chart(...)` com `type` e `data` diferentes — a biblioteca cuida de desenhar eixos, legendas, cores e animações.

---

## 13. Servindo o frontend: por que precisa de um servidor estático

Duas razões técnicas, ambas descobertas durante o desenvolvimento deste projeto:

1. **ES Modules exigem HTTP.** Abrir `login.html` direto pelo Explorer de arquivos (`file://...`) faz o navegador bloquear `import`/`export` por política de segurança. É preciso `http://localhost:...`, mesmo sem nenhum "backend" para o frontend em si — daí o `npx serve frontend -l 5500`.

2. **`serve` com `cleanUrls` engole query strings em redirects.** Por padrão, o pacote `serve` reescreve `/campaigns.html` para `/campaigns` (sem extensão) via redirect HTTP. Ao fazer isso, ele descarta qualquer `?id=31` que estivesse na URL original — o que quebrava a navegação para a página de detalhe da campanha (`campaign-detail.html?id=31` virava `campaign-detail` sem o `id`). A correção foi um arquivo [`frontend/serve.json`](../frontend/serve.json) com `{ "cleanUrls": false }`, desligando essa reescrita.

Esse é um bom exemplo de como uma ferramenta genérica (um servidor estático qualquer) pode ter um comportamento "por padrão" que não é óbvio até você testar o fluxo real da aplicação de ponta a ponta — reforça por que testar manualmente no navegador (e não só confiar que "o código parece certo") pegou esse problema.

---

## 14. Padrões de arquitetura aplicados

| Padrão | Onde | Ideia central |
|---|---|---|
| **Layered architecture** (arquitetura em camadas) | Backend inteiro | Cada camada (`routes → controllers → services → models`) só fala com a camada abaixo. Ver [ARQUITETURA.md](ARQUITETURA.md). |
| **Repository-like pattern** | `models/*.model.js` | Toda query SQL isolada em funções — o resto do código nunca escreve SQL diretamente. |
| **Middleware chain** | Express (`app.use`, `router.use`) | Processamento em pipeline, cada etapa podendo interromper ou deixar passar. |
| **Factory function** | `validate(schema)`, `asyncHandler(fn)` | Funções que retornam outras funções, parametrizando comportamento genérico. |
| **Diffing / snapshot comparison** | `campaign.service.js#update` | Compara estado antigo vs novo campo a campo para decidir o que auditar — em vez de logar o objeto inteiro a cada mudança. |
| **Soft delete** | Coluna `deleted_at` | "Excluir" é marcar como invisível, não apagar fisicamente — preserva histórico e integridade referencial. |
| **Token-based stateless auth** | JWT | Servidor não guarda sessão; cada requisição se autentica sozinha via token assinado. |
| **Design tokens** | `tokens.css` | Valores de design (cor, espaçamento) centralizados em variáveis, nunca hardcoded nos componentes. |

---

## 15. Os dois bugs reais e a lição de cada um

Estes não são hipotéticos — apareceram durante o teste manual deste projeto no navegador, e cada um ensina algo que vale a pena levar para qualquer stack:

### Bug 1 — datas erradas por um dia

**Sintoma:** digitar `10/08/2026` como início de uma campanha e o banco salvar `09/08/2026`.

**Causa:** `Joi.date()` converte a string do formulário em um objeto `Date` do JavaScript (que sempre representa um instante em UTC internamente). Ao passar esse objeto para o `mysql2`, o driver o serializa usando o fuso horário **local do processo Node** — e servidor em UTC-3 empurra a meia-noite UTC para 21h do dia anterior.

**Lição:** quando o conceito de negócio é "um dia" (sem hora associada — nascimento, prazo, orçamento por período), represente como **string** (`'2026-08-10'`), nunca como `Date`. Reserve `Date`/timestamp para quando o instante exato importa (ex.: `created_at`, `changed_at`).

### Bug 2 — histórico de auditoria com entradas falsas

**Sintoma:** editar só a descrição de uma campanha (sem tocar no orçamento) gerava uma entrada de histórico dizendo que o orçamento mudou.

**Causa:** o MySQL devolve colunas `DECIMAL` como **string** (`"1000.00"`) para preservar precisão exata, enquanto o formulário HTML envia **número** (`1000`). O código de diff comparava com `String(1000) !== String("1000.00")` → `"1000" !== "1000.00"` → `true` (mudou!), mesmo o valor sendo o mesmo.

**Lição:** ao comparar valores vindos de fontes diferentes (banco vs formulário, API externa vs seu sistema), normalize o **tipo** antes de comparar. `Number("1000.00") === Number(1000)` é `true`; `String` dos dois não é. A comparação "ingênua" (`===` ou `String()`) só é segura quando você tem certeza de que ambos os lados já vêm no mesmo tipo — e isso raramente é garantido quando um dos lados atravessou um banco de dados.

Ambos os bugs têm teste de regressão em [`backend/tests/campaign.test.js`](../backend/tests/campaign.test.js) — a forma de garantir que, mesmo se alguém "refatorar sem querer" o código de volta ao comportamento errado, o `npm test` pega antes de chegar em produção.

---

## Para continuar aprendendo

- **Índice geral da documentação:** [README.md](../README.md#documentação)
- **O planejamento original do produto** (modelagem, casos de uso, design system): [PLANEJAMENTO.md](PLANEJAMENTO.md)
- **Como as peças se encaixam:** [ARQUITETURA.md](ARQUITETURA.md)
- **Schema do banco linha a linha:** [BANCO_DE_DADOS.md](BANCO_DE_DADOS.md)
- **Toda rota da API com exemplo real:** [API.md](API.md)
