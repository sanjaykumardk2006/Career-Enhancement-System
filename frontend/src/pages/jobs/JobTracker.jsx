import { useState, useEffect } from 'react';
import {
  getJobApplications,
  createJobApplication,
  updateJobApplication,
  deleteJobApplication,
} from '../../services/api';
import toast from 'react-hot-toast';
import {
  Plus, Briefcase, Search, Trash2, Edit, X, ExternalLink,
  Kanban, List, ArrowRight
} from 'lucide-react';
import './JobTracker.css';

const STATUS_OPTIONS = ['Applied', 'Screening', 'Interview', 'Offer', 'Rejected', 'Withdrawn'];
const KANBAN_STAGES = ['Applied', 'Screening', 'Interview', 'Offer', 'Rejected'];

const STATUS_COLORS = {
  Applied: '#6366f1',
  Screening: '#f59e0b',
  Interview: '#06b6d4',
  Offer: '#10b981',
  Rejected: '#ef4444',
  Withdrawn: '#6060a0',
};

const NEXT_STAGE_MAP = {
  Applied: 'Screening',
  Screening: 'Interview',
  Interview: 'Offer',
  Offer: null,
  Rejected: 'Applied',
  Withdrawn: 'Applied',
};

const JOB_TYPES = ['Full-time', 'Part-time', 'Internship', 'Contract', 'Remote'];

const emptyForm = {
  company: '',
  position: '',
  location: '',
  jobType: 'Full-time',
  salary: '',
  jobUrl: '',
  status: 'Applied',
  notes: '',
};

export default function JobTracker() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' | 'list'
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
          toast.error('Failed to load applications');
          setLoading(false);
        }
      });
    return () => {
      ignore = true;
    };
  }, []);

  const openModal = (job = null) => {
    setEditingJob(job);
    setForm(
      job
        ? {
            company: job.company,
            position: job.position,
            location: job.location || '',
            jobType: job.jobType,
            salary: job.salary || '',
            jobUrl: job.jobUrl || '',
            status: job.status,
            notes: job.notes || '',
          }
        : emptyForm
    );
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
    } catch {
      toast.error('Failed to save application');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (jobId, newStatus) => {
    try {
      const { data } = await updateJobApplication(jobId, { status: newStatus });
      setJobs((prev) => prev.map((j) => (j._id === jobId ? data : j)));
      toast.success(`Moved to ${newStatus}`);
    } catch {
      toast.error('Failed to update stage');
    }
  };

  const handleAdvanceStage = (job) => {
    const next = NEXT_STAGE_MAP[job.status];
    if (next) {
      handleStatusChange(job._id, next);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this application from your tracker?')) return;
    try {
      await deleteJobApplication(id);
      setJobs(jobs.filter((j) => j._id !== id));
      toast.success('Application deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  const filtered = jobs.filter((j) => {
    const matchSearch =
      j.company.toLowerCase().includes(search.toLowerCase()) ||
      j.position.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'All' || j.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const stats = STATUS_OPTIONS.reduce(
    (acc, s) => ({ ...acc, [s]: jobs.filter((j) => j.status === s).length }),
    {}
  );

  return (
    <div className="job-tracker-page animate-fade-in">
      {/* Top Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div className="page-header" style={{ margin: 0 }}>
          <div className="page-header-row">
            <div className="header-icon-box">
              <Briefcase size={18} strokeWidth={2.4} />
            </div>
            <div>
              <h1>Pipeline & Application Tracker</h1>
              <p>Visual Kanban board, active interview stages, offers, and opportunity lifecycle</p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
          {/* View Mode Toggle */}
          <div style={{ display: 'inline-flex', background: 'var(--bg-input)', padding: '3px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
            <button
              type="button"
              onClick={() => setViewMode('kanban')}
              className={`btn btn-sm ${viewMode === 'kanban' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
            >
              <Kanban size={14} /> Kanban
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`btn btn-sm ${viewMode === 'list' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
            >
              <List size={14} /> List View
            </button>
          </div>

          <button onClick={() => openModal()} className="btn btn-primary btn-sm">
            <Plus size={15} /> Add Application
          </button>
        </div>
      </div>

      {/* Filter Chips & Stats */}
      <div className="job-filter-buttons">
        {STATUS_OPTIONS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setFilterStatus(filterStatus === s ? 'All' : s)}
            style={{
              padding: '0.45rem 0.9rem',
              borderRadius: 'var(--radius-full)',
              border: `1px solid ${filterStatus === s ? STATUS_COLORS[s] : 'var(--border)'}`,
              background: filterStatus === s ? `${STATUS_COLORS[s]}18` : 'var(--bg-card)',
              color: filterStatus === s ? STATUS_COLORS[s] : 'var(--text-muted)',
              cursor: 'pointer',
              fontSize: '0.8rem',
              fontWeight: 600,
              transition: 'all 0.2s',
            }}
          >
            {s} ({stats[s] || 0})
          </button>
        ))}
        {filterStatus !== 'All' && (
          <button
            type="button"
            onClick={() => setFilterStatus('All')}
            style={{
              padding: '0.45rem 0.9rem',
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--border)',
              background: 'transparent',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              fontSize: '0.8rem',
            }}
          >
            Clear Filter
          </button>
        )}
      </div>

      {/* Search Input */}
      <div style={{ position: 'relative', marginBottom: '1.25rem' }}>
        <Search
          size={16}
          style={{
            position: 'absolute',
            left: '1rem',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--text-muted)',
            pointerEvents: 'none',
          }}
        />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter by company or role title..."
          className="form-input"
          style={{ paddingLeft: '2.75rem' }}
        />
      </div>

      {loading ? (
        <div className="loading-overlay">
          <div className="spinner" />
          <p>Loading application pipeline...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="card empty-state" style={{ padding: '3.5rem 1rem' }}>
          <Briefcase size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 1rem' }} />
          <h3>{search || filterStatus !== 'All' ? 'No matching applications' : 'Your Pipeline is Empty'}</h3>
          <p style={{ color: 'var(--text-muted)', maxWidth: 420, margin: '0.5rem auto 1.5rem' }}>
            Track every job application, recruiter conversation, coding screen, and formal offer in one structured board.
          </p>
          <button onClick={() => openModal()} className="btn btn-primary btn-sm">
            <Plus size={14} /> Add First Application
          </button>
        </div>
      ) : viewMode === 'kanban' ? (
        /* KANBAN BOARD VIEW */
        <div className="kanban-board">
          {KANBAN_STAGES.map((stage) => {
            const stageJobs = filtered.filter((j) => j.status === stage);
            const color = STATUS_COLORS[stage];
            return (
              <div key={stage} className="kanban-column">
                <div className="kanban-column-header">
                  <div className="kanban-column-title">
                    <span
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        background: color,
                        boxShadow: `0 0 8px ${color}`,
                      }}
                    />
                    <span>{stage}</span>
                  </div>
                  <span
                    className="kanban-column-badge"
                    style={{ background: `${color}20`, color }}
                  >
                    {stageJobs.length}
                  </span>
                </div>

                <div className="kanban-cards">
                  {stageJobs.map((job) => (
                    <div key={job._id} className="kanban-card">
                      <div className="kanban-card-top">
                        <span className="kanban-card-company">{job.company}</span>
                        {job.jobUrl && (
                          <a
                            href={job.jobUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: 'var(--text-muted)' }}
                            title="Open Job Listing"
                          >
                            <ExternalLink size={13} />
                          </a>
                        )}
                      </div>

                      <div className="kanban-card-pos">{job.position}</div>

                      <div className="kanban-card-meta">
                        {job.salary && (
                          <span style={{ color: 'var(--success)', fontWeight: 600 }}>
                            💰 {job.salary}
                          </span>
                        )}
                        {job.location && <span>📍 {job.location}</span>}
                        <span>
                          🗓️ {new Date(job.appliedDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} • {job.jobType}
                        </span>
                      </div>

                      <div className="kanban-card-actions">
                        {/* Quick stage selector */}
                        <select
                          value={job.status}
                          onChange={(e) => handleStatusChange(job._id, e.target.value)}
                          className="form-select"
                          style={{
                            fontSize: '0.725rem',
                            padding: '0.2rem 0.4rem',
                            width: 'auto',
                            maxWidth: '110px',
                            height: '26px',
                            borderRadius: '4px',
                          }}
                        >
                          {STATUS_OPTIONS.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                          {NEXT_STAGE_MAP[job.status] && (
                            <button
                              type="button"
                              onClick={() => handleAdvanceStage(job)}
                              className="btn btn-ghost btn-icon"
                              title={`Advance to ${NEXT_STAGE_MAP[job.status]}`}
                              style={{ width: 24, height: 24 }}
                            >
                              <ArrowRight size={13} />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => openModal(job)}
                            className="btn btn-ghost btn-icon"
                            title="Edit"
                            style={{ width: 24, height: 24 }}
                          >
                            <Edit size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(job._id)}
                            className="btn btn-ghost btn-icon"
                            style={{ width: 24, height: 24, color: 'var(--danger)' }}
                            title="Delete"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {stageJobs.length === 0 && (
                    <div className="kanban-empty-col">No {stage.toLowerCase()} applications</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* LIST VIEW */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {filtered.map((job) => (
            <div key={job._id} className="card job-card">
              <div
                style={{
                  width: 44,
                  height: 44,
                  background: `${STATUS_COLORS[job.status]}22`,
                  border: `1px solid ${STATUS_COLORS[job.status]}40`,
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  color: STATUS_COLORS[job.status],
                  flexShrink: 0,
                }}
              >
                {job.company[0]?.toUpperCase()}
              </div>

              <div className="job-card-main">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <p style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.925rem' }}>
                    {job.position}
                  </p>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>@{job.company}</span>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
                  {job.location && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>📍 {job.location}</span>
                  )}
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{job.jobType}</span>
                  {job.salary && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--success)' }}>💰 {job.salary}</span>
                  )}
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {new Date(job.appliedDate).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="job-card-actions">
                <select
                  value={job.status}
                  onChange={(e) => handleStatusChange(job._id, e.target.value)}
                  className="form-select"
                  style={{
                    fontSize: '0.75rem',
                    padding: '0.25rem 0.5rem',
                    borderRadius: 'var(--radius-full)',
                    background: `${STATUS_COLORS[job.status]}18`,
                    color: STATUS_COLORS[job.status],
                    border: `1px solid ${STATUS_COLORS[job.status]}40`,
                    fontWeight: 600,
                    width: 'auto',
                  }}
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  {job.jobUrl && (
                    <a
                      href={job.jobUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-ghost btn-icon"
                    >
                      <ExternalLink size={15} />
                    </a>
                  )}
                  <button onClick={() => openModal(job)} className="btn btn-ghost btn-icon">
                    <Edit size={15} />
                  </button>
                  <button
                    onClick={() => handleDelete(job._id)}
                    className="btn btn-ghost btn-icon"
                    style={{ color: 'var(--danger)' }}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for Add / Edit */}
      {showModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
        >
          <div className="card job-modal-card">
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.5rem',
              }}
            >
              <h4>{editingJob ? 'Edit Application' : 'Add Application'}</h4>
              <button onClick={() => setShowModal(false)} className="btn btn-ghost btn-icon">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Company Name *</label>
                  <input
                    value={form.company}
                    onChange={(e) => setForm({ ...form, company: e.target.value })}
                    className="form-input"
                    required
                    placeholder="e.g. Stripe, Netflix, Google..."
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Position / Title *</label>
                  <input
                    value={form.position}
                    onChange={(e) => setForm({ ...form, position: e.target.value })}
                    className="form-input"
                    required
                    placeholder="e.g. Senior Frontend Engineer"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Location</label>
                  <input
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    className="form-input"
                    placeholder="e.g. San Francisco, CA / Remote"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Employment Type</label>
                  <select
                    value={form.jobType}
                    onChange={(e) => setForm({ ...form, jobType: e.target.value })}
                    className="form-select"
                  >
                    {JOB_TYPES.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Compensation / Salary</label>
                  <input
                    value={form.salary}
                    onChange={(e) => setForm({ ...form, salary: e.target.value })}
                    className="form-input"
                    placeholder="e.g. $120,000 - $140,000"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Pipeline Stage</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="form-select"
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Job Listing URL</label>
                <input
                  value={form.jobUrl}
                  onChange={(e) => setForm({ ...form, jobUrl: e.target.value })}
                  className="form-input"
                  placeholder="https://company.com/careers/..."
                />
              </div>
              <div className="form-group">
                <label className="form-label">Recruiter & Interview Notes</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="form-textarea"
                  rows={3}
                  placeholder="Key contacts, referral info, technical questions asked, next round date..."
                />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? (
                    <>
                      <span className="spinner-sm" /> {editingJob ? 'Updating...' : 'Adding...'}
                    </>
                  ) : editingJob ? (
                    'Update Application'
                  ) : (
                    'Add Application'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
