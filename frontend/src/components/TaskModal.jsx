import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

const empty = { title: '', description: '', priority: 'medium', dueDate: '' };

export default function TaskModal({ isOpen, initialValues, onSubmit, onCancel, submitLabel }) {
  const [values, setValues] = useState(empty);
  const [error, setError] = useState('');
  const titleInputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setValues(initialValues ? {
        title: initialValues.title || '',
        description: initialValues.description || '',
        priority: initialValues.priority || 'medium',
        dueDate: initialValues.dueDate || ''
      } : empty);
      setError('');
      setTimeout(() => {
        titleInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen, initialValues]);

  function handleSubmit(e) {
    e.preventDefault();
    if (!values.title.trim()) {
      setError('Task title is required.');
      return;
    }
    setError('');
    onSubmit({
      title: values.title.trim(),
      description: values.description.trim(),
      priority: values.priority,
      dueDate: values.dueDate || null
    });
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="modal-overlay" onClick={onCancel}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="task-modal-title"
          >
            <div className="modal-header">
              <h3 id="task-modal-title" className="modal-title">
                {initialValues ? 'Edit Task' : 'Create Task'}
              </h3>
              <button onClick={onCancel} className="modal-close-btn" aria-label="Close modal">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="modal-form-group">
                  <label htmlFor="task-title" className="modal-label">Title *</label>
                  <input
                    ref={titleInputRef}
                    id="task-title"
                    type="text"
                    className="modal-input"
                    placeholder="Finish Portfolio..."
                    value={values.title}
                    onChange={(e) => setValues((v) => ({ ...v, title: e.target.value }))}
                    maxLength={200}
                    required
                  />
                  {error && <p className="auth-error" style={{ color: 'var(--priority-high)', fontSize: '12px', marginTop: '4px' }} role="alert">{error}</p>}
                </div>
                
                <div className="modal-form-group">
                  <label htmlFor="task-desc" className="modal-label">Description</label>
                  <textarea
                    id="task-desc"
                    className="modal-textarea"
                    placeholder="Add details (optional)..."
                    value={values.description}
                    onChange={(e) => setValues((v) => ({ ...v, description: e.target.value }))}
                    maxLength={2000}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="modal-form-group">
                    <label htmlFor="task-priority" className="modal-label">Priority</label>
                    <select
                      id="task-priority"
                      className="modal-select"
                      style={{ width: '100%' }}
                      value={values.priority}
                      onChange={(e) => setValues((v) => ({ ...v, priority: e.target.value }))}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>

                  <div className="modal-form-group">
                    <label htmlFor="task-due" className="modal-label">Due Date</label>
                    <input
                      id="task-due"
                      type="date"
                      className="modal-input"
                      value={values.dueDate}
                      onChange={(e) => setValues((v) => ({ ...v, dueDate: e.target.value }))}
                    />
                  </div>
                </div>
              </div>
              
              <div className="modal-footer">
                <button type="button" onClick={onCancel} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {submitLabel || (initialValues ? 'Save Changes' : 'Create Task')}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
