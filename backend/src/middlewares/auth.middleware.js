const jwt = require('jsonwebtoken');
const env = require('../config/env');
const ApiError = require('../utils/ApiError');

module.exports = function authMiddleware(req, res, next) {
  const header = req.headers.authorization || '';
  const [, token] = header.split(' ');

  if (!token) {
    return next(ApiError.unauthorized('Token não fornecido'));
  }

  try {
    const payload = jwt.verify(token, env.jwt.secret);
    req.user = payload;
    next();
  } catch {
    next(ApiError.unauthorized('Token inválido ou expirado'));
  }
};
