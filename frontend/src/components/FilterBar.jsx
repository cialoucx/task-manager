const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'inactive', label: 'Completed' },
];

export default function FilterBar({ status, onChange, counts }) {
  return (
    <div className="filter-bar" role="tablist" aria-label="Filter tasks">
      {FILTERS.map((f) => (
        <button
          key={f.key}
          role="tab"
          aria-selected={status === f.key}
          className={`filter-tab ${status === f.key ? 'filter-tab--active' : ''}`}
          onClick={() => onChange(f.key)}
        >
          {f.label}
          {typeof counts?.[f.key] === 'number' && (
            <span className="filter-tab__count">{counts[f.key]}</span>
          )}
        </button>
      ))}
    </div>
  );
}
