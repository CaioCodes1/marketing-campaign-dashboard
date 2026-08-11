const ApiError = require('../utils/ApiError');

module.exports = function validate(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) {
      const message = error.details.map((d) => d.message).join('; ');
      return next(ApiError.badRequest(message, 'VALIDATION_ERROR'));
    }
    req.body = value;
    next();
  };
};
