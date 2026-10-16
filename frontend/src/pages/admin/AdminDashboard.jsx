import { useState, useEffect } from 'react';
import { adminGetStats } from '../../services/api';
import toast from 'react-hot-toast';
import { Users, Briefcase, Mic, FileText, Clock, ShieldCheck } from 'lucide-react';
import { Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const STATUS_COLORS = { Applied: '#6366f1', Screening: '#f59e0b', Interview: '#06b6d4', Offer: '#10b981', Rejected: '#ef4444', Withdrawn: '#6060a0' };

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminGetStats().then(({ data }) => { setStats(data); setLoading(false); })
      .catch(() => { toast.error('Failed to load stats'); setLoading(false); });
  }, []);

  if (loading) return <div className="loading-overlay"><div className="spinner" /><p>Loading executive telemetry...</p></div>;
  if (!stats) return null;

  const pieData = stats.jobsByStatus?.map((s) => ({ name: s._id, value: s.count, color: STATUS_COLORS[s._id] || '#6060a0' }));

  return (
    <div className="animate-fade-in" style={{ maxWidth: 1100 }}>
      <div className="page-header">
        <div className="page-header-row">
          <div className="header-icon-box">
            <ShieldCheck size={18} strokeWidth={2.4} />
          </div>
          <div>
            <h1>Executive Console</h1>
            <p>Real-time platform telemetry, user engagement metrics, and administrative oversight</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid-4 mb-2">
        {[
          { label: 'Total Students', value: stats.totalUsers, icon: Users, color: '#6366f1', bg: 'rgba(99,102,241,0.12)' },
          { label: 'Job Applications', value: stats.totalJobs, icon: Briefcase, color: '#06b6d4', bg: 'rgba(6,182,212,0.12)' },
          { label: 'Mock Interviews', value: stats.totalInterviews, icon: Mic, color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
          { label: 'Resumes Created', value: stats.totalResumes, icon: FileText, color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="stat-card">
            <div className="stat-icon" style={{ background: bg }}><Icon size={22} style={{ color }} /></div>
            <div className="stat-info">
              <div className="stat-value">{value}</div>
              <div className="stat-label">{label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid-2 mb-2">
        {/* Jobs by Status Chart */}
        <div className="card">
          <h4 style={{ marginBottom: '1.25rem' }}>Applications by Status</h4>
          {pieData && pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={68} dataKey="value" label={({ name, value }) => `${name}: ${value}`} labelLine={false} fontSize={11}>
                  {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-primary)' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : <div className="empty-state"><p>No job applications yet</p></div>}
        </div>

        {/* Interview Stats */}
        <div className="card">
          <h4 style={{ marginBottom: '1.25rem' }}>Interview Statistics</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ padding: '1rem', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Total Started</span>
              <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{stats.totalInterviews}</span>
            </div>
            <div style={{ padding: '1rem', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Completed</span>
              <span style={{ fontWeight: 700, color: 'var(--success)' }}>{stats.completedInterviews}</span>
            </div>
            <div style={{ padding: '1rem', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Completion Rate</span>
              <span style={{ fontWeight: 700, color: 'var(--primary-light)' }}>
                {stats.totalInterviews > 0 ? Math.round((stats.completedInterviews / stats.totalInterviews) * 100) : 0}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Users */}
      <div className="card">
        <h4 style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Clock size={16} style={{ color: 'var(--secondary)' }} />Recent Registrations
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {stats.recentUsers?.map((u) => (
            <div key={u._id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem 1rem', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ width: 34, height: 34, background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-light)', fontWeight: 700, fontSize: '0.85rem', flexShrink: 0 }}>
                {u.name[0]?.toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{u.name}</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.email}</p>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(u.createdAt).toLocaleDateString()}</span>
            </div>
          ))}
          {stats.recentUsers?.length === 0 && <div className="empty-state"><p>No users registered yet</p></div>}
        </div>
      </div>
    </div>
  );
}
