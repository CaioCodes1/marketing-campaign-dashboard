const campaignService = require('../services/campaign.service');
const milestoneModel = require('../models/campaignMilestone.model');
const asyncHandler = require('../utils/asyncHandler');

const list = asyncHandler(async (req, res) => {
  const result = await campaignService.list(req.query);
  res.json({ success: true, data: result });
});

const getById = asyncHandler(async (req, res) => {
  const campaign = await campaignService.getById(req.params.id);
  res.json({ success: true, data: campaign });
});

const create = asyncHandler(async (req, res) => {
  const campaign = await campaignService.create(req.body, req.user.sub);
  res.status(201).json({ success: true, data: campaign });
});

const update = asyncHandler(async (req, res) => {
  const campaign = await campaignService.update(req.params.id, req.body, req.user.sub);
  res.json({ success: true, data: campaign });
});

const remove = asyncHandler(async (req, res) => {
  await campaignService.remove(req.params.id);
  res.status(204).send();
});

const getHistory = asyncHandler(async (req, res) => {
  const history = await campaignService.getHistory(req.params.id);
  res.json({ success: true, data: history });
});

const getMilestones = asyncHandler(async (req, res) => {
  const milestones = await milestoneModel.findByCampaignId(req.params.id);
  res.json({ success: true, data: milestones });
});

const createMilestone = asyncHandler(async (req, res) => {
  const milestone = await milestoneModel.create({
    campaignId: req.params.id,
    label: req.body.label,
    milestoneDate: req.body.milestoneDate,
  });
  res.status(201).json({ success: true, data: milestone });
});

module.exports = {
  list,
  getById,
  create,
  update,
  remove,
  getHistory,
  getMilestones,
  createMilestone,
};
