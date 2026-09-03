import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  ShoppingBag, Trash2, Calendar, MapPin, Phone, MessageSquare, 
  CheckCircle2, ArrowRight, User, Clock, ShieldCheck, Building2,
  X
} from 'lucide-react';
import Layout from '../components/layout/Layout';
import Button from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import { favoritesApi, inquiriesApi, authApi } from '../lib/api';
import { Property, Inquiry } from '../types';

export default function CartPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'cart' | 'inquiries' | 'profile'>('cart');

  const [cartProperties, setCartProperties] = useState<Property[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);

  // Inquiry Modal State (from cart item)
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [viewingDate, setViewingDate] = useState('');
  const [inquiryMessage, setInquiryMessage] = useState('');
  const [sendingInquiry, setSendingInquiry] = useState(false);
  const [inquirySuccessMsg, setInquirySuccessMsg] = useState('');

  // Profile Edit State
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

  const loadCartData = async () => {
    setLoading(true);
    try {
      const [favRes, inqRes] = await Promise.allSettled([
        favoritesApi.list().catch(() => null),
        inquiriesApi.myInquiries().catch(() => null),
      ]);

      let apiFavs: Property[] = [];
      if (favRes.status === 'fulfilled' && Array.isArray(favRes.value)) {
        apiFavs = favRes.value.map((f: any) => f.property || f);
      }

      const localCartStr = localStorage.getItem('rc_cart_properties');
      const localCart: Property[] = localCartStr ? JSON.parse(localCartStr) : [];

      const propsMap = new Map<string, Property>();
      [...localCart, ...apiFavs].forEach((p) => {
        if (p && p.id) propsMap.set(p.id, p);
      });

      setCartProperties(Array.from(propsMap.values()));

      if (inqRes.status === 'fulfilled' && Array.isArray(inqRes.value)) {
        setInquiries(inqRes.value);
      } else {
        setInquiries([]);
      }
    } catch (err) {
      void err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCartData();

    const handleSync = () => {
      const localCartStr = localStorage.getItem('rc_cart_properties');
      if (localCartStr) {
        try {
          const localCart: Property[] = JSON.parse(localCartStr);
          setCartProperties(localCart);
        } catch (err) {
          void err;
        }
      }
    };

    window.addEventListener('storage', handleSync);
    window.addEventListener('rc_cart_updated', handleSync);

    return () => {
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('rc_cart_updated', handleSync);
    };
  }, []);

  const removeFromCart = async (propertyId: string) => {
    try {
      await favoritesApi.remove(propertyId).catch(() => {});
    } catch (err) {
      void err;
    }

    const updated = cartProperties.filter((p) => p.id !== propertyId);
    setCartProperties(updated);
    localStorage.setItem('rc_cart_properties', JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('rc_cart_updated'));
  };

  const handleOpenInquiryModal = (property: Property) => {
    setSelectedProperty(property);
    setInquiryMessage(`Hello, I am interested in renting "${property.title}" in ${property.display_zone}. Please contact me with details.`);
    setViewingDate('');
    setInquirySuccessMsg('');
  };

  const handleSendInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProperty || !inquiryMessage.trim()) return;
    setSendingInquiry(true);
    setInquirySuccessMsg('');

    try {
      await inquiriesApi.create({
        property_id: selectedProperty.id,
        message: inquiryMessage.trim(),
        viewing_date: viewingDate || undefined,
      }).catch(() => {});

      // Local storage fallback inquiry log
      const localInquiriesStr = localStorage.getItem('rc_tenant_inquiries');
      let localInquiries = localInquiriesStr ? JSON.parse(localInquiriesStr) : [];
      const newInq: Inquiry = {
        id: `inq_${Date.now()}`,
        property_id: selectedProperty.id,
        tenant_id: user?.id || '',
        landlord_id: selectedProperty.owner_id || '',
        property: selectedProperty,
        message: inquiryMessage.trim(),
        viewing_date: viewingDate || undefined,
        status: 'pending',
        created_at: new Date().toISOString(),
      };
      localInquiries = [newInq, ...localInquiries];
      localStorage.setItem('rc_tenant_inquiries', JSON.stringify(localInquiries));
      setInquiries((prev) => [newInq, ...prev]);

      // Notify owner admin inquiries
      const adminInqStr = localStorage.getItem('rc_admin_inquiries');
      let adminInqs = adminInqStr ? JSON.parse(adminInqStr) : [];
      adminInqs = [{ ...newInq, tenant: { full_name: user?.full_name || 'Tenant Client', email: user?.email }, is_read: false }, ...adminInqs];
      localStorage.setItem('rc_admin_inquiries', JSON.stringify(adminInqs));
      window.dispatchEvent(new CustomEvent('rc_new_inquiry'));

      setInquirySuccessMsg(`Inquiry successfully sent to property owner (${selectedProperty.owner?.full_name || 'Landlord'})!`);
      setTimeout(() => {
        setSelectedProperty(null);
      }, 1800);
    } catch (err) {
      console.error('Inquiry send error:', err);
    } finally {
      setSendingInquiry(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMsg('');
    try {
      await authApi.updateProfile({ full_name: fullName, phone });
      setProfileMsg('Profile updated successfully!');
    } catch (err) {
      void err;
      setProfileMsg('Failed to update profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  const totalMonthlyPrice = cartProperties.reduce((sum, p) => sum + (Number(p.price) || 0), 0);

  return (
    <Layout>
      <div className="bg-zinc-50 min-h-screen pt-24 pb-16 text-zinc-900">
        <div className="container mx-auto px-4">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 text-white rounded-3xl p-6 mb-8 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-[#f06023] text-white flex items-center justify-center font-extrabold text-2xl shadow-lg relative">
                <ShoppingBag className="h-7 w-7 text-white" />
                {cartProperties.length > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 h-5 w-5 bg-white text-[#f06023] rounded-full text-xs font-black flex items-center justify-center shadow-md">
                    {cartProperties.length}
                  </span>
                )}
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-white">Rental Interest Cart</h1>
                <p className="text-xs sm:text-sm text-zinc-400">
                  {user ? `Logged in as ${user.full_name || user.email}` : 'Browse and manage your saved rental assets'}
                </p>
              </div>
            </div>

            <NavLink
              to="/properties"
              className="px-4 py-2.5 bg-[#f06023] hover:bg-[#d94b12] text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-1.5 active:scale-98"
            >
              <Building2 className="h-4 w-4" /> Browse More Properties
            </NavLink>
          </div>

          {/* Navigation Tabs */}
          <div className="flex space-x-2 border-b border-zinc-200 mb-8 overflow-x-auto">
            <button
              onClick={() => setActiveTab('cart')}
              className={`pb-3 px-4 text-sm font-semibold transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'cart'
                  ? 'border-[#f06023] text-[#f06023]'
                  : 'border-transparent text-zinc-500 hover:text-zinc-800'
              }`}
            >
              <ShoppingBag className="h-4 w-4" /> My Rental Cart ({cartProperties.length})
            </button>

            <button
              onClick={() => setActiveTab('inquiries')}
              className={`pb-3 px-4 text-sm font-semibold transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'inquiries'
                  ? 'border-[#f06023] text-[#f06023]'
                  : 'border-transparent text-zinc-500 hover:text-zinc-800'
              }`}
            >
              <MessageSquare className="h-4 w-4" /> Sent Inquiries ({inquiries.length})
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              className={`pb-3 px-4 text-sm font-semibold transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'profile'
                  ? 'border-[#f06023] text-[#f06023]'
                  : 'border-transparent text-zinc-500 hover:text-zinc-800'
              }`}
            >
              <User className="h-4 w-4" /> Account Profile
            </button>
          </div>

          {/* Loading Indicator */}
          {loading ? (
            <div className="flex justify-center items-center h-48">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#f06023]" />
            </div>
          ) : (
            <>
              {/* TAB 1: RENTAL CART */}
              {activeTab === 'cart' && (
                <div>
                  {cartProperties.length === 0 ? (
                    <div className="bg-white rounded-3xl p-12 text-center border border-zinc-200 shadow-sm max-w-xl mx-auto">
                      <div className="h-20 w-20 bg-[#f06023] text-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <ShoppingBag className="h-10 w-10" />
                      </div>
                      <h3 className="text-xl font-bold text-zinc-800">Your Rental Cart is Empty</h3>
                      <p className="text-zinc-500 text-xs mt-1 mb-6">
                        You haven't saved any rental properties yet. Browse verified listings across Uganda and add them to your cart.
                      </p>
                      <NavLink
                        to="/properties"
                        className="inline-flex items-center gap-2 bg-[#f06023] hover:bg-[#d94b12] text-white font-bold text-xs px-6 py-3 rounded-xl transition-all shadow-md"
                      >
                        Explore Verified Rentals <ArrowRight className="h-4 w-4" />
                      </NavLink>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      {/* Left Side: Items List */}
                      <div className="lg:col-span-2 space-y-4">
                        {cartProperties.map((p) => (
                          <div
                            key={p.id}
                            className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row gap-5 relative group"
                          >
                            {/* Thumbnail */}
                            <div className="h-40 sm:h-36 w-full sm:w-48 rounded-xl bg-zinc-100 overflow-hidden flex-shrink-0 relative">
                              {p.images && p.images[0] ? (
                                <img src={p.images[0].image_url} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-zinc-400 text-xs font-semibold">No Image</div>
                              )}
                              <span className="absolute top-2 left-2 bg-zinc-900/80 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-full capitalize">
                                {p.property_type?.replace('_', ' ')}
                              </span>
                            </div>

                            {/* Info */}
                            <div className="flex-1 flex flex-col justify-between">
                              <div>
                                <div className="flex items-center justify-between gap-2 mb-1">
                                  <span className="text-[10px] font-bold uppercase text-[#f06023] bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200">
                                    Verified Listing
                                  </span>
                                  <button
                                    onClick={() => removeFromCart(p.id)}
                                    className="text-zinc-400 hover:text-red-600 transition-colors p-1"
                                    title="Remove from Cart"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>

                                <NavLink to={`/properties/${p.id}`} className="font-bold text-zinc-900 text-base hover:text-[#f06023] transition-colors line-clamp-1">
                                  {p.title}
                                </NavLink>

                                <p className="text-xs text-zinc-500 flex items-center gap-1 mt-1">
                                  <MapPin className="h-3.5 w-3.5 text-[#f06023]" /> {p.display_zone}
                                </p>

                                <p className="text-xs text-zinc-600 mt-2 font-medium">
                                  Owner: <span className="font-bold text-zinc-800">{p.owner?.full_name || 'Verified Owner'}</span>
                                </p>
                              </div>

                              {/* Price & Action Buttons */}
                              <div className="mt-4 pt-3 border-t border-zinc-100 flex flex-wrap items-center justify-between gap-3">
                                <div>
                                  <span className="text-xs text-zinc-400">Monthly Rate</span>
                                  <p className="text-lg font-extrabold text-[#f06023]">
                                    UGX {Number(p.price).toLocaleString()}
                                    <span className="text-xs text-zinc-400 font-normal">{p.price_period || '/mo'}</span>
                                  </p>
                                </div>

                                <div className="flex items-center gap-2">
                                  {p.owner?.phone && (
                                    <a
                                      href={`tel:${p.owner.phone}`}
                                      className="px-3 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-bold rounded-xl flex items-center gap-1 transition-all"
                                      title="Call Landlord"
                                    >
                                      <Phone className="h-3.5 w-3.5 text-[#f06023]" /> Call
                                    </a>
                                  )}

                                  <button
                                    onClick={() => handleOpenInquiryModal(p)}
                                    className="px-4 py-2 bg-[#f06023] hover:bg-[#d94b12] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-sm active:scale-98"
                                  >
                                    <MessageSquare className="h-3.5 w-3.5" /> Book Viewing
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Right Side: E-Commerce Summary Widget */}
                      <div className="space-y-4">
                        <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm space-y-4 sticky top-28">
                          <h3 className="text-lg font-bold text-zinc-900 border-b border-zinc-100 pb-3 flex items-center justify-between">
                            Cart Summary
                            <span className="text-xs bg-zinc-100 text-zinc-700 px-2.5 py-0.5 rounded-full font-extrabold">
                              {cartProperties.length} Assets
                            </span>
                          </h3>

                          <div className="space-y-2.5 text-xs text-zinc-600">
                            <div className="flex justify-between">
                              <span>Total Monthly Rate</span>
                              <span className="font-bold text-zinc-900">UGX {totalMonthlyPrice.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Listing Verification</span>
                              <span className="font-bold text-emerald-600 flex items-center gap-1">
                                <ShieldCheck className="h-3.5 w-3.5" /> FREE
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Direct Owner Access</span>
                              <span className="font-bold text-zinc-900">Included</span>
                            </div>
                          </div>

                          <div className="border-t border-zinc-200 pt-3">
                            <div className="flex justify-between items-baseline mb-4">
                              <span className="text-sm font-bold text-zinc-800">Estimated Total</span>
                              <span className="text-xl font-extrabold text-[#f06023]">
                                UGX {totalMonthlyPrice.toLocaleString()}
                              </span>
                            </div>

                            <p className="text-[11px] text-zinc-400 mb-4 bg-zinc-50 p-2.5 rounded-xl border border-zinc-100">
                              💡 Adding items to your Rental Cart allows you to inquire and request site viewings in one central hub.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: INQUIRIES */}
              {activeTab === 'inquiries' && (
                <div className="space-y-4">
                  {inquiries.length === 0 ? (
                    <div className="bg-white rounded-3xl p-12 text-center border border-zinc-200">
                      <MessageSquare className="h-12 w-12 text-zinc-300 mx-auto mb-3" />
                      <h3 className="text-lg font-bold text-zinc-700">No Sent Inquiries</h3>
                      <p className="text-zinc-500 text-xs mt-1">Book site viewings or inquire on properties from your Cart to see replies here.</p>
                    </div>
                  ) : (
                    inquiries.map((inq) => (
                      <div key={inq.id} className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-bold text-zinc-900 text-base">{inq.property?.title || 'Rental Property'}</h3>
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
                              <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Property Owner Response:
                            </div>
                            <p>{inq.response}</p>
                            {inq.landlord?.phone && (
                              <p className="mt-2 font-semibold text-[#f06023]">
                                Direct Contact: <a href={`tel:${inq.landlord.phone}`}>{inq.landlord.phone}</a>
                              </p>
                            )}
                          </div>
                        ) : (
                          <p className="text-[11px] text-zinc-400 flex items-center gap-1">
                            <Clock className="h-3 w-3" /> Awaiting property owner reply...
                          </p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* TAB 3: ACCOUNT PROFILE */}
              {activeTab === 'profile' && (
                <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm max-w-xl">
                  <h3 className="text-lg font-bold text-zinc-900 mb-4 flex items-center gap-2">
                    <User className="h-5 w-5 text-[#f06023]" /> Account Profile Settings
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

      {/* Inquiry / Book Viewing Modal */}
      {selectedProperty && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setSelectedProperty(null)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600 p-1"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-xl font-bold text-zinc-900 mb-1 flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-[#f06023]" /> Book Viewing / Send Inquiry
            </h3>
            <p className="text-xs text-zinc-500 mb-4 line-clamp-1">
              Property: <span className="font-semibold text-zinc-800">{selectedProperty.title}</span>
            </p>

            {inquirySuccessMsg && (
              <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 p-3 rounded-xl text-xs font-bold mb-4 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                {inquirySuccessMsg}
              </div>
            )}

            <form onSubmit={handleSendInquiry} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Preferred Viewing Date (Optional)</label>
                <input
                  type="date"
                  className="w-full p-3 border border-zinc-300 rounded-xl text-sm focus:outline-none focus:border-[#f06023]"
                  value={viewingDate}
                  onChange={(e) => setViewingDate(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Message to Property Owner</label>
                <textarea
                  required
                  rows={4}
                  className="w-full p-3 border border-zinc-300 rounded-xl text-sm focus:outline-none focus:border-[#f06023]"
                  value={inquiryMessage}
                  onChange={(e) => setInquiryMessage(e.target.value)}
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedProperty(null)}
                  className="px-4 py-2.5 rounded-xl border border-zinc-300 text-xs font-bold text-zinc-700 hover:bg-zinc-50"
                >
                  Cancel
                </button>
                <Button variant="primary" type="submit" disabled={sendingInquiry}>
                  {sendingInquiry ? 'Sending Inquiry...' : 'Submit Viewing Request'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
