import { motion } from 'framer-motion';
import { highlightText } from './KanbanBoard';

function formatDueDate(dueDateStr) {
  if (!dueDateStr) return null;
  const d = new Date(dueDateStr);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function formatTimeAgo(isoStr) {
  const d = new Date(isoStr);
  const now = new Date();
  const diffMs = now - d;
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  
  const diffHrs = Math.floor(diffMins / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;
  
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function formatNextTaskDue(dueDateStr) {
  if (!dueDateStr) return '';
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDateStr);
  due.setHours(0, 0, 0, 0);
  const diffDays = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return 'overdue';
  if (diffDays === 0) return 'due today';
  if (diffDays === 1) return 'due tomorrow';
  
  const options = { month: 'short', day: 'numeric' };
  return `due ${due.toLocaleDateString(undefined, options)}`;
}

export default function TaskItem({ task, search, onToggle, onCardClick }) {
  const dueLabel = formatNextTaskDue(task.dueDate);
  const isOverdueOrToday = dueLabel === 'overdue' || dueLabel === 'due today';
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`row task-card priority-${task.priority} ${task.completed ? 'done' : ''}`}
      style={{ cursor: 'pointer' }}
      onClick={() => onCardClick(task)}
    >
      <div className="row-num">{String(task.id).padStart(3, '0')}</div>
      
      <div
        className={`row-check task-check ${task.completed ? 'checked' : ''}`}
        onClick={(e) => {
          e.stopPropagation();
          onToggle(task.id);
        }}
        aria-label={task.completed ? 'Mark incomplete' : 'Mark complete'}
      >
        {task.completed && (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        )}
      </div>
      
      <div className="row-body">
        <div className="row-title task-title">
          {highlightText(task.title, search)}
        </div>
        <div className="row-meta task-meta">
          {task.completed ? (
            <span>closed {new Date(task.updatedAt || Date.now()).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
          ) : (
            dueLabel && <span className={isOverdueOrToday ? 'due-soon' : ''}>{dueLabel}</span>
          )}
          <span>·</span>
          <span>updated {formatTimeAgo(task.updatedAt)}</span>
        </div>
      </div>
    </motion.div>
  );
}
