import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { updateProfile, getResume } from '../../services/api';
import toast from 'react-hot-toast';
import {
  Save, Plus, X, User, FileText, Briefcase, GraduationCap,
  FolderGit2, Award, ExternalLink, CheckCircle2, Sparkles, Mail, Phone, MapPin, Globe
} from 'lucide-react';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [loadingResume, setLoadingResume] = useState(true);
  const [resumeData, setResumeData] = useState(null);

  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    bio: user?.bio || '',
    careerGoal: user?.careerGoal || '',
    skills: user?.skills || [],
  });
  const [newSkill, setNewSkill] = useState('');

  useEffect(() => {
    let ignore = false;
    getResume()
      .then(({ data }) => {
        if (!ignore && data) {
          setResumeData(data);
          // If profile fields are empty, sync from resume
          setForm((prev) => ({
            ...prev,
            phone: prev.phone || data.personalInfo?.phone || '',
            bio: prev.bio || data.summary || '',
            skills: prev.skills?.length > 0
              ? prev.skills
              : (data.skills || []).map((s) => (typeof s === 'string' ? s : s.name)).filter(Boolean),
          }));
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!ignore) setLoadingResume(false);
      });
    return () => {
      ignore = true;
    };
  }, []);

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
      toast.success('Profile updated successfully.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const hasResumeContent = resumeData && (
    resumeData.summary?.trim() ||
    (resumeData.skills && resumeData.skills.length > 0) ||
    (resumeData.experience && resumeData.experience.length > 0) ||
    (resumeData.projects && resumeData.projects.length > 0) ||
    (resumeData.education && resumeData.education.length > 0) ||
    (resumeData.certifications && resumeData.certifications.length > 0) ||
    resumeData.personalInfo?.name
  );

  return (
    <div className="animate-fade-in" style={{ maxWidth: 960 }}>
      <div className="page-header">
        <div className="page-header-row">
          <div className="header-icon-box">
            <User size={18} strokeWidth={2.4} />
          </div>
          <div>
            <h1>Executive Profile & Identity</h1>
            <p>Manage authentication credentials, contact coordinates, domain competencies, and saved resume</p>
          </div>
        </div>
      </div>

      {/* Avatar Card */}
      <div className="card mb-2" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
        <div style={{ width: 68, height: 68, background: 'var(--bg-secondary)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary-light)', flexShrink: 0, boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08)' }}>
          {user?.name?.[0]?.toUpperCase()}
        </div>
        <div style={{ flex: 1 }}>
          <h3 style={{ marginBottom: '0.25rem' }}>{user?.name}</h3>
          <p style={{ fontSize: '0.875rem', marginBottom: '0.4rem', color: 'var(--text-muted)' }}>{user?.email}</p>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span className={`badge badge-${user?.role === 'admin' ? 'warning' : 'primary'}`}>
              {user?.role === 'admin' ? 'Platform Administrator' : 'Verified Member'}
            </span>
            {user?.careerGoal && (
              <span className="badge badge-success">🎯 {user.careerGoal}</span>
            )}
          </div>
        </div>
        <div>
          <Link to="/resume/builder" className="btn btn-secondary btn-sm">
            <FileText size={14} /> Resume Builder
          </Link>
        </div>
      </div>

      {/* Profile Edit Form */}
      <form onSubmit={handleSubmit} style={{ marginBottom: '2rem' }}>
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
                <label className="form-label">Bio / Summary</label>
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

      {/* =========================================================
          SAVED RESUME PORTFOLIO CARD (Directly visible from Resume Builder)
         ========================================================= */}
      <div className="card" style={{ border: '1px solid var(--border-light)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div className="header-icon-box" style={{ width: 34, height: 34 }}>
              <FileText size={17} style={{ color: 'var(--primary-light)' }} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem' }}>Saved Resume Portfolio</h3>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Live data synced directly with the Resume Builder
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Link to="/resume/builder" className="btn btn-primary btn-sm">
              <FileText size={14} /> Open in Resume Builder
            </Link>
          </div>
        </div>

        {loadingResume ? (
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            <div className="spinner" style={{ margin: '0 auto 0.5rem' }} />
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Loading saved resume...</p>
          </div>
        ) : hasResumeContent ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Real ATS Metric Strip */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.85rem 1.25rem',
                background: 'var(--bg-secondary)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border)',
                flexWrap: 'wrap',
                gap: '0.75rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: '50%',
                    background: (resumeData.atsScore || 0) >= 70 ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '1rem',
                    color: (resumeData.atsScore || 0) >= 70 ? 'var(--success)' : '#fbbf24',
                    border: `1px solid ${(resumeData.atsScore || 0) >= 70 ? 'rgba(16,185,129,0.4)' : 'rgba(245,158,11,0.4)'}`,
                  }}
                >
                  {resumeData.atsScore || 0}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                    Evaluated ATS Resume Score
                  </div>
                  <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>
                    Calculated from contact coordinates, summary depth, skill density, projects, & credentials
                  </div>
                </div>
              </div>
              <span className={`badge ${(resumeData.atsScore || 0) >= 70 ? 'badge-success' : 'badge-warning'}`}>
                <CheckCircle2 size={12} style={{ marginRight: '0.3rem' }} />
                {(resumeData.atsScore || 0) >= 70 ? 'ATS Competitive' : 'Enhancement Recommended'}
              </span>
            </div>

            {/* Saved Personal Info */}
            <div style={{ background: 'var(--bg-input)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <h4 style={{ margin: 0, fontSize: '1.05rem', color: 'var(--text-primary)' }}>
                  {resumeData.personalInfo?.name || user?.name}
                </h4>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Saved in Resume Builder
                </span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                {(resumeData.personalInfo?.email || user?.email) && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Mail size={13} color="var(--primary-light)" /> {resumeData.personalInfo?.email || user?.email}
                  </span>
                )}
                {resumeData.personalInfo?.phone && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Phone size={13} color="var(--primary-light)" /> {resumeData.personalInfo.phone}
                  </span>
                )}
                {resumeData.personalInfo?.address && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                    <MapPin size={13} color="var(--primary-light)" /> {resumeData.personalInfo.address}
                  </span>
                )}
                {resumeData.personalInfo?.linkedin && (
                  <a href={resumeData.personalInfo.linkedin} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: 'var(--primary-light)' }}>
                    <Globe size={13} /> LinkedIn <ExternalLink size={11} />
                  </a>
                )}
                {resumeData.personalInfo?.github && (
                  <a href={resumeData.personalInfo.github} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: 'var(--primary-light)' }}>
                    <Globe size={13} /> GitHub <ExternalLink size={11} />
                  </a>
                )}
              </div>
            </div>

            {/* Saved Professional Summary */}
            {resumeData.summary && (
              <div>
                <h4 style={{ fontSize: '0.9rem', marginBottom: '0.4rem', color: 'var(--text-primary)' }}>
                  Professional Summary
                </h4>
                <p style={{ margin: 0, fontSize: '0.85rem', lineHeight: 1.6, color: 'var(--text-secondary)', background: 'var(--bg-secondary)', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                  {resumeData.summary}
                </p>
              </div>
            )}

            {/* Saved Skills */}
            {resumeData.skills?.length > 0 && (
              <div>
                <h4 style={{ fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                  Core Competencies & Skills ({resumeData.skills.length})
                </h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {resumeData.skills.map((s, idx) => {
                    const skillName = typeof s === 'string' ? s : s.name;
                    const level = typeof s === 'object' && s.level ? s.level : null;
                    return (
                      <span
                        key={idx}
                        className="badge badge-primary"
                        style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                      >
                        {skillName}
                        {level && (
                          <span style={{ opacity: 0.7, fontSize: '0.7rem', paddingLeft: '0.2rem', borderLeft: '1px solid rgba(255,255,255,0.2)' }}>
                            {level}
                          </span>
                        )}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Work Experience */}
            {resumeData.experience?.length > 0 && (
              <div>
                <h4 style={{ fontSize: '0.9rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-primary)' }}>
                  <Briefcase size={15} color="var(--primary-light)" /> Work Experience ({resumeData.experience.length})
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {resumeData.experience.map((exp, idx) => (
                    <div key={idx} style={{ padding: '0.75rem 1rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.3rem' }}>
                        <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{exp.role || 'Role'}</strong>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {exp.startDate || ''} &ndash; {exp.current ? 'Present' : exp.endDate || ''}
                        </span>
                      </div>
                      <p style={{ margin: '0.15rem 0 0.4rem', fontSize: '0.825rem', color: 'var(--primary-light)' }}>
                        {exp.company}
                      </p>
                      {exp.description && (
                        <p style={{ margin: 0, fontSize: '0.8rem', lineHeight: 1.5, color: 'var(--text-secondary)' }}>
                          {exp.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Key Technical Projects */}
            {resumeData.projects?.length > 0 && (
              <div>
                <h4 style={{ fontSize: '0.9rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-primary)' }}>
                  <FolderGit2 size={15} color="var(--primary-light)" /> Key Technical Projects ({resumeData.projects.length})
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.75rem' }}>
                  {resumeData.projects.map((proj, idx) => (
                    <div key={idx} style={{ padding: '0.75rem 1rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <strong style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>{proj.name}</strong>
                        {proj.link && (
                          <a href={proj.link} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary-light)', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                            Demo <ExternalLink size={10} />
                          </a>
                        )}
                      </div>
                      {proj.description && (
                        <p style={{ margin: '0.4rem 0', fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                          {proj.description}
                        </p>
                      )}
                      {proj.techStack?.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginTop: '0.4rem' }}>
                          {proj.techStack.map((tech, tIdx) => (
                            <span key={tIdx} style={{ fontSize: '0.7rem', padding: '0.15rem 0.45rem', borderRadius: '4px', background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                              {tech}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Education & Certifications Row */}
            <div className="grid-2">
              {resumeData.education?.length > 0 && (
                <div>
                  <h4 style={{ fontSize: '0.9rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-primary)' }}>
                    <GraduationCap size={15} color="var(--primary-light)" /> Education ({resumeData.education.length})
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {resumeData.education.map((edu, idx) => (
                      <div key={idx} style={{ padding: '0.6rem 0.8rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', fontSize: '0.825rem' }}>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                          {edu.degree} {edu.field ? `in ${edu.field}` : ''}
                        </div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.775rem' }}>
                          {edu.institution} {edu.endYear ? `(${edu.endYear})` : ''}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {resumeData.certifications?.length > 0 && (
                <div>
                  <h4 style={{ fontSize: '0.9rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-primary)' }}>
                    <Award size={15} color="var(--primary-light)" /> Certifications ({resumeData.certifications.length})
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {resumeData.certifications.map((cert, idx) => (
                      <div key={idx} style={{ padding: '0.6rem 0.8rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', fontSize: '0.825rem' }}>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                          {cert.name}
                        </div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.775rem' }}>
                          {cert.issuer} {cert.date ? `&bull; ${cert.date}` : ''}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="empty-state" style={{ padding: '2rem 1rem' }}>
            <FileText size={36} style={{ color: 'var(--text-muted)', margin: '0 auto 0.75rem' }} />
            <h4 style={{ margin: '0 0 0.5rem' }}>No Resume Saved Yet</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: 420, margin: '0 auto 1.25rem' }}>
              Create and save your professional executive resume in the Resume Builder to showcase your portfolio, credentials, and calculate your real ATS score.
            </p>
            <Link to="/resume/builder" className="btn btn-primary btn-sm">
              <Sparkles size={14} /> Open Resume Builder
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
