import { api, setSession, getToken } from '../api/apiClient.js';
import { initTheme } from '../utils/theme.js';
import { showToast } from '../components/toast.js';

initTheme();

if (getToken()) {
  window.location.href = 'index.html';
}

const form = document.getElementById('login-form');
const errorEl = document.getElementById('login-error');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  errorEl.textContent = '';

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  try {
    const { token, user } = await api.post('/auth/login', { email, password });
    setSession(token, user);
    window.location.href = 'index.html';
  } catch (err) {
    errorEl.textContent = err.message || 'Falha no login';
  }
});
