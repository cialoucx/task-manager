import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, Edit2, Check, Archive, MessageSquare } from 'lucide-react';
import { useState, useEffect } from 'react';
import { fetchActivityTimeline } from '../api/taskApi';

function formatDueDate(dueDateStr) {
  if (!dueDateStr) return 'No due date';
  const d = new Date(dueDateStr);
  return d.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' });
}

export default function TaskDetailsModal({ isOpen, task, onSave, onToggle, onDelete, onCancel }) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState('');
  const [activities, setActivities] = useState([]);
  const [loadingActivities, setLoadingActivities] = useState(false);

  useEffect(() => {
    if (task && isOpen) {
      setTitle(task.title || '');
      setDescription(task.description || '');
      setPriority(task.priority || 'medium');
      setDueDate(task.dueDate || '');
      setIsEditing(false);
      
      // Load activity history for this specific task
      setLoadingActivities(true);
      fetchActivityTimeline()
        .then((data) => {
          const taskLogs = (data || []).filter((log) => log.taskId === task.id);
          setActivities(taskLogs);
        })
        .catch(() => {})
        .finally(() => setLoadingActivities(false));
    }
  }, [task, isOpen]);

  if (!task) return null;

  function handleSaveClick() {
    if (!title.trim()) return;
    onSave(task.id, {
      title: title.trim(),
      description: description.trim(),
      priority,
      dueDate: dueDate || null
    });
    setIsEditing(false);
  }

  const priorityMeta = {
    low: { label: 'Low', class: 'badge-low' },
    medium: { label: 'Medium', class: 'badge-medium' },
    high: { label: 'High', class: 'badge-high' }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="modal-overlay" onClick={onCancel}>
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 15 }}
            transition={{ type: 'spring', damping: 26, stiffness: 360 }}
            className="modal-content"
            style={{ maxWidth: '640px' }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="details-title"
          >
            {/* Header */}
            <div className="modal-header">
              <span className="text-mono" style={{ fontSize: '11px', color: 'var(--accent)', fontWeight: 600 }}>
                TASK DETAILS
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="card-action-btn"
                    title="Edit Task"
                    style={{ padding: '6px' }}
                  >
                    <Edit2 size={14} />
                  </button>
                )}
                <button onClick={onCancel} className="modal-close-btn" aria-label="Close modal">
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="modal-body" style={{ maxHeight: 'calc(100vh - 220px)', overflowY: 'auto' }}>
              {isEditing ? (
                /* Edit Mode */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div className="modal-form-group">
                    <label className="modal-label" htmlFor="edit-title">Title</label>
                    <input
                      id="edit-title"
                      type="text"
                      className="modal-input"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                    />
                  </div>

                  <div className="modal-form-group">
                    <label className="modal-label" htmlFor="edit-desc">Description</label>
                    <textarea
                      id="edit-desc"
                      className="modal-textarea"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div className="modal-form-group">
                      <label className="modal-label" htmlFor="edit-priority">Priority</label>
                      <select
                        id="edit-priority"
                        className="modal-select"
                        style={{ width: '100%' }}
                        value={priority}
                        onChange={(e) => setPriority(e.target.value)}
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>

                    <div className="modal-form-group">
                      <label className="modal-label" htmlFor="edit-due">Due Date</label>
                      <input
                        id="edit-due"
                        type="date"
                        className="modal-input"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                /* View Mode */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  <div>
                    <h2 id="details-title" style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text)', marginBottom: '8px', wordBreak: 'break-word' }}>
                      {task.title}
                    </h2>
                    
                    {/* Status Toggle Header */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', marginTop: '12px' }}>
                      <button
                        onClick={() => onToggle(task.id)}
                        className={`view-toggle-btn ${task.completed ? 'active' : ''}`}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', fontSize: '12px' }}
                      >
                        <Check size={14} />
                        {task.completed ? 'Completed' : 'Mark Completed'}
                      </button>

                      <span className={`badge ${priorityMeta[task.priority]?.class}`}>
                        {priorityMeta[task.priority]?.label} Priority
                      </span>
                    </div>
                  </div>

                  {/* Attributes Section */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', background: 'var(--bg)', borderRadius: '8px', padding: '16px', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Calendar size={16} style={{ color: 'var(--text-muted)' }} />
                      <div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>DUE DATE</div>
                        <div style={{ fontSize: '13px', color: 'var(--text)', fontWeight: 500 }}>{formatDueDate(task.dueDate)}</div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Clock size={16} style={{ color: 'var(--text-muted)' }} />
                      <div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>LAST UPDATED</div>
                        <div style={{ fontSize: '13px', color: 'var(--text)', fontWeight: 500 }}>
                          {new Date(task.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} at {new Date(task.updatedAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <h4 style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                      Description
                    </h4>
                    {task.description ? (
                      <p style={{ fontSize: '14.5px', color: 'var(--text)', lineHeight: '1.6', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                        {task.description}
                      </p>
                    ) : (
                      <p style={{ fontSize: '14px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                        No description provided.
                      </p>
                    )}
                  </div>

                  <hr style={{ border: 'none', borderBottom: '1px solid var(--border)' }} />

                  {/* Task Specific Timeline */}
                  <div>
                    <h4 style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
                      Activity History
                    </h4>
                    {loadingActivities ? (
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic' }}>Loading logs...</div>
                    ) : activities.length === 0 ? (
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic' }}>No activity logged yet.</div>
                    ) : (
                      <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {activities.map((act) => (
                          <li key={act.id} style={{ display: 'flex', gap: '10px', fontSize: '12px', alignItems: 'center' }}>
                            <span className={`timeline-dot ${act.action}`} style={{ width: '6px', height: '6px' }} />
                            <span style={{ color: 'var(--text)' }}>{act.details}</span>
                            <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-sans)', fontSize: '10px', marginLeft: 'auto' }}>
                              {new Date(act.timestamp).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>


                </div>
              )}
            </div>

            {/* Footer */}
            <div className="modal-footer">
              {isEditing ? (
                <>
                  <button onClick={() => setIsEditing(false)} className="btn-secondary">
                    Cancel
                  </button>
                  <button onClick={handleSaveClick} className="btn-primary">
                    Save Changes
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      onDelete(task.id);
                      onCancel();
                    }}
                    className="btn-danger"
                    style={{ marginRight: 'auto', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Archive size={14} />
                    Delete
                  </button>
                  <button onClick={onCancel} className="btn-secondary">
                    Close
                  </button>
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
