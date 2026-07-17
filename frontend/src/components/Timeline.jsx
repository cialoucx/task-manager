import { useState, useEffect } from 'react';
import { fetchActivityTimeline } from '../api/taskApi';

function formatRelativeTime(isoStr) {
  const d = new Date(isoStr);
  const now = new Date();
  const diffMs = now - d;
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  
  const diffHrs = Math.floor(diffMins / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;
  
  const diffDays = Math.floor(diffHrs / 24);
  if (diffDays === 1) return 'yesterday';
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function parseActivity(act) {
  const details = act.details || '';
  let action = 'Updated';
  let subject = '';

  if (details.startsWith('Created task')) {
    action = 'Created';
    const match = details.match(/"([^"]+)"/);
    subject = match ? match[1] : '';
  } else if (details.includes('priority to')) {
    action = 'Priority changed';
    const match = details.match(/"([^"]+)"/);
    subject = match ? match[1] : '';
  } else if (details.startsWith('Completed task')) {
    action = 'Task completed';
    const match = details.match(/"([^"]+)"/);
    subject = match ? match[1] : '';
  } else if (details.includes('as active')) {
    action = 'Marked active';
    const match = details.match(/"([^"]+)"/);
    subject = match ? match[1] : '';
  } else if (details.startsWith('Deleted task')) {
    action = 'Deleted';
    const match = details.match(/"([^"]+)"/);
    subject = match ? match[1] : '';
  } else {
    const match = details.match(/"([^"]+)"/);
    subject = match ? match[1] : details;
  }

  return { action, subject };
}

export default function Timeline({ refreshTrigger }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  async function loadTimeline() {
    setLoading(true);
    try {
      const data = await fetchActivityTimeline();
      setActivities(data || []);
    } catch {
      // Silence if not authenticated
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTimeline();
  }, [refreshTrigger]);

  const visibleActivities = showAll ? activities : activities.slice(0, 5);

  return (
    <div className="log-section">
      <div className="log-head">
        <div className="log-title">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '6px' }}>
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
            <path d="M3 3v5h5"/>
            <path d="M12 7v5l4 2"/>
          </svg>
          Daily log
        </div>
        <button
          onClick={loadTimeline}
          style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px' }}
          aria-label="Refresh timeline"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2">
            <path d="M23 4v6h-6"/>
            <path d="M1 20v-6h6"/>
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
          </svg>
        </button>
      </div>

      {loading && activities.length === 0 ? (
        <div style={{ fontSize: '13px', color: 'var(--text-muted)', padding: '12px 0' }}>
          Loading activities...
        </div>
      ) : activities.length === 0 ? (
        <div style={{ fontSize: '13px', color: 'var(--text-muted)', padding: '12px 0' }}>
          No activity logs recorded.
        </div>
      ) : (
        <>
          <div className="log-entries">
            {visibleActivities.map((act) => {
              const { action, subject } = parseActivity(act);
              const relativeTimeStr = formatRelativeTime(act.timestamp);
              
              return (
                <div key={act.id} className="log-entry">
                  <div className="log-icon">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z"/>
                    </svg>
                  </div>
                  <div className="log-text">
                    <b>{action}</b> task "{subject}"
                  </div>
                  <div className="log-time">
                    {relativeTimeStr}
                  </div>
                </div>
              );
            })}
          </div>
          {activities.length > 5 && (
            <button 
              onClick={() => setShowAll(!showAll)} 
              className="timeline-view-all-btn" 
              style={{ borderTop: 'none', marginTop: '16px', paddingTop: 0 }}
            >
              {showAll ? 'Show Less' : 'View All →'}
            </button>
          )}
        </>
      )}
    </div>
  );
}
