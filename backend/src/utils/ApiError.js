class ApiError extends Error {
  constructor(statusCode, message, code = 'INTERNAL_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
  }

  static notFound(message = 'Recurso não encontrado', code = 'NOT_FOUND') {
    return new ApiError(404, message, code);
  }

  static badRequest(message = 'Requisição inválida', code = 'BAD_REQUEST') {
    return new ApiError(400, message, code);
  }

  static unauthorized(message = 'Não autenticado', code = 'UNAUTHORIZED') {
    return new ApiError(401, message, code);
  }
}

module.exports = ApiError;
