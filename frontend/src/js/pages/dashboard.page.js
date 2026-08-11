import { api, requireAuth } from '../api/apiClient.js';
import { renderLayout } from '../components/layout.js';
import { formatCurrency } from '../utils/formatCurrency.js';
import { formatDate, daysUntil } from '../utils/formatDate.js';
import { renderStatusChart, renderInvestmentByMonthChart } from '../components/charts.js';

requireAuth();
renderLayout('dashboard');

async function load() {
  const [summary, charts] = await Promise.all([
    api.get('/dashboard/summary'),
    api.get('/dashboard/charts'),
  ]);

  document.getElementById('stat-total').textContent = summary.totalCampaigns;
  document.getElementById('stat-active').textContent = summary.active;
  document.getElementById('stat-paused').textContent = summary.paused;
  document.getElementById('stat-completed').textContent = summary.completed;
  document.getElementById('stat-invested').textContent = formatCurrency(summary.totalInvested);
  document.getElementById('stat-remaining').textContent = formatCurrency(summary.remainingBudget);

  renderStatusChart(document.getElementById('status-chart'), charts.byStatus);
  renderInvestmentByMonthChart(
    document.getElementById('investment-chart'),
    charts.investmentByMonth
  );

  const alertList = document.getElementById('ending-list');
  if (!summary.endingThisWeek.length) {
    alertList.innerHTML = '<div class="empty-state">Nenhuma campanha termina nos próximos 7 dias.</div>';
  } else {
    alertList.innerHTML = summary.endingThisWeek
      .map((c) => {
        const days = daysUntil(c.end_date);
        return `<div class="alert-item">
          <span>${c.name}</span>
          <span>${days <= 0 ? 'termina hoje' : `termina em ${days} dia(s)`} · ${formatDate(c.end_date)}</span>
        </div>`;
      })
      .join('');
  }
}

load().catch((err) => console.error(err));
