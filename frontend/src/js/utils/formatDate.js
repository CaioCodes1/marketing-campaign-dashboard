export function formatDate(value) {
  if (!value) return '-';
  const date = new Date(`${value}T00:00:00`);
  return new Intl.DateTimeFormat('pt-BR').format(date);
}

export function daysUntil(value) {
  const target = new Date(`${value}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.ceil((target - today) / (1000 * 60 * 60 * 24));
}
