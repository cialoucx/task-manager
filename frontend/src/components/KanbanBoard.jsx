import { motion, AnimatePresence } from 'framer-motion';

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

export function highlightText(text, search) {
  if (!search || !search.trim()) return text;
  const cleanSearch = search.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
  const parts = text.split(new RegExp(`(${cleanSearch})`, 'gi'));
  return (
    <>
      {parts.map((part, i) => 
        part.toLowerCase() === search.toLowerCase() 
          ? <span key={i} className="search-highlight">{part}</span> 
          : part
      )}
    </>
  );
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

export default function KanbanBoard({ 
  tasks, 
  search, 
  isDragging, 
  onToggle, 
  onPriorityChange, 
  onCardClick,
  onDragStart,
  onDragEnd
}) {
  const columns = [
    { 
      key: 'high', 
      label: 'High priority', 
      emptyMsg: 'Nothing filed at high priority. Docket\'s clear.',
      dotClass: 'high' 
    },
    { 
      key: 'medium', 
      label: 'Medium priority', 
      emptyMsg: 'Nothing filed at medium priority. Docket\'s clear.',
      dotClass: 'med' 
    },
    { 
      key: 'low', 
      label: 'Low priority', 
      emptyMsg: 'Nothing filed at low priority. Docket\'s clear.',
      dotClass: 'low' 
    },
  ];

  function handleDragStart(e, taskId) {
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';
    onDragStart(taskId);
  }

  function handleDragEnd() {
    onDragEnd();
  }

  function handleDragOver(e) {
    e.preventDefault();
  }

  function handleDrop(e, priority) {
    e.preventDefault();
    const taskIdStr = e.dataTransfer.getData('text/plain');
    const taskId = Number(taskIdStr);
    if (!isNaN(taskId)) {
      onPriorityChange(taskId, priority);
    }
  }

  return (
    <div className="board">
      {columns.map((col) => {
        const colTasks = tasks.filter((t) => t.priority === col.key);
        
        return (
          <div
            key={col.key}
            className={`col ${col.key}`}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, col.key)}
            role="region"
            aria-label={`${col.label} lane`}
          >
            <div className="col-head">
              <span className="label">{col.label}</span>
              <span className="count">{String(colTasks.length).padStart(3, '0')}</span>
            </div>

            <div className="task-cards-list" style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
              <AnimatePresence>
                {colTasks.map((task) => {
                  const dueLabel = formatNextTaskDue(task.dueDate);
                  const isOverdueOrToday = dueLabel === 'overdue' || dueLabel === 'due today';
                  
                  return (
                    <motion.div
                      key={task.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className={`row task-card priority-${task.priority} ${task.completed ? 'done' : ''}`}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task.id)}
                      onDragEnd={handleDragEnd}
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
                })}
              </AnimatePresence>

              {colTasks.length === 0 && (
                <div className="col-empty">
                  <p>
                    Nothing filed at {col.key} priority. <span className="mark">Docket's clear.</span>
                  </p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
