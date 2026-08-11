const clientModel = require('../models/client.model');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

const list = asyncHandler(async (req, res) => {
  const clients = await clientModel.findAll();
  res.json({ success: true, data: clients });
});

const create = asyncHandler(async (req, res) => {
  const client = await clientModel.create(req.body);
  res.status(201).json({ success: true, data: client });
});

const update = asyncHandler(async (req, res) => {
  const existing = await clientModel.findById(req.params.id);
  if (!existing) throw ApiError.notFound('Cliente não encontrado', 'CLIENT_NOT_FOUND');
  const client = await clientModel.update(req.params.id, req.body);
  res.json({ success: true, data: client });
});

const remove = asyncHandler(async (req, res) => {
  const existing = await clientModel.findById(req.params.id);
  if (!existing) throw ApiError.notFound('Cliente não encontrado', 'CLIENT_NOT_FOUND');
  await clientModel.remove(req.params.id);
  res.status(204).send();
});

module.exports = { list, create, update, remove };
