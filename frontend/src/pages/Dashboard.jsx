import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getJobApplications, getInterviews, getRoadmap } from '../services/api';
import {
  Brain, FileText, Mic, Briefcase, TrendingUp, BookOpen,
  ChevronRight, Target, MessageSquare, ArrowUpRight, ShieldCheck
} from 'lucide-react';
import './Dashboard.css';

const quickActions = [
  { to: '/career/recommendations', icon: Brain, label: 'AI Career Intelligence', color: '#818cf8', bg: 'rgba(79,70,229,0.12)' },
  { to: '/resume/builder', icon: FileText, label: 'Resume Builder', color: '#38bdf8', bg: 'rgba(2,132,199,0.12)' },
  { to: '/interview', icon: Mic, label: 'Mock Interview Studio', color: '#fbbf24', bg: 'rgba(217,119,6,0.12)' },
  { to: '/skills/gap', icon: BookOpen, label: 'Skill Gap Matrix', color: '#34d399', bg: 'rgba(5,150,105,0.12)' },
  { to: '/jobs', icon: Briefcase, label: 'Pipeline Tracker', color: '#f472b6', bg: 'rgba(219,39,119,0.12)' },
  { to: '/career/chatbot', icon: MessageSquare, label: 'Career Copilot', color: '#a78bfa', bg: 'rgba(124,58,237,0.12)' },
];

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ jobs: 0, interviews: 0, progress: 0 });
  const [recentJobs, setRecentJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [jobsRes, interviewsRes] = await Promise.allSettled([getJobApplications(), getInterviews()]);
        const jobs = jobsRes.status === 'fulfilled' ? jobsRes.value.data : [];
        const interviews = interviewsRes.status === 'fulfilled' ? interviewsRes.value.data : [];
        let progress = 0;
        try {
          const roadmapRes = await getRoadmap();
          progress = roadmapRes.data.overallProgress || 0;
        } catch (err) {
          console.debug('No roadmap found yet', err?.message);
        }
        setStats({ jobs: jobs.length, interviews: interviews.length, progress });
        setRecentJobs(jobs.slice(0, 3));
      } catch (err) {
        console.debug('Dashboard data error', err?.message);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const statusBadge = {
    Applied: 'badge-primary',
    Screening: 'badge-warning',
    Interview: 'badge-secondary',
    Offer: 'badge-success',
    Rejected: 'badge-danger',
    Withdrawn: 'badge-muted',
  };

  return (
    <div className="dashboard animate-fade-in">
      {/* Administrator Simulator Banner */}
      {user?.role === 'admin' && (
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.12), rgba(217, 119, 6, 0.08))',
            border: '1px solid rgba(245, 158, 11, 0.35)',
            borderRadius: 'var(--radius-lg)',
            padding: '1rem 1.25rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 'var(--radius-md)',
                background: 'rgba(245, 158, 11, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fbbf24',
                flexShrink: 0,
              }}
            >
              <ShieldCheck size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#fbbf24' }}>
                Administrator Mode: Student Portal Simulator
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                You are previewing the platform through candidate eyes. To govern users, inspect portfolios, or review institutional metrics, switch to Executive Console.
              </div>
            </div>
          </div>
          <Link
            to="/admin"
            className="btn btn-primary btn-sm"
            style={{
              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
              borderColor: '#f59e0b',
              color: '#000',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            Open Executive Console <ArrowUpRight size={14} />
          </Link>
        </div>
      )}

      {/* Hero Banner */}
      <div className="dashboard-hero">
        <div className="hero-content">
          <div className="hero-status-pill">
            <span className="status-dot" />
            <span>CareerOS Intelligence Active</span>
          </div>

          <h1 className="hero-name">
            {getGreeting()}, {user?.name?.split(' ')[0] || 'Member'}
          </h1>

          <p className="hero-sub">
            {user?.careerGoal ? (
              <>
                Target Career Path:{' '}
                <span className="hero-goal-badge">
                  <Target size={13} /> {user.careerGoal}
                </span>
              </>
            ) : (
              'Define your target career path to calibrate personalized AI roadmap and mock interview scenarios.'
            )}
          </p>

          {!user?.careerGoal && (
            <Link to="/career/goals" className="btn btn-primary btn-sm">
              <Target size={14} /> Set Career Goal
            </Link>
          )}
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid-3 mb-2">
        {[
          { label: 'Active Pipeline', value: stats.jobs, icon: Briefcase, color: '#818cf8', bg: 'rgba(79,70,229,0.12)' },
          { label: 'Completed Interviews', value: stats.interviews, icon: Mic, color: '#38bdf8', bg: 'rgba(2,132,199,0.12)' },
          { label: 'Curriculum Progress', value: `${stats.progress}%`, icon: TrendingUp, color: '#34d399', bg: 'rgba(5,150,105,0.12)' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="stat-card">
            <div className="stat-icon" style={{ background: bg }}>
              <Icon size={20} style={{ color }} strokeWidth={2.2} />
            </div>
            <div className="stat-info">
              <div className="stat-value">{value}</div>
              <div className="stat-label">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="section-header mb-1">
        <h3>Platform Workspaces</h3>
      </div>
      <div className="quick-actions">
        {quickActions.map(({ to, icon: Icon, label, color, bg }) => (
          <Link key={to} to={to} className="quick-action-card">
            <div className="qa-icon" style={{ background: bg }}>
              <Icon size={18} style={{ color }} strokeWidth={2.2} />
            </div>
            <span>{label}</span>
            <ChevronRight size={14} className="qa-arrow" />
          </Link>
        ))}
      </div>

      {/* Recent Applications */}
      <div className="section-header mt-2">
        <h3>Recent Pipeline Activity</h3>
        <Link to="/jobs" className="btn btn-ghost btn-sm">
          View Pipeline <ArrowUpRight size={14} />
        </Link>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {[1, 2, 3].map((i) => (
            <div key={i} className="card" style={{ height: '64px', opacity: 0.5 }} />
          ))}
        </div>
      ) : recentJobs.length > 0 ? (
        <div className="recent-jobs">
          {recentJobs.map((job) => (
            <div key={job._id} className="recent-job-card">
              <div className="job-company-avatar">
                {job.company[0]?.toUpperCase()}
              </div>
              <div className="job-info">
                <p className="job-position">{job.position}</p>
                <p className="job-company">
                  {job.company} · {job.jobType}
                </p>
              </div>
              <span className={`badge ${statusBadge[job.status] || 'badge-muted'}`}>
                {job.status}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="card empty-state">
          <Briefcase size={32} style={{ color: 'var(--text-muted)', margin: '0 auto 0.75rem' }} />
          <h3>No applications tracked yet</h3>
          <p>Begin tracking your job applications, interviews, and offers in one organized pipeline.</p>
          <Link to="/jobs" className="btn btn-secondary btn-sm mt-1">
            Add First Application
          </Link>
        </div>
      )}
    </div>
  );
}
