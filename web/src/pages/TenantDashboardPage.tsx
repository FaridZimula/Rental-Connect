import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, MessageSquare, Flag, MapPin, Calendar, Clock, CheckCircle2, User, Phone, Save } from 'lucide-react';
import Layout from '../components/layout/Layout';
import Button from '../components/ui/Button';
import PropertyCard from '../components/features/properties/PropertyCard';
import { useAuth } from '../contexts/AuthContext';
import { favoritesApi, inquiriesApi, reportsApi, authApi } from '../lib/api';
import { Inquiry, ListingReport, Property } from '../types';

export default function TenantDashboardPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'inquiries' | 'favorites' | 'reports' | 'profile'>('inquiries');

  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [favorites, setFavorites] = useState<Property[]>([]);
  const [reports, setReports] = useState<ListingReport[]>([]);
  const [loading, setLoading] = useState(true);

  // Profile edit state
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState('');

  useEffect(() => {
    if (user) {
      setFullName(user.full_name || '');
      setPhone(user.phone || '');
    }
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMsg('');
    try {
      await authApi.updateProfile({ full_name: fullName, phone });
      setProfileMsg('Profile updated successfully!');
    } catch {
      setProfileMsg('Failed to update profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    Promise.allSettled([
      inquiriesApi.myInquiries(),
      favoritesApi.list(),
      reportsApi.myReports(),
    ]).then(([inqRes, favRes, repRes]) => {
      if (inqRes.status === 'fulfilled' && Array.isArray(inqRes.value)) {
        setInquiries(inqRes.value);
      } else {
        setInquiries([]);
      }

      if (favRes.status === 'fulfilled' && Array.isArray(favRes.value)) {
        setFavorites(favRes.value.map((f: any) => f.property || f));
      } else {
        setFavorites([]);
      }

      if (repRes.status === 'fulfilled' && Array.isArray(repRes.value)) {
        setReports(repRes.value);
      } else {
        setReports([]);
      }
      setLoading(false);
    });
  }, []);

  return (
    <Layout>
      <div className="bg-zinc-50 min-h-screen pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="bg-white border border-zinc-200 rounded-3xl p-6 mb-8 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-[#f06023]/10 text-[#f06023] flex items-center justify-center font-extrabold text-xl">
                {user?.full_name?.charAt(0) || 'T'}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-zinc-900">{user?.full_name || 'Tenant'}</h1>
                <p className="text-xs text-zinc-500">{user?.email} • Customer / Tenant Role</p>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex space-x-2 border-b border-zinc-200 mb-8 overflow-x-auto">
            <button
              onClick={() => setActiveTab('inquiries')}
              className={`pb-3 px-4 text-sm font-semibold transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'inquiries'
                  ? 'border-[#f06023] text-[#f06023]'
                  : 'border-transparent text-zinc-500 hover:text-zinc-800'
              }`}
            >
              <MessageSquare className="h-4 w-4" /> My Inquiries ({inquiries.length})
            </button>

            <button
              onClick={() => setActiveTab('favorites')}
              className={`pb-3 px-4 text-sm font-semibold transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'favorites'
                  ? 'border-[#f06023] text-[#f06023]'
                  : 'border-transparent text-zinc-500 hover:text-zinc-800'
              }`}
            >
              <Heart className="h-4 w-4" /> Saved Properties ({favorites.length})
            </button>

            <button
              onClick={() => setActiveTab('reports')}
              className={`pb-3 px-4 text-sm font-semibold transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'reports'
                  ? 'border-[#f06023] text-[#f06023]'
                  : 'border-transparent text-zinc-500 hover:text-zinc-800'
              }`}
            >
              <Flag className="h-4 w-4" /> My Flagged Reports ({reports.length})
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              className={`pb-3 px-4 text-sm font-semibold transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'profile'
                  ? 'border-[#f06023] text-[#f06023]'
                  : 'border-transparent text-zinc-500 hover:text-zinc-800'
              }`}
            >
              <User className="h-4 w-4" /> Profile Settings
            </button>
          </div>

          {/* Tab Content */}
          {loading ? (
            <div className="flex justify-center items-center h-48">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#f06023]" />
            </div>
          ) : (
            <>
              {/* Inquiries */}
              {activeTab === 'inquiries' && (
                <div className="space-y-4">
                  {inquiries.length === 0 ? (
                    <div className="bg-white rounded-2xl p-12 text-center border border-zinc-200">
                      <MessageSquare className="h-12 w-12 text-zinc-300 mx-auto mb-3" />
                      <h3 className="text-lg font-bold text-zinc-700">No Inquiries Sent Yet</h3>
                      <p className="text-zinc-500 text-xs mt-1">Browse properties and send inquiries to landlords.</p>
                    </div>
                  ) : (
                    inquiries.map((inq) => (
                      <div key={inq.id} className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-bold text-zinc-900 text-base">{inq.property?.title || 'Property'}</h3>
                            <p className="text-xs text-zinc-500 flex items-center gap-1 mt-0.5">
                              <MapPin className="h-3 w-3 text-[#f06023]" /> {inq.property?.display_zone}
                            </p>
                          </div>
                          <span
                            className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${
                              inq.status === 'responded'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}
                          >
                            {inq.status}
                          </span>
                        </div>

                        <div className="bg-zinc-50 p-3 rounded-xl text-xs text-zinc-700 border border-zinc-200/60">
                          <span className="font-semibold text-zinc-900">Your Message: </span>
                          {inq.message}
                          {inq.viewing_date && (
                            <div className="mt-1.5 flex items-center gap-1 text-[#f06023] font-medium">
                              <Calendar className="h-3 w-3" /> Requested viewing date: {new Date(inq.viewing_date).toLocaleDateString()}
                            </div>
                          )}
                        </div>

                        {inq.response ? (
                          <div className="bg-emerald-50/70 p-3.5 rounded-xl text-xs text-emerald-900 border border-emerald-200">
                            <div className="font-bold flex items-center gap-1 text-emerald-800 mb-1">
                              <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Landlord Response:
                            </div>
                            <p>{inq.response}</p>
                            {inq.landlord?.phone && (
                              <p className="mt-2 font-semibold text-[#f06023]">
                                Contact Phone: <a href={`tel:${inq.landlord.phone}`}>{inq.landlord.phone}</a>
                              </p>
                            )}
                          </div>
                        ) : (
                          <p className="text-[11px] text-zinc-400 flex items-center gap-1">
                            <Clock className="h-3 w-3" /> Waiting for landlord reply...
                          </p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Favorites */}
              {activeTab === 'favorites' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {favorites.length === 0 ? (
                    <div className="col-span-full bg-white rounded-2xl p-12 text-center border border-zinc-200">
                      <Heart className="h-12 w-12 text-zinc-300 mx-auto mb-3" />
                      <h3 className="text-lg font-bold text-zinc-700">No Saved Properties</h3>
                      <p className="text-zinc-500 text-xs mt-1">Click the heart icon on any property to save it here.</p>
                    </div>
                  ) : (
                    favorites.map((p) => <PropertyCard key={p.id} property={p} />)
                  )}
                </div>
              )}

              {/* Reports */}
              {activeTab === 'reports' && (
                <div className="space-y-4">
                  {reports.length === 0 ? (
                    <div className="bg-white rounded-2xl p-12 text-center border border-zinc-200">
                      <Flag className="h-12 w-12 text-zinc-300 mx-auto mb-3" />
                      <h3 className="text-lg font-bold text-zinc-700">No Reports Submitted</h3>
                      <p className="text-zinc-500 text-xs mt-1">You haven't reported any fraudulent listings.</p>
                    </div>
                  ) : (
                    reports.map((rep) => (
                      <div key={rep.id} className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm space-y-2">
                        <div className="flex justify-between items-start">
                          <h4 className="font-bold text-zinc-900 text-sm">{rep.property?.title || 'Reported Property'}</h4>
                          <span className="bg-zinc-100 text-zinc-700 text-xs px-2.5 py-1 rounded-full font-semibold capitalize">
                            {rep.status}
                          </span>
                        </div>
                        <p className="text-xs text-amber-700 font-medium">Reason: {rep.reason}</p>
                        {rep.details && <p className="text-xs text-zinc-600">Details: {rep.details}</p>}
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Profile Settings */}
              {activeTab === 'profile' && (
                <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm max-w-xl">
                  <h3 className="text-lg font-bold text-zinc-900 mb-4 flex items-center gap-2">
                    <User className="h-5 w-5 text-[#f06023]" /> Edit Account Profile
                  </h3>

                  {profileMsg && (
                    <div className={`p-3 rounded-xl text-xs font-semibold mb-4 ${
                      profileMsg.includes('successfully') ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-600 border border-red-200'
                    }`}>
                      {profileMsg}
                    </div>
                  )}

                  <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 mb-1">Full Name</label>
                      <input
                        type="text"
                        required
                        className="w-full p-3 border border-zinc-300 rounded-xl text-sm focus:outline-none focus:border-[#f06023]"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 mb-1">Email Address (Read-only)</label>
                      <input
                        type="email"
                        disabled
                        className="w-full p-3 border border-zinc-200 bg-zinc-100 text-zinc-500 rounded-xl text-sm cursor-not-allowed"
                        value={user?.email || ''}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 mb-1">Phone Number</label>
                      <input
                        type="tel"
                        className="w-full p-3 border border-zinc-300 rounded-xl text-sm focus:outline-none focus:border-[#f06023]"
                        placeholder="0700 000 000 or +256..."
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </div>

                    <Button variant="primary" type="submit" disabled={savingProfile}>
                      {savingProfile ? 'Saving Changes...' : 'Save Profile Updates'}
                    </Button>
                  </form>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
