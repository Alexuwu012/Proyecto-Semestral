export const STATUS_LABELS = {
  pending: 'Pendiente',
  in_progress: 'En progreso',
  resolved: 'Resuelto'
};

export default function StatusBadge({ status }) {
  return <span className={`badge ${status}`}>{STATUS_LABELS[status] || status}</span>;
}
