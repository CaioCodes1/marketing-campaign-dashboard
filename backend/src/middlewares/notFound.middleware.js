module.exports = function notFoundMiddleware(req, res) {
  res.status(404).json({
    success: false,
    error: { message: 'Rota não encontrada', code: 'ROUTE_NOT_FOUND' },
  });
};
