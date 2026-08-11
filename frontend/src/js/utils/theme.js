const STORAGE_KEY = 'mcd-theme';

export function initTheme() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    document.documentElement.setAttribute('data-theme', saved);
  }
}

export function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const isDark = current ? current === 'dark' : prefersDark;
  const next = isDark ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem(STORAGE_KEY, next);
}
