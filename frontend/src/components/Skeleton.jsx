export default function Skeleton() {
  return (
    <div className="skeleton-task-list">
      {[1, 2, 3].map((n) => (
        <div key={n} className="skeleton-card" aria-hidden="true">
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div className="skeleton" style={{ width: '20px', height: '20px', borderRadius: '6px' }} />
            <div className="skeleton" style={{ width: '150px', height: '18px' }} />
          </div>
          <div className="skeleton" style={{ width: '80%', height: '12px', marginTop: '10px' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '14px' }}>
            <div className="skeleton" style={{ width: '60px', height: '16px' }} />
            <div className="skeleton" style={{ width: '80px', height: '16px' }} />
          </div>
        </div>
      ))}
    </div>
  );
}
