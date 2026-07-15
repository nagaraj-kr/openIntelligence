'use client';

export default function StatusBadge({ status }) {
  const config = {
    PENDING:  { label: 'Pending',  cls: 'badge-pending'  },
    APPROVED: { label: 'Approved', cls: 'badge-approved' },
    FEATURED: { label: 'Featured', cls: 'badge-featured' },
    REJECTED: { label: 'Rejected', cls: 'badge-rejected' },
  };

  const { label, cls } = config[status] || config.PENDING;

  return (
    <span className={`badge ${cls}`}>{label}</span>
  );
}
