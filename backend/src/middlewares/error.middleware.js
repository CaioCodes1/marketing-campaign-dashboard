const ApiError = require('../utils/ApiError');

function errorMiddleware(err, req, res, next) { // eslint-disable-line no-unused-vars
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      error: { message: err.message, code: err.code },
    });
  }

  console.error(err);
  return res.status(500).json({
    success: false,
    error: { message: 'Erro interno do servidor', code: 'INTERNAL_ERROR' },
  });
}

module.exports = errorMiddleware;
