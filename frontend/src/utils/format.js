/**
 * Map a risk score to a human label and Tailwind class.
 * Centralised so the dashboard + map agree on colour bands.
 * Light-theme palette: deep coloured text on light pill backgrounds.
 */

export const STATUS_LABELS = {
  SAFE: 'Safe',
  WATCH: 'Watch',
  WARNING: 'Warning',
  DANGER: 'Danger',
  CRITICAL: 'Critical',
  UNKNOWN: 'Standby',
};

export function getStatusMeta(status) {
  switch (status) {
    case 'SAFE':
      return {
        text: 'text-emerald-700',
        textStrong: 'text-emerald-700',
        pill: 'pill-safe',
        ring: 'ring-emerald-200',
        bar: 'bg-emerald-500',
        fill: '#10b981',
        label: STATUS_LABELS.SAFE,
      };
    case 'WATCH':
      return {
        text: 'text-amber-700',
        textStrong: 'text-amber-700',
        pill: 'pill-watch',
        ring: 'ring-amber-200',
        bar: 'bg-amber-500',
        fill: '#f59e0b',
        label: STATUS_LABELS.WATCH,
      };
    case 'WARNING':
      return {
        text: 'text-orange-700',
        textStrong: 'text-orange-700',
        pill: 'pill-warning',
        ring: 'ring-orange-200',
        bar: 'bg-orange-500',
        fill: '#f97316',
        label: STATUS_LABELS.WARNING,
      };
    case 'DANGER':
      return {
        text: 'text-rose-700',
        textStrong: 'text-rose-700',
        pill: 'pill-danger',
        ring: 'ring-rose-200',
        bar: 'bg-rose-500',
        fill: '#f43f5e',
        label: STATUS_LABELS.DANGER,
      };
    case 'CRITICAL':
      return {
        text: 'text-rose-700',
        textStrong: 'text-rose-700',
        pill: 'pill-critical',
        ring: 'ring-rose-300',
        bar: 'bg-rose-600',
        fill: '#e11d48',
        label: STATUS_LABELS.CRITICAL,
      };
    default:
      return {
        text: 'text-slate-600',
        textStrong: 'text-slate-700',
        pill: 'pill-neutral',
        ring: 'ring-sky-200',
        bar: 'bg-slate-400',
        fill: '#94a3b8',
        label: STATUS_LABELS.UNKNOWN,
      };
  }
}

export function formatCoord(n, digits = 4) {
  return Number(n).toFixed(digits);
}
