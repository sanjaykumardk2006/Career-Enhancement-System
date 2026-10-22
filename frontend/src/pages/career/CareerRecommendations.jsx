import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getCareerRecommendations, updateProfile } from '../../services/api';
import toast from 'react-hot-toast';
import { Brain, TrendingUp, RefreshCw, DollarSign, Zap, Sparkles, Target, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const POPULAR_GOALS = [
  'Full Stack Developer',
  'Frontend Developer',
  'Backend Developer',
  'Data Scientist',
  'DevOps Engineer',
  'AI/ML Engineer',
  'Cloud Architect',
];

export default function CareerRecommendations() {
  const { user, updateUser } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(Boolean(user?.careerGoal));
  const [quickSelecting, setQuickSelecting] = useState(false);

  const fetchRecommendations = async (overrideGoal) => {
    const goal = overrideGoal || user?.careerGoal;
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
    if (user?.careerGoal) {
      getCareerRecommendations({
        careerGoal: user.careerGoal,
        currentSkills: user.skills || [],
        education: user.education || [],
      })
        .then((res) => {
          if (!ignore) setData(res.data);
        })
        .catch((err) => {
          if (!ignore) toast.error(err.response?.data?.message || 'Failed to get recommendations');
        })
        .finally(() => {
          if (!ignore) setLoading(false);
        });
    }
    return () => {
      ignore = true;
    };
  }, [user?.careerGoal, user?.skills, user?.education]);

  const handleQuickSelectGoal = async (goal) => {
    setQuickSelecting(true);
    try {
      const { data: updatedUser } = await updateProfile({ careerGoal: goal });
      updateUser(updatedUser);
      toast.success(`Career goal calibrated: ${goal}`);
      fetchRecommendations(goal);
    } catch {
      toast.error('Failed to update career goal');
    } finally {
      setQuickSelecting(false);
    }
  };

  const demandColor = { High: 'badge-success', Medium: 'badge-warning', Low: 'badge-danger' };

  return (
    <div className="animate-fade-in" style={{ maxWidth: 900 }}>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div className="page-header-row">
            <div className="header-icon-box"><Brain size={18} strokeWidth={2.4} /></div>
            <div>
              <h1>Career Intelligence & Pathways</h1>
              <p>Personalized market trajectory analysis calibrated to your profile and competencies</p>
            </div>
          </div>
          {user?.careerGoal && (
            <button onClick={() => fetchRecommendations()} className="btn btn-secondary" disabled={loading}>
              <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
              {loading ? 'Analyzing...' : 'Recalibrate'}
            </button>
          )}
        </div>
      </div>

      {!user?.careerGoal && (
        <div className="card mb-2" style={{ padding: '2.5rem 1.75rem', textAlign: 'center' }}>
          <div style={{ width: 64, height: 64, background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
            <Target size={30} style={{ color: 'var(--primary)' }} />
          </div>
          <h3 style={{ marginBottom: '0.5rem' }}>Choose Your Desired Career Trajectory</h3>
          <p style={{ color: 'var(--text-muted)', maxWidth: 520, margin: '0 auto 1.75rem', fontSize: '0.925rem' }}>
            Select a target role below to instantly trigger tailored market demand analytics, compensation insights, and required skills.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', justifyContent: 'center', maxWidth: 640, margin: '0 auto 2rem' }}>
            {POPULAR_GOALS.map((goal) => (
              <button
                key={goal}
                onClick={() => handleQuickSelectGoal(goal)}
                disabled={quickSelecting}
                className="btn btn-secondary"
                style={{ fontSize: '0.875rem', borderRadius: 'var(--radius-full)', padding: '0.55rem 1.1rem' }}
              >
                <Sparkles size={14} style={{ color: 'var(--primary-light)' }} />
                {goal}
              </button>
            ))}
          </div>

          <Link to="/career/goals" className="btn btn-primary">
            Explore All 16+ Career Paths <ArrowRight size={16} />
          </Link>
        </div>
      )}

      {loading && (
        <div className="loading-overlay">
          <div className="spinner" />
          <p>Gemini AI is analyzing your profile...</p>
        </div>
      )}

      {data && !loading && (
        <>
          {/* Career Paths */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
            {data.topCareerPaths?.map((path, i) => (
              <div key={i} className="card" style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
                <div style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary))', borderRadius: 'var(--radius-md)', width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: '1.2rem', flexShrink: 0 }}>
                  {i + 1}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                    <h4>{path.title}</h4>
                    <span className={`badge ${demandColor[path.demandLevel] || 'badge-muted'}`}>{path.demandLevel} Demand</span>
                  </div>
                  <p style={{ fontSize: '0.875rem', marginBottom: '0.75rem' }}>{path.description}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <DollarSign size={14} />{path.averageSalary}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--primary-light)' }}>Match: {path.matchScore}%</span>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                    {path.requiredSkills?.map((s) => <span key={s} className="badge badge-muted">{s}</span>)}
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
                <Zap size={16} style={{ color: 'var(--accent)' }} />Immediate Actions
              </h4>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', listStyle: 'none' }}>
                {data.immediateActions?.map((action, i) => (
                  <li key={i} style={{ display: 'flex', gap: '0.75rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    <span style={{ color: 'var(--primary)', fontWeight: 700, flexShrink: 0 }}>{i + 1}.</span>{action}
                  </li>
                ))}
              </ul>
            </div>
            <div className="card">
              <h4 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <TrendingUp size={16} style={{ color: 'var(--secondary)' }} />Industry Insights
              </h4>
              <p style={{ fontSize: '0.875rem', lineHeight: 1.7 }}>{data.industryInsights}</p>
              {data.timeToGoal && (
                <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'rgba(99,102,241,0.08)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Estimated time to goal</p>
                  <p style={{ fontWeight: 700, color: 'var(--primary-light)' }}>{data.timeToGoal}</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
