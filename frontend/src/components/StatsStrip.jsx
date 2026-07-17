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
    if (metrics.percent >= 50) return "Halfway through the docket — steady pace.";
    if (metrics.percent > 0) return "Off to a good start!";
    return "No tasks completed yet.";
  }, [metrics.percent]);

  return (
    <div className="brief-right">
      <div className="tally">
        <span className="big">{metrics.completed}</span>
        <span className="of">of {metrics.total} closed today</span>
      </div>
      <div className="tally-bar">
        <div className="tally-bar-fill" style={{ width: `${metrics.percent}%`, transition: 'width 0.35s ease' }}></div>
      </div>
      <div className="tally-note">
        {metrics.total === 0 ? 'File a new entry to get started.' : progressMotivationalLabel}
      </div>
    </div>
  );
}
