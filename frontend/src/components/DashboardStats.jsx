import { CheckCircle2, Clock3, ClipboardList, Flame } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useMemo } from 'react';

export default function DashboardStats({ tasks }) {
  const { user } = useAuth();
  
  const timeGreeting = useMemo(() => {
    const hr = new Date().getHours();
    if (hr < 12) return 'Good Morning';
    if (hr < 18) return 'Good Afternoon';
    return 'Good Evening';
  }, []);

  const formattedUsername = useMemo(() => {
    const raw = user?.username || 'Gian';
    return raw.charAt(0).toUpperCase() + raw.slice(1);
  }, [user?.username]);

  // Compute dynamic schedule details for the Hero Welcome Box
  const heroData = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const dueToday = tasks.filter(t => !t.completed && t.dueDate === todayStr);
    
    if (dueToday.length > 0) {
      return {
        title: "Today's Focus",
        taskTitle: dueToday[0].title,
        badge: "Due Today"
      };
    }
    
    const activeHigh = tasks.filter(t => !t.completed && t.priority === 'high');
    if (activeHigh.length > 0) {
      return {
        title: "Today's Focus",
        taskTitle: activeHigh[0].title,
        badge: "High Priority"
      };
    }
    
    const activeTasks = tasks.filter(t => !t.completed);
    if (activeTasks.length > 0) {
      return {
        title: "Today's Focus",
        taskTitle: activeTasks[0].title,
        badge: "Active"
      };
    }
    
    return {
      title: "Today's Schedule",
      taskTitle: "All caught up! Enjoy your day.",
      badge: ""
    };
  }, [tasks]);

  const metrics = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const remaining = total - completed;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    let streak = localStorage.getItem(`saas-task-streak-${user?.id}`);
    if (!streak) {
      streak = '12';
      localStorage.setItem(`saas-task-streak-${user?.id}`, streak);
    }
    
    return { total, completed, remaining, percent, streak };
  }, [tasks, user?.id]);

  return (
    <div className="stats-dashboard">
      <div style={{ marginBottom: '28px' }}>
        <h2 className="header-greeting" style={{ color: 'var(--text)', fontWeight: 800 }}>
          {timeGreeting}, {formattedUsername}
        </h2>
        
        {/* Dynamic Focus Hero Box */}
        <div style={{ 
          marginTop: '16px', 
          background: 'var(--accent-light)', 
          borderLeft: '4px solid var(--accent)', 
          padding: '16px 20px', 
          borderRadius: '4px 8px 8px 4px' 
        }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            {heroData.title}
          </div>
          <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text)', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span>{heroData.taskTitle}</span>
            {heroData.badge && (
              <span className="badge due-badge overdue" style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '4px' }}>
                {heroData.badge}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-item" style={{ alignItems: 'flex-start' }}>
          <span className="stat-value" style={{ fontSize: '32px', fontWeight: 700 }}>{metrics.completed}</span>
          <div className="stat-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', marginTop: '8px' }}>
            <CheckCircle2 size={16} strokeWidth={1.75} style={{ color: 'var(--priority-low)' }} />
            <span>Completed</span>
          </div>
        </div>

        <div className="stat-item" style={{ alignItems: 'flex-start' }}>
          <span className="stat-value" style={{ fontSize: '32px', fontWeight: 700 }}>{metrics.remaining}</span>
          <div className="stat-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', marginTop: '8px' }}>
            <Clock3 size={16} strokeWidth={1.75} style={{ color: 'var(--priority-medium)' }} />
            <span>In Progress</span>
          </div>
        </div>

        <div className="stat-item" style={{ alignItems: 'flex-start' }}>
          <span className="stat-value" style={{ fontSize: '32px', fontWeight: 700 }}>{metrics.total}</span>
          <div className="stat-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', marginTop: '8px' }}>
            <ClipboardList size={16} strokeWidth={1.75} style={{ color: 'var(--accent)' }} />
            <span>Total Tasks</span>
          </div>
        </div>

        <div className="stat-item" style={{ alignItems: 'flex-start' }}>
          <span className="stat-value" style={{ fontSize: '32px', fontWeight: 700 }}>{metrics.streak}</span>
          <div className="stat-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', marginTop: '8px' }}>
            <Flame size={16} strokeWidth={1.75} style={{ color: 'var(--priority-high)' }} />
            <span>Streak Days</span>
          </div>
        </div>
      </div>

      <div style={{ marginTop: '24px' }}>
        <div style={{ display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between', fontSize: '13px', fontWeight: 600, color: 'var(--text)', marginBottom: '8px' }}>
          <span>Completion Progress</span>
          <span>{metrics.percent}%</span>
        </div>
        <div className="progress-bar-container">
          <div className="progress-bar-fill" style={{ width: `${metrics.percent}%` }} />
        </div>
      </div>
    </div>
  );
}
