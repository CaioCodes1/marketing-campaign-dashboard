import { getUser, clearSession } from '../api/apiClient.js';
import { initTheme, toggleTheme } from '../utils/theme.js';

const NAV_ITEMS = [
  { key: 'dashboard', label: 'Dashboard', href: 'index.html', icon: '&#9635;' },
  { key: 'campaigns', label: 'Campanhas', href: 'campaigns.html', icon: '&#128203;' },
  { key: 'financial', label: 'Financeiro', href: 'financial.html', icon: '&#128176;' },
];

export function renderLayout(activeKey) {
  initTheme();
  const user = getUser();

  const sidebarRoot = document.getElementById('sidebar-root');
  const topbarRoot = document.getElementById('topbar-root');
  if (!sidebarRoot || !topbarRoot) return;

  sidebarRoot.outerHTML = `
    <aside class="sidebar" id="sidebar-root">
      <div class="sidebar-logo">Marketing Dashboard</div>
      <nav class="sidebar-nav">
        ${NAV_ITEMS.map(
          (item) => `
          <a class="sidebar-link ${item.key === activeKey ? 'active' : ''}" href="${item.href}">
            <span aria-hidden="true">${item.icon}</span> ${item.label}
          </a>`
        ).join('')}
      </nav>
    </aside>
  `;

  topbarRoot.outerHTML = `
    <header class="topbar" id="topbar-root">
      <input class="search-input" type="search" placeholder="Buscar campanhas..." id="global-search" />
      <div class="topbar-actions">
        <button class="icon-btn" id="theme-toggle-btn" title="Alternar tema" type="button">
          <span class="theme-icon-light">&#9788;</span>
          <span class="theme-icon-dark">&#9789;</span>
        </button>
        <span class="text-secondary">${user ? user.name : ''}</span>
        <button class="icon-btn" id="logout-btn" title="Sair" type="button">&#10148;</button>
      </div>
    </header>
  `;

  document.getElementById('theme-toggle-btn').addEventListener('click', toggleTheme);
  document.getElementById('logout-btn').addEventListener('click', () => {
    clearSession();
    window.location.href = 'login.html';
  });

  const search = document.getElementById('global-search');
  search.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && search.value.trim()) {
      window.location.href = `campaigns.html?search=${encodeURIComponent(search.value.trim())}`;
    }
  });
}
