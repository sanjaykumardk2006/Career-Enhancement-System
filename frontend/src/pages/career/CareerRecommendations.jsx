import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getCareerRecommendations, updateProfile } from '../../services/api';
import toast from 'react-hot-toast';
import {
  Brain, TrendingUp, RefreshCw, DollarSign, Zap, Sparkles,
  Target, ChevronRight, Check
} from 'lucide-react';

const ALL_CAREER_GOALS = [
  'Full Stack Developer',
  'Frontend Developer',
  'Backend Developer',
  'Data Scientist',
  'Machine Learning Engineer',
  'DevOps Engineer',
  'Cloud Architect',
  'Cybersecurity Analyst',
  'Mobile Developer',
  'Product Manager',
  'UX/UI Designer',
  'Blockchain Developer',
  'AI Solutions Developer',
  'Site Reliability Engineer',
  'Database Administrator',
  'QA Automation Engineer',
];

export default function CareerRecommendations() {
  const { user, updateUser } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(Boolean(user?.careerGoal));
  const [selectedGoal, setSelectedGoal] = useState(user?.careerGoal || 'Full Stack Developer');
  const [customGoal, setCustomGoal] = useState('');
  const [savingGoal, setSavingGoal] = useState(false);
  const [showGoalPicker, setShowGoalPicker] = useState(!user?.careerGoal);

  const fetchRecommendations = async (overrideGoal) => {
    const goal = overrideGoal || user?.careerGoal || selectedGoal;
    if (!goal) return toast.error('Please select a career goal first');
    setLoading(true);
    try {
      const res = await getCareerRecommendations({
        careerGoal: goal,
        currentSkills: user?.skills || [],
        education: user?.education || [],
      });
      setData(res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to get recommendations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;
    const initialGoal = user?.careerGoal || 'Full Stack Developer';
    getCareerRecommendations({
      careerGoal: initialGoal,
      currentSkills: user?.skills || [],
      education: user?.education || [],
    })
      .then((res) => {
        if (!ignore) {
          setData(res.data);
          setSelectedGoal(initialGoal);
        }
      })
      .catch((err) => {
        if (!ignore) toast.error(err.response?.data?.message || 'Failed to get recommendations');
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, [user?.careerGoal, user?.skills, user?.education]);

  const handleApplyGoal = async (goalToApply) => {
    const goal = (goalToApply || customGoal.trim() || selectedGoal).trim();
    if (!goal) return toast.error('Please select or enter a career goal');

    setSavingGoal(true);
    try {
      const { data: updatedUser } = await updateProfile({ careerGoal: goal });
      updateUser(updatedUser);
      setSelectedGoal(goal);
      setCustomGoal('');
      setShowGoalPicker(false);
      toast.success(`Target career goal set to: ${goal}`);
      await fetchRecommendations(goal);
    } catch {
      toast.error('Failed to update career goal');
    } finally {
      setSavingGoal(false);
    }
  };

  const demandColor = { High: 'badge-success', Medium: 'badge-warning', Low: 'badge-danger' };

  return (
    <div className="animate-fade-in" style={{ maxWidth: 950 }}>
      {/* Page Header */}
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div className="page-header-row">
            <div className="header-icon-box">
              <Brain size={18} strokeWidth={2.4} />
            </div>
            <div>
              <h1>AI Career Intelligence & Trajectory</h1>
              <p>Calibrate your target role and generate AI-driven market pathways, salary benchmarks, and immediate actions</p>
            </div>
          </div>

          <button
            onClick={() => fetchRecommendations()}
            className="btn btn-secondary btn-sm"
            disabled={loading}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            {loading ? 'Analyzing...' : 'Recalibrate'}
          </button>
        </div>
      </div>

      {/* EMBEDDED CAREER GOAL SECTION */}
      <div className="card mb-2" style={{ border: '1px solid rgba(99, 102, 241, 0.25)', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05), rgba(6, 182, 212, 0.03))' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: showGoalPicker ? '1.25rem' : 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: 'rgba(99, 102, 241, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-light)', flexShrink: 0 }}>
              <Target size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>
                Target Career Path
              </div>
              <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {user?.careerGoal || selectedGoal}
              </div>
            </div>
          </div>

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => setShowGoalPicker(!showGoalPicker)}
          >
            {showGoalPicker ? 'Collapse Options' : 'Change Career Goal'}
          </button>
        </div>

        {/* Expandable Goal Selector */}
        {showGoalPicker && (
          <div style={{ paddingTop: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.85rem' }}>
              Select a specialized trajectory to instantly calibrate market insights and recommendations:
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.25rem' }}>
              {ALL_CAREER_GOALS.map((goal) => {
                const isCurrent = (user?.careerGoal || selectedGoal) === goal;
                return (
                  <button
                    key={goal}
                    type="button"
                    onClick={() => {
                      setSelectedGoal(goal);
                      setCustomGoal('');
                    }}
                    style={{
                      padding: '0.5rem 0.85rem',
                      borderRadius: 'var(--radius-full)',
                      border: `1px solid ${isCurrent ? 'var(--primary)' : 'var(--border)'}`,
                      background: isCurrent ? 'rgba(79, 70, 229, 0.2)' : 'var(--bg-card)',
                      color: isCurrent ? '#fff' : 'var(--text-secondary)',
                      fontSize: '0.8rem',
                      fontWeight: isCurrent ? 600 : 500,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {isCurrent && <Check size={12} color="var(--primary-light)" />}
                    {goal}
                  </button>
                );
              })}
            </div>

            <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <input
                type="text"
                className="form-input"
                style={{ flex: 1, minWidth: 260 }}
                placeholder="Or specify a custom role (e.g., Quantum Computing Specialist, Rust Developer)..."
                value={customGoal}
                onChange={(e) => setCustomGoal(e.target.value)}
              />
              <button
                type="button"
                className="btn btn-primary btn-sm"
                disabled={savingGoal}
                onClick={() => handleApplyGoal(customGoal || selectedGoal)}
              >
                {savingGoal ? (
                  <>
                    <span className="spinner-sm" /> Calibrating...
                  </>
                ) : (
                  <>
                    <Sparkles size={14} /> Save Goal & Calibrate
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {loading && (
        <div className="loading-overlay">
          <div className="spinner" />
          <p>Calibrating career intelligence for {user?.careerGoal || selectedGoal}...</p>
        </div>
      )}

      {data && !loading && (
        <>
          {/* Career Paths */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
            {data.topCareerPaths?.map((path, i) => (
              <div key={i} className="card" style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
                <div style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary))', borderRadius: 'var(--radius-md)', width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: '1.15rem', flexShrink: 0 }}>
                  {i + 1}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.4rem' }}>
                    <h4 style={{ margin: 0 }}>{path.title}</h4>
                    <span className={`badge ${demandColor[path.demandLevel] || 'badge-muted'}`}>{path.demandLevel} Demand</span>
                  </div>
                  <p style={{ fontSize: '0.875rem', marginBottom: '0.75rem', color: 'var(--text-secondary)' }}>{path.description}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 600 }}>
                      <DollarSign size={14} />{path.averageSalary}
                    </span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--primary-light)', fontWeight: 600 }}>Match Score: {path.matchScore}%</span>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                    {path.requiredSkills?.map((s) => (
                      <span key={s} className="badge badge-muted" style={{ fontSize: '0.75rem' }}>
                        {s}
                      </span>
                    ))}
                  </div>
                  {/* Match score bar */}
                  <div style={{ marginTop: '0.75rem' }}>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${path.matchScore}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Immediate Actions & Insights */}
          <div className="grid-2">
            <div className="card">
              <h4 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Zap size={16} style={{ color: 'var(--accent)' }} /> Immediate Milestones
              </h4>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', listStyle: 'none', padding: 0, margin: 0 }}>
                {data.immediateActions?.map((action, i) => (
                  <li key={i} style={{ display: 'flex', gap: '0.75rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    <span style={{ color: 'var(--primary)', fontWeight: 700, flexShrink: 0 }}>{i + 1}.</span>
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="card">
              <h4 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <TrendingUp size={16} style={{ color: 'var(--secondary)' }} /> Industry Market Trends
              </h4>
              <p style={{ fontSize: '0.875rem', lineHeight: 1.7, color: 'var(--text-secondary)' }}>{data.industryInsights}</p>
              {data.timeToGoal && (
                <div style={{ marginTop: '1rem', padding: '0.75rem 1rem', background: 'rgba(99,102,241,0.08)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', margin: 0 }}>Estimated ramp-up time to target role</p>
                  <p style={{ fontWeight: 700, color: 'var(--primary-light)', fontSize: '0.95rem', margin: '0.2rem 0 0' }}>{data.timeToGoal}</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
