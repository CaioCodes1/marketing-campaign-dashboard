const STATUS_COLORS = {
  active: '#16a34a',
  paused: '#d97706',
  planned: '#2563eb',
  completed: '#6b7280',
  cancelled: '#dc2626',
};

const STATUS_LABELS = {
  active: 'Ativa',
  paused: 'Pausada',
  planned: 'Planejada',
  completed: 'Finalizada',
  cancelled: 'Cancelada',
};

const PALETTE = ['#4f46e5', '#0ea5e9', '#16a34a', '#d97706', '#dc2626', '#6b7280'];

export function renderStatusChart(canvas, byStatus) {
  const labels = byStatus.map((s) => STATUS_LABELS[s.status] || s.status);
  const data = byStatus.map((s) => s.count);
  const colors = byStatus.map((s) => STATUS_COLORS[s.status] || '#6b7280');

  return new Chart(canvas, {
    type: 'doughnut',
    data: { labels, datasets: [{ data, backgroundColor: colors, borderWidth: 0 }] },
    options: { plugins: { legend: { position: 'bottom' } }, maintainAspectRatio: false },
  });
}

export function renderInvestmentByMonthChart(canvas, investmentByMonth) {
  return new Chart(canvas, {
    type: 'bar',
    data: {
      labels: investmentByMonth.map((i) => i.month),
      datasets: [
        {
          label: 'Investimento',
          data: investmentByMonth.map((i) => Number(i.total)),
          backgroundColor: '#4f46e5',
          borderRadius: 6,
        },
      ],
    },
    options: {
      plugins: { legend: { display: false } },
      maintainAspectRatio: false,
      scales: { y: { beginAtZero: true } },
    },
  });
}

export function renderTopCampaignsChart(canvas, topCampaigns) {
  return new Chart(canvas, {
    type: 'bar',
    data: {
      labels: topCampaigns.map((c) => c.name),
      datasets: [
        {
          label: 'Investido',
          data: topCampaigns.map((c) => Number(c.spent_amount)),
          backgroundColor: '#4f46e5',
          borderRadius: 6,
        },
      ],
    },
    options: {
      indexAxis: 'y',
      plugins: { legend: { display: false } },
      maintainAspectRatio: false,
    },
  });
}

export function renderPlatformChart(canvas, byPlatform) {
  return new Chart(canvas, {
    type: 'pie',
    data: {
      labels: byPlatform.map((p) => p.platform),
      datasets: [
        {
          data: byPlatform.map((p) => Number(p.total)),
          backgroundColor: PALETTE,
          borderWidth: 0,
        },
      ],
    },
    options: { plugins: { legend: { position: 'bottom' } }, maintainAspectRatio: false },
  });
}
