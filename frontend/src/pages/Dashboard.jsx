import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getJobApplications, getInterviews, getRoadmap } from '../services/api';
import { Brain, FileText, Mic, Briefcase, TrendingUp, BookOpen, ChevronRight, Zap, Target } from 'lucide-react';
import './Dashboard.css';

const quickActions = [
  { to: '/career/recommendations', icon: Brain, label: 'AI Career Advice', color: '#6366f1', bg: 'rgba(99,102,241,0.1)' },
  { to: '/resume/builder', icon: FileText, label: 'Build Resume', color: '#06b6d4', bg: 'rgba(6,182,212,0.1)' },
  { to: '/interview', icon: Mic, label: 'Mock Interview', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  { to: '/skills/gap', icon: BookOpen, label: 'Skill Gap', color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
  { to: '/jobs', icon: Briefcase, label: 'Job Tracker', color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
  { to: '/career/chatbot', icon: Zap, label: 'CareerBot', color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)' },
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
        try { const roadmapRes = await getRoadmap(); progress = roadmapRes.data.overallProgress || 0; } catch {}
        setStats({ jobs: jobs.length, interviews: interviews.length, progress });
        setRecentJobs(jobs.slice(0, 3));
      } catch (e) {}
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

  const statusColor = { Applied: '#6366f1', Screening: '#f59e0b', Interview: '#06b6d4', Offer: '#10b981', Rejected: '#ef4444', Withdrawn: '#6060a0' };

  return (
    <div className="dashboard animate-fade-in">
      {/* Hero */}
      <div className="dashboard-hero">
        <div className="hero-content">
          <div className="hero-greeting">
            <span className="greeting-wave">👋</span>
            <span>{getGreeting()},</span>
          </div>
          <h1 className="hero-name">{user?.name?.split(' ')[0] || 'Student'}</h1>
          <p className="hero-sub">
            {user?.careerGoal ? `Working towards: ${user.careerGoal}` : 'Set your career goal to get personalized AI recommendations'}
          </p>
          {!user?.careerGoal && (
            <Link to="/career/goals" className="btn btn-primary btn-sm">
              <Target size={14} /> Set Career Goal
            </Link>
          )}
        </div>
        <div className="hero-graphic">
          <div className="hero-orb orb-1" />
          <div className="hero-orb orb-2" />
          <div className="hero-orb orb-3" />
        </div>
      </div>

      {/* Stats */}
      <div className="grid-3 mb-2">
        {[
          { label: 'Jobs Applied', value: stats.jobs, icon: Briefcase, color: '#6366f1', bg: 'rgba(99,102,241,0.12)' },
          { label: 'Interviews Done', value: stats.interviews, icon: Mic, color: '#06b6d4', bg: 'rgba(6,182,212,0.12)' },
          { label: 'Learning Progress', value: `${stats.progress}%`, icon: TrendingUp, color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="stat-card">
            <div className="stat-icon" style={{ background: bg }}>
              <Icon size={22} style={{ color }} />
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
        <h3>Quick Actions</h3>
      </div>
      <div className="quick-actions">
        {quickActions.map(({ to, icon: Icon, label, color, bg }) => (
          <Link key={to} to={to} className="quick-action-card">
            <div className="qa-icon" style={{ background: bg }}>
              <Icon size={20} style={{ color }} />
            </div>
            <span>{label}</span>
            <ChevronRight size={14} className="qa-arrow" />
          </Link>
        ))}
      </div>

      {/* Recent Jobs */}
      <div className="section-header mt-2">
        <h3>Recent Applications</h3>
        <Link to="/jobs" className="btn btn-ghost btn-sm">View All <ChevronRight size={14} /></Link>
      </div>
      {loading ? (
        <div className="skeleton-list">
          {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: '64px', marginBottom: '0.75rem' }} />)}
        </div>
      ) : recentJobs.length > 0 ? (
        <div className="recent-jobs">
          {recentJobs.map((job) => (
            <div key={job._id} className="recent-job-card">
              <div className="job-company-avatar">{job.company[0]?.toUpperCase()}</div>
              <div className="job-info">
                <p className="job-position">{job.position}</p>
                <p className="job-company">{job.company} • {job.jobType}</p>
              </div>
              <span className="badge" style={{ background: `${statusColor[job.status]}18`, color: statusColor[job.status], border: `1px solid ${statusColor[job.status]}40` }}>
                {job.status}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="card empty-state">
          <Briefcase size={36} style={{ color: 'var(--text-muted)', margin: '0 auto 0.75rem' }} />
          <h3>No applications yet</h3>
          <p>Start tracking your job applications</p>
          <Link to="/jobs" className="btn btn-primary btn-sm mt-1">Add Application</Link>
        </div>
      )}
    </div>
  );
}
