import { useState, useEffect, useMemo } from 'react';
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sortOrder, setSortOrder] = useState('latest');
  const [currentPage, setCurrentPage] = useState(1);
  const logsPerPage = 10;

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

  const latestFiveLogs = useMemo(() => {
    return [...activities]
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 5);
  }, [activities]);

  const sortedActivities = useMemo(() => {
    return [...activities].sort((a, b) => {
      const dateA = new Date(a.timestamp);
      const dateB = new Date(b.timestamp);
      return sortOrder === 'latest' ? dateB - dateA : dateA - dateB;
    });
  }, [activities, sortOrder]);

  const totalPages = Math.ceil(sortedActivities.length / logsPerPage);
  const currentLogs = useMemo(() => {
    const indexOfLastLog = currentPage * logsPerPage;
    const indexOfFirstLog = indexOfLastLog - logsPerPage;
    return sortedActivities.slice(indexOfFirstLog, indexOfLastLog);
  }, [sortedActivities, currentPage]);

  return (
    <div className="log-section">
      <div className="log-head">
        <div className="log-title">
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
            {latestFiveLogs.map((act) => {
              const { action, subject } = parseActivity(act);
              let actionWord = 'Updated';
              if (action === 'Created') actionWord = 'Filed';
              else if (action === 'Task completed') actionWord = 'Closed';
              else if (action === 'Deleted') actionWord = 'Removed';

              const docketNum = act.taskId ? String(act.taskId).padStart(3, '0') : '000';
              const relativeTimeStr = formatRelativeTime(act.timestamp);
              
              return (
                <div key={act.id} className="log-entry">
                  <div className="log-dot"></div>
                  <div className="log-text">
                    <b>{actionWord}</b> entry no. {docketNum}, "{subject}"
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
              onClick={() => { setIsModalOpen(true); setCurrentPage(1); }} 
              className="timeline-view-all-btn" 
              style={{ borderTop: 'none', marginTop: '16px', paddingTop: 0 }}
            >
              View All →
            </button>
          )}
        </>
      )}

      {/* Daily Log History Modal */}
      {isModalOpen && (
        <div className="log-modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="log-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="log-modal-header">
              <h3>Daily Log History</h3>
              <button className="log-modal-close" onClick={() => setIsModalOpen(false)}>×</button>
            </div>
            <div className="log-modal-toolbar">
              <span style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
                Total entries: <b>{activities.length}</b>
              </span>
              <select 
                value={sortOrder} 
                onChange={(e) => { setSortOrder(e.target.value); setCurrentPage(1); }}
                className="filter"
                style={{ padding: '6px 10px', fontSize: '12.5px', background: 'var(--bg)', cursor: 'pointer' }}
              >
                <option value="latest">Latest first</option>
                <option value="earliest">Earliest first</option>
              </select>
            </div>
            <div className="log-modal-body">
              {currentLogs.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', fontSize: '13px', padding: '20px 0', textAlign: 'center' }}>
                  No entries found.
                </div>
              ) : (
                <div className="log-entries">
                  {currentLogs.map((act) => {
                    const { action, subject } = parseActivity(act);
                    let actionWord = 'Updated';
                    if (action === 'Created') actionWord = 'Filed';
                    else if (action === 'Task completed') actionWord = 'Closed';
                    else if (action === 'Deleted') actionWord = 'Removed';

                    const docketNum = act.taskId ? String(act.taskId).padStart(3, '0') : '000';
                    const relativeTimeStr = formatRelativeTime(act.timestamp);
                    
                    return (
                      <div key={act.id} className="log-entry">
                        <div className="log-dot"></div>
                        <div className="log-text">
                          <b>{actionWord}</b> entry no. {docketNum}, "{subject}"
                        </div>
                        <div className="log-time">
                          {relativeTimeStr}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            <div className="log-modal-footer">
              <span className="page-info">Page {currentPage} of {totalPages || 1}</span>
              <div className="nav-btns">
                <button 
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
                  disabled={currentPage === 1}
                >
                  Previous
                </button>
                <button 
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} 
                  disabled={currentPage === totalPages || totalPages === 0}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
