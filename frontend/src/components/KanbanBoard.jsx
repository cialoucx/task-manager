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
      emptyMsg: 'No high priority work.\nYou\'re staying focused.',
      dotClass: 'high' 
    },
    { 
      key: 'medium', 
      label: 'Medium priority', 
      emptyMsg: 'No medium priority work.\nYou\'re staying focused.',
      dotClass: 'med' 
    },
    { 
      key: 'low', 
      label: 'Low priority', 
      emptyMsg: 'No low priority work.\nYou\'re staying focused.',
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
            className="kanban-column"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, col.key)}
            role="region"
            aria-label={`${col.label} lane`}
            style={{ display: 'flex', flexDirection: 'column' }}
          >
            <div className="col-head">
              <span className={`dot ${col.dotClass}`}></span>
              {col.label}
              <span className="col-count">({colTasks.length})</span>
            </div>

            <div className="task-cards-list" style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
              <AnimatePresence>
                {colTasks.map((task) => {
                  const dueDateLabel = formatDueDate(task.dueDate);
                  
                  return (
                    <motion.div
                      key={task.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className={`task-card priority-${task.priority} ${task.completed ? 'done' : ''}`}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task.id)}
                      onDragEnd={handleDragEnd}
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
                })}
              </AnimatePresence>

              {colTasks.length === 0 && (
                <div className="empty-col" style={{ flexGrow: 1 }}>
                  <div className="empty-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </div>
                  <p>
                    {col.emptyMsg.split('\n')[0]}
                    <br />
                    {col.emptyMsg.split('\n')[1]}
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
