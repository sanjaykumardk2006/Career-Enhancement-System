import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  adminGetStats,
  adminGetUsers,
  adminGetUserById,
  adminUpdateUserRole,
  adminDeleteUser,
  adminGetAllApplications,
} from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import {
  Users, Briefcase, Mic, FileText, Clock, ShieldCheck,
  Search, Eye, ShieldAlert, Trash2, CheckCircle2,
  AlertTriangle, X, Award, Activity, Server,
  Lock, RefreshCw
} from 'lucide-react';
import { Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import './AdminDashboard.css';

const STATUS_COLORS = {
  Applied: '#6366f1',
  Screening: '#f59e0b',
  Interview: '#06b6d4',
  Offer: '#10b981',
  Rejected: '#ef4444',
  Withdrawn: '#6060a0',
};

export default function AdminDashboard() {
  const { user: currentAdmin } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'overview';

  // Overall Stats
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  // Users Management State
  const [usersList, setUsersList] = useState([]);
  const [userStats, setUserStats] = useState({ total: 0, students: 0, admins: 0 });
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  // Selected User Dossier Modal State
  const [selectedUserDossier, setSelectedUserDossier] = useState(null);
  const [loadingDossier, setLoadingDossier] = useState(false);

  // Delete User Confirmation Modal State
  const [userToDelete, setUserToDelete] = useState(null);
  const [deletingUser, setDeletingUser] = useState(false);

  // Applications Pipeline State
  const [allApplications, setAllApplications] = useState([]);
  const [appStats, setAppStats] = useState({ total: 0, applied: 0, interview: 0, offer: 0, rejected: 0 });
  const [loadingApps, setLoadingApps] = useState(false);
  const [appSearch, setAppSearch] = useState('');
  const [appStatusFilter, setAppStatusFilter] = useState('all');

  // Load telemetry stats on user action
  const fetchTelemetryStats = useCallback(async () => {
    try {
      const { data } = await adminGetStats();
      setStats(data);
    } catch {
      toast.error('Failed to load telemetry stats');
    }
  }, []);

  // Load users list on user action
  const fetchUsers = useCallback(async () => {
    try {
      setLoadingUsers(true);
      const { data } = await adminGetUsers({ search: userSearch, role: roleFilter });
      setUsersList(data.users || []);
      if (data.stats) {
        setUserStats(data.stats);
      }
    } catch {
      toast.error('Failed to fetch user directory');
    } finally {
      setLoadingUsers(false);
    }
  }, [userSearch, roleFilter]);

  // Load applications pipeline on user action
  const fetchApplications = useCallback(async () => {
    try {
      setLoadingApps(true);
      const { data } = await adminGetAllApplications();
      setAllApplications(data.jobs || []);
      if (data.stats) {
        setAppStats(data.stats);
      }
    } catch {
      toast.error('Failed to fetch applications pipeline');
    } finally {
      setLoadingApps(false);
    }
  }, []);

  // Synchronize telemetry stats on mount
  useEffect(() => {
    let ignore = false;
    adminGetStats()
      .then(({ data }) => {
        if (!ignore) {
          setStats(data);
          setLoadingStats(false);
        }
      })
      .catch(() => {
        if (!ignore) {
          toast.error('Failed to load telemetry stats');
          setLoadingStats(false);
        }
      });
    return () => {
      ignore = true;
    };
  }, []);

  // Synchronize tab data when activeTab or query changes
  useEffect(() => {
    let ignore = false;
    if (activeTab === 'users') {
      adminGetUsers({ search: userSearch, role: roleFilter })
        .then(({ data }) => {
          if (!ignore) {
            setUsersList(data.users || []);
            if (data.stats) setUserStats(data.stats);
            setLoadingUsers(false);
          }
        })
        .catch(() => {
          if (!ignore) {
            toast.error('Failed to fetch user directory');
            setLoadingUsers(false);
          }
        });
    } else if (activeTab === 'applications') {
      adminGetAllApplications()
        .then(({ data }) => {
          if (!ignore) {
            setAllApplications(data.jobs || []);
            if (data.stats) setAppStats(data.stats);
            setLoadingApps(false);
          }
        })
        .catch(() => {
          if (!ignore) {
            toast.error('Failed to fetch applications pipeline');
            setLoadingApps(false);
          }
        });
    }
    return () => {
      ignore = true;
    };
  }, [activeTab, userSearch, roleFilter]);

  const setTab = (tab) => {
    setSearchParams({ tab });
  };

  // Inspect User Dossier
  const handleInspectUser = async (userId) => {
    try {
      setLoadingDossier(true);
      const { data } = await adminGetUserById(userId);
      setSelectedUserDossier(data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to retrieve candidate dossier');
    } finally {
      setLoadingDossier(false);
    }
  };

  // Change User Role
  const handleToggleRole = async (targetUser) => {
    const newRole = targetUser.role === 'admin' ? 'student' : 'admin';
    if (targetUser._id === currentAdmin?._id && newRole !== 'admin') {
      toast.error('Security Guard: You cannot demote your own administrator account.');
      return;
    }

    try {
      const { data } = await adminUpdateUserRole(targetUser._id, { role: newRole });
      toast.success(data.message || `Role updated to ${newRole}`);
      fetchUsers();
      fetchTelemetryStats();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update user role');
    }
  };

  // Confirm and Execute User Deletion
  const handleConfirmDeleteUser = async () => {
    if (!userToDelete) return;
    if (userToDelete._id === currentAdmin?._id) {
      toast.error('Security Guard: You cannot delete your own administrator account.');
      setUserToDelete(null);
      return;
    }

    try {
      setDeletingUser(true);
      const { data } = await adminDeleteUser(userToDelete._id);
      toast.success(data.message || 'User deleted successfully');
      setUserToDelete(null);
      fetchUsers();
      fetchTelemetryStats();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete user');
    } finally {
      setDeletingUser(false);
    }
  };

  // Filtered Applications
  const filteredApplications = allApplications.filter((app) => {
    const matchesStatus = appStatusFilter === 'all' || app.status === appStatusFilter;
    const query = appSearch.toLowerCase().trim();
    const matchesSearch =
      !query ||
      app.company?.toLowerCase().includes(query) ||
      app.position?.toLowerCase().includes(query) ||
      app.user?.name?.toLowerCase().includes(query) ||
      app.user?.email?.toLowerCase().includes(query);
    return matchesStatus && matchesSearch;
  });

  const pieData = stats?.jobsByStatus?.map((s) => ({
    name: s._id,
    value: s.count,
    color: STATUS_COLORS[s._id] || '#6060a0',
  })) || [];

  return (
    <div className="admin-console-wrapper animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-row">
          <div className="header-icon-box" style={{ background: 'rgba(245, 158, 11, 0.15)', borderColor: 'rgba(245, 158, 11, 0.35)', color: '#fbbf24' }}>
            <ShieldCheck size={20} strokeWidth={2.4} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.2rem' }}>
              <h1 style={{ margin: 0 }}>Executive Command Center</h1>
              <span className="admin-badge-pill">
                <ShieldCheck size={12} /> Authorized Admin
              </span>
            </div>
            <p>Institutional oversight, role-based access governance, candidate dossiers, and real-time telemetry</p>
          </div>
        </div>
      </div>

      {/* Admin Tabs */}
      <div className="admin-tabs-nav">
        <button
          className={`admin-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setTab('overview')}
        >
          <Activity size={16} /> Executive Overview
        </button>

        <button
          className={`admin-tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setTab('users')}
        >
          <Users size={16} /> User Directory & Access
          {userStats.total > 0 && <span className="admin-tab-count">{userStats.total}</span>}
        </button>

        <button
          className={`admin-tab-btn ${activeTab === 'applications' ? 'active' : ''}`}
          onClick={() => setTab('applications')}
        >
          <Briefcase size={16} /> Institutional Job Tracker
          {appStats.total > 0 && <span className="admin-tab-count">{appStats.total}</span>}
        </button>

        <button
          className={`admin-tab-btn ${activeTab === 'security' ? 'active' : ''}`}
          onClick={() => setTab('security')}
        >
          <Lock size={16} /> Security & Audit
        </button>
      </div>

      {/* =========================================================
          TAB 1: EXECUTIVE OVERVIEW
         ========================================================= */}
      {activeTab === 'overview' && (
        <div className="animate-fade-in">
          {loadingStats ? (
            <div className="loading-overlay"><div className="spinner" /><p>Calibrating platform telemetry...</p></div>
          ) : (
            <>
              {/* Stat Cards Grid */}
              <div className="grid-4 mb-2">
                {[
                  { label: 'Registered Students', value: stats?.totalUsers || 0, icon: Users, color: '#6366f1', bg: 'rgba(99,102,241,0.12)' },
                  { label: 'Student Applications', value: stats?.totalJobs || 0, icon: Briefcase, color: '#06b6d4', bg: 'rgba(6,182,212,0.12)' },
                  { label: 'Mock Interviews', value: stats?.totalInterviews || 0, icon: Mic, color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
                  { label: 'Curated Resumes', value: stats?.totalResumes || 0, icon: FileText, color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
                ].map(({ label, value, icon: Icon, color, bg }) => (
                  <div key={label} className="stat-card">
                    <div className="stat-icon" style={{ background: bg }}><Icon size={22} style={{ color }} /></div>
                    <div className="stat-info">
                      <div className="stat-value">{value}</div>
                      <div className="stat-label">{label}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Charts & Analytics */}
              <div className="grid-2 mb-2">
                <div className="card">
                  <h4 style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span>Applications by Funnel Stage</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Institutional Distribution</span>
                  </h4>
                  {pieData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={220}>
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          outerRadius={70}
                          dataKey="value"
                          label={({ name, value }) => `${name}: ${value}`}
                          labelLine={false}
                          fontSize={11}
                        >
                          {pieData.map((entry, i) => (
                            <Cell key={i} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-primary)' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="empty-state"><p>No job applications recorded in system yet</p></div>
                  )}
                </div>

                <div className="card">
                  <h4 style={{ marginBottom: '1.25rem' }}>AI Interview Studio Performance</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                    <div style={{ padding: '0.85rem 1rem', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Total Sessions Initiated</span>
                      <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{stats?.totalInterviews || 0}</span>
                    </div>
                    <div style={{ padding: '0.85rem 1rem', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Fully Evaluated & Scored</span>
                      <span style={{ fontWeight: 700, color: 'var(--success)' }}>{stats?.completedInterviews || 0}</span>
                    </div>
                    <div style={{ padding: '0.85rem 1rem', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Session Completion Rate</span>
                      <span style={{ fontWeight: 700, color: 'var(--primary-light)' }}>
                        {stats?.totalInterviews > 0
                          ? Math.round(((stats.completedInterviews || 0) / stats.totalInterviews) * 100)
                          : 0}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Registrations with Quick Inspection */}
              <div className="card">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                  <h4 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Clock size={16} style={{ color: 'var(--secondary)' }} />
                    Recent Candidate Registrations
                  </h4>
                  <button className="btn btn-secondary btn-sm" onClick={() => setTab('users')}>
                    View All Users ({stats?.totalUsers || 0})
                  </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  {stats?.recentUsers?.map((u) => (
                    <div
                      key={u._id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        padding: '0.75rem 1rem',
                        background: 'var(--bg-input)',
                        borderRadius: 'var(--radius-md)',
                      }}
                    >
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          background: 'linear-gradient(135deg, #1e1b4b, #312e81)',
                          border: '1px solid rgba(99, 102, 241, 0.35)',
                          borderRadius: 'var(--radius-full)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#c7d2fe',
                          fontWeight: 700,
                          fontSize: '0.85rem',
                          flexShrink: 0,
                        }}
                      >
                        {u.name[0]?.toUpperCase() || 'U'}
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)', margin: 0 }}>
                          {u.name}
                        </p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>{u.email}</p>
                      </div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {new Date(u.createdAt).toLocaleDateString()}
                      </span>
                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '0.3rem 0.65rem', fontSize: '0.75rem' }}
                        onClick={() => handleInspectUser(u._id)}
                      >
                        <Eye size={13} /> View
                      </button>
                    </div>
                  ))}
                  {(!stats?.recentUsers || stats.recentUsers.length === 0) && (
                    <div className="empty-state"><p>No users registered yet</p></div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* =========================================================
          TAB 2: AUTHORIZED USER DIRECTORY & GOVERNANCE
         ========================================================= */}
      {activeTab === 'users' && (
        <div className="animate-fade-in">
          {/* Toolbar */}
          <div className="admin-toolbar">
            <div className="admin-search-box">
              <Search size={16} color="var(--text-muted)" />
              <input
                type="text"
                className="admin-search-input"
                placeholder="Search candidates by name, email, target role, or skills..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
              />
              {userSearch && (
                <button
                  type="button"
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                  onClick={() => setUserSearch('')}
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="admin-filter-group">
              <button
                className={`filter-chip ${roleFilter === 'all' ? 'active' : ''}`}
                onClick={() => setRoleFilter('all')}
              >
                All ({userStats.total})
              </button>
              <button
                className={`filter-chip ${roleFilter === 'student' ? 'active' : ''}`}
                onClick={() => setRoleFilter('student')}
              >
                Students ({userStats.students})
              </button>
              <button
                className={`filter-chip ${roleFilter === 'admin' ? 'active' : ''}`}
                onClick={() => setRoleFilter('admin')}
              >
                Admins ({userStats.admins})
              </button>
              <button
                className="filter-chip"
                onClick={fetchUsers}
                title="Refresh user directory"
              >
                <RefreshCw size={13} />
              </button>
            </div>
          </div>

          {/* User Data Table */}
          <div className="admin-table-container">
            {loadingUsers ? (
              <div style={{ padding: '3rem', textAlign: 'center' }}>
                <div className="spinner" style={{ margin: '0 auto 1rem' }} />
                <p style={{ color: 'var(--text-secondary)' }}>Querying authorized user directory...</p>
              </div>
            ) : usersList.length > 0 ? (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>User / Candidate</th>
                    <th>Role & Privilege</th>
                    <th>Target Goal / Skills</th>
                    <th>Joined</th>
                    <th style={{ textAlign: 'right' }}>Authorized Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {usersList.map((targetUser) => {
                    const isSelf = targetUser._id === currentAdmin?._id;
                    return (
                      <tr key={targetUser._id}>
                        {/* User info */}
                        <td>
                          <div className="user-cell">
                            <div
                              className="user-avatar-badge"
                              style={{
                                background: targetUser.role === 'admin'
                                  ? 'linear-gradient(135deg, #78350f, #b45309)'
                                  : 'linear-gradient(135deg, #1e1b4b, #312e81)',
                                color: targetUser.role === 'admin' ? '#fef3c7' : '#c7d2fe',
                                border: targetUser.role === 'admin'
                                  ? '1px solid rgba(245, 158, 11, 0.4)'
                                  : '1px solid rgba(99, 102, 241, 0.35)',
                              }}
                            >
                              {targetUser.name[0]?.toUpperCase() || 'U'}
                            </div>
                            <div>
                              <div className="user-cell-name">
                                {targetUser.name} {isSelf && <span style={{ fontSize: '0.72rem', color: 'var(--primary-light)' }}>(You)</span>}
                              </div>
                              <div className="user-cell-email">{targetUser.email}</div>
                            </div>
                          </div>
                        </td>

                        {/* Role */}
                        <td>
                          <span className={`role-badge ${targetUser.role}`}>
                            {targetUser.role === 'admin' ? (
                              <>
                                <ShieldCheck size={12} /> Administrator
                              </>
                            ) : (
                              <>
                                <Users size={12} /> Student
                              </>
                            )}
                          </span>
                        </td>

                        {/* Target Goal / Skills */}
                        <td>
                          <div style={{ maxWidth: 260 }}>
                            {targetUser.careerGoal ? (
                              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
                                🎯 {targetUser.careerGoal}
                              </div>
                            ) : (
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Not configured</span>
                            )}
                            {targetUser.skills && targetUser.skills.length > 0 && (
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px' }}>
                                {targetUser.skills.slice(0, 3).map((s, idx) => (
                                  <span key={idx} className="skill-tag-pill" style={{ fontSize: '0.68rem', padding: '0.1rem 0.4rem' }}>
                                    {s}
                                  </span>
                                ))}
                                {targetUser.skills.length > 3 && (
                                  <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', alignSelf: 'center' }}>
                                    +{targetUser.skills.length - 3}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Joined Date */}
                        <td>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            {new Date(targetUser.createdAt).toLocaleDateString()}
                          </span>
                        </td>

                        {/* Actions */}
                        <td>
                          <div className="action-btn-group" style={{ justifyContent: 'flex-end' }}>
                            {/* Inspect View */}
                            <button
                              type="button"
                              className="action-btn view"
                              title="View Candidate Portfolio"
                              onClick={() => handleInspectUser(targetUser._id)}
                            >
                              <Eye size={15} />
                            </button>

                            {/* Toggle Role */}
                            <button
                              type="button"
                              className="action-btn role"
                              title={
                                isSelf
                                  ? 'Self-demotion disabled'
                                  : targetUser.role === 'admin'
                                  ? 'Demote to Student'
                                  : 'Elevate to Administrator'
                              }
                              disabled={isSelf}
                              style={{ opacity: isSelf ? 0.4 : 1, cursor: isSelf ? 'not-allowed' : 'pointer' }}
                              onClick={() => handleToggleRole(targetUser)}
                            >
                              <ShieldAlert size={15} />
                            </button>

                            {/* Delete User */}
                            <button
                              type="button"
                              className="action-btn delete"
                              title={isSelf ? 'Self-deletion disabled' : 'Permanently Delete User'}
                              disabled={isSelf}
                              style={{ opacity: isSelf ? 0.4 : 1, cursor: isSelf ? 'not-allowed' : 'pointer' }}
                              onClick={() => setUserToDelete(targetUser)}
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="empty-state" style={{ padding: '3rem' }}>
                <p>No users matching the query &ldquo;{userSearch}&rdquo;</p>
                <button
                  className="btn btn-secondary btn-sm"
                  style={{ marginTop: '0.5rem' }}
                  onClick={() => {
                    setUserSearch('');
                    setRoleFilter('all');
                  }}
                >
                  Reset Filters
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================
          TAB 3: INSTITUTIONAL APPLICATIONS PIPELINE
         ========================================================= */}
      {activeTab === 'applications' && (
        <div className="animate-fade-in">
          {/* Applications Toolbar */}
          <div className="admin-toolbar">
            <div className="admin-search-box">
              <Search size={16} color="var(--text-muted)" />
              <input
                type="text"
                className="admin-search-input"
                placeholder="Search by company, position, or candidate name..."
                value={appSearch}
                onChange={(e) => setAppSearch(e.target.value)}
              />
            </div>

            <div className="admin-filter-group">
              {['all', 'Applied', 'Screening', 'Interview', 'Offer', 'Rejected'].map((status) => (
                <button
                  key={status}
                  className={`filter-chip ${appStatusFilter === status ? 'active' : ''}`}
                  onClick={() => setAppStatusFilter(status)}
                >
                  {status === 'all' ? `All (${appStats.total})` : status}
                </button>
              ))}
              <button
                className="filter-chip"
                onClick={fetchApplications}
                title="Refresh applications pipeline"
              >
                <RefreshCw size={13} />
              </button>
            </div>
          </div>

          {/* Applications Table */}
          <div className="admin-table-container">
            {loadingApps ? (
              <div style={{ padding: '3rem', textAlign: 'center' }}>
                <div className="spinner" style={{ margin: '0 auto 1rem' }} />
                <p style={{ color: 'var(--text-secondary)' }}>Auditing platform applications...</p>
              </div>
            ) : filteredApplications.length > 0 ? (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Candidate</th>
                    <th>Company & Position</th>
                    <th>Status</th>
                    <th>Applied Date</th>
                    <th>Salary / Compensation</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredApplications.map((app) => (
                    <tr key={app._id}>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                          {app.user?.name || 'Candidate'}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {app.user?.email || 'N/A'}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{app.company}</div>
                        <div style={{ fontSize: '0.775rem', color: 'var(--text-secondary)' }}>{app.position}</div>
                      </td>
                      <td>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '0.2rem 0.6rem',
                            borderRadius: 'var(--radius-full)',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            background: `${STATUS_COLORS[app.status] || '#6060a0'}22`,
                            color: STATUS_COLORS[app.status] || '#fff',
                            border: `1px solid ${STATUS_COLORS[app.status] || '#6060a0'}55`,
                          }}
                        >
                          {app.status}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          {new Date(app.appliedDate || app.createdAt).toLocaleDateString()}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          {app.salary || 'Undisclosed'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="empty-state" style={{ padding: '3rem' }}>
                <p>No applications match the current filter criteria</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================
          TAB 4: SECURITY & RBAC AUDIT
         ========================================================= */}
      {activeTab === 'security' && (
        <div className="animate-fade-in">
          <div className="security-card">
            <h4 style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Lock size={18} style={{ color: '#fbbf24' }} /> Active Administrator Session & RBAC Scope
            </h4>
            <div className="dossier-grid">
              <div className="dossier-metric-box">
                <div className="dossier-metric-label">Logged-In Administrator</div>
                <div className="dossier-metric-val">{currentAdmin?.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{currentAdmin?.email}</div>
              </div>
              <div className="dossier-metric-box">
                <div className="dossier-metric-label">Access Authorization Token</div>
                <div className="dossier-metric-val" style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <CheckCircle2 size={16} /> Verified Active
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>JWT Bearer Signature valid</div>
              </div>
              <div className="dossier-metric-box">
                <div className="dossier-metric-label">Assigned Role</div>
                <div className="dossier-metric-val" style={{ color: '#fbbf24' }}>
                  Super-Administrator
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Level 3 Executive Access</div>
              </div>
            </div>
          </div>

          <div className="security-card">
            <h4 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldCheck size={18} style={{ color: 'var(--success)' }} /> System Guardrails & Enforced Policies
            </h4>

            <div className="security-policy-row">
              <div className="policy-info">
                <h5>1. Role-Based Access Control (RBAC) Guard</h5>
                <p>All sensitive operations (/api/auth/admin/* and /api/jobs/admin/*) require both `protect` and `admin` middleware verification.</p>
              </div>
              <span className="policy-status-pill"><CheckCircle2 size={12} /> Active</span>
            </div>

            <div className="security-policy-row">
              <div className="policy-info">
                <h5>2. Self-Demotion Lockout Prevention</h5>
                <p>Guards prevent administrators from demoting their own account, preventing accidental loss of platform governance access.</p>
              </div>
              <span className="policy-status-pill"><CheckCircle2 size={12} /> Active</span>
            </div>

            <div className="security-policy-row">
              <div className="policy-info">
                <h5>3. Active Admin Self-Deletion Shield</h5>
                <p>Guards prevent an active administrator from executing account deletion on themselves.</p>
              </div>
              <span className="policy-status-pill"><CheckCircle2 size={12} /> Active</span>
            </div>

            <div className="security-policy-row">
              <div className="policy-info">
                <h5>4. Cascading Referential Data Integrity</h5>
                <p>When a candidate account is deleted, linked resumes, interviews, roadmaps, and job applications are atomically purged.</p>
              </div>
              <span className="policy-status-pill"><CheckCircle2 size={12} /> Active</span>
            </div>

            <div className="security-policy-row">
              <div className="policy-info">
                <h5>5. Public Admin Registration Prohibition</h5>
                <p>Public signup endpoints reject any request attempting to inject role: &quot;admin&quot; to prevent privilege escalation.</p>
              </div>
              <span className="policy-status-pill"><CheckCircle2 size={12} /> Active</span>
            </div>
          </div>

          <div className="security-card">
            <h4 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Server size={18} style={{ color: 'var(--primary-light)' }} /> Platform Infrastructure Diagnostics
            </h4>
            <div className="grid-3">
              <div style={{ padding: '1rem', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Database Engine</div>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.2rem' }}>MongoDB Atlas (M0/M10)</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--success)', marginTop: '0.2rem' }}>● Connected & Synced</div>
              </div>
              <div style={{ padding: '1rem', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>AI Inference Engine</div>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.2rem' }}>Gemini Flash + Contextual Failover</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--success)', marginTop: '0.2rem' }}>● High Availability Active</div>
              </div>
              <div style={{ padding: '1rem', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Authentication Protocol</div>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.2rem' }}>HMAC SHA256 (JWT)</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--success)', marginTop: '0.2rem' }}>● Expire: 30 Days</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading View Overlay */}
      {loadingDossier && (
        <div className="admin-modal-backdrop">
          <div className="admin-modal-card" style={{ maxWidth: 320, padding: '2rem', textAlign: 'center', alignItems: 'center' }}>
            <div className="spinner" style={{ margin: '0 auto 1rem' }} />
            <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              Retrieving candidate portfolio view...
            </p>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL: CANDIDATE PORTFOLIO VIEW
         ========================================================= */}
      {selectedUserDossier && (
        <div className="admin-modal-backdrop" onClick={() => setSelectedUserDossier(null)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <div className="admin-modal-title">
                <FileText size={18} color="var(--primary-light)" />
                Candidate Portfolio View
              </div>
              <button
                type="button"
                className="action-btn"
                onClick={() => setSelectedUserDossier(null)}
              >
                <X size={16} />
              </button>
            </div>

            <div className="admin-modal-body">
              {/* Profile Overview Card */}
              <div className="dossier-profile-card">
                <div className="dossier-avatar">
                  {selectedUserDossier.user.name[0]?.toUpperCase() || 'U'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <h3 style={{ margin: 0, fontSize: '1.2rem' }}>{selectedUserDossier.user.name}</h3>
                    <span className={`role-badge ${selectedUserDossier.user.role}`}>
                      {selectedUserDossier.user.role}
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    {selectedUserDossier.user.email} &bull; Joined {new Date(selectedUserDossier.user.createdAt).toLocaleDateString()}
                  </p>
                  {selectedUserDossier.user.careerGoal && (
                    <div style={{ marginTop: '0.4rem', fontSize: '0.85rem', color: 'var(--primary-light)', fontWeight: 600 }}>
                      🎯 Target Career: {selectedUserDossier.user.careerGoal}
                    </div>
                  )}
                </div>
              </div>

              {/* Dossier Metrics */}
              <div className="dossier-grid">
                <div className="dossier-metric-box">
                  <div className="dossier-metric-label">Resume ATS Score</div>
                  <div className="dossier-metric-val" style={{ color: selectedUserDossier.portfolio.resume?.atsScore ? 'var(--success)' : 'var(--text-muted)' }}>
                    {selectedUserDossier.portfolio.resume?.atsScore ? `${selectedUserDossier.portfolio.resume.atsScore}/100` : 'Not uploaded'}
                  </div>
                </div>
                <div className="dossier-metric-box">
                  <div className="dossier-metric-label">Completed Interviews</div>
                  <div className="dossier-metric-val">
                    {selectedUserDossier.portfolio.interviews?.filter((i) => i.status === 'completed').length || 0}
                  </div>
                </div>
                <div className="dossier-metric-box">
                  <div className="dossier-metric-label">Job Applications</div>
                  <div className="dossier-metric-val">
                    {selectedUserDossier.portfolio.applications?.length || 0}
                  </div>
                </div>
                <div className="dossier-metric-box">
                  <div className="dossier-metric-label">Curriculum Progress</div>
                  <div className="dossier-metric-val" style={{ color: 'var(--primary-light)' }}>
                    {selectedUserDossier.portfolio.roadmap?.overallProgress || 0}%
                  </div>
                </div>
              </div>

              {/* Bio & Education */}
              {(selectedUserDossier.user.bio || selectedUserDossier.user.education) && (
                <div style={{ marginBottom: '1.25rem' }}>
                  <div className="dossier-section-title">Background & Profile</div>
                  {selectedUserDossier.user.bio && (
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                      {selectedUserDossier.user.bio}
                    </p>
                  )}
                  {selectedUserDossier.user.education && (
                    <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                      <strong>Education:</strong> {selectedUserDossier.user.education}
                    </p>
                  )}
                </div>
              )}

              {/* Skills */}
              {selectedUserDossier.user.skills && selectedUserDossier.user.skills.length > 0 && (
                <div style={{ marginBottom: '1.25rem' }}>
                  <div className="dossier-section-title">Declared Skillset</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                    {selectedUserDossier.user.skills.map((skill, i) => (
                      <span key={i} className="skill-tag-pill">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Applications Snapshot */}
              {selectedUserDossier.portfolio.applications?.length > 0 && (
                <div style={{ marginBottom: '1.25rem' }}>
                  <div className="dossier-section-title">
                    <Briefcase size={15} /> Recent Job Applications
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {selectedUserDossier.portfolio.applications.slice(0, 4).map((app) => (
                      <div
                        key={app._id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0.65rem 0.85rem',
                          background: 'var(--bg-input)',
                          borderRadius: 'var(--radius-md)',
                          fontSize: '0.85rem',
                        }}
                      >
                        <div>
                          <strong>{app.company}</strong> &bull; {app.position}
                        </div>
                        <span style={{ fontSize: '0.75rem', color: STATUS_COLORS[app.status] || 'inherit', fontWeight: 600 }}>
                          {app.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Mock Interviews Snapshot */}
              {selectedUserDossier.portfolio.interviews?.length > 0 && (
                <div>
                  <div className="dossier-section-title">
                    <Award size={15} /> Mock Interview Evaluations
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {selectedUserDossier.portfolio.interviews.slice(0, 3).map((intv) => (
                      <div
                        key={intv._id}
                        style={{
                          padding: '0.65rem 0.85rem',
                          background: 'var(--bg-input)',
                          borderRadius: 'var(--radius-md)',
                          fontSize: '0.85rem',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                          <strong>{intv.jobRole}</strong>
                          <span style={{ color: intv.score >= 70 ? 'var(--success)' : '#fbbf24', fontWeight: 700 }}>
                            Score: {intv.score || 'N/A'}/100
                          </span>
                        </div>
                        {intv.overallFeedback && (
                          <p style={{ margin: 0, fontSize: '0.775rem', color: 'var(--text-muted)' }}>
                            {intv.overallFeedback.slice(0, 140)}...
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="admin-modal-footer">
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setSelectedUserDossier(null)}
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL: CONFIRM DELETE USER
         ========================================================= */}
      {userToDelete && (
        <div className="admin-modal-backdrop" onClick={() => !deletingUser && setUserToDelete(null)}>
          <div className="admin-modal-card" style={{ maxWidth: 480 }} onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header" style={{ borderColor: 'rgba(239, 68, 68, 0.3)' }}>
              <div className="admin-modal-title" style={{ color: '#ef4444' }}>
                <AlertTriangle size={20} /> Confirm Account Removal
              </div>
              <button
                type="button"
                className="action-btn"
                disabled={deletingUser}
                onClick={() => setUserToDelete(null)}
              >
                <X size={16} />
              </button>
            </div>

            <div className="admin-modal-body">
              <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '1rem' }}>
                Are you sure you want to permanently delete the account for candidate:
              </p>
              <div style={{ padding: '0.85rem', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: 'var(--radius-md)', marginBottom: '1rem' }}>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{userToDelete.name}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{userToDelete.email}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                  Role: <strong>{userToDelete.role}</strong>
                </div>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                ⚠️ <strong>Cascading Purge:</strong> This authorized administrative action will permanently delete this user, their uploaded resume, all mock interview recordings/scores, learning roadmap, and job application pipeline records. This cannot be undone.
              </p>
            </div>

            <div className="admin-modal-footer">
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                disabled={deletingUser}
                onClick={() => setUserToDelete(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger btn-sm"
                style={{ background: '#ef4444', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                disabled={deletingUser}
                onClick={handleConfirmDeleteUser}
              >
                {deletingUser ? 'Deleting...' : (
                  <>
                    <Trash2 size={14} /> Permanently Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
