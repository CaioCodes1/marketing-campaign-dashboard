import { api, requireAuth } from '../api/apiClient.js';
import { renderLayout } from '../components/layout.js';
import { openModal, closeModal } from '../components/modal.js';
import { showToast } from '../components/toast.js';
import { formatCurrency } from '../utils/formatCurrency.js';
import { formatDate } from '../utils/formatDate.js';

requireAuth();
renderLayout('campaigns');

const PLATFORM_LABELS = {
  instagram: 'Instagram',
  facebook: 'Facebook',
  google_ads: 'Google Ads',
  tiktok: 'TikTok',
  linkedin: 'LinkedIn',
  other: 'Outra',
};

const STATUS_LABELS = {
  active: 'Ativa',
  paused: 'Pausada',
  planned: 'Planejada',
  completed: 'Finalizada',
  cancelled: 'Cancelada',
};

const params = new URLSearchParams(window.location.search);
const state = {
  search: params.get('search') || '',
  status: '',
  platform: '',
  sortBy: 'created_at',
  order: 'desc',
  page: 1,
  limit: 10,
};

let clients = [];
let users = [];
let editingId = null;

async function loadFilters() {
  [clients, users] = await Promise.all([api.get('/clients'), api.get('/users')]);

  const clientSelect = document.getElementById('field-client');
  const responsibleSelect = document.getElementById('field-responsible');
  clientSelect.innerHTML = clients.map((c) => `<option value="${c.id}">${c.name}</option>`).join('');
  responsibleSelect.innerHTML = users.map((u) => `<option value="${u.id}">${u.name}</option>`).join('');
}

function clientName(id) {
  return clients.find((c) => c.id === id)?.name || '-';
}

async function loadCampaigns() {
  const data = await api.get('/campaigns', state);
  renderTable(data.rows);
  renderPagination(data.total, data.page, data.limit);
}

function renderTable(rows) {
  const tbody = document.getElementById('campaigns-tbody');
  if (!rows.length) {
    tbody.innerHTML = '<tr><td colspan="6"><div class="empty-state">Nenhuma campanha encontrada.</div></td></tr>';
    return;
  }

  tbody.innerHTML = rows
    .map(
      (c) => `
      <tr data-id="${c.id}">
        <td>${c.name}</td>
        <td>${c.client_name}</td>
        <td>${PLATFORM_LABELS[c.platform] || c.platform}</td>
        <td><span class="badge badge-${c.status}">${STATUS_LABELS[c.status] || c.status}</span></td>
        <td>${formatCurrency(c.budget)}</td>
        <td class="row-actions">
          <button data-action="edit" title="Editar">&#9998;</button>
          <button data-action="delete" title="Excluir">&#128465;</button>
        </td>
      </tr>`
    )
    .join('');

  tbody.querySelectorAll('tr').forEach((tr) => {
    const id = tr.dataset.id;
    tr.addEventListener('click', (e) => {
      if (e.target.closest('button')) return;
      window.location.href = `campaign-detail.html?id=${id}`;
    });
    tr.querySelector('[data-action="edit"]').addEventListener('click', () => openEditModal(id));
    tr.querySelector('[data-action="delete"]').addEventListener('click', () => deleteCampaign(id));
  });
}

function renderPagination(total, page, limit) {
  const totalPages = Math.max(Math.ceil(total / limit), 1);
  const container = document.getElementById('pagination');
  container.innerHTML = '';
  for (let i = 1; i <= totalPages; i += 1) {
    const btn = document.createElement('button');
    btn.textContent = i;
    if (i === page) btn.classList.add('active');
    btn.addEventListener('click', () => {
      state.page = i;
      loadCampaigns();
    });
    container.appendChild(btn);
  }
}

async function deleteCampaign(id) {
  if (!confirm('Tem certeza que deseja excluir esta campanha?')) return;
  try {
    await api.delete(`/campaigns/${id}`);
    showToast('Campanha excluída com sucesso.');
    loadCampaigns();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function resetForm() {
  document.getElementById('campaign-form').reset();
  editingId = null;
  document.getElementById('modal-title').textContent = 'Nova Campanha';
}

function openCreateModal() {
  resetForm();
  openModal('campaign-modal');
}

async function openEditModal(id) {
  const campaign = await api.get(`/campaigns/${id}`);
  editingId = id;
  document.getElementById('modal-title').textContent = 'Editar Campanha';
  document.getElementById('field-name').value = campaign.name;
  document.getElementById('field-client').value = campaign.client_id;
  document.getElementById('field-description').value = campaign.description || '';
  document.getElementById('field-objective').value = campaign.objective || '';
  document.getElementById('field-platform').value = campaign.platform;
  document.getElementById('field-budget').value = campaign.budget;
  document.getElementById('field-spent').value = campaign.spent_amount;
  document.getElementById('field-start').value = campaign.start_date;
  document.getElementById('field-end').value = campaign.end_date;
  document.getElementById('field-status').value = campaign.status;
  document.getElementById('field-responsible').value = campaign.responsible_id;
  document.getElementById('field-notes').value = campaign.notes || '';
  openModal('campaign-modal');
}

document.getElementById('new-campaign-btn').addEventListener('click', openCreateModal);
document.getElementById('modal-close-btn').addEventListener('click', () => closeModal('campaign-modal'));
document.getElementById('modal-cancel-btn').addEventListener('click', () => closeModal('campaign-modal'));

document.getElementById('campaign-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const payload = {
    name: document.getElementById('field-name').value,
    clientId: Number(document.getElementById('field-client').value),
    description: document.getElementById('field-description').value,
    objective: document.getElementById('field-objective').value,
    platform: document.getElementById('field-platform').value,
    budget: Number(document.getElementById('field-budget').value),
    spentAmount: Number(document.getElementById('field-spent').value || 0),
    startDate: document.getElementById('field-start').value,
    endDate: document.getElementById('field-end').value,
    status: document.getElementById('field-status').value,
    responsibleId: Number(document.getElementById('field-responsible').value),
    notes: document.getElementById('field-notes').value,
  };

  try {
    if (editingId) {
      await api.put(`/campaigns/${editingId}`, payload);
      showToast('Campanha atualizada com sucesso.');
    } else {
      await api.post('/campaigns', payload);
      showToast('Campanha criada com sucesso.');
    }
    closeModal('campaign-modal');
    loadCampaigns();
  } catch (err) {
    showToast(err.message, 'error');
  }
});

document.getElementById('search-input').value = state.search;
document.getElementById('search-input').addEventListener('input', (e) => {
  state.search = e.target.value;
  state.page = 1;
  loadCampaigns();
});

document.getElementById('status-filter').addEventListener('change', (e) => {
  state.status = e.target.value;
  state.page = 1;
  loadCampaigns();
});

document.getElementById('platform-filter').addEventListener('change', (e) => {
  state.platform = e.target.value;
  state.page = 1;
  loadCampaigns();
});

document.querySelectorAll('th[data-sort]').forEach((th) => {
  th.addEventListener('click', () => {
    const column = th.dataset.sort;
    if (state.sortBy === column) {
      state.order = state.order === 'asc' ? 'desc' : 'asc';
    } else {
      state.sortBy = column;
      state.order = 'asc';
    }
    loadCampaigns();
  });
});

(async function init() {
  await loadFilters();
  await loadCampaigns();
})().catch((err) => console.error(err));
