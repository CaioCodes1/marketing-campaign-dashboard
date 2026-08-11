import { api, requireAuth } from '../api/apiClient.js';
import { renderLayout } from '../components/layout.js';
import { formatCurrency } from '../utils/formatCurrency.js';
import { renderTopCampaignsChart, renderPlatformChart } from '../components/charts.js';

requireAuth();
renderLayout('financial');

async function load() {
  const data = await api.get('/dashboard/financial');

  document.getElementById('stat-invested').textContent = formatCurrency(data.totalInvested);
  document.getElementById('stat-used-pct').textContent = `${data.budgetUsedPct}%`;
  document.getElementById('stat-remaining').textContent = formatCurrency(data.remaining);

  renderTopCampaignsChart(document.getElementById('top-campaigns-chart'), data.topCampaigns);
  renderPlatformChart(document.getElementById('platform-chart'), data.byPlatform);
}

load().catch((err) => console.error(err));
