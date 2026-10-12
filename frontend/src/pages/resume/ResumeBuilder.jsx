import { useState, useEffect } from 'react';
import { getResume, updateResume } from '../../services/api';
import toast from 'react-hot-toast';
import { Plus, Trash2, Save } from 'lucide-react';
import './ResumeBuilder.css';

const TABS = ['Personal', 'Summary', 'Education', 'Experience', 'Skills', 'Projects', 'Certifications'];

export default function ResumeBuilder() {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resume, setResume] = useState({
    personalInfo: { name: '', email: '', phone: '', address: '', linkedin: '', github: '', portfolio: '' },
    summary: '',
    education: [],
    experience: [],
    skills: [],
    projects: [],
    certifications: [],
  });

  useEffect(() => {
    getResume().then(({ data }) => { setResume(data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateResume(resume);
      toast.success('Resume saved!');
    } catch { toast.error('Failed to save resume'); } finally { setSaving(false); }
  };

  const updateField = (section, value) => setResume({ ...resume, [section]: value });
  const updatePersonal = (field, value) => setResume({ ...resume, personalInfo: { ...resume.personalInfo, [field]: value } });

  const addItem = (section, template) => setResume({ ...resume, [section]: [...(resume[section] || []), template] });
  const removeItem = (section, index) => setResume({ ...resume, [section]: resume[section].filter((_, i) => i !== index) });
  const updateItem = (section, index, field, value) => {
    const updated = [...resume[section]];
    updated[index] = { ...updated[index], [field]: value };
    setResume({ ...resume, [section]: updated });
  };

  if (loading) return <div className="loading-overlay"><div className="spinner" /><p>Loading resume...</p></div>;

  return (
    <div className="resume-builder animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div className="page-header" style={{ margin: 0 }}>
          <h1>📄 Resume Builder</h1>
          <p>Build a professional resume section by section</p>
        </div>
        <button onClick={handleSave} className="btn btn-primary" disabled={saving}>
          {saving ? <><span className="spinner-sm" />Saving...</> : <><Save size={16} />Save Resume</>}
        </button>
      </div>

      <div className="tabs">
        {TABS.map((tab, i) => (
          <button key={tab} className={`tab ${activeTab === i ? 'active' : ''}`} onClick={() => setActiveTab(i)}>{tab}</button>
        ))}
      </div>

      <div className="card animate-fade-in">
        {/* Personal Info */}
        {activeTab === 0 && (
          <div>
            <h4 style={{ marginBottom: '1.25rem' }}>Personal Information</h4>
            <div className="grid-2">
              {[['name', 'Full Name'], ['email', 'Email'], ['phone', 'Phone'], ['address', 'Address'], ['linkedin', 'LinkedIn URL'], ['github', 'GitHub URL'], ['portfolio', 'Portfolio URL']].map(([field, label]) => (
                <div key={field} className="form-group">
                  <label className="form-label">{label}</label>
                  <input value={resume.personalInfo?.[field] || ''} onChange={(e) => updatePersonal(field, e.target.value)} className="form-input" placeholder={label} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Summary */}
        {activeTab === 1 && (
          <div>
            <h4 style={{ marginBottom: '1.25rem' }}>Professional Summary</h4>
            <textarea value={resume.summary || ''} onChange={(e) => updateField('summary', e.target.value)} className="form-textarea" rows={6} placeholder="Write a compelling professional summary that highlights your key skills, experience, and career goals..." />
          </div>
        )}

        {/* Education */}
        {activeTab === 2 && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h4>Education</h4>
              <button onClick={() => addItem('education', { institution: '', degree: '', field: '', startYear: '', endYear: '', gpa: '' })} className="btn btn-secondary btn-sm">
                <Plus size={14} /> Add Education
              </button>
            </div>
            {resume.education?.map((edu, i) => (
              <div key={i} className="section-item">
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.75rem' }}>
                  <button onClick={() => removeItem('education', i)} className="btn btn-danger btn-sm btn-icon"><Trash2 size={14} /></button>
                </div>
                <div className="grid-2">
                  {[['institution', 'Institution'], ['degree', 'Degree'], ['field', 'Field of Study'], ['gpa', 'GPA']].map(([field, label]) => (
                    <div key={field} className="form-group">
                      <label className="form-label">{label}</label>
                      <input value={edu[field] || ''} onChange={(e) => updateItem('education', i, field, e.target.value)} className="form-input" placeholder={label} />
                    </div>
                  ))}
                  <div className="form-group">
                    <label className="form-label">Start Year</label>
                    <input type="number" value={edu.startYear || ''} onChange={(e) => updateItem('education', i, 'startYear', e.target.value)} className="form-input" placeholder="2020" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">End Year</label>
                    <input type="number" value={edu.endYear || ''} onChange={(e) => updateItem('education', i, 'endYear', e.target.value)} className="form-input" placeholder="2024" />
                  </div>
                </div>
              </div>
            ))}
            {resume.education?.length === 0 && <div className="empty-state"><p>No education added yet</p></div>}
          </div>
        )}

        {/* Experience */}
        {activeTab === 3 && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h4>Work Experience</h4>
              <button onClick={() => addItem('experience', { company: '', role: '', startDate: '', endDate: '', current: false, description: '' })} className="btn btn-secondary btn-sm">
                <Plus size={14} /> Add Experience
              </button>
            </div>
            {resume.experience?.map((exp, i) => (
              <div key={i} className="section-item">
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.75rem' }}>
                  <button onClick={() => removeItem('experience', i)} className="btn btn-danger btn-sm btn-icon"><Trash2 size={14} /></button>
                </div>
                <div className="grid-2">
                  {[['company', 'Company'], ['role', 'Job Title'], ['startDate', 'Start Date'], ['endDate', 'End Date']].map(([field, label]) => (
                    <div key={field} className="form-group">
                      <label className="form-label">{label}</label>
                      <input value={exp[field] || ''} onChange={(e) => updateItem('experience', i, field, e.target.value)} className="form-input" placeholder={label} />
                    </div>
                  ))}
                </div>
                <div className="form-group" style={{ marginTop: '1rem' }}>
                  <label className="form-label">Description</label>
                  <textarea value={exp.description || ''} onChange={(e) => updateItem('experience', i, 'description', e.target.value)} className="form-textarea" rows={3} placeholder="Describe your responsibilities and achievements..." />
                </div>
              </div>
            ))}
            {resume.experience?.length === 0 && <div className="empty-state"><p>No experience added yet</p></div>}
          </div>
        )}

        {/* Skills */}
        {activeTab === 4 && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h4>Skills</h4>
              <button onClick={() => addItem('skills', { name: '', level: 'Intermediate' })} className="btn btn-secondary btn-sm"><Plus size={14} /> Add Skill</button>
            </div>
            <div className="grid-2">
              {resume.skills?.map((skill, i) => (
                <div key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <input value={skill.name || ''} onChange={(e) => updateItem('skills', i, 'name', e.target.value)} className="form-input" placeholder="Skill name" style={{ flex: 1 }} />
                  <select value={skill.level || 'Intermediate'} onChange={(e) => updateItem('skills', i, 'level', e.target.value)} className="form-select" style={{ width: 130 }}>
                    {['Beginner', 'Intermediate', 'Advanced', 'Expert'].map((l) => <option key={l}>{l}</option>)}
                  </select>
                  <button onClick={() => removeItem('skills', i)} className="btn btn-danger btn-sm btn-icon"><Trash2 size={14} /></button>
                </div>
              ))}
            </div>
            {resume.skills?.length === 0 && <div className="empty-state"><p>No skills added yet</p></div>}
          </div>
        )}

        {/* Projects */}
        {activeTab === 5 && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h4>Projects</h4>
              <button onClick={() => addItem('projects', { name: '', description: '', techStack: [], link: '', github: '' })} className="btn btn-secondary btn-sm"><Plus size={14} /> Add Project</button>
            </div>
            {resume.projects?.map((proj, i) => (
              <div key={i} className="section-item">
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.75rem' }}>
                  <button onClick={() => removeItem('projects', i)} className="btn btn-danger btn-sm btn-icon"><Trash2 size={14} /></button>
                </div>
                <div className="grid-2">
                  {[['name', 'Project Name'], ['link', 'Live URL'], ['github', 'GitHub URL']].map(([field, label]) => (
                    <div key={field} className="form-group">
                      <label className="form-label">{label}</label>
                      <input value={proj[field] || ''} onChange={(e) => updateItem('projects', i, field, e.target.value)} className="form-input" placeholder={label} />
                    </div>
                  ))}
                  <div className="form-group">
                    <label className="form-label">Tech Stack (comma-separated)</label>
                    <input value={proj.techStack?.join(', ') || ''} onChange={(e) => updateItem('projects', i, 'techStack', e.target.value.split(',').map((s) => s.trim()))} className="form-input" placeholder="React, Node.js, MongoDB" />
                  </div>
                </div>
                <div className="form-group" style={{ marginTop: '1rem' }}>
                  <label className="form-label">Description</label>
                  <textarea value={proj.description || ''} onChange={(e) => updateItem('projects', i, 'description', e.target.value)} className="form-textarea" rows={2} />
                </div>
              </div>
            ))}
            {resume.projects?.length === 0 && <div className="empty-state"><p>No projects added yet</p></div>}
          </div>
        )}

        {/* Certifications */}
        {activeTab === 6 && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h4>Certifications</h4>
              <button onClick={() => addItem('certifications', { name: '', issuer: '', date: '', url: '' })} className="btn btn-secondary btn-sm"><Plus size={14} /> Add Certification</button>
            </div>
            {resume.certifications?.map((cert, i) => (
              <div key={i} className="section-item">
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.75rem' }}>
                  <button onClick={() => removeItem('certifications', i)} className="btn btn-danger btn-sm btn-icon"><Trash2 size={14} /></button>
                </div>
                <div className="grid-2">
                  {[['name', 'Certification Name'], ['issuer', 'Issuing Organization'], ['date', 'Date Earned'], ['url', 'Certificate URL']].map(([field, label]) => (
                    <div key={field} className="form-group">
                      <label className="form-label">{label}</label>
                      <input value={cert[field] || ''} onChange={(e) => updateItem('certifications', i, field, e.target.value)} className="form-input" placeholder={label} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {resume.certifications?.length === 0 && <div className="empty-state"><p>No certifications added yet</p></div>}
          </div>
        )}
      </div>
    </div>
  );
}
