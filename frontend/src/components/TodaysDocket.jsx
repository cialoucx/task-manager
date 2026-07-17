import { useMemo } from 'react';
import { useAuth } from '../context/AuthContext';

function formatNextTaskDue(dueDateStr) {
  if (!dueDateStr) return 'DUE SOON';
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDateStr);
  due.setHours(0, 0, 0, 0);
  const diffDays = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return 'OVERDUE';
  if (diffDays === 0) return 'DUE TODAY';
  if (diffDays === 1) return 'DUE TOMORROW';
  
  const options = { month: 'short', day: 'numeric' };
  return `DUE ${due.toLocaleDateString(undefined, options).toUpperCase()}`;
}

export default function TodaysDocket({ tasks, onCardClick, onToggle }) {
  const { user } = useAuth();

  const timeGreeting = useMemo(() => {
    const hr = new Date().getHours();
    if (hr < 12) return 'Good morning';
    if (hr < 18) return 'Good afternoon';
    return 'Good evening';
  }, []);

  const formattedUsername = useMemo(() => {
    const raw = user?.username || 'Lucs';
    return raw.charAt(0).toUpperCase() + raw.slice(1);
  }, [user?.username]);

  const incompleteTasks = useMemo(() => tasks.filter(t => !t.completed), [tasks]);

  const nextTask = useMemo(() => {
    if (incompleteTasks.length === 0) return null;
    const sorted = [...incompleteTasks].sort((a, b) => {
      const pWeight = { high: 3, medium: 2, low: 1 };
      const priorityDiff = (pWeight[b.priority] || 0) - (pWeight[a.priority] || 0);
      if (priorityDiff !== 0) return priorityDiff;
      
      if (a.dueDate && b.dueDate) return a.dueDate.localeCompare(b.dueDate);
      if (a.dueDate) return -1;
      if (b.dueDate) return 1;
      return 0;
    });
    return sorted[0];
  }, [incompleteTasks]);

  const greetingSubText = useMemo(() => {
    if (incompleteTasks.length === 0 && tasks.length > 0) {
      return "Docket's clear.";
    }
    if (tasks.length === 0) {
      return "Your daily brief is clear. File a new entry below to begin.";
    }
    return `${incompleteTasks.length} ${incompleteTasks.length === 1 ? 'entry' : 'entries'} still open on today's docket.`;
  }, [incompleteTasks.length, tasks.length]);

  return (
    <div className="brief-left">
      <div className="eyebrow">Today's brief</div>
      <div className="greeting-block">
        <h1>{timeGreeting}, {formattedUsername}.</h1>
        <p className="greeting-sub">{greetingSubText}</p>
      </div>
      
      {nextTask ? (
        <div 
          className="status-line"
          onClick={() => onCardClick(nextTask)}
          role="button"
          tabIndex={0}
          onKeyDown={e => e.key === 'Enter' && onCardClick(nextTask)}
        >
          <div className="stamp">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <div className="text">
            <div className="title">{nextTask.title}</div>
            <div className="sub">Filed {new Date(nextTask.createdAt || nextTask.updatedAt || Date.now()).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} — due {formatNextTaskDue(nextTask.dueDate).toLowerCase()}</div>
          </div>
        </div>
      ) : (
        <div className="status-line">
          <div className="stamp clear">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <div className="text">
            <div className="title">All caught up for today</div>
            <div className="sub">Nothing due — check back tomorrow, or get ahead on low priority tasks.</div>
          </div>
        </div>
      )}
    </div>
  );
}
