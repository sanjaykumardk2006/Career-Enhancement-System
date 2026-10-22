import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getSkillGapAnalysis } from '../../services/api';
import toast from 'react-hot-toast';
import { Search, ArrowRight, CheckCircle, AlertCircle, Clock, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

const priorityStyles = { Critical: 'badge-danger', Important: 'badge-warning', 'Nice-to-have': 'badge-muted' };
const relevanceStyles = { High: 'badge-success', Medium: 'badge-warning', Low: 'badge-danger' };

export default function SkillGap() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(Boolean(user?.careerGoal));
  const [form, setForm] = useState({ careerGoal: user?.careerGoal || '', currentSkills: user?.skills?.join(', ') || '' });

  useEffect(() => {
    let ignore = false;
    if (user?.careerGoal) {
      const skills = user.skills || [];
      getSkillGapAnalysis({ careerGoal: user.careerGoal, currentSkills: skills })
        .then((res) => {
          if (!ignore) setData(res.data);
        })
        .catch((err) => console.debug('Initial skill gap fetch:', err?.message))
        .finally(() => {
          if (!ignore) setLoading(false);
        });
    }
    return () => {
      ignore = true;
    };
  }, [user?.careerGoal, user?.skills]);

  const handleAnalyze = async () => {
    if (!form.careerGoal) return toast.error('Please enter a career goal');
    setLoading(true);
    try {
      const skills = form.currentSkills.split(',').map((s) => s.trim()).filter(Boolean);
      const res = await getSkillGapAnalysis({ careerGoal: form.careerGoal, currentSkills: skills });
      setData(res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: 900 }}>
      <div className="page-header">
        <div className="page-header-row">
          <div className="header-icon-box"><BookOpen size={18} strokeWidth={2.4} /></div>
          <div>
            <h1>Skill Gap Matrix</h1>
            <p>Benchmark your current technical profile against market requirements for your target role</p>
          </div>
        </div>
      </div>

      <div className="card mb-2">
        <h4 style={{ marginBottom: '1.25rem' }}>Analyze Your Skills</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Career Goal</label>
            <input value={form.careerGoal} onChange={(e) => setForm({ ...form, careerGoal: e.target.value })} className="form-input" placeholder="e.g. Full Stack Developer" />
          </div>
          <div className="form-group">
            <label className="form-label">Current Skills (comma-separated)</label>
            <input value={form.currentSkills} onChange={(e) => setForm({ ...form, currentSkills: e.target.value })} className="form-input" placeholder="e.g. JavaScript, React, Python, SQL" />
          </div>
          <button onClick={handleAnalyze} className="btn btn-primary" disabled={loading} style={{ alignSelf: 'flex-start' }}>
            {loading ? <><span className="spinner-sm" />Analyzing Profile...</> : <><Search size={16} />Analyze Skills</>}
          </button>
        </div>
      </div>

      {loading && (
        <div className="loading-overlay">
          <div className="spinner" />
          <p>Analyzing technical gaps and proficiency deltas...</p>
        </div>
      )}

      {data && !loading && (
        <>
          {/* Readiness Score */}
          <div className="card mb-2" style={{ textAlign: 'center' }}>
            <p style={{ color: 'var(--text-muted)', marginBottom: '0.5rem', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Genuine Role Readiness Benchmark
            </p>
            <div
              style={{
                fontSize: '3.75rem',
                fontWeight: 800,
                fontFamily: 'Plus Jakarta Sans',
                color: data.overallReadiness >= 75 ? 'var(--success)' : data.overallReadiness >= 40 ? 'var(--warning)' : 'var(--danger)',
                letterSpacing: '-0.03em',
              }}
            >
              {data.overallReadiness}%
            </div>
            <div style={{ display: 'inline-flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <span className={`badge ${data.overallReadiness >= 75 ? 'badge-success' : data.overallReadiness >= 40 ? 'badge-warning' : 'badge-danger'}`}>
                {data.overallReadiness >= 75 ? 'Market Ready' : data.overallReadiness >= 40 ? 'Moderate Alignment' : 'Substantial Gap — Upskilling Required'}
              </span>
            </div>
            <div className="progress-bar" style={{ maxWidth: 360, margin: '0.5rem auto 1rem' }}>
              <div
                className="progress-fill"
                style={{
                  width: `${data.overallReadiness}%`,
                  background: data.overallReadiness >= 75 ? 'var(--success)' : data.overallReadiness >= 40 ? 'var(--warning)' : 'var(--danger)',
                }}
              />
            </div>
            <p style={{ margin: '0 auto', fontSize: '0.875rem', color: 'var(--text-secondary)', maxWidth: 650, lineHeight: 1.6 }}>
              {data.summary}
            </p>
          </div>

          <div className="grid-2">
            {/* Current Skills Assessment */}
            <div className="card">
              <h4 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle size={16} style={{ color: 'var(--success)' }} />Current Skills
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {data.currentSkillsAssessment?.map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>
                    <div>
                      <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>{item.skill}</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Need: {item.proficiencyNeeded}</p>
                    </div>
                    <span className={`badge ${relevanceStyles[item.relevance] || 'badge-muted'}`}>{item.relevance}</span>
                  </div>
                ))}
                {(!data.currentSkillsAssessment || data.currentSkillsAssessment.length === 0) && (
                  <div className="empty-state" style={{ padding: '1.5rem 1rem' }}>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      No matching verified skills yet for this role. You are embarking on a brand new learning journey!
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Missing Skills */}
            <div className="card">
              <h4 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertCircle size={16} style={{ color: 'var(--danger)' }} />Missing Skills
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {data.missingSkills?.map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>
                    <div>
                      <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>{item.skill}</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Clock size={11} />{item.estimatedLearningTime}
                      </p>
                    </div>
                    <span className={`badge ${priorityStyles[item.priority] || 'badge-muted'}`}>{item.priority}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{ marginTop: '1.5rem' }}>
            <Link to="/skills/roadmap" className="btn btn-primary btn-lg">
              Generate Learning Roadmap <ArrowRight size={16} />
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
