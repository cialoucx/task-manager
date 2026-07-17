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
      return "Everything's complete. Nice work. Time to relax.";
    }
    if (tasks.length === 0) {
      return "Your daily brief is clear. Create a task below to begin.";
    }
    return `You have ${incompleteTasks.length} task${incompleteTasks.length === 1 ? '' : 's'} left today.`;
  }, [incompleteTasks.length, tasks.length]);

  return (
    <div className="greeting-block">
      <div className="eyebrow">TODAY'S BRIEF</div>
      <h1>{timeGreeting}, {formattedUsername}.</h1>
      <p className="greeting-sub">{greetingSubText}</p>
      
      {nextTask && (
        <div 
          className="next-task"
          onClick={() => onCardClick(nextTask)}
          role="button"
          tabIndex={0}
          onKeyDown={e => e.key === 'Enter' && onCardClick(nextTask)}
        >
          <div 
            className="check" 
            onClick={e => { e.stopPropagation(); onToggle(nextTask.id); }}
            aria-label="Toggle next task"
          />
          <div className="title">{nextTask.title}</div>
          <div className="badge-due">{formatNextTaskDue(nextTask.dueDate)}</div>
          <div className="arrow">→</div>
        </div>
      )}
    </div>
  );
}
