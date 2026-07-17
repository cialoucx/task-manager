import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from './context/AuthContext';
import { useTheme } from './context/ThemeContext';
import TodaysDocket from './components/TodaysDocket';
import StatsStrip from './components/StatsStrip';
import Timeline from './components/Timeline';
import TaskList from './components/TaskList';
import KanbanBoard from './components/KanbanBoard';
import TaskModal from './components/TaskModal';
import TaskDetailsModal from './components/TaskDetailsModal';
import ConfirmModal from './components/ConfirmModal';
import Warmup from './components/Warmup';
import ToastStack from './components/Toast';
import { fetchTasks, createTask, updateTask, toggleTask, deleteTask } from './api/taskApi';
import { LayoutGrid, List, LogOut, Plus, ChevronDown, ChevronUp, Search } from 'lucide-react';
import './App.css';

export default function App() {
  const { user, token, login, signup, logout, loading: authLoading } = useAuth();
  const { theme, setTheme } = useTheme();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('docket');

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sortBy, setSortBy] = useState('priority');
  const [filter, setFilter] = useState('all');
  const [viewMode, setViewMode] = useState('kanban');
  const [timelineTrigger, setTimelineTrigger] = useState(0);
  const [activityOpen, setActivityOpen] = useState(true);

  const [draggedTaskId, setDraggedTaskId] = useState(null);

  const [isLoginMode, setIsLoginMode] = useState(true);
  const [authUsername, setAuthUsername] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');

  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [viewingTask, setViewingTask] = useState(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [deletingTaskId, setDeletingTaskId] = useState(null);

  const [toasts, setToasts] = useState([]);
  const searchInputRef = useRef(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const profileMenuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const showToast = useCallback((message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const apiParams = useMemo(() => {
    let status = 'all';
    let dueDateFilter = '';
    if (filter === 'active') status = 'active';
    else if (filter === 'inactive' || filter === 'completed') status = 'inactive';
    else if (filter === 'overdue') { status = 'active'; dueDateFilter = 'overdue'; }
    else if (filter === 'today') dueDateFilter = 'today';
    else if (filter === 'week') dueDateFilter = 'week';
    else if (filter === 'high') dueDateFilter = 'high';
    return { status, dueDateFilter, sortBy, search: debouncedSearch };
  }, [filter, sortBy, debouncedSearch]);

  const loadTasks = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError('');
    try {
      const data = await fetchTasks(apiParams);
      setTasks(data || []);
    } catch (err) {
      setError(err.message || 'Could not load tasks.');
    } finally {
      setLoading(false);
    }
  }, [token, apiParams]);

  useEffect(() => { loadTasks(); }, [loadTasks]);

  useEffect(() => {
    if (!user) return;
    function handleKeyDown(e) {
      const el = document.activeElement;
      const typing = el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable);

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        document.getElementById('dashboard-search')?.focus();
        return;
      }
      if (typing) { if (e.key === 'Escape') el.blur(); return; }
      if (e.key.toLowerCase() === 'n') { e.preventDefault(); setEditingTask(null); setTaskModalOpen(true); }
      else if (e.key === 'Escape') { setTaskModalOpen(false); setConfirmModalOpen(false); setViewingTask(null); }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [user]);

  async function handleAuthSubmit(e) {
    e.preventDefault();
    setAuthError('');
    if (!authUsername.trim() || !authPassword) { setAuthError('All fields are required.'); return; }
    if (authPassword.length < 6) { setAuthError('Password must be at least 6 characters.'); return; }
    try {
      if (isLoginMode) { await login(authUsername.trim(), authPassword); showToast('Welcome back!', 'success'); }
      else { await signup(authUsername.trim(), authPassword); showToast('Account created!', 'success'); }
      setAuthUsername(''); setAuthPassword('');
      setAuthModalOpen(false);
    } catch (err) { setAuthError(err.message || 'Authentication failed.'); }
  }

  async function handleSaveTask(fields) {
    setTaskModalOpen(false);
    try {
      if (editingTask) { await updateTask(editingTask.id, fields); showToast('Task updated', 'success'); }
      else { await createTask(fields); showToast('Task created', 'success'); }
      setEditingTask(null);
      loadTasks();
      setTimelineTrigger(t => t + 1);
    } catch (err) { showToast(err.message || 'Error saving task', 'danger'); }
  }

  async function handleSaveTaskFromDetails(id, fields) {
    try {
      await updateTask(id, fields);
      showToast('Task updated', 'success');
      setViewingTask(prev => prev ? { ...prev, ...fields } : null);
      loadTasks();
      setTimelineTrigger(t => t + 1);
    } catch (err) { showToast(err.message || 'Error updating task', 'danger'); }
  }

  async function handleToggleTask(id) {
    const prev = [...tasks];
    setTasks(ts => ts.map(t => t.id === id ? { ...t, completed: !t.completed, updatedAt: new Date().toISOString() } : t));
    setViewingTask(v => v && v.id === id ? { ...v, completed: !v.completed } : v);
    try {
      const updated = await toggleTask(id);
      showToast(updated.completed ? 'Task completed!' : 'Marked active', 'success');
      setTimelineTrigger(t => t + 1);
    } catch (err) {
      setTasks(prev);
      setViewingTask(v => v && v.id === id ? { ...v, completed: !v.completed } : v);
      showToast(err.message || 'Could not update task.', 'danger');
    }
  }

  function handleDeleteClick(id) { setDeletingTaskId(id); setConfirmModalOpen(true); }

  async function handleDeleteConfirm() {
    const id = deletingTaskId;
    setConfirmModalOpen(false); setDeletingTaskId(null);
    const prev = [...tasks];
    setTasks(ts => ts.filter(t => t.id !== id));
    try {
      await deleteTask(id);
      showToast('Task deleted', 'success');
      setTimelineTrigger(t => t + 1);
    } catch (err) {
      setTasks(prev);
      showToast(err.message || 'Could not delete task.', 'danger');
    }
  }

  async function handlePriorityChange(id, newPriority) {
    const prev = [...tasks];
    setTasks(ts => ts.map(t => t.id === id ? { ...t, priority: newPriority, updatedAt: new Date().toISOString() } : t));
    try {
      await updateTask(id, { priority: newPriority });
      showToast(`Priority → ${newPriority}`, 'success');
      setTimelineTrigger(t => t + 1);
    } catch (err) {
      setTasks(prev);
      showToast(err.message || 'Could not update priority.', 'danger');
    }
  }
  // Calculate wrap up stats dynamically
  const wrapUpInfo = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const completedToday = tasks.filter(t => t.completed && t.updatedAt?.startsWith(todayStr)).length;
    const activeTasks = tasks.filter(t => !t.completed);
    const focusTask = activeTasks.length > 0 ? activeTasks[0].title : '';
    return { completedToday, mostWorkedOn: focusTask };
  }, [tasks]);

  const username = user?.username ? user.username.charAt(0).toUpperCase() + user.username.slice(1) : 'Lucs';
  const initial  = user?.username ? user.username.charAt(0).toUpperCase() : 'L';

  const datestamp = useMemo(() => {
    const now = new Date();
    const options = { weekday: 'long', month: 'short', day: 'numeric' };
    return `${now.toLocaleDateString('en-US', options)} - 24°C, cloudy`;
  }, []);

  if (authLoading) {
    return <div className="auth-page"><div className="auth-loading">Loading workspace...</div></div>;
  }

  // ── LANDING PAGE WITH AUTH MODAL ─────────────────────────
  if (!user) {
    return (
      <div className="landing-page">
        <nav>
          <div className="wrap">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="logo" 
              onClick={() => setAuthModalOpen(false)}
            >
              The Daily Docket
            </motion.div>
            <motion.button 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              onClick={() => { setAuthModalOpen(true); setIsLoginMode(true); setAuthError(''); }} 
              className="nav-cta"
              style={{ border: 'none', cursor: 'pointer' }}
            >
              Open your docket
            </motion.button>
          </div>
        </nav>

        <div className="hero">
          <div className="wrap">
            <motion.div 
              initial={{ opacity: 0, y: 15 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.5, delay: 0.1 }}
              className="eyebrow"
            >
              TASK MANAGEMENT, FILED PROPERLY
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Every task deserves<br /><em>a case number.</em>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.6, delay: 0.3 }}
              className="lede"
            >
              A daily to-do list that logs each task instead of losing it in a pile of identical cards.
            </motion.p>
            <motion.button 
              initial={{ opacity: 0, y: 15 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.5, delay: 0.4 }}
              onClick={() => { setAuthModalOpen(true); setIsLoginMode(true); setAuthError(''); }} 
              className="btn-primary"
              style={{ border: 'none', cursor: 'pointer' }}
            >
              Open your docket
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </motion.button>

            <motion.div 
              initial={{ opacity: 0, y: 30 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.7, delay: 0.5 }}
              className="preview"
            >
              <div className="preview-head">
                <span className="title">Today's docket · Jul 17</span>
                <div className="stamp-mini">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
              </div>
              <div className="prow">
                <span className="n">014</span><span className="c"></span>
                <span className="t">Fix checkout redirect bug</span>
                <span className="m hi">due today</span>
              </div>
              <div className="prow done">
                <span className="n">009</span><span className="c"></span>
                <span className="t">Deploy staging env</span>
                <span className="m">closed</span>
              </div>
              <div className="prow">
                <span className="n">011</span><span className="c"></span>
                <span className="t">Update API docs</span>
                <span className="m">due Jul 18</span>
              </div>
            </motion.div>
          </div>
        </div>

        <div className="features">
          <div className="wrap">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className="features-head"
            >
              <h2>How it's filed</h2>
              <p>No dashboards to set up. Open the docket, file what's due, close what's done.</p>
            </motion.div>
            <div className="feature-grid">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="feature"
              >
                <div className="fnum">001</div>
                <h3>Sorted on arrival</h3>
                <p>Every task lands in high, medium, or low priority automatically — no manual triage.</p>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="feature"
              >
                <div className="fnum">002</div>
                <h3>A number for every task</h3>
                <p>Each entry is logged in order, so you always know what came first and what's still open.</p>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="feature"
              >
                <div className="fnum">003</div>
                <h3>Closed stays on record</h3>
                <p>Finished tasks don't disappear — they stay visible, struck through, so progress is always in view.</p>
              </motion.div>
            </div>
          </div>
        </div>

        <footer>
          <div className="wrap">
            <div className="f-left">© 2026 The Daily Docket</div>
            <div className="f-links">
              <a href="#privacy">Privacy</a>
              <a href="#terms">Terms</a>
            </div>
          </div>
        </footer>

        {/* Modal-style Login/Signup Overlay */}
        <AnimatePresence>
          {authModalOpen && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="log-modal-overlay" 
              onClick={() => setAuthModalOpen(false)}
            >
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="auth-card" 
                onClick={(e) => e.stopPropagation()} 
                style={{ position: 'relative' }}
              >
                <button 
                  className="log-modal-close" 
                  onClick={() => setAuthModalOpen(false)}
                  style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '22px', color: 'var(--text-muted)' }}
                >
                  ×
                </button>
                <div className="auth-header">
                  <div className="auth-logo">The Daily Docket</div>
                  <h2 className="auth-title">{isLoginMode ? 'Sign In' : 'Create Account'}</h2>
                  <p className="auth-subtitle">
                    {isLoginMode ? 'Enter your credentials to continue' : 'Register a free workspace'}
                  </p>
                </div>
                <form onSubmit={handleAuthSubmit}>
                  <div className="auth-form-group">
                    <label className="auth-label">Username</label>
                    <input type="text" className="auth-input" value={authUsername}
                      onChange={e => setAuthUsername(e.target.value)} placeholder="e.g. gian" required />
                  </div>
                  <div className="auth-form-group">
                    <label className="auth-label">Password</label>
                    <input type="password" className="auth-input" value={authPassword}
                      onChange={e => setAuthPassword(e.target.value)} placeholder="••••••" required />
                  </div>
                  {authError && <div className="auth-error">{authError}</div>}
                  <button type="submit" className="auth-button">
                    {isLoginMode ? 'Sign In' : 'Sign Up'}
                  </button>
                </form>
                <div className="auth-footer">
                  <span>{isLoginMode ? "Don't have an account? " : 'Already have an account? '}</span>
                  <button onClick={() => { setIsLoginMode(!isLoginMode); setAuthError(''); }} className="auth-link-btn">
                    {isLoginMode ? 'Sign up' : 'Sign in'}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }



  return (
    <div className="wrap">

      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="header"
      >
        <div className="brand">
          <div className="brand-mark">The Daily Docket</div>
          <div className="brand-date">{datestamp}</div>
        </div>
        <div className="header-right" ref={profileMenuRef}>
          <div className="profile-menu-container">
            <button
              className="profile-menu-trigger"
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              aria-label="Toggle user menu"
            >
              <div className="avatar">{initial}</div>
              <span className="user-name">{username}</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ opacity: 0.6, transition: 'transform 0.2s', transform: userMenuOpen ? 'rotate(180deg)' : 'none' }}>
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>

            {userMenuOpen && (
              <div className="profile-dropdown">
                <div className="dropdown-section">
                  <span className="dropdown-label">Theme</span>
                  <div className="theme-selector">
                    {['dark', 'light', 'retro', 'terminal'].map(t => (
                      <button
                        key={t}
                        className={`theme-dot-btn ${t} ${theme === t ? 'active' : ''}`}
                        onClick={() => setTheme(t)}
                        title={`${t} theme`}
                      />
                    ))}
                  </div>
                </div>
                <div className="dropdown-divider" />
                <button onClick={logout} className="dropdown-item logout-btn">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                    <polyline points="16 17 21 12 16 7"/>
                    <line x1="21" y1="12" x2="9" y2="12"/>
                  </svg>
                  Log out
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="tabs"
      >
        <div 
          className={`tab ${activeTab === 'docket' ? 'active' : ''}`} 
          onClick={() => setActiveTab('docket')}
        >
          Docket
        </div>
        <div 
          className={`tab ${activeTab === 'warmup' ? 'active' : ''}`} 
          onClick={() => setActiveTab('warmup')}
        >
          Warmup
        </div>
      </motion.div>

      {activeTab === 'docket' ? (
        <>
          {/* Brief / Stats Grid (Unified Bordered Unit) */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="brief"
          >
            <TodaysDocket
              tasks={tasks}
              onCardClick={task => setViewingTask(task)}
              onToggle={handleToggleTask}
            />
            <StatsStrip tasks={tasks} />
          </motion.div>

          {/* Controls Row */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="controls"
          >
            <div className="controls-left">
              <div className="search-wrapper">
                <Search className="search-icon" size={16} />
                <input
                  ref={searchInputRef}
                  id="dashboard-search"
                  type="text"
                  className="search"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search the docket…"
                  aria-label="Search the docket"
                />
              </div>
              <select className="filter" value={filter} onChange={e => setFilter(e.target.value)}>
                <option value="all">All entries</option>
                <option value="active">Active entries</option>
                <option value="inactive">Inactive entries</option>
                <option value="today">Due Today</option>
                <option value="week">This Week</option>
                <option value="overdue">Overdue</option>
                <option value="high">High Priority</option>
                <option value="completed">Completed</option>
              </select>
              <select className="filter" value={sortBy} onChange={e => setSortBy(e.target.value)}>
                <option value="priority">Priority</option>
                <option value="dueDate">Due Date</option>
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="alphabetical">A–Z</option>
              </select>
            </div>
            <div className="v-divider" />
            <div className="controls-right">
              <div className="toggle-group">
                <button
                  className={viewMode === 'kanban' ? 'active' : ''}
                  onClick={() => setViewMode('kanban')}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="7" height="7"/>
                    <rect x="14" y="3" width="7" height="7"/>
                    <rect x="3" y="14" width="7" height="7"/>
                    <rect x="14" y="14" width="7" height="7"/>
                  </svg>
                  Board
                </button>
                <button
                  className={viewMode === 'list' ? 'active' : ''}
                  onClick={() => setViewMode('list')}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="8" y1="6" x2="21" y2="6"/>
                    <line x1="8" y1="12" x2="21" y2="12"/>
                    <line x1="8" y1="18" x2="21" y2="18"/>
                    <line x1="3" y1="6" x2="3.01" y2="6"/>
                    <line x1="3" y1="12" x2="3.01" y2="12"/>
                    <line x1="3" y1="18" x2="3.01" y2="18"/>
                  </svg>
                  List
                </button>
              </div>
              <button onClick={() => { setEditingTask(null); setTaskModalOpen(true); }} className="btn-primary">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19"/>
                  <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                File new entry
              </button>
            </div>
          </motion.div>

          {/* Board / List view */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            style={{ marginBottom: '36px' }}
          >
            {viewMode === 'kanban' ? (
              <KanbanBoard
                tasks={tasks}
                search={debouncedSearch}
                isDragging={draggedTaskId !== null}
                onToggle={handleToggleTask}
                onPriorityChange={handlePriorityChange}
                onCardClick={task => setViewingTask(task)}
                onDragStart={id => setDraggedTaskId(id)}
                onDragEnd={() => setDraggedTaskId(null)}
              />
            ) : (
              <TaskList
                tasks={tasks}
                loading={loading}
                error={error}
                search={debouncedSearch}
                onToggle={handleToggleTask}
                onEdit={task => { setEditingTask(task); setTaskModalOpen(true); }}
                onDelete={handleDeleteClick}
                onCardClick={task => setViewingTask(task)}
                onCreateClick={() => { setEditingTask(null); setTaskModalOpen(true); }}
              />
            )}
          </motion.div>

          {/* Daily Log Timeline */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <Timeline refreshTrigger={timelineTrigger} />
          </motion.div>

          {/* Daily Wrap-up */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.6 }}
            className="daily-wrapup" 
            style={{ fontSize: '13px', color: 'var(--text-muted)', fontFamily: 'var(--font-sans)', paddingTop: '24px', paddingBottom: '24px', lineHeight: '1.5' }}
          >
            <span><strong>{wrapUpInfo.completedToday}</strong> task{wrapUpInfo.completedToday === 1 ? '' : 's'} completed today.</span>
            {wrapUpInfo.mostWorkedOn && (
              <span style={{ marginLeft: '12px' }}>Active task: <strong>{wrapUpInfo.mostWorkedOn}</strong>.</span>
            )}
            <span style={{ marginLeft: '12px' }}>See you tomorrow.</span>
          </motion.div>
        </>
      ) : (
        <Warmup onGoToDocket={() => setActiveTab('docket')} />
      )}

      {/* ── MODALS ─────────────────────────────────────────── */}
      <TaskModal
        isOpen={taskModalOpen}
        initialValues={editingTask}
        onSubmit={handleSaveTask}
        onCancel={() => { setTaskModalOpen(false); setEditingTask(null); }}
      />
      <TaskDetailsModal
        isOpen={viewingTask !== null}
        task={viewingTask}
        onSave={handleSaveTaskFromDetails}
        onToggle={handleToggleTask}
        onDelete={handleDeleteClick}
        onCancel={() => setViewingTask(null)}
      />
      <ConfirmModal
        isOpen={confirmModalOpen}
        title="Delete Task"
        message="Are you sure? This cannot be undone."
        onConfirm={handleDeleteConfirm}
        onCancel={() => { setConfirmModalOpen(false); setDeletingTaskId(null); }}
      />
      <ToastStack toasts={toasts} onClose={id => setToasts(prev => prev.filter(t => t.id !== id))} />
    </div>
  );
}
