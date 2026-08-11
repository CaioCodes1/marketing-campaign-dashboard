const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const env = require('./config/env');
const routes = require('./routes');
const notFoundMiddleware = require('./middlewares/notFound.middleware');
const errorMiddleware = require('./middlewares/error.middleware');

const app = express();

app.use(cors({ origin: env.corsOrigin }));
app.use(express.json());
if (env.nodeEnv !== 'test') {
  app.use(morgan('dev'));
}

app.get('/health', (req, res) => res.json({ success: true, data: { status: 'ok' } }));

app.use('/api', routes);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

module.exports = app;
