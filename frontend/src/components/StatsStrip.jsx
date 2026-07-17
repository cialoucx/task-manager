import { useMemo } from 'react';

export default function StatsStrip({ tasks }) {
  const metrics = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, percent };
  }, [tasks]);

  const progressMotivationalLabel = useMemo(() => {
    if (metrics.percent === 100) return "All caught up! Nice job.";
    if (metrics.percent >= 75) return "Almost done — keep it up.";
    if (metrics.percent >= 50) return "Nice pace today — keep going.";
    if (metrics.percent > 0) return "Off to a good start!";
    return "No tasks completed yet.";
  }, [metrics.percent]);

  if (metrics.total === 0) {
    return (
      <div className="progress-card">
        <div className="ring">
          <svg width="64" height="64" viewBox="0 0 64 64">
            <circle cx="32" cy="32" r="27" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="6"/>
            <circle cx="32" cy="32" r="27" fill="none" stroke="var(--accent)" stroke-width="6" stroke-linecap="round" stroke-dasharray="169.6" stroke-dashoffset="169.6"/>
          </svg>
          <div className="ring-label">0%</div>
        </div>
        <div className="progress-text">
          <p className="num">No tasks today</p>
          <p className="lbl">Add a task to get started.</p>
        </div>
      </div>
    );
  }

  // Circular progress math: circumference of circle with radius 27 is 2 * Math.PI * 27 = 169.646
  const circ = 169.6;
  const strokeDashoffset = circ - (metrics.percent / 100) * circ;

  return (
    <div className="progress-card">
      <div className="ring">
        <svg width="64" height="64" viewBox="0 0 64 64">
          <circle cx="32" cy="32" r="27" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="6"/>
          <circle 
            cx="32" 
            cy="32" 
            r="27" 
            fill="none" 
            stroke="var(--accent)" 
            stroke-width="6" 
            stroke-linecap="round" 
            stroke-dasharray={`${circ}`} 
            stroke-dashoffset={strokeDashoffset}
            style={{ transition: 'stroke-dashoffset 0.35s ease' }}
          />
        </svg>
        <div className="ring-label">{metrics.percent}%</div>
      </div>
      <div className="progress-text">
        <p className="num">{metrics.completed} of {metrics.total} tasks completed</p>
        <p className="lbl">{progressMotivationalLabel}</p>
      </div>
    </div>
  );
}
