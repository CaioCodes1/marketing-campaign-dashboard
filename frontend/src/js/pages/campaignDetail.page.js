import { api, requireAuth } from '../api/apiClient.js';
import { renderLayout } from '../components/layout.js';
import { formatCurrency } from '../utils/formatCurrency.js';
import { formatDate } from '../utils/formatDate.js';

requireAuth();
renderLayout('campaigns');

const STATUS_LABELS = {
  active: 'Ativa',
  paused: 'Pausada',
  planned: 'Planejada',
  completed: 'Finalizada',
  cancelled: 'Cancelada',
};

const PLATFORM_LABELS = {
  instagram: 'Instagram',
  facebook: 'Facebook',
  google_ads: 'Google Ads',
  tiktok: 'TikTok',
  linkedin: 'LinkedIn',
  other: 'Outra',
};

const FIELD_LABELS = {
  name: 'nome',
  budget: 'orçamento',
  status: 'status',
  start_date: 'data de início',
  end_date: 'data final',
  responsible_id: 'responsável',
};

const id = new URLSearchParams(window.location.search).get('id');

async function load() {
  const [campaign, history, milestones] = await Promise.all([
    api.get(`/campaigns/${id}`),
    api.get(`/campaigns/${id}/history`),
    api.get(`/campaigns/${id}/milestones`),
  ]);

  document.getElementById('campaign-name').textContent = campaign.name;
  document.getElementById('campaign-status').innerHTML =
    `<span class="badge badge-${campaign.status}">${STATUS_LABELS[campaign.status]}</span> · ${PLATFORM_LABELS[campaign.platform]} · Responsável: ${campaign.responsible_name}`;
  document.getElementById('campaign-objective').textContent = campaign.objective || '-';
  document.getElementById('campaign-description').textContent = campaign.description || '-';
  document.getElementById('campaign-period').textContent =
    `${formatDate(campaign.start_date)} → ${formatDate(campaign.end_date)}`;
  document.getElementById('campaign-budget').textContent =
    `${formatCurrency(campaign.budget)} (${formatCurrency(campaign.spent_amount)} usado)`;
  document.getElementById('campaign-client').textContent = campaign.client_name;
  document.getElementById('campaign-notes').textContent = campaign.notes || '-';

  const timelineEvents = [
    { label: 'Criada', date: campaign.created_at.slice(0, 10) },
    { label: 'Início', date: campaign.start_date },
    ...milestones.map((m) => ({ label: m.label, date: m.milestone_date })),
    { label: 'Fim previsto', date: campaign.end_date },
  ].sort((a, b) => new Date(a.date) - new Date(b.date));

  document.getElementById('timeline').innerHTML = timelineEvents
    .map(
      (ev) => `<div class="timeline-item">
        <div class="timeline-dot"></div>
        <strong>${ev.label}</strong>
        <span class="text-secondary">${formatDate(ev.date)}</span>
      </div>`
    )
    .join('');

  const historyContainer = document.getElementById('history-list');
  if (!history.length) {
    historyContainer.innerHTML = '<div class="empty-state">Nenhuma alteração registrada ainda.</div>';
  } else {
    historyContainer.innerHTML = history
      .map((h) => {
        const field = FIELD_LABELS[h.field_changed] || h.field_changed;
        const when = new Date(h.changed_at).toLocaleString('pt-BR');
        const change = h.old_value
          ? `alterou ${field}: ${h.old_value} → ${h.new_value}`
          : `definiu ${field}: ${h.new_value}`;
        return `<div class="history-item"><span class="text-secondary">${when}</span><span>${h.changed_by_name} ${change}</span></div>`;
      })
      .join('');
  }
}

load().catch((err) => console.error(err));
