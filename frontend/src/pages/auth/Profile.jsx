import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { updateProfile } from '../../services/api';
import toast from 'react-hot-toast';
import { Save, Plus, X } from 'lucide-react';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    bio: user?.bio || '',
    careerGoal: user?.careerGoal || '',
    skills: user?.skills || [],
  });
  const [newSkill, setNewSkill] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const addSkill = () => {
    if (newSkill.trim() && !form.skills.includes(newSkill.trim())) {
      setForm({ ...form, skills: [...form.skills, newSkill.trim()] });
      setNewSkill('');
    }
  };

  const removeSkill = (skill) => setForm({ ...form, skills: form.skills.filter((s) => s !== skill) });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await updateProfile(form);
      updateUser(data);
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: 800 }}>
      <div className="page-header">
        <h1>My Profile</h1>
        <p>Manage your personal information and career preferences</p>
      </div>

      {/* Avatar Card */}
      <div className="card mb-2" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <div style={{ width: 72, height: 72, background: 'linear-gradient(135deg, var(--primary), var(--secondary))', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 800, color: 'white', flexShrink: 0 }}>
          {user?.name?.[0]?.toUpperCase()}
        </div>
        <div>
          <h3 style={{ marginBottom: '0.25rem' }}>{user?.name}</h3>
          <p style={{ fontSize: '0.875rem', marginBottom: '0.25rem' }}>{user?.email}</p>
          <span className={`badge badge-${user?.role === 'admin' ? 'warning' : 'primary'}`}>{user?.role}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid-2 mb-2">
          <div className="card">
            <h4 style={{ marginBottom: '1.25rem' }}>Personal Information</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input name="name" value={form.name} onChange={handleChange} className="form-input" placeholder="Your full name" />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input value={user?.email} className="form-input" disabled style={{ opacity: 0.5 }} />
              </div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input name="phone" value={form.phone} onChange={handleChange} className="form-input" placeholder="+1 234 567 890" />
              </div>
              <div className="form-group">
                <label className="form-label">Bio</label>
                <textarea name="bio" value={form.bio} onChange={handleChange} className="form-textarea" placeholder="Tell us about yourself..." rows={3} />
              </div>
            </div>
          </div>

          <div className="card">
            <h4 style={{ marginBottom: '1.25rem' }}>Career Preferences</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Career Goal</label>
                <input name="careerGoal" value={form.careerGoal} onChange={handleChange} className="form-input" placeholder="e.g. Full Stack Developer" />
              </div>
              <div className="form-group">
                <label className="form-label">Skills</label>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <input value={newSkill} onChange={(e) => setNewSkill(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())} className="form-input" placeholder="Add a skill..." />
                  <button type="button" onClick={addSkill} className="btn btn-secondary btn-sm"><Plus size={16} /></button>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {form.skills.map((skill) => (
                    <span key={skill} className="badge badge-primary" style={{ cursor: 'pointer' }} onClick={() => removeSkill(skill)}>
                      {skill} <X size={12} />
                    </span>
                  ))}
                  {form.skills.length === 0 && <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No skills added yet</p>}
                </div>
              </div>
            </div>
          </div>
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading} id="save-profile-btn">
          {loading ? <><span className="spinner-sm" />Saving...</> : <><Save size={16} />Save Changes</>}
        </button>
      </form>
    </div>
  );
}
