const Joi = require('joi');

const upsertSchema = Joi.object({
  name: Joi.string().max(160).required(),
  contactEmail: Joi.string().email({ tlds: false }).allow('', null),
  contactPhone: Joi.string().max(30).allow('', null),
});

module.exports = { upsertSchema };
