import { useState, useEffect } from 'react';
import { getResume, updateResume } from '../../services/api';
import toast from 'react-hot-toast';
import {
  Plus, Trash2, Save, FileText, Eye, Edit3, Printer, Sparkles,
  ExternalLink, Mail, Phone, MapPin, Globe, Link2, Code2, Check
} from 'lucide-react';
import './ResumeBuilder.css';

const TABS = ['Personal', 'Summary', 'Education', 'Experience', 'Skills', 'Projects', 'Certifications'];

const SAMPLE_PROFILE = {
  personalInfo: {
    name: 'Alex Morgan',
    email: 'alex.morgan@example.com',
    phone: '+1 (555) 349-2810',
    address: 'San Francisco, CA',
    linkedin: 'https://linkedin.com/in/alexmorgan-dev',
    github: 'https://github.com/alexmorgan',
    portfolio: 'https://alexmorgan.dev',
  },
  summary:
    'Full Stack Software Engineer with 2+ years of experience engineering modern web architectures using React, Node.js, TypeScript, and MongoDB. Passionate about building high-throughput REST APIs, responsive UIs, and cloud microservices with rigorous test coverage and performance optimization.',
  education: [
    {
      institution: 'University of California, Berkeley',
      degree: 'Bachelor of Science',
      field: 'Computer Science',
      startYear: '2020',
      endYear: '2024',
      gpa: '3.85',
    },
  ],
  experience: [
    {
      company: 'TechFlow Systems',
      role: 'Full Stack Engineer',
      startDate: '2024-01',
      endDate: 'Present',
      current: true,
      description:
        'Architected and deployed customer-facing microservices handling 50,000+ daily requests using Node.js, Express, and Redis. Engineered responsive component libraries in React 19 and improved bundle loading speeds by 35%.',
    },
    {
      company: 'InnovateX Labs',
      role: 'Software Engineering Intern',
      startDate: '2023-05',
      endDate: '2023-12',
      current: false,
      description:
        'Developed RESTful endpoints with MongoDB Atlas, integrated Google Gemini LLM API for automated context extraction, and authored unit tests achieving 88% code coverage.',
    },
  ],
  skills: [
    { name: 'JavaScript / TypeScript', level: 'Expert' },
    { name: 'React.js & Next.js', level: 'Advanced' },
    { name: 'Node.js & Express', level: 'Advanced' },
    { name: 'MongoDB & PostgreSQL', level: 'Intermediate' },
    { name: 'Docker & AWS', level: 'Intermediate' },
    { name: 'REST APIs & WebSockets', level: 'Advanced' },
    { name: 'Git & Agile CI/CD', level: 'Expert' },
  ],
  projects: [
    {
      name: 'CareerAI Intelligence System',
      description:
        'Full-stack career acceleration platform featuring automated curriculum roadmap generation, real-time AI mock interviews, and ATS resume scanning.',
      techStack: ['React', 'Node.js', 'Express', 'MongoDB', 'Gemini AI'],
      link: 'https://careerai.example.com',
      github: 'https://github.com/alexmorgan/careerai',
    },
    {
      name: 'Distributed CloudMetrics Monitor',
      description:
        'Real-time telemetry and resource usage dashboard with WebSockets, live charts, and latency threshold alerts.',
      techStack: ['TypeScript', 'React', 'Go', 'Redis', 'Docker'],
      link: 'https://cloudmetrics.example.com',
      github: 'https://github.com/alexmorgan/cloudmetrics',
    },
  ],
  certifications: [
    {
      name: 'AWS Certified Solutions Architect – Associate',
      issuer: 'Amazon Web Services (AWS)',
      date: '2024',
      url: 'https://aws.amazon.com/verification',
    },
  ],
};

export default function ResumeBuilder() {
  const [activeTab, setActiveTab] = useState(0);
  const [viewMode, setViewMode] = useState('editor'); // 'editor' | 'preview'
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
    let ignore = false;
    getResume()
      .then(({ data }) => {
        if (!ignore && data) {
          setResume((prev) => ({
            ...prev,
            ...data,
            personalInfo: { ...prev.personalInfo, ...(data.personalInfo || {}) },
          }));
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, []);

  const handleSave = async (customData) => {
    const payload = customData || resume;
    setSaving(true);
    try {
      await updateResume(payload);
      toast.success('Resume saved successfully!');
    } catch {
      toast.error('Failed to save resume');
    } finally {
      setSaving(false);
    }
  };

  const handleLoadSample = () => {
    if (resume.summary || (resume.experience && resume.experience.length > 0)) {
      if (!window.confirm('Replace current resume fields with comprehensive sample profile?')) return;
    }
    setResume(SAMPLE_PROFILE);
    handleSave(SAMPLE_PROFILE);
    toast.success('Sample profile loaded & saved! Check Live Preview.');
  };

  const handlePrint = () => {
    setViewMode('preview');
    setTimeout(() => {
      window.print();
    }, 200);
  };

  const updateField = (section, value) => setResume({ ...resume, [section]: value });
  const updatePersonal = (field, value) =>
    setResume({ ...resume, personalInfo: { ...resume.personalInfo, [field]: value } });

  const addItem = (section, template) =>
    setResume({ ...resume, [section]: [...(resume[section] || []), template] });
  const removeItem = (section, index) =>
    setResume({ ...resume, [section]: resume[section].filter((_, i) => i !== index) });
  const updateItem = (section, index, field, value) => {
    const updated = [...resume[section]];
    updated[index] = { ...updated[index], [field]: value };
    setResume({ ...resume, [section]: updated });
  };

  const getTabCount = (tabName) => {
    switch (tabName) {
      case 'Personal':
        return resume.personalInfo?.name ? '✓' : '';
      case 'Summary':
        return resume.summary?.trim() ? '✓' : '';
      case 'Education':
        return resume.education?.length || '';
      case 'Experience':
        return resume.experience?.length || '';
      case 'Skills':
        return resume.skills?.length || '';
      case 'Projects':
        return resume.projects?.length || '';
      case 'Certifications':
        return resume.certifications?.length || '';
      default:
        return '';
    }
  };

  if (loading) {
    return (
      <div className="loading-overlay">
        <div className="spinner" />
        <p>Loading resume portfolio...</p>
      </div>
    );
  }

  return (
    <div className="resume-builder animate-fade-in">
      {/* Top Header & Global Actions */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div className="page-header" style={{ margin: 0 }}>
          <div className="page-header-row">
            <div className="header-icon-box">
              <FileText size={18} strokeWidth={2.4} />
            </div>
            <div>
              <h1>Executive Resume Builder</h1>
              <p>Structure, preview, and print ATS-optimized executive resumes</p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={handleLoadSample}
            className="btn btn-secondary btn-sm"
            title="Auto-fill high-quality sample software engineer profile"
          >
            <Sparkles size={14} style={{ color: 'var(--primary-light)' }} />
            Load Sample Profile
          </button>

          <button
            type="button"
            onClick={() => setViewMode(viewMode === 'editor' ? 'preview' : 'editor')}
            className={`btn ${viewMode === 'preview' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          >
            {viewMode === 'editor' ? (
              <>
                <Eye size={14} /> Live Preview
              </>
            ) : (
              <>
                <Edit3 size={14} /> Edit Form
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="btn btn-secondary btn-sm"
            title="Print or export as PDF"
          >
            <Printer size={14} /> Print / Export PDF
          </button>

          <button
            type="button"
            onClick={() => handleSave()}
            className="btn btn-primary btn-sm"
            disabled={saving}
          >
            {saving ? (
              <>
                <span className="spinner-sm" /> Saving...
              </>
            ) : (
              <>
                <Save size={14} /> Save Resume
              </>
            )}
          </button>
        </div>
      </div>

      {/* View Switcher: Editor Mode vs Live Preview Mode */}
      {viewMode === 'editor' ? (
        <>
          {/* Section Navigation Tabs */}
          <div className="tabs">
            {TABS.map((tab, i) => {
              const count = getTabCount(tab);
              return (
                <button
                  key={tab}
                  type="button"
                  className={`tab ${activeTab === i ? 'active' : ''}`}
                  onClick={() => setActiveTab(i)}
                >
                  {tab}
                  {count && (
                    <span
                      style={{
                        marginLeft: '0.4rem',
                        fontSize: '0.75rem',
                        padding: '0.1rem 0.4rem',
                        borderRadius: '10px',
                        background: activeTab === i ? 'var(--primary)' : 'var(--bg-input)',
                        color: activeTab === i ? '#fff' : 'var(--text-muted)',
                      }}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="card animate-fade-in">
            {/* 0. Personal Info */}
            {activeTab === 0 && (
              <div>
                <h4 style={{ marginBottom: '1.25rem' }}>Personal Contact Information</h4>
                <div className="grid-2">
                  {[
                    ['name', 'Full Name'],
                    ['email', 'Email Address'],
                    ['phone', 'Phone Number'],
                    ['address', 'City, State / Country'],
                    ['linkedin', 'LinkedIn Profile URL'],
                    ['github', 'GitHub Profile URL'],
                    ['portfolio', 'Portfolio Website URL'],
                  ].map(([field, label]) => (
                    <div key={field} className="form-group">
                      <label className="form-label">{label}</label>
                      <input
                        value={resume.personalInfo?.[field] || ''}
                        onChange={(e) => updatePersonal(field, e.target.value)}
                        className="form-input"
                        placeholder={label}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 1. Summary */}
            {activeTab === 1 && (
              <div>
                <h4 style={{ marginBottom: '1.25rem' }}>Professional Summary</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.85rem' }}>
                  Write a concise 2-4 sentence executive overview highlighting your domain focus, years of experience, core technologies, and standout impact.
                </p>
                <textarea
                  value={resume.summary || ''}
                  onChange={(e) => updateField('summary', e.target.value)}
                  className="form-textarea"
                  rows={6}
                  placeholder="e.g. Dedicated Software Engineer with experience architecting performant React and Node.js solutions..."
                />
              </div>
            )}

            {/* 2. Education */}
            {activeTab === 2 && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <h4>Education History</h4>
                  <button
                    type="button"
                    onClick={() => addItem('education', { institution: '', degree: '', field: '', startYear: '', endYear: '', gpa: '' })}
                    className="btn btn-secondary btn-sm"
                  >
                    <Plus size={14} /> Add Education
                  </button>
                </div>
                {resume.education?.map((edu, i) => (
                  <div key={i} className="section-item">
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.75rem' }}>
                      <button
                        type="button"
                        onClick={() => removeItem('education', i)}
                        className="btn btn-danger btn-sm btn-icon"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <div className="grid-2">
                      {[
                        ['institution', 'Institution / University'],
                        ['degree', 'Degree (e.g. Bachelor of Science)'],
                        ['field', 'Field of Study / Major'],
                        ['gpa', 'GPA / Honors (optional)'],
                      ].map(([field, label]) => (
                        <div key={field} className="form-group">
                          <label className="form-label">{label}</label>
                          <input
                            value={edu[field] || ''}
                            onChange={(e) => updateItem('education', i, field, e.target.value)}
                            className="form-input"
                            placeholder={label}
                          />
                        </div>
                      ))}
                      <div className="form-group">
                        <label className="form-label">Start Year</label>
                        <input
                          type="number"
                          value={edu.startYear || ''}
                          onChange={(e) => updateItem('education', i, 'startYear', e.target.value)}
                          className="form-input"
                          placeholder="2020"
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">End Year (or Expected)</label>
                        <input
                          type="number"
                          value={edu.endYear || ''}
                          onChange={(e) => updateItem('education', i, 'endYear', e.target.value)}
                          className="form-input"
                          placeholder="2024"
                        />
                      </div>
                    </div>
                  </div>
                ))}
                {resume.education?.length === 0 && (
                  <div className="empty-state">
                    <p>No education entries added yet. Click &quot;Add Education&quot; or &quot;Load Sample Profile&quot;.</p>
                  </div>
                )}
              </div>
            )}

            {/* 3. Experience */}
            {activeTab === 3 && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <h4>Work Experience</h4>
                  <button
                    type="button"
                    onClick={() => addItem('experience', { company: '', role: '', startDate: '', endDate: '', current: false, description: '' })}
                    className="btn btn-secondary btn-sm"
                  >
                    <Plus size={14} /> Add Experience
                  </button>
                </div>
                {resume.experience?.map((exp, i) => (
                  <div key={i} className="section-item">
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.75rem' }}>
                      <button
                        type="button"
                        onClick={() => removeItem('experience', i)}
                        className="btn btn-danger btn-sm btn-icon"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <div className="grid-2">
                      {[
                        ['company', 'Company / Organization'],
                        ['role', 'Job Title'],
                        ['startDate', 'Start Date (e.g. 2023-01)'],
                        ['endDate', 'End Date (or &quot;Present&quot;)'],
                      ].map(([field, label]) => (
                        <div key={field} className="form-group">
                          <label className="form-label">{label}</label>
                          <input
                            value={exp[field] || ''}
                            onChange={(e) => updateItem('experience', i, field, e.target.value)}
                            className="form-input"
                            placeholder={label}
                          />
                        </div>
                      ))}
                    </div>
                    <div className="form-group" style={{ marginTop: '1rem' }}>
                      <label className="form-label">Responsibilities & Quantifiable Achievements</label>
                      <textarea
                        value={exp.description || ''}
                        onChange={(e) => updateItem('experience', i, 'description', e.target.value)}
                        className="form-textarea"
                        rows={3}
                        placeholder="Implemented features using React, reduced query latency by 40%, collaborated across cross-functional teams..."
                      />
                    </div>
                  </div>
                ))}
                {resume.experience?.length === 0 && (
                  <div className="empty-state">
                    <p>No work experience added yet.</p>
                  </div>
                )}
              </div>
            )}

            {/* 4. Skills */}
            {activeTab === 4 && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <h4>Technical & Professional Skills</h4>
                  <button
                    type="button"
                    onClick={() => addItem('skills', { name: '', level: 'Intermediate' })}
                    className="btn btn-secondary btn-sm"
                  >
                    <Plus size={14} /> Add Skill
                  </button>
                </div>
                <div className="grid-2">
                  {resume.skills?.map((skill, i) => (
                    <div key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <input
                        value={skill.name || ''}
                        onChange={(e) => updateItem('skills', i, 'name', e.target.value)}
                        className="form-input"
                        placeholder="Skill (e.g. React.js, Python, Docker)"
                        style={{ flex: 1 }}
                      />
                      <select
                        value={skill.level || 'Intermediate'}
                        onChange={(e) => updateItem('skills', i, 'level', e.target.value)}
                        className="form-select"
                        style={{ width: 130 }}
                      >
                        {['Beginner', 'Intermediate', 'Advanced', 'Expert'].map((l) => (
                          <option key={l}>{l}</option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => removeItem('skills', i)}
                        className="btn btn-danger btn-sm btn-icon"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
                {resume.skills?.length === 0 && (
                  <div className="empty-state">
                    <p>No skills added yet.</p>
                  </div>
                )}
              </div>
            )}

            {/* 5. Projects */}
            {activeTab === 5 && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <h4>Key Technical Projects</h4>
                  <button
                    type="button"
                    onClick={() => addItem('projects', { name: '', description: '', techStack: [], link: '', github: '' })}
                    className="btn btn-secondary btn-sm"
                  >
                    <Plus size={14} /> Add Project
                  </button>
                </div>
                {resume.projects?.map((proj, i) => (
                  <div key={i} className="section-item">
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.75rem' }}>
                      <button
                        type="button"
                        onClick={() => removeItem('projects', i)}
                        className="btn btn-danger btn-sm btn-icon"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <div className="grid-2">
                      {[
                        ['name', 'Project Name'],
                        ['link', 'Live Demo URL'],
                        ['github', 'GitHub Repository URL'],
                      ].map(([field, label]) => (
                        <div key={field} className="form-group">
                          <label className="form-label">{label}</label>
                          <input
                            value={proj[field] || ''}
                            onChange={(e) => updateItem('projects', i, field, e.target.value)}
                            className="form-input"
                            placeholder={label}
                          />
                        </div>
                      ))}
                      <div className="form-group">
                        <label className="form-label">Tech Stack (comma-separated)</label>
                        <input
                          value={Array.isArray(proj.techStack) ? proj.techStack.join(', ') : proj.techStack || ''}
                          onChange={(e) =>
                            updateItem(
                              'projects',
                              i,
                              'techStack',
                              e.target.value.split(',').map((s) => s.trim()).filter(Boolean)
                            )
                          }
                          className="form-input"
                          placeholder="React, Node.js, MongoDB"
                        />
                      </div>
                    </div>
                    <div className="form-group" style={{ marginTop: '1rem' }}>
                      <label className="form-label">Project Description</label>
                      <textarea
                        value={proj.description || ''}
                        onChange={(e) => updateItem('projects', i, 'description', e.target.value)}
                        className="form-textarea"
                        rows={2}
                        placeholder="Explain problem solved, architectural approach, and outcomes..."
                      />
                    </div>
                  </div>
                ))}
                {resume.projects?.length === 0 && (
                  <div className="empty-state">
                    <p>No projects added yet.</p>
                  </div>
                )}
              </div>
            )}

            {/* 6. Certifications */}
            {activeTab === 6 && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <h4>Certifications & Credentials</h4>
                  <button
                    type="button"
                    onClick={() => addItem('certifications', { name: '', issuer: '', date: '', url: '' })}
                    className="btn btn-secondary btn-sm"
                  >
                    <Plus size={14} /> Add Certification
                  </button>
                </div>
                {resume.certifications?.map((cert, i) => (
                  <div key={i} className="section-item">
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.75rem' }}>
                      <button
                        type="button"
                        onClick={() => removeItem('certifications', i)}
                        className="btn btn-danger btn-sm btn-icon"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <div className="grid-2">
                      {[
                        ['name', 'Certification Title'],
                        ['issuer', 'Issuing Organization'],
                        ['date', 'Date Earned / Year'],
                        ['url', 'Verification URL'],
                      ].map(([field, label]) => (
                        <div key={field} className="form-group">
                          <label className="form-label">{label}</label>
                          <input
                            value={cert[field] || ''}
                            onChange={(e) => updateItem('certifications', i, field, e.target.value)}
                            className="form-input"
                            placeholder={label}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                {resume.certifications?.length === 0 && (
                  <div className="empty-state">
                    <p>No certifications added yet.</p>
                  </div>
                )}
              </div>
            )}

            {/* Bottom Actions inside Card */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border)' }}>
              <button
                type="button"
                onClick={() => setActiveTab(Math.max(0, activeTab - 1))}
                className="btn btn-secondary btn-sm"
                disabled={activeTab === 0}
              >
                Previous Section
              </button>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setViewMode('preview')}
                  className="btn btn-secondary btn-sm"
                >
                  <Eye size={14} /> Preview Document
                </button>
                {activeTab < TABS.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => setActiveTab(activeTab + 1)}
                    className="btn btn-primary btn-sm"
                  >
                    Next Section
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSave()}
                    className="btn btn-primary btn-sm"
                    disabled={saving}
                  >
                    <Save size={14} /> Save Complete Resume
                  </button>
                )}
              </div>
            </div>
          </div>
        </>
      ) : (
        /* LIVE DOCUMENT PREVIEW & PRINT READY VIEW */
        <div className="resume-preview-container animate-fade-in">
          <div className="resume-preview-toolbar">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="badge badge-success">
                <Check size={12} /> ATS-Optimized Document
              </span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Format ready for job applications & PDF export
              </span>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={() => setViewMode('editor')}
                className="btn btn-secondary btn-sm"
              >
                <Edit3 size={14} /> Return to Editor
              </button>
              <button
                type="button"
                onClick={handlePrint}
                className="btn btn-primary btn-sm"
              >
                <Printer size={14} /> Print / Save as PDF
              </button>
            </div>
          </div>

          {/* Formatted CV Document */}
          <div id="resume-document" className="resume-document">
            {/* Header: Name & Contact info */}
            <div className="resume-header">
              <h1 className="resume-name">
                {resume.personalInfo?.name || 'Candidate Full Name'}
              </h1>
              <div className="resume-contacts">
                {resume.personalInfo?.email && (
                  <span>
                    <Mail size={13} /> {resume.personalInfo.email}
                  </span>
                )}
                {resume.personalInfo?.phone && (
                  <span>
                    <Phone size={13} /> {resume.personalInfo.phone}
                  </span>
                )}
                {resume.personalInfo?.address && (
                  <span>
                    <MapPin size={13} /> {resume.personalInfo.address}
                  </span>
                )}
                {resume.personalInfo?.linkedin && (
                  <span>
                    <Link2 size={13} />
                    <a href={resume.personalInfo.linkedin} target="_blank" rel="noreferrer">
                      LinkedIn
                    </a>
                  </span>
                )}
                {resume.personalInfo?.github && (
                  <span>
                    <Code2 size={13} />
                    <a href={resume.personalInfo.github} target="_blank" rel="noreferrer">
                      GitHub
                    </a>
                  </span>
                )}
                {resume.personalInfo?.portfolio && (
                  <span>
                    <Globe size={13} />
                    <a href={resume.personalInfo.portfolio} target="_blank" rel="noreferrer">
                      Portfolio
                    </a>
                  </span>
                )}
              </div>
            </div>

            {/* Professional Summary */}
            {resume.summary && (
              <div className="resume-section">
                <div className="resume-section-title">Professional Summary</div>
                <p className="resume-text">{resume.summary}</p>
              </div>
            )}

            {/* Work Experience */}
            {resume.experience && resume.experience.length > 0 && (
              <div className="resume-section">
                <div className="resume-section-title">Work Experience</div>
                {resume.experience.map((exp, i) => (
                  <div key={i} className="resume-entry">
                    <div className="resume-entry-header">
                      <div>
                        <span className="resume-entry-title">{exp.role}</span>
                        {exp.company && <span className="resume-entry-subtitle"> — {exp.company}</span>}
                      </div>
                      <div className="resume-entry-date">
                        {exp.startDate} {exp.endDate ? `– ${exp.endDate}` : ''}
                      </div>
                    </div>
                    {exp.description && (
                      <p className="resume-text" style={{ marginTop: '0.35rem' }}>
                        {exp.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Education */}
            {resume.education && resume.education.length > 0 && (
              <div className="resume-section">
                <div className="resume-section-title">Education</div>
                {resume.education.map((edu, i) => (
                  <div key={i} className="resume-entry">
                    <div className="resume-entry-header">
                      <div>
                        <span className="resume-entry-title">
                          {edu.degree} {edu.field ? `in ${edu.field}` : ''}
                        </span>
                        {edu.institution && (
                          <span className="resume-entry-subtitle"> — {edu.institution}</span>
                        )}
                      </div>
                      <div className="resume-entry-date">
                        {edu.startYear} {edu.endYear ? `– ${edu.endYear}` : ''}
                        {edu.gpa ? ` | GPA: ${edu.gpa}` : ''}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Skills */}
            {resume.skills && resume.skills.length > 0 && (
              <div className="resume-section">
                <div className="resume-section-title">Technical Skills</div>
                <div className="resume-skills-grid">
                  {resume.skills.map((s, i) => (
                    <span key={i} className="resume-skill-tag">
                      {s.name} {s.level ? `(${s.level})` : ''}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Projects */}
            {resume.projects && resume.projects.length > 0 && (
              <div className="resume-section">
                <div className="resume-section-title">Key Projects</div>
                {resume.projects.map((proj, i) => (
                  <div key={i} className="resume-entry">
                    <div className="resume-entry-header">
                      <div>
                        <span className="resume-entry-title">{proj.name}</span>
                        {proj.techStack && (
                          <span className="resume-entry-subtitle" style={{ fontSize: '0.8rem' }}>
                            {' '}
                            | {Array.isArray(proj.techStack) ? proj.techStack.join(', ') : proj.techStack}
                          </span>
                        )}
                      </div>
                      <div className="resume-entry-date">
                        {proj.link && (
                          <a
                            href={proj.link}
                            target="_blank"
                            rel="noreferrer"
                            style={{ color: '#0f172a', marginRight: '0.75rem', textDecoration: 'underline' }}
                          >
                            Live Demo <ExternalLink size={11} style={{ display: 'inline' }} />
                          </a>
                        )}
                        {proj.github && (
                          <a
                            href={proj.github}
                            target="_blank"
                            rel="noreferrer"
                            style={{ color: '#0f172a', textDecoration: 'underline' }}
                          >
                            GitHub
                          </a>
                        )}
                      </div>
                    </div>
                    {proj.description && (
                      <p className="resume-text" style={{ marginTop: '0.25rem' }}>
                        {proj.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Certifications */}
            {resume.certifications && resume.certifications.length > 0 && (
              <div className="resume-section">
                <div className="resume-section-title">Certifications</div>
                {resume.certifications.map((c, i) => (
                  <div key={i} className="resume-entry" style={{ marginBottom: '0.4rem' }}>
                    <div className="resume-entry-header">
                      <div>
                        <span className="resume-entry-title">{c.name}</span>
                        {c.issuer && <span className="resume-entry-subtitle"> — {c.issuer}</span>}
                      </div>
                      <div className="resume-entry-date">{c.date}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
