import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHouseUser, faUserShield } from '@fortawesome/free-solid-svg-icons';
import { 
  ShieldCheck, CheckCircle2, XCircle, Users, Flag, Activity, Ban, ShieldAlert, 
  BarChart3, Clock, UserPlus, Shield, User, Mail, Key, X, Sparkles, Building2, 
  Tag, Crown, Search, Filter, Phone, Image as ImageIcon, Eye, TrendingUp, Percent, Check
} from 'lucide-react';
import Layout from '../components/layout/Layout';
import Button from '../components/ui/Button';
import { adminApi, reportsApi, propertiesApi } from '../lib/api';
import { mockProperties } from '../data/mockData';
import { Property, ListingReport, AuditLog } from '../types';

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<'verification' | 'users' | 'properties' | 'flagged' | 'audit' | 'analytics' | 'post_property'>('verification');

  const [pendingProperties, setPendingProperties] = useState<Property[]>([]);
  const [allProperties, setAllProperties] = useState<Property[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [reports, setReports] = useState<ListingReport[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Property Filters
  const [propertySearch, setPropertySearch] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('all');

  // Add Property Owner Modal State
  const [showAddOwnerModal, setShowAddOwnerModal] = useState(false);
  const [ownerName, setOwnerName] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [ownerPassword, setOwnerPassword] = useState('');
  const [ownerPhone, setOwnerPhone] = useState('');
  const [ownerPlan, setOwnerPlan] = useState<'basic' | 'pay-per-client' | 'premium'>('pay-per-client');
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

  // Admin: Post / Edit Property State
  const [showPropertyModal, setShowPropertyModal] = useState(false);
  const [editingAdminPropertyId, setEditingAdminPropertyId] = useState<string | null>(null);
  const [pTitle, setPTitle] = useState('');
  const [pDescription, setPDescription] = useState('');
  const [pType, setPType] = useState('apartment');
  const [pListingType, setPListingType] = useState('rent');
  const [pPrice, setPPrice] = useState('');
  const [pZone, setPZone] = useState('');
  const [pAddress, setPAddress] = useState('');
  const [pBedrooms, setPBedrooms] = useState('1');
  const [pBathrooms, setPBathrooms] = useState('1');
  const [pPhotos, setPPhotos] = useState<string[]>([]);
  const [pNewPhotoUrl, setPNewPhotoUrl] = useState('');
  const [pSubmitting, setPSubmitting] = useState(false);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [pendingRes, usersRes, reportsRes, auditRes, analyticsRes, propertiesRes] = await Promise.allSettled([
        adminApi.pending(),
        adminApi.users(),
        reportsApi.adminAll(),
        adminApi.auditLogs(),
        adminApi.analytics(),
        propertiesApi.list(),
      ]);

      if (pendingRes.status === 'fulfilled' && Array.isArray(pendingRes.value)) setPendingProperties(pendingRes.value);
      else setPendingProperties([]);

      // Aggregate All Properties (API + Custom Local + Mock Data)
      let backendProps: Property[] = [];
      if (propertiesRes.status === 'fulfilled' && Array.isArray(propertiesRes.value?.data)) backendProps = propertiesRes.value.data;
      else if (propertiesRes.status === 'fulfilled' && Array.isArray(propertiesRes.value)) backendProps = propertiesRes.value;

      const customPropsStr = localStorage.getItem('rc_custom_properties');
      const customProps: Property[] = customPropsStr ? JSON.parse(customPropsStr) : [];

      const propsMap = new Map<string, Property>();
      [...customProps, ...backendProps, ...mockProperties].forEach((p) => {
        if (p && p.id) propsMap.set(p.id, p);
      });

      const aggregatedProperties = Array.from(propsMap.values());
      setAllProperties(aggregatedProperties);

      // Construct complete user list including system admins and added property owners
      const defaultAdminUsers = [
        { id: 'adm_1', full_name: 'Farid Zimula', email: 'faridzimula602@gmail.com', role: 'admin', is_active: true },
        { id: 'adm_2', full_name: 'Rhines Mukiibi', email: 'mukiibirhines2001@gmail.com', role: 'admin', is_active: true },
        { id: 'adm_3', full_name: 'Robert Tx', email: 'robtxpro002@gmail.com', role: 'admin', is_active: true },
        { id: 'adm_4', full_name: 'Robert Mukiibi', email: 'mukiibirobert002@gmail.com', role: 'admin', is_active: true },
      ];

      const customAdminsStr = localStorage.getItem('rc_authorized_admins');
      const customAdminEmails: string[] = customAdminsStr ? JSON.parse(customAdminsStr) : [];
      const customAdminUsers = customAdminEmails.map((email, idx) => ({
        id: `adm_custom_${idx}`,
        full_name: email.split('@')[0],
        email,
        role: 'admin',
        is_active: true,
      }));

      const registeredOwnersStr = localStorage.getItem('rc_registered_owners');
      const registeredOwners: any[] = registeredOwnersStr ? JSON.parse(registeredOwnersStr) : [];
      const localOwners = registeredOwners.map((o) => ({
        id: o.id || `owner_${Date.now()}`,
        full_name: o.full_name || o.email?.split('@')[0] || 'Property Owner',
        email: o.email,
        phone: o.phone,
        role: 'landlord',
        plan: o.plan || 'pay-per-client',
        is_active: true,
      }));

      let fetchedUsers: any[] = [];
      if (usersRes.status === 'fulfilled' && Array.isArray(usersRes.value?.data)) fetchedUsers = usersRes.value.data;
      else if (usersRes.status === 'fulfilled' && Array.isArray(usersRes.value)) fetchedUsers = usersRes.value;

      // Merge and deduplicate by email
      const allUsersMap = new Map<string, any>();
      [...defaultAdminUsers, ...customAdminUsers, ...localOwners, ...fetchedUsers].forEach((u) => {
        if (u.email) {
          const clean = u.email.toLowerCase().trim();
          if (!allUsersMap.has(clean)) {
            allUsersMap.set(clean, u);
          }
        }
      });

      setUsers(Array.from(allUsersMap.values()));

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

  const handleTogglePropertyAvailability = async (propertyId: string) => {
    try {
      await propertiesApi.toggleAvailability(propertyId);
    } catch {}

    const customPropsStr = localStorage.getItem('rc_custom_properties');
    let customProps: Property[] = customPropsStr ? JSON.parse(customPropsStr) : [];
    customProps = customProps.map((p) =>
      p.id === propertyId ? { ...p, is_available: !p.is_available } : p
    );
    localStorage.setItem('rc_custom_properties', JSON.stringify(customProps));

    setAllProperties((prev) =>
      prev.map((p) => (p.id === propertyId ? { ...p, is_available: !p.is_available } : p))
    );
  };

  const handleAdminDeleteProperty = (id: string) => {
    if (!confirm('Delete this property listing from the platform?')) return;
    const localSavedStr = localStorage.getItem('rc_custom_properties');
    let localProps: Property[] = localSavedStr ? JSON.parse(localSavedStr) : [];
    localProps = localProps.filter((p) => p.id !== id);
    localStorage.setItem('rc_custom_properties', JSON.stringify(localProps));
    setAllProperties((prev) => prev.filter((p) => p.id !== id));
    window.dispatchEvent(new CustomEvent('rc_properties_updated'));
  };

  const openAdminCreateModal = () => {
    setEditingAdminPropertyId(null);
    setPTitle(''); setPDescription(''); setPType('apartment'); setPListingType('rent');
    setPPrice(''); setPZone(''); setPAddress(''); setPBedrooms('1'); setPBathrooms('1');
    setPPhotos([]); setPNewPhotoUrl('');
    setShowPropertyModal(true);
  };

  const openAdminEditModal = (p: Property) => {
    setEditingAdminPropertyId(p.id);
    setPTitle(p.title); setPDescription(p.description); setPType(p.property_type);
    setPListingType(p.listing_type); setPPrice(String(p.price)); setPZone(p.display_zone);
    setPAddress(p.real_address || p.display_zone); setPBedrooms(String(p.bedrooms)); setPBathrooms(String(p.bathrooms));
    setPPhotos(p.images?.map((i) => i.image_url) || []); setPNewPhotoUrl('');
    setShowPropertyModal(true);
  };

  const handleAdminSaveProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    setPSubmitting(true);
    const propId = editingAdminPropertyId || `p_admin_${Date.now()}`;
    const formattedImages = pPhotos.length > 0
      ? pPhotos.map((url, idx) => ({ id: `img_${propId}_${idx}`, property_id: propId, image_url: url, is_primary: idx === 0 }))
      : [{ id: `img_${propId}_default`, property_id: propId, image_url: 'https://images.pexels.com/photos/1918291/pexels-photo-1918291.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', is_primary: true }];

    const savedProp: Property = {
      id: propId,
      owner_id: 'admin',
      title: pTitle,
      description: pDescription,
      property_type: pType,
      listing_type: pListingType,
      price: Number(pPrice),
      price_period: '/month',
      display_zone: pZone,
      real_address: pAddress || pZone,
      bedrooms: Number(pBedrooms),
      bathrooms: Number(pBathrooms),
      area_sqft: 1200,
      status: 'published',
      is_available: true,
      created_at: new Date().toISOString(),
      images: formattedImages,
      amenities: [],
      owner: { full_name: 'Rental Connect Admin', phone: '+256 700 000 000' },
    };

    const localSavedStr = localStorage.getItem('rc_custom_properties');
    let localProps: Property[] = localSavedStr ? JSON.parse(localSavedStr) : [];
    const idx = localProps.findIndex((p) => p.id === propId);
    if (idx >= 0) localProps[idx] = savedProp;
    else localProps = [savedProp, ...localProps];
    localStorage.setItem('rc_custom_properties', JSON.stringify(localProps));

    setAllProperties((prev) => {
      const without = prev.filter((p) => p.id !== propId);
      return [savedProp, ...without];
    });
    window.dispatchEvent(new CustomEvent('rc_properties_updated'));
    setShowPropertyModal(false);
    setPSubmitting(false);
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
      plan: ownerPlan,
      created_at: new Date().toISOString(),
    };

    // Save temporary password and user plan
    localStorage.setItem(`rc_pwd_${cleanEmail}`, ownerPassword);
    localStorage.setItem(`rc_user_plan_${cleanEmail}`, ownerPlan);

    // Save in registered owners storage
    const registeredOwnersStr = localStorage.getItem('rc_registered_owners');
    let registeredOwners = registeredOwnersStr ? JSON.parse(registeredOwnersStr) : [];
    registeredOwners = [newOwner, ...registeredOwners.filter((o: any) => o.email?.toLowerCase() !== cleanEmail)];
    localStorage.setItem('rc_registered_owners', JSON.stringify(registeredOwners));

    setOwnerSuccessMsg(`Property Owner "${cleanEmail}" registered under "${ownerPlan.toUpperCase()}" plan!`);
    setOwnerName('');
    setOwnerEmail('');
    setOwnerPassword('');
    setOwnerPhone('');
    setOwnerPlan('pay-per-client');
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
                onClick={openAdminCreateModal}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-md cursor-pointer active:scale-98"
              >
                <Building2 className="h-4 w-4" /> Post Property
              </button>
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
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5 mb-8">
            <div className="bg-white border border-zinc-200 p-4 rounded-2xl shadow-sm">
              <p className="text-[11px] text-zinc-400 font-bold uppercase tracking-wider">Total Properties</p>
              <p className="text-2xl font-extrabold text-zinc-900 mt-1">{allProperties.length}</p>
              <p className="text-[10px] text-zinc-400 mt-0.5">Live catalog listings</p>
            </div>

            <div className="bg-white border border-zinc-200 p-4 rounded-2xl shadow-sm">
              <p className="text-[11px] text-emerald-600 font-bold uppercase tracking-wider">Booked / Occupied</p>
              <p className="text-2xl font-extrabold text-emerald-600 mt-1">
                {allProperties.filter((p) => p.is_available === false).length}
              </p>
              <p className="text-[10px] text-zinc-400 mt-0.5">
                {allProperties.length > 0
                  ? `${Math.round((allProperties.filter((p) => p.is_available === false).length / allProperties.length) * 100)}% booking rate`
                  : '0% booking rate'}
              </p>
            </div>

            <div className="bg-white border border-zinc-200 p-4 rounded-2xl shadow-sm">
              <p className="text-[11px] text-amber-500 font-bold uppercase tracking-wider">Pending Verification</p>
              <p className="text-2xl font-extrabold text-amber-500 mt-1">{pendingProperties.length}</p>
              <p className="text-[10px] text-zinc-400 mt-0.5">Awaiting moderation</p>
            </div>

            <div className="bg-white border border-zinc-200 p-4 rounded-2xl shadow-sm">
              <p className="text-[11px] text-[#f06023] font-bold uppercase tracking-wider">Property Owners</p>
              <p className="text-2xl font-extrabold text-[#f06023] mt-1">
                {users.filter((u) => u.role === 'landlord' || u.role === 'owner').length}
              </p>
              <p className="text-[10px] text-zinc-400 mt-0.5">Verified owner accounts</p>
            </div>

            <div className="bg-white border border-zinc-200 p-4 rounded-2xl shadow-sm col-span-2 sm:col-span-1">
              <p className="text-[11px] text-zinc-500 font-bold uppercase tracking-wider">System Admins</p>
              <p className="text-2xl font-extrabold text-zinc-900 mt-1">
                {users.filter((u) => u.role === 'admin').length}
              </p>
              <p className="text-[10px] text-zinc-400 mt-0.5">Console moderators</p>
            </div>
          </div>

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
              onClick={() => setActiveTab('properties')}
              className={`pb-3 px-4 text-sm font-semibold transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'properties'
                  ? 'border-[#f06023] text-[#f06023]'
                  : 'border-transparent text-zinc-500 hover:text-zinc-800'
              }`}
            >
              <Building2 className="h-4 w-4" /> Live Properties Catalog ({allProperties.length})
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
              <BarChart3 className="h-4 w-4" /> Analytics & Plan Statistics
            </button>

            <button
              onClick={() => { openAdminCreateModal(); setActiveTab('post_property'); }}
              className={`pb-3 px-4 text-sm font-semibold transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'post_property'
                  ? 'border-emerald-600 text-emerald-600'
                  : 'border-transparent text-zinc-500 hover:text-zinc-800'
              }`}
            >
              <Building2 className="h-4 w-4" /> Post New Property
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
                <div className="space-y-4">
                  {/* User Management Toolbar */}
                  <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="font-bold text-zinc-900 text-base flex items-center gap-2">
                        <Users className="h-5 w-5 text-[#f06023]" /> System Users & Account Control
                      </h3>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        Manage system administrators, pre-authorized property owners, and tenant client accounts.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setShowAddOwnerModal(true);
                          setOwnerSuccessMsg('');
                        }}
                        className="px-3.5 py-2 bg-[#f06023] hover:bg-[#d94b12] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-sm cursor-pointer active:scale-98"
                      >
                        <UserPlus className="h-3.5 w-3.5" /> + Add Property Owner
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowAddAdminModal(true);
                          setAdminSuccessMsg('');
                        }}
                        className="px-3.5 py-2 bg-zinc-900 hover:bg-black text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-sm cursor-pointer active:scale-98"
                      >
                        <Shield className="h-3.5 w-3.5 text-[#f06023]" /> + Add System Admin
                      </button>
                    </div>
                  </div>

                  {/* Users Table */}
                  <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-zinc-100 border-b border-zinc-200 text-zinc-600 uppercase font-semibold">
                        <tr>
                          <th className="p-4">User</th>
                          <th className="p-4">Role & Plan Tier</th>
                          <th className="p-4">Account Status</th>
                          <th className="p-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100 text-zinc-800">
                        {users.map((u) => (
                          <tr key={u.id} className="hover:bg-zinc-50">
                            <td className="p-4">
                              <div className="font-bold text-zinc-900 flex items-center gap-1.5">
                                {u.full_name}
                                {u.role === 'admin' && (
                                  <span className="bg-orange-100 text-[#f06023] text-[9px] font-extrabold px-1.5 py-0.5 rounded border border-orange-200">
                                    ADMIN
                                  </span>
                                )}
                              </div>
                              <div className="text-zinc-400">{u.email} {u.phone ? `• ${u.phone}` : ''}</div>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`px-2.5 py-1 rounded-full font-bold text-[10px] uppercase shadow-sm ${
                                    u.role === 'admin'
                                      ? 'bg-[#f06023] text-white'
                                      : u.role === 'landlord' || u.role === 'owner'
                                      ? 'bg-zinc-900 text-white'
                                      : 'bg-zinc-100 text-zinc-700'
                                  }`}
                                >
                                  {u.role === 'landlord' || u.role === 'owner' ? 'Property Owner' : u.role}
                                </span>
                                {(u.role === 'landlord' || u.role === 'owner') && (
                                  <span className="bg-orange-50 text-[#f06023] border border-orange-200 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                                    {u.plan ? u.plan.replace(/-/g, ' ') : 'Pay Per Client'}
                                  </span>
                                )}
                              </div>
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
                </div>
              )}

              {/* Live Properties Catalog */}
              {activeTab === 'properties' && (
                <div className="space-y-4">
                  {/* Filter & Search Bar */}
                  <div className="bg-white border border-zinc-200 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="relative w-full md:w-80">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 h-4 w-4" />
                      <input
                        type="text"
                        placeholder="Search title, zone, or landlord..."
                        className="w-full pl-10 pr-4 py-2 border border-zinc-300 rounded-xl text-xs focus:outline-none focus:border-[#f06023]"
                        value={propertySearch}
                        onChange={(e) => setPropertySearch(e.target.value)}
                      />
                    </div>

                    <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                      <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                        <Filter className="h-3.5 w-3.5 text-[#f06023]" /> Category:
                        <select
                          className="p-2 border border-zinc-300 rounded-xl text-xs focus:outline-none focus:border-[#f06023] bg-white font-medium"
                          value={selectedCategoryFilter}
                          onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                        >
                          <option value="all">All Categories</option>
                          <option value="apartment">Apartments & Houses</option>
                          <option value="hostel">Student Hostels</option>
                          <option value="vehicle">Vehicles & Transport</option>
                          <option value="land">Plots & Land</option>
                          <option value="equipment">Equipments & Tools</option>
                        </select>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                        Status:
                        <select
                          className="p-2 border border-zinc-300 rounded-xl text-xs focus:outline-none focus:border-[#f06023] bg-white font-medium"
                          value={selectedStatusFilter}
                          onChange={(e) => setSelectedStatusFilter(e.target.value)}
                        >
                          <option value="all">All Statuses</option>
                          <option value="available">Available Only</option>
                          <option value="booked">Booked / Occupied</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Properties Table */}
                  <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-zinc-100 border-b border-zinc-200 text-zinc-600 uppercase font-semibold">
                          <tr>
                            <th className="p-4">Property & Category</th>
                            <th className="p-4">Price & Zone</th>
                            <th className="p-4">Property Owner / Landlord</th>
                            <th className="p-4">Status & Photos</th>
                            <th className="p-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100 text-zinc-800">
                          {allProperties
                            .filter((p) => {
                              const matchesSearch =
                                !propertySearch.trim() ||
                                p.title.toLowerCase().includes(propertySearch.toLowerCase()) ||
                                p.display_zone.toLowerCase().includes(propertySearch.toLowerCase()) ||
                                p.owner?.full_name?.toLowerCase().includes(propertySearch.toLowerCase());
                              const matchesCat =
                                selectedCategoryFilter === 'all' || p.property_type === selectedCategoryFilter;
                              const matchesStatus =
                                selectedStatusFilter === 'all' ||
                                (selectedStatusFilter === 'available' && p.is_available !== false) ||
                                (selectedStatusFilter === 'booked' && p.is_available === false);
                              return matchesSearch && matchesCat && matchesStatus;
                            })
                            .map((p) => {
                              const primaryImage =
                                p.images?.find((img) => img.is_primary)?.image_url ||
                                p.images?.[0]?.image_url ||
                                'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=600&q=80';
                              return (
                                <tr key={p.id} className="hover:bg-zinc-50">
                                  <td className="p-4">
                                    <div className="flex items-center gap-3">
                                      <img
                                        src={primaryImage}
                                        alt={p.title}
                                        className="h-12 w-16 object-cover rounded-xl border border-zinc-200 shrink-0"
                                      />
                                      <div>
                                        <h4 className="font-bold text-zinc-900 line-clamp-1">{p.title}</h4>
                                        <span className="inline-block mt-0.5 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-orange-50 text-[#f06023] rounded-md border border-orange-200">
                                          {p.property_type || 'Property'}
                                        </span>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="p-4">
                                    <div className="font-extrabold text-zinc-900">
                                      UGX {Number(p.price).toLocaleString()}
                                      <span className="text-[10px] text-zinc-500 font-normal">{p.price_period || '/month'}</span>
                                    </div>
                                    <div className="text-zinc-500 text-[11px] mt-0.5">{p.display_zone}</div>
                                  </td>
                                  <td className="p-4">
                                    <div className="font-bold text-zinc-900">{p.owner?.full_name || 'Verified Owner'}</div>
                                    <div className="text-zinc-400 text-[11px]">{p.owner?.phone || 'Contact Available'}</div>
                                  </td>
                                  <td className="p-4">
                                    <div className="flex items-center gap-2">
                                      <span
                                        className={`px-2.5 py-1 rounded-full font-bold text-[10px] uppercase ${
                                          p.is_available !== false
                                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                                        }`}
                                      >
                                        {p.is_available !== false ? '🟢 Available' : '🟡 Booked / Occupied'}
                                      </span>
                                      <span className="text-[11px] text-zinc-400 font-semibold">
                                        📷 {p.images?.length || 1} {p.images?.length === 1 ? 'photo' : 'photos'}
                                      </span>
                                    </div>
                                  </td>
                                  <td className="p-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                      <button
                                        onClick={() => openAdminEditModal(p)}
                                        className="px-3 py-1.5 rounded-xl font-bold text-xs transition-all bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200"
                                      >
                                        ✏️ Edit
                                      </button>
                                      <button
                                        onClick={() => handleTogglePropertyAvailability(p.id)}
                                        className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
                                          p.is_available !== false
                                            ? 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
                                            : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                                        }`}
                                      >
                                        {p.is_available !== false ? 'Mark Booked' : 'Mark Available'}
                                      </button>
                                      <button
                                        onClick={() => handleAdminDeleteProperty(p.id)}
                                        className="px-3 py-1.5 rounded-xl font-bold text-xs transition-all bg-red-50 text-red-700 hover:bg-red-100 border border-red-200"
                                      >
                                        🗑️ Delete
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                        </tbody>
                      </table>
                    </div>
                  </div>
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
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div>
                            <span className="bg-red-50 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-red-200 uppercase">
                              {rep.reason}
                            </span>
                            <h3 className="font-bold text-zinc-900 text-base mt-1">{rep.property?.title}</h3>
                            <p className="text-xs text-zinc-500">Reported by: {rep.reporter?.full_name}</p>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleResolveReport(rep.id, 'dismissed')}
                              className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl text-xs font-bold transition-all"
                            >
                              Dismiss Report
                            </button>
                            <button
                              onClick={() => setActionTarget({ id: rep.property_id, type: 'suspend' })}
                              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all"
                            >
                              Suspend Listing
                            </button>
                          </div>
                        </div>

                        {rep.details && (
                          <p className="text-xs text-zinc-600 bg-zinc-50 p-3 rounded-xl border border-zinc-200/60">
                            {rep.details}
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
                  <div className="p-4 border-b border-zinc-100 font-bold text-zinc-900 text-sm">
                    Platform Action Logs
                  </div>
                  <div className="divide-y divide-zinc-100 text-xs">
                    {auditLogs.length === 0 ? (
                      <div className="p-8 text-center text-zinc-400">No system audit logs logged yet.</div>
                    ) : (
                      auditLogs.map((log) => (
                        <div key={log.id} className="p-4 flex items-center justify-between">
                          <div>
                            <span className="font-bold text-zinc-800">{log.action}</span>
                            <span className="text-zinc-500 ml-2">• by {log.admin?.full_name || 'System Admin'}</span>
                          </div>
                          <span className="text-zinc-400 text-[11px]">
                            {new Date(log.created_at).toLocaleString()}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Analytics & Subscription Statistics */}
              {activeTab === 'analytics' && (
                <div className="space-y-6">
                  {/* Subscription Tiers Statistics */}
                  <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm">
                    <h3 className="text-base font-bold text-zinc-900 mb-1 flex items-center gap-2">
                      <Crown className="h-5 w-5 text-[#f06023]" /> Property Owner Subscription Tiers Breakdown
                    </h3>
                    <p className="text-xs text-zinc-500 mb-6">Distribution of plans across registered property owners.</p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="p-4 bg-orange-50/60 border border-orange-200 rounded-2xl">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-bold uppercase text-[#f06023]">Pay Per Client Tier</span>
                          <span className="text-xs font-bold bg-[#f06023] text-white px-2 py-0.5 rounded-full">Pay As You Go</span>
                        </div>
                        <p className="text-2xl font-extrabold text-zinc-900">
                          {users.filter((u) => (u.role === 'landlord' || u.role === 'owner') && (!u.plan || u.plan === 'pay-per-client')).length}
                        </p>
                        <p className="text-xs text-zinc-500 mt-1">Zero upfront cost • Fee per client lead</p>
                      </div>

                      <div className="p-4 bg-purple-50/60 border border-purple-200 rounded-2xl">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-bold uppercase text-purple-700">Premium Owner Tier</span>
                          <span className="text-xs font-bold bg-purple-600 text-white px-2 py-0.5 rounded-full">Unlimited</span>
                        </div>
                        <p className="text-2xl font-extrabold text-zinc-900">
                          {users.filter((u) => (u.role === 'landlord' || u.role === 'owner') && u.plan === 'premium').length}
                        </p>
                        <p className="text-xs text-zinc-500 mt-1">Unlimited Photos • Animated frontend gallery</p>
                      </div>

                      <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-2xl">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-bold uppercase text-zinc-700">Basic Listing Tier</span>
                          <span className="text-xs font-bold bg-zinc-700 text-white px-2 py-0.5 rounded-full">Free</span>
                        </div>
                        <p className="text-2xl font-extrabold text-zinc-900">
                          {users.filter((u) => (u.role === 'landlord' || u.role === 'owner') && u.plan === 'basic').length}
                        </p>
                        <p className="text-xs text-zinc-500 mt-1">5 Photos Maximum limit</p>
                      </div>
                    </div>
                  </div>

                  {/* Booking & Occupancy Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm space-y-4">
                      <h4 className="font-bold text-zinc-900 text-sm flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-[#f06023]" /> Booking Performance & Success Rate
                      </h4>
                      <div className="space-y-3">
                        <div className="flex justify-between text-xs font-semibold text-zinc-700">
                          <span>Occupancy Ratio:</span>
                          <span>
                            {allProperties.length > 0
                              ? `${Math.round((allProperties.filter((p) => p.is_available === false).length / allProperties.length) * 100)}%`
                              : '0%'}
                          </span>
                        </div>
                        <div className="w-full bg-zinc-100 rounded-full h-3 overflow-hidden">
                          <div
                            className="bg-emerald-500 h-3 rounded-full transition-all duration-500"
                            style={{
                              width: `${
                                allProperties.length > 0
                                  ? Math.round((allProperties.filter((p) => p.is_available === false).length / allProperties.length) * 100)
                                  : 0
                              }%`,
                            }}
                          />
                        </div>
                        <p className="text-xs text-zinc-500 leading-relaxed">
                          {allProperties.filter((p) => p.is_available === false).length} out of {allProperties.length} listings have been successfully booked by tenants on Rental Connect.
                        </p>
                      </div>
                    </div>

                    <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm space-y-4">
                      <h4 className="font-bold text-zinc-900 text-sm flex items-center gap-2">
                        <Tag className="h-4 w-4 text-[#f06023]" /> Categories Listing Distribution
                      </h4>
                      <div className="space-y-2 text-xs">
                        {[
                          { label: 'Apartments & Houses', count: allProperties.filter((p) => p.property_type === 'apartment' || p.property_type === 'house' || !p.property_type).length },
                          { label: 'Student Hostels', count: allProperties.filter((p) => p.property_type === 'hostel').length },
                          { label: 'Vehicles & Transport', count: allProperties.filter((p) => p.property_type === 'vehicle').length },
                          { label: 'Commercial & Plots', count: allProperties.filter((p) => p.property_type === 'land').length },
                          { label: 'Tools & Equipment', count: allProperties.filter((p) => p.property_type === 'equipment').length },
                        ].map((cat) => (
                          <div key={cat.label} className="flex justify-between items-center p-2 bg-zinc-50 rounded-xl">
                            <span className="font-medium text-zinc-700">{cat.label}</span>
                            <span className="font-bold bg-white px-2.5 py-0.5 rounded-lg border border-zinc-200 text-zinc-900">{cat.count} listings</span>
                          </div>
                        ))}
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

      {/* Admin: Add / Edit Property Modal */}
      {showPropertyModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative overflow-y-auto max-h-[90vh]">
            <button onClick={() => setShowPropertyModal(false)} className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600"><X className="h-5 w-5" /></button>

            <div className="text-center mb-5">
              <div className="h-14 w-14 rounded-full bg-emerald-600 flex items-center justify-center mx-auto mb-3 shadow-md">
                <Building2 className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-lg font-bold text-zinc-900">{editingAdminPropertyId ? 'Edit Property Listing' : 'Post New Property'}</h3>
              <p className="text-xs text-zinc-500 mt-1">Admin is posting directly on the platform. This listing goes live immediately.</p>
            </div>

            <form onSubmit={handleAdminSaveProperty} className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Property Title <span className="text-[#f06023]">*</span></label>
                <input required type="text" placeholder="e.g. Modern 3-Bedroom Apartment in Kololo" className="w-full p-3 border border-zinc-300 rounded-xl text-sm focus:outline-none focus:border-[#f06023]" value={pTitle} onChange={(e) => setPTitle(e.target.value)} />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Description <span className="text-[#f06023]">*</span></label>
                <textarea required rows={3} placeholder="Describe the property, features, nearby landmarks..." className="w-full p-3 border border-zinc-300 rounded-xl text-sm focus:outline-none focus:border-[#f06023]" value={pDescription} onChange={(e) => setPDescription(e.target.value)} />
              </div>

              {/* Type & Listing Type */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">Property Type</label>
                  <select className="w-full p-3 border border-zinc-300 rounded-xl text-sm focus:outline-none focus:border-[#f06023] bg-white" value={pType} onChange={(e) => setPType(e.target.value)}>
                    <option value="apartment">Apartment / Flat</option>
                    <option value="house">Residential House</option>
                    <option value="hostel">Hostel Room</option>
                    <option value="land">Land / Plot</option>
                    <option value="vehicle">Vehicle (Car, SUV, Truck)</option>
                    <option value="commercial">Commercial / Warehouse</option>
                    <option value="machinery">Heavy Machinery & Tool</option>
                    <option value="event_equipment">Event & Sound Gear</option>
                    <option value="event_venue">Event Venue / Garden</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">Listing Type</label>
                  <select className="w-full p-3 border border-zinc-300 rounded-xl text-sm focus:outline-none focus:border-[#f06023] bg-white" value={pListingType} onChange={(e) => setPListingType(e.target.value)}>
                    <option value="rent">For Rent</option>
                    <option value="sale">For Sale</option>
                    <option value="lease">For Lease</option>
                  </select>
                </div>
              </div>

              {/* Price, Zone, Address */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">Price (UGX) <span className="text-[#f06023]">*</span></label>
                  <input required type="number" placeholder="e.g. 1500000" className="w-full p-3 border border-zinc-300 rounded-xl text-sm focus:outline-none focus:border-[#f06023]" value={pPrice} onChange={(e) => setPPrice(e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">Display Zone / Area <span className="text-[#f06023]">*</span></label>
                  <input required type="text" placeholder="e.g. Kololo, Kampala" className="w-full p-3 border border-zinc-300 rounded-xl text-sm focus:outline-none focus:border-[#f06023]" value={pZone} onChange={(e) => setPZone(e.target.value)} />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Full Real Address</label>
                <input type="text" placeholder="e.g. Plot 45, Kanjokya Street, Kampala" className="w-full p-3 border border-zinc-300 rounded-xl text-sm focus:outline-none focus:border-[#f06023]" value={pAddress} onChange={(e) => setPAddress(e.target.value)} />
              </div>

              {/* Bedrooms & Bathrooms */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">Bedrooms</label>
                  <select className="w-full p-3 border border-zinc-300 rounded-xl text-sm focus:outline-none focus:border-[#f06023] bg-white" value={pBedrooms} onChange={(e) => setPBedrooms(e.target.value)}>
                    {['1','2','3','4','5','6+'].map((n) => <option key={n} value={n}>{n} Bedroom{n !== '1' ? 's' : ''}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">Bathrooms</label>
                  <select className="w-full p-3 border border-zinc-300 rounded-xl text-sm focus:outline-none focus:border-[#f06023] bg-white" value={pBathrooms} onChange={(e) => setPBathrooms(e.target.value)}>
                    {['1','2','3','4+'].map((n) => <option key={n} value={n}>{n} Bathroom{n !== '1' ? 's' : ''}</option>)}
                  </select>
                </div>
              </div>

              {/* Photos */}
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Photo URLs (Paste image links)</label>
                <div className="flex gap-2">
                  <input type="url" placeholder="https://example.com/photo.jpg" className="flex-1 p-3 border border-zinc-300 rounded-xl text-sm focus:outline-none focus:border-[#f06023]" value={pNewPhotoUrl} onChange={(e) => setPNewPhotoUrl(e.target.value)} />
                  <button type="button" onClick={() => { if (pNewPhotoUrl.trim()) { setPPhotos([...pPhotos, pNewPhotoUrl.trim()]); setPNewPhotoUrl(''); }}} className="px-4 py-2 bg-[#f06023] text-white rounded-xl text-xs font-bold hover:bg-[#d94b12] transition-all">Add</button>
                </div>
                {pPhotos.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {pPhotos.map((url, i) => (
                      <div key={i} className="relative group">
                        <img src={url} alt={`photo ${i+1}`} className="h-16 w-20 object-cover rounded-xl border border-zinc-200" />
                        <button type="button" onClick={() => setPPhotos(pPhotos.filter((_, j) => j !== i))} className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">×</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-2 flex gap-2">
                <Button variant="secondary" fullWidth type="button" onClick={() => setShowPropertyModal(false)}>Cancel</Button>
                <Button variant="primary" fullWidth type="submit" disabled={pSubmitting}>
                  {pSubmitting ? 'Saving...' : editingAdminPropertyId ? 'Save Changes' : 'Post Property Live'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}


      {showAddOwnerModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setShowAddOwnerModal(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="text-center mb-5">
              <div className="h-14 w-14 rounded-full bg-[#f06023] flex items-center justify-center mx-auto mb-3 shadow-md">
                <FontAwesomeIcon icon={faHouseUser} className="text-white text-xl" />
              </div>
              <h3 className="text-lg font-bold text-zinc-900">
                Register New Property Owner
              </h3>
              <p className="text-xs text-zinc-500 mt-1">
                Pre-authorize a Property Owner account. They can log in via Google or password immediately.
              </p>
            </div>

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

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Assign Subscription Plan Tier <span className="text-[#f06023]">*</span>
                </label>
                <select
                  className="w-full p-3 border border-zinc-300 rounded-xl text-sm focus:outline-none focus:border-[#f06023] bg-white font-medium text-zinc-900"
                  value={ownerPlan}
                  onChange={(e: any) => setOwnerPlan(e.target.value)}
                >
                  <option value="pay-per-client">🤝 Pay Per Client (Pay As You Go - Zero Upfront)</option>
                  <option value="premium">👑 Premium Owner Plan (Unlimited Photos + Verified Badge)</option>
                  <option value="basic">🆓 Basic Listing Plan (5 Photos Limit)</option>
                </select>
                <p className="text-[10px] text-zinc-400 mt-1">
                  {ownerPlan === 'premium'
                    ? '✨ Premium tier unlocks unlimited photos per property and priority search ranking.'
                    : ownerPlan === 'pay-per-client'
                    ? '🤝 Zero upfront cost. Pay per client inquiry lead.'
                    : '📷 Basic tier is limited to 5 photos per property listing.'}
                </p>
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

            <div className="text-center mb-5">
              <div className="h-14 w-14 rounded-full bg-[#f06023] flex items-center justify-center mx-auto mb-3 shadow-md">
                <FontAwesomeIcon icon={faUserShield} className="text-white text-xl" />
              </div>
              <h3 className="text-lg font-bold text-zinc-900">
                Authorize New System Administrator
              </h3>
              <p className="text-xs text-zinc-500 mt-1">
                Add a new Google email to the system admin allowlist for /admin portal access.
              </p>
            </div>

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
