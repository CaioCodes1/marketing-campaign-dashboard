const Joi = require('joi');

const PLATFORMS = ['instagram', 'facebook', 'google_ads', 'tiktok', 'linkedin', 'other'];
const STATUSES = ['planned', 'active', 'paused', 'completed', 'cancelled'];

// Datas ficam como string 'YYYY-MM-DD' (não Joi.date()) para não passar por um
// objeto Date, cuja conversão de fuso horário no driver do MySQL desloca o dia.
const isoDate = Joi.string()
  .pattern(/^\d{4}-\d{2}-\d{2}$/)
  .message('Data deve estar no formato AAAA-MM-DD');

const createSchema = Joi.object({
  name: Joi.string().max(160).required(),
  clientId: Joi.number().integer().required(),
  description: Joi.string().allow('', null),
  objective: Joi.string().max(160).allow('', null),
  platform: Joi.string().valid(...PLATFORMS).required(),
  budget: Joi.number().min(0).required(),
  spentAmount: Joi.number().min(0).default(0),
  startDate: isoDate.required(),
  endDate: isoDate.required(),
  status: Joi.string().valid(...STATUSES).default('planned'),
  responsibleId: Joi.number().integer().required(),
  notes: Joi.string().allow('', null),
}).custom((value, helpers) => {
  if (value.endDate < value.startDate) {
    return helpers.message('A data final deve ser igual ou posterior à data de início');
  }
  return value;
});

const updateSchema = Joi.object({
  name: Joi.string().max(160),
  clientId: Joi.number().integer(),
  description: Joi.string().allow('', null),
  objective: Joi.string().max(160).allow('', null),
  platform: Joi.string().valid(...PLATFORMS),
  budget: Joi.number().min(0),
  spentAmount: Joi.number().min(0),
  startDate: isoDate,
  endDate: isoDate,
  status: Joi.string().valid(...STATUSES),
  responsibleId: Joi.number().integer(),
  notes: Joi.string().allow('', null),
}).custom((value, helpers) => {
  if (value.startDate && value.endDate && value.endDate < value.startDate) {
    return helpers.message('A data final deve ser igual ou posterior à data de início');
  }
  return value;
});

module.exports = { createSchema, updateSchema };
