import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { generateRoadmap, getRoadmap, updateTopicProgress } from '../../services/api';
import toast from 'react-hot-toast';
import { BookOpen, CheckCircle, Circle, ExternalLink, ChevronDown, ChevronUp, Sparkles, Compass } from 'lucide-react';

const resourceTypeIcon = { Video: '🎬', Article: '📄', Course: '🎓', Book: '📚', Practice: '💻' };

export default function LearningRoadmap() {
  const { user } = useAuth();
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [expandedPhases, setExpandedPhases] = useState({});
  const [form, setForm] = useState({ careerGoal: user?.careerGoal || '', currentSkills: user?.skills?.join(', ') || '', skillGaps: '' });

  useEffect(() => {
    const fetchRoadmap = async () => {
      try {
        const { data } = await getRoadmap();
        setRoadmap(data);
        setExpandedPhases({ 0: true });
      } catch (err) {
        // No roadmap generated yet
        console.debug('No roadmap found for user', err?.message);
      }
      setLoading(false);
    };
    fetchRoadmap();
  }, []);

  const handleGenerate = async () => {
    if (!form.careerGoal) return toast.error('Please enter a career goal');
    setGenerating(true);
    try {
      const skills = form.currentSkills.split(',').map((s) => s.trim()).filter(Boolean);
      const gaps = form.skillGaps.split(',').map((s) => s.trim()).filter(Boolean);
      const { data } = await generateRoadmap({ careerGoal: form.careerGoal, currentSkills: skills, skillGaps: gaps });
      setRoadmap(data);
      setExpandedPhases({ 0: true });
      toast.success('Curriculum roadmap generated.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate roadmap');
    } finally {
      setGenerating(false);
    }
  };

  const toggleTopic = async (phaseIndex, topicIndex, currentState) => {
    try {
      const { data } = await updateTopicProgress({ phaseIndex, topicIndex, completed: !currentState });
      setRoadmap(data);
      toast.success(!currentState ? 'Topic completed.' : 'Topic marked incomplete.');
    } catch { toast.error('Failed to update progress'); }
  };

  if (loading) return <div className="loading-overlay"><div className="spinner" /><p>Loading roadmap...</p></div>;

  return (
    <div className="animate-fade-in" style={{ maxWidth: 900 }}>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div className="page-header-row">
            <div className="header-icon-box"><Compass size={18} strokeWidth={2.4} /></div>
            <div>
              <h1>Curriculum Roadmap</h1>
              <p>Milestone-based competency development path calibrated to your target trajectory</p>
            </div>
          </div>
          {roadmap && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Curriculum Progress</p>
                <p style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary-light)' }}>{roadmap.overallProgress}%</p>
              </div>
              <div style={{ width: 56, height: 56, position: 'relative' }}>
                <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="var(--border)" strokeWidth="3" />
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="var(--primary)" strokeWidth="3" strokeDasharray={`${roadmap.overallProgress} ${100 - roadmap.overallProgress}`} strokeLinecap="round" />
                </svg>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Generate Form */}
      <div className="card mb-2">
        <h4 style={{ marginBottom: '1rem' }}>
          {roadmap ? 'Recalibrate Curriculum Roadmap' : 'Generate Curriculum Roadmap'}
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Career Goal</label>
              <input value={form.careerGoal} onChange={(e) => setForm({ ...form, careerGoal: e.target.value })} className="form-input" placeholder="Full Stack Developer" />
            </div>
            <div className="form-group">
              <label className="form-label">Current Skills</label>
              <input value={form.currentSkills} onChange={(e) => setForm({ ...form, currentSkills: e.target.value })} className="form-input" placeholder="JavaScript, HTML, CSS" />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Skill Gaps (optional - from Skill Gap Analysis)</label>
            <input value={form.skillGaps} onChange={(e) => setForm({ ...form, skillGaps: e.target.value })} className="form-input" placeholder="Node.js, MongoDB, Docker, AWS" />
          </div>
          <button onClick={handleGenerate} className="btn btn-primary" disabled={generating} style={{ alignSelf: 'flex-start' }}>
            {generating ? <><span className="spinner-sm" />Generating with AI...</> : <><Sparkles size={16} />{roadmap ? 'Regenerate' : 'Generate Roadmap'}</>}
          </button>
        </div>
      </div>

      {/* Roadmap Phases */}
      {roadmap?.roadmap?.map((phase, pIdx) => {
        const completedTopics = phase.topics?.filter((t) => t.completed).length;
        const totalTopics = phase.topics?.length;
        const isExpanded = expandedPhases[pIdx];

        return (
          <div key={pIdx} className="card mb-2">
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }}
              onClick={() => setExpandedPhases({ ...expandedPhases, [pIdx]: !isExpanded })}>
              <div style={{ width: 44, height: 44, background: `linear-gradient(135deg, var(--primary), var(--secondary))`, borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, flexShrink: 0 }}>
                {phase.phase}
              </div>
              <div style={{ flex: 1 }}>
                <h4>{phase.title}</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{phase.duration} • {completedTopics}/{totalTopics} topics</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span className="badge badge-primary">{Math.round((completedTopics / totalTopics) * 100)}%</span>
                {isExpanded ? <ChevronUp size={18} style={{ color: 'var(--text-muted)' }} /> : <ChevronDown size={18} style={{ color: 'var(--text-muted)' }} />}
              </div>
            </div>

            {isExpanded && (
              <div style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {phase.topics?.map((topic, tIdx) => (
                  <div key={tIdx} style={{ padding: '1rem', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)', border: `1px solid ${topic.completed ? 'rgba(16,185,129,0.3)' : 'var(--border)'}`, transition: 'all 0.2s' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                      <button onClick={() => toggleTopic(pIdx, tIdx, topic.completed)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: topic.completed ? 'var(--success)' : 'var(--text-muted)', display: 'flex' }}>
                        {topic.completed ? <CheckCircle size={20} /> : <Circle size={20} />}
                      </button>
                      <p style={{ fontWeight: 600, fontSize: '0.9rem', color: topic.completed ? 'var(--text-muted)' : 'var(--text-primary)', textDecoration: topic.completed ? 'line-through' : 'none' }}>
                        {topic.name}
                      </p>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', paddingLeft: '2rem' }}>
                      {topic.resources?.map((r, rIdx) => (
                        <a key={rIdx} href={r.url} target="_blank" rel="noopener noreferrer"
                          style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.3rem 0.75rem', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-full)', color: 'var(--text-secondary)', fontSize: '0.78rem', textDecoration: 'none', transition: 'all 0.2s' }}
                          onMouseEnter={(e) => { e.target.style.borderColor = 'var(--primary)'; e.target.style.color = 'var(--primary-light)'; }}
                          onMouseLeave={(e) => { e.target.style.borderColor = 'var(--border)'; e.target.style.color = 'var(--text-secondary)'; }}>
                          {resourceTypeIcon[r.type] || '🔗'} {r.title} <ExternalLink size={10} />
                        </a>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}

      {!roadmap && !loading && (
        <div className="card empty-state">
          <BookOpen size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 1rem' }} />
          <h3>No Roadmap Yet</h3>
          <p>Generate a personalized learning roadmap based on your career goal and skills</p>
        </div>
      )}
    </div>
  );
}
