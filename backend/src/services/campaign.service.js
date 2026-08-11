const campaignModel = require('../models/campaign.model');
const historyModel = require('../models/campaignHistory.model');
const ApiError = require('../utils/ApiError');

const TRACKED_FIELDS = [
  ['name', 'name', 'string'],
  ['budget', 'budget', 'number'],
  ['status', 'status', 'string'],
  ['startDate', 'start_date', 'string'],
  ['endDate', 'end_date', 'string'],
  ['responsibleId', 'responsible_id', 'number'],
];

async function list(query) {
  return campaignModel.findAll(query);
}

async function getById(id) {
  const campaign = await campaignModel.findById(id);
  if (!campaign) throw ApiError.notFound('Campanha não encontrada', 'CAMPAIGN_NOT_FOUND');
  return campaign;
}

async function create(data, userId) {
  const campaign = await campaignModel.create(data);
  await historyModel.create({
    campaignId: campaign.id,
    changedBy: userId,
    fieldChanged: 'status',
    oldValue: null,
    newValue: campaign.status,
  });
  return campaign;
}

async function update(id, data, userId) {
  const existing = await getById(id);

  const changes = [];
  for (const [payloadKey, dbKey, type] of TRACKED_FIELDS) {
    const newValue = data[payloadKey];
    const oldValue = existing[dbKey];
    if (newValue === undefined) continue;

    const changed =
      type === 'number' ? Number(newValue) !== Number(oldValue) : String(newValue) !== String(oldValue);

    if (changed) {
      changes.push({
        campaignId: id,
        changedBy: userId,
        fieldChanged: dbKey,
        oldValue: type === 'number' ? String(Number(oldValue)) : String(oldValue),
        newValue: type === 'number' ? String(Number(newValue)) : String(newValue),
      });
    }
  }

  const merged = {
    name: data.name ?? existing.name,
    clientId: data.clientId ?? existing.client_id,
    description: data.description ?? existing.description,
    objective: data.objective ?? existing.objective,
    platform: data.platform ?? existing.platform,
    budget: data.budget ?? existing.budget,
    spentAmount: data.spentAmount ?? existing.spent_amount,
    startDate: data.startDate ?? existing.start_date,
    endDate: data.endDate ?? existing.end_date,
    status: data.status ?? existing.status,
    responsibleId: data.responsibleId ?? existing.responsible_id,
    notes: data.notes ?? existing.notes,
  };

  const updated = await campaignModel.update(id, merged);
  if (changes.length) {
    await historyModel.createMany(changes);
  }
  return updated;
}

async function remove(id) {
  await getById(id);
  await campaignModel.softDelete(id);
}

async function getHistory(id) {
  await getById(id);
  return historyModel.findByCampaignId(id);
}

module.exports = { list, getById, create, update, remove, getHistory };
