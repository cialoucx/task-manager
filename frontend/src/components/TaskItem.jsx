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

export default function TaskItem({ task, search, onToggle, onCardClick }) {
  const dueDateLabel = formatDueDate(task.dueDate);
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`task-card priority-${task.priority} ${task.completed ? 'done' : ''}`}
      style={{ cursor: 'pointer' }}
      onClick={() => onCardClick(task)}
    >
      <div className="task-top">
        <div
          className={`task-check ${task.completed ? 'checked' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggle(task.id);
          }}
          aria-label={task.completed ? 'Mark incomplete' : 'Mark complete'}
        >
          {task.completed && (
            <svg viewBox="0 0 24 24" fill="none" stroke="#0b0c14" strokeWidth="3">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          )}
        </div>
        
        <div className="task-title">
          {highlightText(task.title, search)}
        </div>
      </div>

      <div className="task-meta">
        {dueDateLabel && (
          <div className="task-due">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            {dueDateLabel}
          </div>
        )}

        <div className="task-updated">
          updated {formatTimeAgo(task.updatedAt)}
        </div>
      </div>
    </motion.div>
  );
}
