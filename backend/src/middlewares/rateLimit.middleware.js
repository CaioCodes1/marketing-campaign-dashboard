const rateLimit = require('express-rate-limit');
const env = require('../config/env');

/**
 * LIMITE DE REQUISICOES.
 *
 * Sem isto, o endpoint de login aceita tentativas ilimitadas: um script testa
 * milhares de senhas por minuto ate acertar. Validacao forte de senha e hash com
 * bcrypt nao ajudam contra isso - eles encarecem CADA tentativa, mas nao limitam
 * QUANTAS tentativas existem.
 *
 * Sao dois limites porque os riscos sao diferentes:
 *
 *   - o geral protege a API de abuso e de esgotamento de recursos;
 *   - o de login protege a CONTA, e por isso e muito mais apertado.
 *
 * Em testes o limite fica desligado, senao a suite falha quando cresce - o que
 * seria um teste quebrando por motivo que nao tem a ver com o que ele testa.
 */

const desligadoEmTeste = () => env.nodeEnv === 'test';

/** Limite geral: 300 requisicoes por IP a cada 15 minutos. */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true, // RateLimit-* (padrao IETF)
  legacyHeaders: false, // sem os X-RateLimit-* antigos
  skip: desligadoEmTeste,
  message: {
    success: false,
    error: { message: 'Muitas requisicoes. Tente novamente em alguns minutos.' },
  },
});

/**
 * Limite do login: 5 tentativas por IP a cada 15 minutos.
 *
 * `skipSuccessfulRequests` faz o acerto nao consumir cota - quem digita a senha
 * certa nunca e barrado, por mais que use o sistema. So a tentativa ERRADA
 * conta, que e exatamente o comportamento de quem esta adivinhando.
 */
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  skip: desligadoEmTeste,
  message: {
    success: false,
    error: {
      message: 'Muitas tentativas de login. Tente novamente em 15 minutos.',
    },
  },
});

module.exports = { apiLimiter, loginLimiter };
