import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { startInterview, getInterviews } from '../../services/api';
import toast from 'react-hot-toast';
import { Mic, Brain, ChevronRight, Clock, Star, ArrowUpRight } from 'lucide-react';

const JOB_ROLES = [
  'Software Engineer',
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Developer',
  'Data Scientist',
  'DevOps Engineer',
  'Product Manager',
  'UX Designer',
  'Machine Learning Engineer',
  'Cloud Architect',
];

export default function MockInterview() {
  const [form, setForm] = useState({ jobRole: '', difficulty: 'Medium' });
  const [custom, setCustom] = useState('');
  const [loading, setLoading] = useState(false);
  const [pastInterviews, setPastInterviews] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let ignore = false;
    getInterviews()
      .then(({ data }) => {
        if (!ignore && Array.isArray(data)) {
          setPastInterviews(data);
        }
      })
      .catch((err) => console.debug('Failed to load past interviews', err?.message))
      .finally(() => {
        if (!ignore) setLoadingHistory(false);
      });
    return () => {
      ignore = true;
    };
  }, []);

  const handleStart = async () => {
    const role = custom.trim() || form.jobRole;
    if (!role) return toast.error('Please select or enter a job role');
    setLoading(true);
    try {
      const { data } = await startInterview({ jobRole: role, difficulty: form.difficulty });
      toast.success('Interview simulation initialized.');
      navigate(`/interview/${data._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to start interview');
    } finally {
      setLoading(false);
    }
  };

  const getScoreBadge = (score) => {
    if (score >= 80) return { color: '#10b981', bg: 'rgba(16,185,129,0.12)', label: 'Strong Ready' };
    if (score >= 60) return { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', label: 'Good Potential' };
    return { color: '#ef4444', bg: 'rgba(239,68,68,0.12)', label: 'Needs Practice' };
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: 850 }}>
      <div className="page-header">
        <div className="page-header-row">
          <div className="header-icon-box">
            <Mic size={18} strokeWidth={2.4} />
          </div>
          <div>
            <h1>Mock Interview Studio</h1>
            <p>Real-time conversational evaluation, technical probing, and structured rubrics</p>
          </div>
        </div>
      </div>

      {/* Target Role Card */}
      <div className="card mb-2">
        <h4 style={{ marginBottom: '1.25rem' }}>Select Target Role</h4>
        <div className="roles-grid">
          {JOB_ROLES.map((role) => (
            <button
              key={role}
              type="button"
              onClick={() => {
                setForm({ ...form, jobRole: role });
                setCustom('');
              }}
              style={{
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                border: `1px solid ${form.jobRole === role && !custom ? 'var(--primary)' : 'var(--border)'}`,
                background: form.jobRole === role && !custom ? 'rgba(99,102,241,0.12)' : 'var(--bg-input)',
                color: form.jobRole === role && !custom ? 'var(--primary-light)' : 'var(--text-secondary)',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: 500,
                transition: 'all 0.2s',
                textAlign: 'left',
              }}
            >
              {role}
            </button>
          ))}
        </div>
        <div className="form-group" style={{ marginTop: '1rem' }}>
          <label className="form-label">Or enter a custom role</label>
          <input
            value={custom}
            onChange={(e) => {
              setCustom(e.target.value);
              setForm({ ...form, jobRole: '' });
            }}
            className="form-input"
            placeholder="e.g. Site Reliability Engineer, Mobile Architect..."
          />
        </div>
      </div>

      {/* Rigor selection */}
      <div className="card mb-2">
        <h4 style={{ marginBottom: '1.25rem' }}>Assessment Rigor</h4>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {[
            { level: 'Easy', label: 'Associate', q: '3 Questions', desc: 'Core fundamentals' },
            { level: 'Medium', label: 'Mid-Senior', q: '5 Questions', desc: 'System reasoning' },
            { level: 'Hard', label: 'Staff / Lead', q: '7 Questions', desc: 'Deep dive & edge cases' },
          ].map((item) => (
            <button
              key={item.level}
              type="button"
              onClick={() => setForm({ ...form, difficulty: item.level })}
              style={{
                flex: 1,
                minWidth: '180px',
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                border: `1px solid ${form.difficulty === item.level ? 'var(--primary)' : 'var(--border)'}`,
                background: form.difficulty === item.level ? 'rgba(99,102,241,0.12)' : 'var(--bg-input)',
                cursor: 'pointer',
                transition: 'all 0.2s',
                textAlign: 'left',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    color: form.difficulty === item.level ? 'var(--primary-light)' : 'var(--text-muted)',
                  }}
                >
                  {item.level}
                </span>
                <span className="badge badge-primary" style={{ fontSize: '0.7rem', padding: '0.15rem 0.4rem' }}>
                  {item.q}
                </span>
              </div>
              <p style={{ fontWeight: 600, color: form.difficulty === item.level ? '#fff' : 'var(--text-primary)', fontSize: '0.9rem' }}>
                {item.label}
              </p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{item.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {(form.jobRole || custom) && (
        <div className="card mb-2" style={{ borderColor: 'rgba(99,102,241,0.3)', background: 'rgba(99,102,241,0.06)' }}>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <Brain size={20} style={{ color: 'var(--primary)' }} />
            <div>
              <p style={{ fontWeight: 600 }}>{custom || form.jobRole}</p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{form.difficulty} rigor level</p>
            </div>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={handleStart}
        className="btn btn-primary btn-lg"
        disabled={loading || (!form.jobRole && !custom)}
        style={{ width: '100%', marginBottom: '2.5rem' }}
      >
        {loading ? (
          <>
            <span className="spinner-sm" /> Initializing AI Interview Environment...
          </>
        ) : (
          <>
            <Mic size={16} /> Start Interview Simulation <ChevronRight size={16} />
          </>
        )}
      </button>

      {/* Past Interview History */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Clock size={16} style={{ color: 'var(--primary-light)' }} />
            Interview History & Performance Logs
          </h4>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {pastInterviews.length} session{pastInterviews.length === 1 ? '' : 's'} recorded
          </span>
        </div>

        {loadingHistory ? (
          <div style={{ padding: '2rem 0', textAlign: 'center' }}>
            <span className="spinner-sm" />
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Loading session records...</p>
          </div>
        ) : pastInterviews.length === 0 ? (
          <div className="empty-state" style={{ padding: '2rem 1rem' }}>
            <Mic size={36} style={{ color: 'var(--text-muted)', margin: '0 auto 0.75rem' }} />
            <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>No interview simulations completed yet</p>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Select a target role and rigor level above to begin your first AI evaluation.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {pastInterviews.map((session) => {
              const badge = getScoreBadge(session.overallScore || 0);
              const isDone = session.status === 'completed';
              return (
                <div
                  key={session._id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '1rem',
                    padding: '0.9rem 1.1rem',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 'var(--radius-sm)',
                        background: 'rgba(99,102,241,0.12)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--primary-light)',
                        flexShrink: 0,
                      }}
                    >
                      <Mic size={18} />
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <p style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.925rem' }}>
                          {session.jobRole}
                        </p>
                        <span className="badge badge-primary" style={{ fontSize: '0.7rem' }}>
                          {session.difficulty}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                        {new Date(session.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}{' '}
                        • {session.questions?.length || 0} Questions
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    {isDone ? (
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', justifyContent: 'flex-end' }}>
                          <Star size={13} style={{ color: badge.color }} />
                          <span style={{ fontWeight: 800, fontSize: '1.05rem', color: badge.color }}>
                            {session.overallScore}/100
                          </span>
                        </div>
                        <span
                          style={{
                            fontSize: '0.7rem',
                            fontWeight: 600,
                            color: badge.color,
                            background: badge.bg,
                            padding: '0.1rem 0.45rem',
                            borderRadius: '4px',
                          }}
                        >
                          {badge.label}
                        </span>
                      </div>
                    ) : (
                      <span className="badge badge-warning">In Progress</span>
                    )}

                    <Link to={`/interview/${session._id}`} className="btn btn-secondary btn-sm">
                      {isDone ? 'Review Feedback' : 'Resume'} <ArrowUpRight size={13} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
