import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, CheckCircle2, XCircle, Users, Flag, Activity, Ban, ShieldAlert, BarChart3, Clock, UserPlus, Shield, User, Mail, Key, X, Sparkles } from 'lucide-react';
import Layout from '../components/layout/Layout';
import Button from '../components/ui/Button';
import { adminApi, reportsApi } from '../lib/api';
import { Property, ListingReport, AuditLog } from '../types';

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<'verification' | 'users' | 'flagged' | 'audit' | 'analytics'>('verification');

  const [pendingProperties, setPendingProperties] = useState<Property[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [reports, setReports] = useState<ListingReport[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Add Property Owner Modal State
  const [showAddOwnerModal, setShowAddOwnerModal] = useState(false);
  const [ownerName, setOwnerName] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [ownerPassword, setOwnerPassword] = useState('');
  const [ownerPhone, setOwnerPhone] = useState('');
  const [addingOwner, setAddingOwner] = useState(false);
  const [ownerSuccessMsg, setOwnerSuccessMsg] = useState('');

  // Add Admin Modal State
  const [showAddAdminModal, setShowAddAdminModal] = useState(false);
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [addingAdmin, setAddingAdmin] = useState(false);
  const [adminSuccessMsg, setAdminSuccessMsg] = useState('');

  // Reject / Suspend reason modal state
  const [actionTarget, setActionTarget] = useState<{ id: string; type: 'reject' | 'suspend' } | null>(null);
  const [reason, setReason] = useState('');
  const [submittingAction, setSubmittingAction] = useState(false);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [pendingRes, usersRes, reportsRes, auditRes, analyticsRes] = await Promise.allSettled([
        adminApi.pending(),
        adminApi.users(),
        reportsApi.adminAll(),
        adminApi.auditLogs(),
        adminApi.analytics(),
      ]);

      if (pendingRes.status === 'fulfilled' && Array.isArray(pendingRes.value)) setPendingProperties(pendingRes.value);
      else setPendingProperties([]);

      if (usersRes.status === 'fulfilled' && Array.isArray(usersRes.value?.data)) setUsers(usersRes.value.data);
      else if (usersRes.status === 'fulfilled' && Array.isArray(usersRes.value)) setUsers(usersRes.value);
      else setUsers([]);

      if (reportsRes.status === 'fulfilled' && Array.isArray(reportsRes.value)) setReports(reportsRes.value);
      else setReports([]);

      if (auditRes.status === 'fulfilled' && Array.isArray(auditRes.value?.data)) setAuditLogs(auditRes.value.data);
      else if (auditRes.status === 'fulfilled' && Array.isArray(auditRes.value)) setAuditLogs(auditRes.value);
      else setAuditLogs([]);

      if (analyticsRes.status === 'fulfilled') setAnalytics(analyticsRes.value);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleApprove = async (propertyId: string) => {
    try {
      await adminApi.approve(propertyId);
      fetchAdminData();
    } catch {}
  };

  const handleActionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actionTarget || !reason.trim()) return;
    setSubmittingAction(true);
    try {
      if (actionTarget.type === 'reject') {
        await adminApi.reject(actionTarget.id, reason.trim());
      } else {
        await adminApi.suspend(actionTarget.id, reason.trim());
      }
      setActionTarget(null);
      setReason('');
      fetchAdminData();
    } catch {
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleToggleUserActive = async (userId: string) => {
    try {
      await adminApi.toggleUserActive(userId);
      fetchAdminData();
    } catch {}
  };

  const handleResolveReport = async (reportId: string, status: string) => {
    try {
      await reportsApi.resolve(reportId, status, 'Resolved by system manager.');
      fetchAdminData();
    } catch {}
  };

  const handleAddOwner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ownerEmail.trim() || !ownerPassword.trim()) return;
    setAddingOwner(true);
    setOwnerSuccessMsg('');

    const cleanEmail = ownerEmail.trim().toLowerCase();
    const newOwner = {
      id: `owner_${Date.now()}`,
      full_name: ownerName.trim() || cleanEmail.split('@')[0],
      email: cleanEmail,
      phone: ownerPhone.trim() || undefined,
      role: 'landlord',
      created_at: new Date().toISOString(),
    };

    // Save temporary password
    localStorage.setItem(`rc_pwd_${cleanEmail}`, ownerPassword);

    // Save in registered owners storage
    const registeredOwnersStr = localStorage.getItem('rc_registered_owners');
    let registeredOwners = registeredOwnersStr ? JSON.parse(registeredOwnersStr) : [];
    registeredOwners = [newOwner, ...registeredOwners.filter((o: any) => o.email?.toLowerCase() !== cleanEmail)];
    localStorage.setItem('rc_registered_owners', JSON.stringify(registeredOwners));

    setOwnerSuccessMsg(`Property Owner "${cleanEmail}" added successfully! They can now log in via Google or password.`);
    setOwnerName('');
    setOwnerEmail('');
    setOwnerPassword('');
    setOwnerPhone('');
    setAddingOwner(false);
    fetchAdminData();
  };

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminEmail.trim() || !adminPassword.trim()) return;
    setAddingAdmin(true);
    setAdminSuccessMsg('');

    const cleanEmail = adminEmail.trim().toLowerCase();

    // Save temporary password
    localStorage.setItem(`rc_pwd_${cleanEmail}`, adminPassword);

    // Save in authorized admins list
    const authorizedAdminsStr = localStorage.getItem('rc_authorized_admins');
    let authorizedAdmins: string[] = authorizedAdminsStr ? JSON.parse(authorizedAdminsStr) : [];
    if (!authorizedAdmins.includes(cleanEmail)) {
      authorizedAdmins.push(cleanEmail);
      localStorage.setItem('rc_authorized_admins', JSON.stringify(authorizedAdmins));
    }

    setAdminSuccessMsg(`New Admin "${cleanEmail}" authorized! They can now log in to /admin via Google or password.`);
    setAdminName('');
    setAdminEmail('');
    setAdminPassword('');
    setAddingAdmin(false);
    fetchAdminData();
  };

  return (
    <Layout>
      <div className="bg-zinc-50 min-h-screen pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="bg-zinc-900 text-white rounded-3xl p-6 mb-8 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-full bg-[#f06023] border-2 border-[#f06023] flex items-center justify-center font-extrabold text-xl shadow-md">
                <ShieldCheck className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">System Manager Console</h1>
                <p className="text-xs text-zinc-400">Platform Moderation, Verification & Audit Control</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setShowAddOwnerModal(true);
                  setOwnerSuccessMsg('');
                }}
                className="px-4 py-2.5 bg-[#f06023] hover:bg-[#d94b12] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-md cursor-pointer active:scale-98"
              >
                <UserPlus className="h-4 w-4" /> Add Property Owner
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddAdminModal(true);
                  setAdminSuccessMsg('');
                }}
                className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-md cursor-pointer active:scale-98"
              >
                <Shield className="h-4 w-4 text-[#f06023]" /> Add System Admin
              </button>
            </div>
          </div>

          {/* Stat Cards Overview */}
          {analytics && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white border border-zinc-200 p-4 rounded-2xl shadow-sm">
                <p className="text-xs text-zinc-400 font-semibold uppercase">Pending Verification</p>
                <p className="text-2xl font-extrabold text-amber-500 mt-1">{analytics.properties?.pending ?? 0}</p>
              </div>
              <div className="bg-white border border-zinc-200 p-4 rounded-2xl shadow-sm">
                <p className="text-xs text-zinc-400 font-semibold uppercase">Published Properties</p>
                <p className="text-2xl font-extrabold text-emerald-600 mt-1">{analytics.properties?.published ?? 0}</p>
              </div>
              <div className="bg-white border border-zinc-200 p-4 rounded-2xl shadow-sm">
                <p className="text-xs text-zinc-400 font-semibold uppercase">Registered Users</p>
                <p className="text-2xl font-extrabold text-zinc-900 mt-1">{analytics.users?.total ?? 0}</p>
              </div>
              <div className="bg-white border border-zinc-200 p-4 rounded-2xl shadow-sm">
                <p className="text-xs text-zinc-400 font-semibold uppercase">Pending Flagged Reports</p>
                <p className="text-2xl font-extrabold text-red-500 mt-1">{analytics.reports?.pending ?? 0}</p>
              </div>
            </div>
          )}

          {/* Navigation Tabs */}
          <div className="flex space-x-2 border-b border-zinc-200 mb-8 overflow-x-auto">
            <button
              onClick={() => setActiveTab('verification')}
              className={`pb-3 px-4 text-sm font-semibold transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'verification'
                  ? 'border-[#f06023] text-[#f06023]'
                  : 'border-transparent text-zinc-500 hover:text-zinc-800'
              }`}
            >
              <ShieldCheck className="h-4 w-4" /> Verification Queue ({pendingProperties.length})
            </button>

            <button
              onClick={() => setActiveTab('users')}
              className={`pb-3 px-4 text-sm font-semibold transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'users'
                  ? 'border-[#f06023] text-[#f06023]'
                  : 'border-transparent text-zinc-500 hover:text-zinc-800'
              }`}
            >
              <Users className="h-4 w-4" /> User Management ({users.length})
            </button>

            <button
              onClick={() => setActiveTab('flagged')}
              className={`pb-3 px-4 text-sm font-semibold transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'flagged'
                  ? 'border-[#f06023] text-[#f06023]'
                  : 'border-transparent text-zinc-500 hover:text-zinc-800'
              }`}
            >
              <Flag className="h-4 w-4" /> Flagged Reports ({reports.length})
            </button>

            <button
              onClick={() => setActiveTab('audit')}
              className={`pb-3 px-4 text-sm font-semibold transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'audit'
                  ? 'border-[#f06023] text-[#f06023]'
                  : 'border-transparent text-zinc-500 hover:text-zinc-800'
              }`}
            >
              <Activity className="h-4 w-4" /> Audit Logs ({auditLogs.length})
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`pb-3 px-4 text-sm font-semibold transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'analytics'
                  ? 'border-[#f06023] text-[#f06023]'
                  : 'border-transparent text-zinc-500 hover:text-zinc-800'
              }`}
            >
              <BarChart3 className="h-4 w-4" /> System Analytics
            </button>
          </div>

          {/* Tab Content */}
          {loading ? (
            <div className="flex justify-center items-center h-48">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#f06023]" />
            </div>
          ) : (
            <>
              {/* Verification Queue */}
              {activeTab === 'verification' && (
                <div className="space-y-4">
                  {pendingProperties.length === 0 ? (
                    <div className="bg-white rounded-2xl p-12 text-center border border-zinc-200">
                      <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto mb-3" />
                      <h3 className="text-lg font-bold text-zinc-700">Verification Queue Clear</h3>
                      <p className="text-zinc-500 text-xs mt-1">No property listings are currently waiting for admin approval.</p>
                    </div>
                  ) : (
                    pendingProperties.map((p) => (
                      <div key={p.id} className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div>
                            <span className="bg-amber-50 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-200 uppercase">
                              Pending Review
                            </span>
                            <h3 className="font-bold text-zinc-900 text-base mt-1">{p.title}</h3>
                            <p className="text-xs text-zinc-500">
                              Zone: {p.display_zone} • Price: UGX {Number(p.price).toLocaleString()} • Owner: {p.owner?.full_name} ({p.owner?.email})
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleApprove(p.id)}
                              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1"
                            >
                              <CheckCircle2 className="h-4 w-4" /> Approve
                            </button>
                            <button
                              onClick={() => setActionTarget({ id: p.id, type: 'reject' })}
                              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1"
                            >
                              <XCircle className="h-4 w-4" /> Reject
                            </button>
                          </div>
                        </div>

                        <p className="text-xs text-zinc-600 bg-zinc-50 p-3 rounded-xl border border-zinc-200/60 line-clamp-3">
                          {p.description}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* User Management */}
              {activeTab === 'users' && (
                <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-zinc-100 border-b border-zinc-200 text-zinc-600 uppercase font-semibold">
                      <tr>
                        <th className="p-4">User</th>
                        <th className="p-4">Role</th>
                        <th className="p-4">Account Status</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 text-zinc-800">
                      {users.map((u) => (
                        <tr key={u.id} className="hover:bg-zinc-50">
                          <td className="p-4">
                            <div className="font-bold text-zinc-900">{u.full_name}</div>
                            <div className="text-zinc-400">{u.email}</div>
                          </td>
                          <td className="p-4 capitalize">
                            <span className="bg-zinc-100 text-zinc-700 px-2.5 py-1 rounded-full font-semibold">
                              {u.role}
                            </span>
                          </td>
                          <td className="p-4">
                            <span
                              className={`px-2.5 py-1 rounded-full font-semibold ${
                                u.is_active !== false
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-red-50 text-red-700 border border-red-200'
                              }`}
                            >
                              {u.is_active !== false ? 'Active' : 'Disabled'}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            {u.role !== 'admin' && (
                              <button
                                onClick={() => handleToggleUserActive(u.id)}
                                className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                                  u.is_active !== false
                                    ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
                                    : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200'
                                }`}
                              >
                                {u.is_active !== false ? 'Disable Account' : 'Enable Account'}
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Flagged Reports */}
              {activeTab === 'flagged' && (
                <div className="space-y-4">
                  {reports.length === 0 ? (
                    <div className="bg-white rounded-2xl p-12 text-center border border-zinc-200">
                      <ShieldCheck className="h-12 w-12 text-emerald-500 mx-auto mb-3" />
                      <h3 className="text-lg font-bold text-zinc-700">No Flagged Listings</h3>
                      <p className="text-zinc-500 text-xs mt-1">No user reports pending moderation review.</p>
                    </div>
                  ) : (
                    reports.map((rep) => (
                      <div key={rep.id} className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="bg-red-50 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-red-200 uppercase">
                              Report Reason: {rep.reason}
                            </span>
                            <h4 className="font-bold text-zinc-900 text-sm mt-1">
                              Property: {rep.property?.title || 'Unknown Property'}
                            </h4>
                            <p className="text-xs text-zinc-500">Reported by: {rep.reporter?.full_name} ({rep.reporter?.email})</p>
                          </div>

                          <div className="flex items-center gap-2">
                            {rep.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleResolveReport(rep.id, 'action_taken')}
                                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold"
                                >
                                  Take Action
                                </button>
                                <button
                                  onClick={() => handleResolveReport(rep.id, 'dismissed')}
                                  className="px-3 py-1.5 bg-zinc-200 hover:bg-zinc-300 text-zinc-700 rounded-xl text-xs font-bold"
                                >
                                  Dismiss
                                </button>
                              </>
                            )}
                          </div>
                        </div>

                        {rep.details && (
                          <p className="text-xs text-zinc-700 bg-zinc-50 p-3 rounded-xl border border-zinc-200/60">
                            Details: {rep.details}
                          </p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Audit Logs */}
              {activeTab === 'audit' && (
                <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-zinc-100 border-b border-zinc-200 text-zinc-600 uppercase font-semibold">
                      <tr>
                        <th className="p-4">Timestamp</th>
                        <th className="p-4">Action</th>
                        <th className="p-4">Target Type</th>
                        <th className="p-4">Target ID</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 text-zinc-800">
                      {auditLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-zinc-50 font-mono text-[11px]">
                          <td className="p-4 text-zinc-500">{new Date(log.created_at).toLocaleString()}</td>
                          <td className="p-4 font-bold text-[#f06023]">{log.action}</td>
                          <td className="p-4 uppercase">{log.target_type}</td>
                          <td className="p-4 text-zinc-400 truncate max-w-[150px]">{log.target_id}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Analytics Overview */}
              {activeTab === 'analytics' && (
                <div className="space-y-6">
                  <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-zinc-900 mb-4 flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-[#f06023]" /> Platform Performance & Operations Summary
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4">
                        <h4 className="text-xs font-bold text-zinc-500 uppercase mb-2">Property Listings</h4>
                        <div className="space-y-2 text-xs font-medium">
                          <div className="flex justify-between">
                            <span className="text-zinc-600">Total Listings:</span>
                            <span className="font-bold text-zinc-900">{analytics?.properties?.total ?? 0}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-emerald-600">Published / Active:</span>
                            <span className="font-bold text-emerald-700">{analytics?.properties?.published ?? 0}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-amber-600">Pending Review:</span>
                            <span className="font-bold text-amber-700">{analytics?.properties?.pending ?? 0}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-red-600">Rejected / Suspended:</span>
                            <span className="font-bold text-red-700">{analytics?.properties?.rejected ?? 0}</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4">
                        <h4 className="text-xs font-bold text-zinc-500 uppercase mb-2">User Distribution</h4>
                        <div className="space-y-2 text-xs font-medium">
                          <div className="flex justify-between">
                            <span className="text-zinc-600">Total Users:</span>
                            <span className="font-bold text-zinc-900">{analytics?.users?.total ?? 0}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-blue-600">Tenants / Customers:</span>
                            <span className="font-bold text-blue-700">{analytics?.users?.tenants ?? 0}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-purple-600">Property Owners / Brokers:</span>
                            <span className="font-bold text-purple-700">{analytics?.users?.landlords ?? 0}</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4">
                        <h4 className="text-xs font-bold text-zinc-500 uppercase mb-2">Inquiries & Reports</h4>
                        <div className="space-y-2 text-xs font-medium">
                          <div className="flex justify-between">
                            <span className="text-zinc-600">Total Inquiries:</span>
                            <span className="font-bold text-zinc-900">{analytics?.inquiries?.total ?? 0}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-red-600">Flagged Reports:</span>
                            <span className="font-bold text-red-700">{analytics?.reports?.pending ?? 0}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-zinc-500">Audit Actions Tracked:</span>
                            <span className="font-bold text-zinc-700">{auditLogs.length}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Reject / Suspend Reason Modal */}
      {actionTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-zinc-900 mb-2">
              {actionTarget.type === 'reject' ? 'Reject Property Listing' : 'Suspend Property Listing'}
            </h3>
            <p className="text-xs text-zinc-500 mb-4">Provide a reason for the property owner notification log.</p>

            <form onSubmit={handleActionSubmit} className="space-y-4">
              <textarea
                required
                rows={3}
                className="w-full p-3 border border-zinc-300 rounded-xl text-sm focus:outline-none focus:border-red-500"
                placeholder="Reason for rejection or suspension..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
              <div className="flex gap-2">
                <Button variant="secondary" fullWidth type="button" onClick={() => setActionTarget(null)}>
                  Cancel
                </Button>
                <Button variant="primary" fullWidth type="submit" disabled={submittingAction}>
                  Confirm
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Property Owner Modal */}
      {showAddOwnerModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setShowAddOwnerModal(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-lg font-bold text-zinc-900 mb-1 flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-[#f06023]" /> Register New Property Owner
            </h3>
            <p className="text-xs text-zinc-500 mb-4">
              Pre-authorize a Property Owner account. They can log in via Google or password immediately.
            </p>

            {ownerSuccessMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl mb-4 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>{ownerSuccessMsg}</span>
              </div>
            )}

            <form onSubmit={handleAddOwner} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mukasa Robert"
                  className="w-full p-3 border border-zinc-300 rounded-xl text-sm focus:outline-none focus:border-[#f06023]"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Google Email / User Email</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. mukasa.owner@gmail.com"
                  className="w-full p-3 border border-zinc-300 rounded-xl text-sm focus:outline-none focus:border-[#f06023]"
                  value={ownerEmail}
                  onChange={(e) => setOwnerEmail(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">First-Time Temporary Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full p-3 border border-zinc-300 rounded-xl text-sm focus:outline-none focus:border-[#f06023]"
                  value={ownerPassword}
                  onChange={(e) => setOwnerPassword(e.target.value)}
                />
                <p className="text-[10px] text-zinc-400 mt-0.5">The owner can change this password later in their profile.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Phone Number (Optional)</label>
                <input
                  type="text"
                  placeholder="+256 700 000 000"
                  className="w-full p-3 border border-zinc-300 rounded-xl text-sm focus:outline-none focus:border-[#f06023]"
                  value={ownerPhone}
                  onChange={(e) => setOwnerPhone(e.target.value)}
                />
              </div>

              <div className="pt-2 flex gap-2">
                <Button variant="secondary" fullWidth type="button" onClick={() => setShowAddOwnerModal(false)}>
                  Cancel
                </Button>
                <Button variant="primary" fullWidth type="submit" disabled={addingOwner}>
                  {addingOwner ? 'Adding Owner...' : 'Add Property Owner'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add System Admin Modal */}
      {showAddAdminModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative border-t-4 border-[#f06023]">
            <button
              onClick={() => setShowAddAdminModal(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-lg font-bold text-zinc-900 mb-1 flex items-center gap-2">
              <Shield className="h-5 w-5 text-[#f06023]" /> Authorize New System Administrator
            </h3>
            <p className="text-xs text-zinc-500 mb-4">
              Add a new Google email to the system admin allowlist for /admin portal access.
            </p>

            {adminSuccessMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl mb-4 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>{adminSuccessMsg}</span>
              </div>
            )}

            <form onSubmit={handleAddAdmin} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Admin Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sarah Mukiibi"
                  className="w-full p-3 border border-zinc-300 rounded-xl text-sm focus:outline-none focus:border-[#f06023]"
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Google Account Email</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. sarah.admin@gmail.com"
                  className="w-full p-3 border border-zinc-300 rounded-xl text-sm focus:outline-none focus:border-[#f06023]"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">First-Time Temporary Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full p-3 border border-zinc-300 rounded-xl text-sm focus:outline-none focus:border-[#f06023]"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                />
              </div>

              <div className="pt-2 flex gap-2">
                <Button variant="secondary" fullWidth type="button" onClick={() => setShowAddAdminModal(false)}>
                  Cancel
                </Button>
                <Button variant="primary" fullWidth type="submit" disabled={addingAdmin}>
                  {addingAdmin ? 'Authorizing Admin...' : 'Authorize Admin'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
