const campaignModel = require('../models/campaign.model');

async function getSummary() {
  const { totals, endingThisWeek } = await campaignModel.getSummary();
  const totalBudget = Number(totals.total_budget);
  const totalSpent = Number(totals.total_spent);

  return {
    totalCampaigns: Number(totals.total),
    active: Number(totals.active) || 0,
    paused: Number(totals.paused) || 0,
    completed: Number(totals.completed) || 0,
    planned: Number(totals.planned) || 0,
    cancelled: Number(totals.cancelled) || 0,
    totalInvested: totalSpent,
    remainingBudget: totalBudget - totalSpent,
    endingThisWeek,
  };
}

async function getCharts() {
  const [byStatus, investmentByMonth] = await Promise.all([
    campaignModel.getStatusBreakdown(),
    campaignModel.getInvestmentByMonth(),
  ]);
  return { byStatus, investmentByMonth };
}

async function getFinancial() {
  const [{ totals }, topCampaigns, byPlatform] = await Promise.all([
    campaignModel.getSummary(),
    campaignModel.getTopCampaignsByInvestment(5),
    campaignModel.getInvestmentByPlatform(),
  ]);

  const totalBudget = Number(totals.total_budget);
  const totalSpent = Number(totals.total_spent);
  const budgetUsedPct = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

  return {
    totalInvested: totalSpent,
    totalBudget,
    remaining: totalBudget - totalSpent,
    budgetUsedPct,
    topCampaigns,
    byPlatform,
  };
}

module.exports = { getSummary, getCharts, getFinancial };
