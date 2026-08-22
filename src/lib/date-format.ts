const DATE_FORMATTER = new Intl.DateTimeFormat('es-MX', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});

const DATE_TIME_FORMATTER = new Intl.DateTimeFormat('es-MX', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

function parseDate(value?: string | null) {
  if (!value) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const localDate = new Date(`${value}T12:00:00`);
    return Number.isNaN(localDate.getTime()) ? null : localDate;
  }
  const normalized = value.includes(' ') && !value.includes('T') ? value.replace(' ', 'T') : value;
  const parsed = new Date(normalized);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function formatDate(value?: string | null, fallback = 'Sin fecha') {
  const parsed = parseDate(value);
  return parsed ? DATE_FORMATTER.format(parsed) : fallback;
}

export function formatDateTime(value?: string | null, fallback = 'Sin fecha') {
  const parsed = parseDate(value);
  return parsed ? DATE_TIME_FORMATTER.format(parsed) : fallback;
}
