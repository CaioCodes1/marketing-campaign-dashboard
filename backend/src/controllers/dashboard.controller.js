const dashboardService = require('../services/dashboard.service');
const asyncHandler = require('../utils/asyncHandler');

const summary = asyncHandler(async (req, res) => {
  const data = await dashboardService.getSummary();
  res.json({ success: true, data });
});

const charts = asyncHandler(async (req, res) => {
  const data = await dashboardService.getCharts();
  res.json({ success: true, data });
});

const financial = asyncHandler(async (req, res) => {
  const data = await dashboardService.getFinancial();
  res.json({ success: true, data });
});

module.exports = { summary, charts, financial };
