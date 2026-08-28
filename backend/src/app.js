const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const env = require('./config/env');
const routes = require('./routes');
const { apiLimiter } = require('./middlewares/rateLimit.middleware');
const notFoundMiddleware = require('./middlewares/notFound.middleware');
const errorMiddleware = require('./middlewares/error.middleware');

const app = express();

/**
 * A ORDEM DOS MIDDLEWARES IMPORTA.
 *
 * O helmet vem primeiro para que TODA resposta saia com os cabecalhos de
 * seguranca - inclusive as de erro e a do 404. Se ele viesse depois das rotas,
 * as respostas de erro sairiam sem protecao nenhuma.
 */

/**
 * Cabecalhos de seguranca. O que o helmet resolve, sem precisar decorar cada um:
 *   - X-Content-Type-Options: impede o navegador de "adivinhar" o tipo do
 *     conteudo, que e como um upload de texto acaba executado como script;
 *   - X-Frame-Options: impede a pagina de ser embutida em iframe (clickjacking);
 *   - Strict-Transport-Security: obriga HTTPS nas proximas visitas;
 *   - remove o X-Powered-By, que anunciava "Express" para quem faz varredura.
 */
app.use(helmet());

app.use(cors({ origin: env.corsOrigin }));

/**
 * LIMITE DE TAMANHO DO CORPO.
 *
 * O padrao do Express ja e 100kb, mas o ponto e ser explicito: nenhuma rota
 * desta API recebe payload grande. Corpo gigante e sinal de abuso, e recusar
 * cedo custa menos que processar.
 */
app.use(express.json({ limit: '10kb' }));

if (env.nodeEnv !== 'test') {
  app.use(morgan('dev'));
}

app.get('/health', (req, res) => res.json({ success: true, data: { status: 'ok' } }));

// O limite geral cobre /api. O /health fica de fora de proposito: monitoramento
// bate nele com frequencia alta e legitima.
app.use('/api', apiLimiter, routes);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

module.exports = app;
