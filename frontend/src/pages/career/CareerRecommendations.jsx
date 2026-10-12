import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getCareerRecommendations } from '../../services/api';
import toast from 'react-hot-toast';
import { Brain, TrendingUp, Sparkles, RefreshCw, DollarSign, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CareerRecommendations() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchRecommendations = async () => {
    if (!user?.careerGoal) return toast.error('Please set a career goal first');
    setLoading(true);
    try {
      const res = await getCareerRecommendations({
        careerGoal: user.careerGoal,
        currentSkills: user.skills || [],
        education: user.education || [],
      });
      setData(res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to get recommendations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (user?.careerGoal) fetchRecommendations(); }, []);

  const demandColor = { High: 'badge-success', Medium: 'badge-warning', Low: 'badge-danger' };

  return (
    <div className="animate-fade-in" style={{ maxWidth: 900 }}>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1>🤖 AI Career Recommendations</h1>
            <p>Personalized career paths based on your profile and AI analysis</p>
          </div>
          <button onClick={fetchRecommendations} className="btn btn-secondary" disabled={loading}>
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            {loading ? 'Analyzing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {!user?.careerGoal && (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <Brain size={48} style={{ color: 'var(--primary)', margin: '0 auto 1rem' }} />
          <h3>Set Your Career Goal First</h3>
          <p style={{ marginBottom: '1.5rem' }}>AI recommendations are personalized based on your career goal and skills</p>
          <Link to="/career/goals" className="btn btn-primary">Set Career Goal</Link>
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
