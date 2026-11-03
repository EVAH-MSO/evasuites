const COLORS = {
  active: 'bg-emerald-100 text-emerald-700',
  occupied: 'bg-blue-100 text-blue-700',
  paid: 'bg-emerald-100 text-emerald-700',
  resolved: 'bg-emerald-100 text-emerald-700',
  available: 'bg-sky-100 text-sky-700',
  pending: 'bg-amber-100 text-amber-700',
  open: 'bg-amber-100 text-amber-700',
  in_progress: 'bg-blue-100 text-blue-700',
  late: 'bg-red-100 text-red-700',
  overdue: 'bg-red-100 text-red-700',
  expired: 'bg-slate-200 text-slate-700',
  terminated: 'bg-slate-200 text-slate-700',
  maintenance: 'bg-rose-100 text-rose-700',
  high: 'bg-red-100 text-red-700',
  medium: 'bg-amber-100 text-amber-700',
  low: 'bg-slate-200 text-slate-700',
};

export default function StatusBadge({ value }) {
  if (!value) return null;
  const cls = COLORS[value] || 'bg-slate-100 text-slate-700';
  return (
    <span className={'text-xs px-2 py-0.5 rounded capitalize ' + cls}>
      {String(value).replace('_', ' ')}
    </span>
  );
}
