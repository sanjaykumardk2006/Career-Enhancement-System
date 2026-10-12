import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { updateProfile } from '../../services/api';
import toast from 'react-hot-toast';
import { Target, Sparkles, ChevronRight } from 'lucide-react';

const CAREER_GOALS = [
  'Full Stack Developer', 'Frontend Developer', 'Backend Developer', 'Data Scientist',
  'Machine Learning Engineer', 'DevOps Engineer', 'Cloud Architect', 'Cybersecurity Analyst',
  'Product Manager', 'UX/UI Designer', 'Mobile Developer', 'Blockchain Developer',
  'Game Developer', 'AI/ML Researcher', 'Database Administrator', 'QA Engineer',
];

export default function CareerGoals() {
  const { user, updateUser } = useAuth();
  const [selected, setSelected] = useState(user?.careerGoal || '');
  const [custom, setCustom] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSave = async () => {
    const goal = custom.trim() || selected;
    if (!goal) return toast.error('Please select or enter a career goal');
    setLoading(true);
    try {
      const { data } = await updateProfile({ careerGoal: goal });
      updateUser(data);
      toast.success('Career goal saved! Getting AI recommendations...');
      navigate('/career/recommendations');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save goal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: 800 }}>
      <div className="page-header">
        <h1>🎯 Career Goal Selection</h1>
        <p>Choose your target career path to get personalized AI guidance and roadmap</p>
      </div>

      <div className="card mb-2">
        <h4 style={{ marginBottom: '1.25rem' }}>Select a Career Path</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
          {CAREER_GOALS.map((goal) => (
            <button key={goal} onClick={() => { setSelected(goal); setCustom(''); }}
              className={`goal-option ${selected === goal && !custom ? 'selected' : ''}`}
              style={{
                padding: '0.875rem 1rem',
                borderRadius: 'var(--radius-md)',
                border: `1px solid ${selected === goal && !custom ? 'var(--primary)' : 'var(--border)'}`,
                background: selected === goal && !custom ? 'rgba(99,102,241,0.12)' : 'var(--bg-input)',
                color: selected === goal && !custom ? 'var(--primary-light)' : 'var(--text-secondary)',
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontWeight: 500,
                transition: 'all 0.2s',
                textAlign: 'left',
              }}>
              {goal}
            </button>
          ))}
        </div>
      </div>

      <div className="card mb-2">
        <h4 style={{ marginBottom: '1rem' }}>Or Enter a Custom Goal</h4>
        <input value={custom} onChange={(e) => { setCustom(e.target.value); setSelected(''); }} className="form-input" placeholder="e.g. Site Reliability Engineer, Quantum Computing Researcher..." />
      </div>

      {(selected || custom) && (
        <div className="card mb-2" style={{ borderColor: 'rgba(99,102,241,0.3)', background: 'rgba(99,102,241,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Target size={20} style={{ color: 'var(--primary)' }} />
            <div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Your Selected Goal</p>
              <p style={{ fontWeight: 700, color: 'var(--primary-light)', fontSize: '1.1rem' }}>{custom || selected}</p>
            </div>
          </div>
        </div>
      )}

      <button onClick={handleSave} className="btn btn-primary btn-lg" disabled={loading || (!selected && !custom)}>
        {loading ? <><span className="spinner-sm" />Processing...</> : <><Sparkles size={16} />Save & Get AI Recommendations <ChevronRight size={16} /></>}
      </button>
    </div>
  );
}
