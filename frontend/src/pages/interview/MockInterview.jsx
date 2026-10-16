import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { startInterview } from '../../services/api';
import toast from 'react-hot-toast';
import { Mic, Brain, ChevronRight } from 'lucide-react';

const JOB_ROLES = ['Software Engineer', 'Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'Data Scientist', 'DevOps Engineer', 'Product Manager', 'UX Designer', 'Machine Learning Engineer', 'Cloud Architect'];

export default function MockInterview() {
  const [form, setForm] = useState({ jobRole: '', difficulty: 'Medium' });
  const [custom, setCustom] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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

  return (
    <div className="animate-fade-in" style={{ maxWidth: 750 }}>
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

      <div className="card mb-2">
        <h4 style={{ marginBottom: '1.25rem' }}>Select Target Role</h4>
        <div className="roles-grid">
          {JOB_ROLES.map((role) => (
            <button key={role} onClick={() => { setForm({ ...form, jobRole: role }); setCustom(''); }}
              style={{
                padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: `1px solid ${form.jobRole === role && !custom ? 'var(--primary)' : 'var(--border)'}`,
                background: form.jobRole === role && !custom ? 'rgba(99,102,241,0.12)' : 'var(--bg-input)',
                color: form.jobRole === role && !custom ? 'var(--primary-light)' : 'var(--text-secondary)',
                cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500, transition: 'all 0.2s', textAlign: 'left',
              }}>
              {role}
            </button>
          ))}
        </div>
        <div className="form-group">
          <label className="form-label">Or enter a custom role</label>
          <input value={custom} onChange={(e) => { setCustom(e.target.value); setForm({ ...form, jobRole: '' }); }} className="form-input" placeholder="e.g. Site Reliability Engineer" />
        </div>
      </div>

      <div className="card mb-2">
        <h4 style={{ marginBottom: '1.25rem' }}>Assessment Rigor</h4>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {[
            { level: 'Easy', label: 'Associate', q: '3 Questions', desc: 'Core fundamentals' },
            { level: 'Medium', label: 'Mid-Senior', q: '5 Questions', desc: 'System reasoning' },
            { level: 'Hard', label: 'Staff / Lead', q: '7 Questions', desc: 'Deep dive & edge cases' }
          ].map((item) => (
            <button key={item.level} onClick={() => setForm({ ...form, difficulty: item.level })}
              style={{
                flex: 1, padding: '1rem', borderRadius: 'var(--radius-md)', border: `1px solid ${form.difficulty === item.level ? 'var(--primary)' : 'var(--border)'}`,
                background: form.difficulty === item.level ? 'rgba(99,102,241,0.12)' : 'var(--bg-input)',
                cursor: 'pointer', transition: 'all 0.2s', textAlign: 'left',
              }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: form.difficulty === item.level ? 'var(--primary-light)' : 'var(--text-muted)' }}>{item.level}</span>
                <span className="badge badge-primary" style={{ fontSize: '0.7rem', padding: '0.15rem 0.4rem' }}>{item.q}</span>
              </div>
              <p style={{ fontWeight: 600, color: form.difficulty === item.level ? '#fff' : 'var(--text-primary)', fontSize: '0.9rem' }}>{item.label}</p>
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
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{form.difficulty} difficulty</p>
            </div>
          </div>
        </div>
      )}

      <button onClick={handleStart} className="btn btn-primary btn-lg" disabled={loading || (!form.jobRole && !custom)}>
        {loading ? <><span className="spinner-sm" />Generating Questions...</> : <><Mic size={16} />Start Interview <ChevronRight size={16} /></>}
      </button>
    </div>
  );
}
