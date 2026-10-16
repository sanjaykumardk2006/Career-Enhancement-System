import { useState, useEffect } from 'react';
import { getJobApplications, createJobApplication, updateJobApplication, deleteJobApplication } from '../../services/api';
import toast from 'react-hot-toast';
import { Plus, Briefcase, Search, Trash2, Edit, X, ExternalLink } from 'lucide-react';
import './JobTracker.css';

const STATUS_OPTIONS = ['Applied', 'Screening', 'Interview', 'Offer', 'Rejected', 'Withdrawn'];
const STATUS_COLORS = { Applied: '#6366f1', Screening: '#f59e0b', Interview: '#06b6d4', Offer: '#10b981', Rejected: '#ef4444', Withdrawn: '#6060a0' };
const JOB_TYPES = ['Full-time', 'Part-time', 'Internship', 'Contract', 'Remote'];

const emptyForm = { company: '', position: '', location: '', jobType: 'Full-time', salary: '', jobUrl: '', status: 'Applied', notes: '' };

export default function JobTracker() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [submitting, setSubmitting] = useState(false);


  useEffect(() => {
    let ignore = false;
    getJobApplications()
      .then(({ data }) => {
        if (!ignore) {
          setJobs(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!ignore) {
          toast.error('Failed to load jobs');
          setLoading(false);
        }
      });
    return () => {
      ignore = true;
    };
  }, []);

  const openModal = (job = null) => {
    setEditingJob(job);
    setForm(job ? { company: job.company, position: job.position, location: job.location || '', jobType: job.jobType, salary: job.salary || '', jobUrl: job.jobUrl || '', status: job.status, notes: job.notes || '' } : emptyForm);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingJob) {
        const { data } = await updateJobApplication(editingJob._id, form);
        setJobs(jobs.map((j) => (j._id === editingJob._id ? data : j)));
        toast.success('Application updated!');
      } else {
        const { data } = await createJobApplication(form);
        setJobs([data, ...jobs]);
        toast.success('Application added!');
      }
      setShowModal(false);
    } catch { toast.error('Failed to save'); } finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this application?')) return;
    try {
      await deleteJobApplication(id);
      setJobs(jobs.filter((j) => j._id !== id));
      toast.success('Application deleted');
    } catch { toast.error('Failed to delete'); }
  };

  const filtered = jobs.filter((j) => {
    const matchSearch = j.company.toLowerCase().includes(search.toLowerCase()) || j.position.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'All' || j.status === filterStatus;
    return matchSearch && matchStatus;
  });

  // Stats
  const stats = STATUS_OPTIONS.reduce((acc, s) => ({ ...acc, [s]: jobs.filter((j) => j.status === s).length }), {});

  return (
    <div className="animate-fade-in" style={{ maxWidth: 1100 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div className="page-header" style={{ margin: 0 }}>
          <div className="page-header-row">
            <div className="header-icon-box">
              <Briefcase size={18} strokeWidth={2.4} />
            </div>
            <div>
              <h1>Pipeline & Application Tracker</h1>
              <p>Active interview stages, offers, and opportunity lifecycle</p>
            </div>
          </div>
        </div>
        <button onClick={() => openModal()} className="btn btn-primary"><Plus size={16} />Add Application</button>
      </div>

      {/* Stats */}
      <div className="job-filter-buttons">
        {STATUS_OPTIONS.map((s) => (
          <button key={s} onClick={() => setFilterStatus(filterStatus === s ? 'All' : s)}
            style={{ padding: '0.5rem 1rem', borderRadius: 'var(--radius-full)', border: `1px solid ${filterStatus === s ? STATUS_COLORS[s] : 'var(--border)'}`, background: filterStatus === s ? `${STATUS_COLORS[s]}18` : 'var(--bg-card)', color: filterStatus === s ? STATUS_COLORS[s] : 'var(--text-muted)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, transition: 'all 0.2s' }}>
            {s} ({stats[s] || 0})
          </button>
        ))}
        {filterStatus !== 'All' && <button onClick={() => setFilterStatus('All')} style={{ padding: '0.5rem 1rem', borderRadius: 'var(--radius-full)', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.8rem' }}>Clear Filter</button>}
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: '1.25rem' }}>
        <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by company or position..." className="form-input" style={{ paddingLeft: '2.75rem' }} />
      </div>

      {loading ? (
        <div className="loading-overlay"><div className="spinner" /></div>
      ) : filtered.length === 0 ? (
        <div className="card empty-state">
          <Briefcase size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 1rem' }} />
          <h3>{search || filterStatus !== 'All' ? 'No matching applications' : 'No applications yet'}</h3>
          <p>Start tracking your job search journey</p>
          <button onClick={() => openModal()} className="btn btn-primary btn-sm" style={{ marginTop: '1rem' }}>Add First Application</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {filtered.map((job) => (
            <div key={job._id} className="card job-card">
              <div style={{ width: 44, height: 44, background: `${STATUS_COLORS[job.status]}22`, border: `1px solid ${STATUS_COLORS[job.status]}40`, borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: STATUS_COLORS[job.status], flexShrink: 0 }}>
                {job.company[0]?.toUpperCase()}
              </div>
              <div className="job-card-main">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <p style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.925rem' }}>{job.position}</p>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>@{job.company}</span>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
                  {job.location && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>📍 {job.location}</span>}
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{job.jobType}</span>
                  {job.salary && <span style={{ fontSize: '0.75rem', color: 'var(--success)' }}>💰 {job.salary}</span>}
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(job.appliedDate).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="job-card-actions">
                <span style={{ padding: '0.25rem 0.75rem', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 600, background: `${STATUS_COLORS[job.status]}18`, color: STATUS_COLORS[job.status], border: `1px solid ${STATUS_COLORS[job.status]}40` }}>
                  {job.status}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  {job.jobUrl && <a href={job.jobUrl} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-icon"><ExternalLink size={15} /></a>}
                  <button onClick={() => openModal(job)} className="btn btn-ghost btn-icon"><Edit size={15} /></button>
                  <button onClick={() => handleDelete(job._id)} className="btn btn-ghost btn-icon" style={{ color: 'var(--danger)' }}><Trash2 size={15} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="card job-modal-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h4>{editingJob ? 'Edit Application' : 'Add Application'}</h4>
              <button onClick={() => setShowModal(false)} className="btn btn-ghost btn-icon"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Company *</label>
                  <input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} className="form-input" required placeholder="Google, Amazon..." />
                </div>
                <div className="form-group">
                  <label className="form-label">Position *</label>
                  <input value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} className="form-input" required placeholder="Software Engineer" />
                </div>
                <div className="form-group">
                  <label className="form-label">Location</label>
                  <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="form-input" placeholder="New York, NY" />
                </div>
                <div className="form-group">
                  <label className="form-label">Job Type</label>
                  <select value={form.jobType} onChange={(e) => setForm({ ...form, jobType: e.target.value })} className="form-select">
                    {JOB_TYPES.map((t) => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Salary Range</label>
                  <input value={form.salary} onChange={(e) => setForm({ ...form, salary: e.target.value })} className="form-input" placeholder="$80k - $120k" />
                </div>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="form-select">
                    {STATUS_OPTIONS.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Job URL</label>
                <input value={form.jobUrl} onChange={(e) => setForm({ ...form, jobUrl: e.target.value })} className="form-input" placeholder="https://jobs.example.com/..." />
              </div>
              <div className="form-group">
                <label className="form-label">Notes</label>
                <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="form-textarea" rows={3} placeholder="Interview notes, contacts, follow-up dates..." />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? <><span className="spinner-sm" />{editingJob ? 'Updating...' : 'Adding...'}</> : editingJob ? 'Update' : 'Add Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
