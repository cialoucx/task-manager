import TaskItem from './TaskItem';
import Skeleton from './Skeleton';
import { AnimatePresence, motion } from 'framer-motion';
import { ClipboardList } from 'lucide-react';

export default function TaskList({ tasks, loading, error, onToggle, onEdit, onDelete, search, onCreateClick, onCardClick }) {
  if (loading) {
    return <Skeleton />;
  }

  if (error) {
    return <p className="state-message state-message--error" style={{ color: 'var(--priority-high)' }}>{error}</p>;
  }

  if (tasks.length === 0) {
    return (
      <div className="beautiful-empty-state" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <motion.div
          animate={{ y: [0, -8, 0], rotate: [0, 2, -2, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          style={{ marginBottom: '20px' }}
        >
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="12" y="16" width="40" height="40" rx="8" stroke="var(--text-muted)" strokeWidth="2" strokeDasharray="4 4" opacity="0.5" />
            <path d="M22 36L28 42L42 26" stroke="var(--accent)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="48" cy="18" r="4" fill="var(--priority-low)" opacity="0.8" />
            <circle cx="16" cy="50" r="3" fill="var(--accent)" opacity="0.6" />
          </svg>
        </motion.div>
        <h3 className="empty-state-title">
          {search ? 'No matches found' : "You're all caught up."}
        </h3>
        <p className="empty-state-subtitle">
          {search
            ? `We couldn't find any entries matching "${search}".`
            : 'File a new entry.'}
        </p>
        {!search && (
          <button onClick={onCreateClick} className="btn-primary" style={{ margin: '0 auto' }}>
            File new entry
          </button>
        )}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0px' }}>
      <AnimatePresence>
        {tasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            search={search}
            onToggle={onToggle}
            onEdit={onEdit}
            onDelete={onDelete}
            onCardClick={onCardClick}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
