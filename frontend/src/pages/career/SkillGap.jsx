import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getSkillGapAnalysis } from '../../services/api';
import toast from 'react-hot-toast';
import { BookOpen, Search, ArrowRight, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

const priorityStyles = { Critical: 'badge-danger', Important: 'badge-warning', 'Nice-to-have': 'badge-muted' };
const relevanceStyles = { High: 'badge-success', Medium: 'badge-warning', Low: 'badge-danger' };

export default function SkillGap() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ careerGoal: user?.careerGoal || '', currentSkills: user?.skills?.join(', ') || '' });

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
        <h1>📊 Skill Gap Analysis</h1>
        <p>Discover which skills you need to develop to reach your career goal</p>
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
            {loading ? <><span className="spinner-sm" />Analyzing with AI...</> : <><Search size={16} />Analyze Skills</>}
          </button>
        </div>
      </div>

      {loading && (
        <div className="loading-overlay">
          <div className="spinner" />
          <p>AI is analyzing your skill gaps...</p>
        </div>
      )}

      {data && !loading && (
        <>
          {/* Readiness Score */}
          <div className="card mb-2" style={{ textAlign: 'center' }}>
            <p style={{ color: 'var(--text-muted)', marginBottom: '0.75rem' }}>Overall Career Readiness</p>
            <div style={{ fontSize: '3.5rem', fontWeight: 900, fontFamily: 'Outfit', background: 'linear-gradient(135deg, var(--primary-light), var(--secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              {data.overallReadiness}%
            </div>
            <div className="progress-bar" style={{ maxWidth: 300, margin: '1rem auto 0' }}>
              <div className="progress-fill" style={{ width: `${data.overallReadiness}%` }} />
            </div>
            <p style={{ marginTop: '0.75rem', fontSize: '0.875rem' }}>{data.summary}</p>
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
