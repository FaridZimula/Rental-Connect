import { useState, useEffect } from 'react';
import { Building2, Plus, MessageSquare, Trash2, Eye, EyeOff, X, Edit2, User, Image as ImageIcon, Upload, Sparkles, AlertCircle, Calendar, Tag } from 'lucide-react';
import Layout from '../components/layout/Layout';
import Button from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import { propertiesApi, inquiriesApi, authApi } from '../lib/api';
import { supabasePropertiesStore } from '../lib/supabaseStore';
import { Property, Inquiry } from '../types';

const TYPE_LABELS: Record<string, string> = {
  apartment: 'Apartment / Flat',
  house: 'Residential House',
  studio: 'Studio Unit',
  hostel: 'Hostel Room',
  land: 'Land / Plot',
  commercial: 'Commercial / Warehouse',
  vehicle: 'Vehicle (Car, SUV, Truck)',
  machinery: 'Heavy Machinery & Tool',
  event_equipment: 'Event & Sound Gear',
  event_venue: 'Event Venue / Garden',
  agro_machinery: 'Farm Machinery & Agro Asset',
  medical_equipment: 'Medical & Healthcare Gear',
  solar_power: 'Solar & Renewable Energy',
  fashion_attire: 'Formal Wear & Attire',
  it_hardware: 'IT & Computing Tech',
  watercraft: 'Marine & Watercraft',
  camping_sports: 'Camping & Sports Gear',
};

const formatDatePosted = (dateStr?: string) => {
  if (!dateStr) return 'Posted recently';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return 'Posted recently';
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60));
    if (diffHours < 1) return 'Posted just now';
    if (diffHours < 24) return `Posted ${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Posted yesterday';
    if (diffDays < 7) return `Posted ${diffDays} days ago`;
    return `Posted ${d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`;
  } catch {
    return 'Posted recently';
  }
};

const AVAILABLE_AMENITIES = [
  'Water Supply',
  'Electricity (UEDCL)',
  'Security Guard',
  'Parking Space',
  'WiFi Internet',
  'Furnished',
  'CCTV Surveillance',
  'Backup Generator',
  'Paved Compound',
  'Garbage Collection',
];

export default function LandlordDashboardPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'listings' | 'inquiries' | 'profile'>('listings');

  const [properties, setProperties] = useState<Property[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);

  // Property Form State (Create / Edit)
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPropertyId, setEditingPropertyId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [propertyType, setPropertyType] = useState('apartment');
  const [listingType, setListingType] = useState('rent');
  const [price, setPrice] = useState('');
  const [displayZone, setDisplayZone] = useState('');
  const [realAddress, setRealAddress] = useState('');
  const [bedrooms, setBedrooms] = useState('1');
  const [bathrooms, setBathrooms] = useState('1');
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Photo Gallery & Plan Management State
  const [propertyPhotos, setPropertyPhotos] = useState<string[]>([]);
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [photoError, setPhotoError] = useState('');
  const [userPlan, setUserPlan] = useState<'basic' | 'standard' | 'agency'>(() => {
    return (localStorage.getItem('rc_landlord_plan') as any) || 'basic';
  });

  const maxPhotosAllowed = userPlan === 'basic' ? 5 : 999;

  const handleAddPhotoUrl = () => {
    if (!newPhotoUrl.trim()) return;
    if (propertyPhotos.length >= maxPhotosAllowed) {
      setPhotoError('Basic plan allows max 5 photos per listing. Upgrade to Landlord Standard or Pro Agency for UNLIMITED photos!');
      return;
    }
    setPhotoError('');
    setPropertyPhotos([...propertyPhotos, newPhotoUrl.trim()]);
    setNewPhotoUrl('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    if (propertyPhotos.length >= maxPhotosAllowed) {
      setPhotoError('Basic plan allows max 5 photos per listing. Upgrade to Landlord Standard or Pro Agency for UNLIMITED photos!');
      return;
    }
    setPhotoError('');
    const file = files[0];
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const result = uploadEvent.target?.result as string;
      if (result) {
        setPropertyPhotos((prev) => [...prev, result]);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleRemovePhoto = (index: number) => {
    setPropertyPhotos(propertyPhotos.filter((_, i) => i !== index));
    setPhotoError('');
  };

  const handleSetPrimaryPhoto = (index: number) => {
    if (index === 0) return;
    const target = propertyPhotos[index];
    const remaining = propertyPhotos.filter((_, i) => i !== index);
    setPropertyPhotos([target, ...remaining]);
  };

  const handleUpgradePlan = (newPlan: 'standard' | 'agency') => {
    setUserPlan(newPlan);
    localStorage.setItem('rc_landlord_plan', newPlan);
    setPhotoError('');
  };

  // Profile Form State
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

  // Response Form State
  const [replyingInquiry, setReplyingInquiry] = useState<Inquiry | null>(null);
  const [responseText, setResponseText] = useState('');
  const [responding, setResponding] = useState(false);

  const filterUserProperties = (list: Property[]): Property[] => {
    if (!user) return [];
    return list.filter((p) => {
      if (p.owner_id && user.id && p.owner_id === user.id) return true;
      if (p.owner?.email && user.email && p.owner.email.toLowerCase() === user.email.toLowerCase()) return true;
      if (user.email && p.owner_id === `owner_${user.email}`) return true;
      return false;
    });
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [propsData, inqData] = await Promise.all([
        propertiesApi.myProperties().catch(() => null),
        inquiriesApi.landlordInquiries().catch(() => null),
      ]);

      const localSavedStr = localStorage.getItem('rc_custom_properties');
      const localProps: Property[] = localSavedStr ? JSON.parse(localSavedStr) : [];
      const userLocalProps = filterUserProperties(localProps);

      let apiProps: Property[] = [];
      if (Array.isArray(propsData) && propsData.length > 0) {
        apiProps = propsData;
      }

      const propsMap = new Map<string, Property>();
      [...userLocalProps, ...apiProps].forEach((p) => {
        if (p && p.id) propsMap.set(p.id, p);
      });

      setProperties(Array.from(propsMap.values()));
      setInquiries(Array.isArray(inqData) ? inqData : []);
    } catch {
      const localSavedStr = localStorage.getItem('rc_custom_properties');
      const localProps: Property[] = localSavedStr ? JSON.parse(localSavedStr) : [];
      setProperties(filterUserProperties(localProps));
      setInquiries([]);
    } finally {
      setLoading(false);
    }
  };

  const notifyRealtimeUpdates = () => {
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new CustomEvent('rc_properties_updated'));
  };

  useEffect(() => {
    fetchData();

    const handleSync = () => {
      const localSavedStr = localStorage.getItem('rc_custom_properties');
      if (localSavedStr) {
        try {
          const localProps: Property[] = JSON.parse(localSavedStr);
          setProperties(filterUserProperties(localProps));
        } catch (err) {
          void err;
        }
      }
    };

    window.addEventListener('storage', handleSync);
    window.addEventListener('rc_properties_updated', handleSync);

    return () => {
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('rc_properties_updated', handleSync);
    };
  }, [user]);

  const openCreateModal = () => {
    setEditingPropertyId(null);
    setTitle('');
    setDescription('');
    setPropertyType('apartment');
    setListingType('rent');
    setPrice('');
    setDisplayZone('');
    setRealAddress('');
    setBedrooms('1');
    setBathrooms('1');
    setSelectedAmenities([]);
    setPropertyPhotos([]);
    setNewPhotoUrl('');
    setPhotoError('');
    setShowAddModal(true);
  };

  const openEditModal = (p: Property) => {
    setEditingPropertyId(p.id);
    setTitle(p.title);
    setDescription(p.description);
    setPropertyType(p.property_type);
    setListingType(p.listing_type);
    setPrice(String(p.price));
    setDisplayZone(p.display_zone);
    setRealAddress(p.real_address || p.display_zone);
    setBedrooms(String(p.bedrooms));
    setBathrooms(String(p.bathrooms));
    setSelectedAmenities(p.amenities?.map((a) => a.amenity.name) || []);
    setPropertyPhotos(p.images?.map((i) => i.image_url) || []);
    setNewPhotoUrl('');
    setPhotoError('');
    setShowAddModal(true);
  };

  const handleSaveProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        title,
        description,
        property_type: propertyType,
        listing_type: listingType,
        price: Number(price),
        display_zone: displayZone,
        real_address: realAddress || displayZone,
        bedrooms: Number(bedrooms),
        bathrooms: Number(bathrooms),
        amenities: selectedAmenities,
        real_lat: 0.3476,
        real_lng: 32.5825,
      };

      let createdApiProp: any = null;
      try {
        if (editingPropertyId) {
          createdApiProp = await propertiesApi.update(editingPropertyId, payload);
        } else {
          createdApiProp = await propertiesApi.create(payload);
        }
      } catch (err) {
        console.warn('Backend API update notice/offline mode active:', err);
      }

      // Build updated property object with custom photos
      const propId = createdApiProp?.id || editingPropertyId || `p_${Date.now()}`;
      const formattedImages = propertyPhotos.length > 0
        ? propertyPhotos.map((url, idx) => ({
            id: `img_${propId}_${idx}`,
            property_id: propId,
            image_url: url,
            is_primary: idx === 0,
          }))
        : [
            {
              id: `img_${propId}_default`,
              property_id: propId,
              image_url: 'https://images.pexels.com/photos/1918291/pexels-photo-1918291.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
              is_primary: true,
            },
          ];

      const savedProp: Property = {
        id: propId,
        owner_id: user?.id || (user?.email ? `owner_${user.email}` : `owner_${Date.now()}`),
        title,
        description,
        property_type: propertyType as any,
        listing_type: listingType as any,
        price: Number(price),
        price_period: '/month',
        display_zone: displayZone,
        real_address: realAddress || displayZone,
        bedrooms: Number(bedrooms),
        bathrooms: Number(bathrooms),
        area_sqft: 1200,
        status: 'pending_review',
        is_available: true,
        created_at: new Date().toISOString(),
        images: formattedImages,
        amenities: selectedAmenities.map((a, idx) => ({
          property_id: propId,
          amenity_id: `a_${idx}`,
          amenity: { id: `a_${idx}`, name: a },
        })),
        owner: {
          full_name: user?.full_name || 'Landlord',
          email: user?.email,
          phone: user?.phone || '+256 772 123456',
        },
      };

      // Persist in localStorage
      const localSavedStr = localStorage.getItem('rc_custom_properties');
      let localProps: Property[] = localSavedStr ? JSON.parse(localSavedStr) : [];
      const existingIdx = localProps.findIndex((p) => p.id === propId);
      if (existingIdx >= 0) {
        localProps[existingIdx] = savedProp;
      } else {
        localProps = [savedProp, ...localProps];
      }
      localStorage.setItem('rc_custom_properties', JSON.stringify(localProps));

      // Sync to Supabase Cloud Store for multi-browser / real-time cross-device access
      supabasePropertiesStore.saveProperty(savedProp).catch(() => {});

      // Update state & notify real-time sync
      setProperties((prev) => {
        const withoutTarget = prev.filter((p) => p.id !== propId);
        return [savedProp, ...withoutTarget];
      });
      notifyRealtimeUpdates();

      setShowAddModal(false);
    } catch (err: unknown) {
      console.error('Save listing error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleAvailability = async (id: string) => {
    try {
      await propertiesApi.toggleAvailability(id).catch(() => {});
    } catch (err) {
      void err;
    }
    setProperties((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const updated = { ...p, is_available: !p.is_available };
          const localSavedStr = localStorage.getItem('rc_custom_properties');
          if (localSavedStr) {
            let localProps: Property[] = JSON.parse(localSavedStr);
            localProps = localProps.map((item) => (item.id === id ? updated : item));
            localStorage.setItem('rc_custom_properties', JSON.stringify(localProps));
          }
          return updated;
        }
        return p;
      })
    );
    notifyRealtimeUpdates();
  };

  const handleDeleteProperty = async (id: string) => {
    if (!confirm('Are you sure you want to delete this listing?')) return;
    try {
      await propertiesApi.delete(id).catch(() => {});
    } catch (err) {
      void err;
    }
    setProperties((prev) => prev.filter((p) => p.id !== id));
    const localSavedStr = localStorage.getItem('rc_custom_properties');
    if (localSavedStr) {
      let localProps: Property[] = JSON.parse(localSavedStr);
      localProps = localProps.filter((p) => p.id !== id);
      localStorage.setItem('rc_custom_properties', JSON.stringify(localProps));
    }
    notifyRealtimeUpdates();
  };

  const handleSendResponse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyingInquiry || !responseText.trim()) return;
    setResponding(true);
    try {
      await inquiriesApi.respond(replyingInquiry.id, responseText.trim());
      setReplyingInquiry(null);
      setResponseText('');
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to send response.');
    } finally {
      setResponding(false);
    }
  };

  return (
    <Layout>
      <div className="bg-zinc-50 min-h-screen pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="bg-white border border-zinc-200 rounded-3xl p-6 mb-8 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-full bg-[#f06023] border-2 border-[#f06023] text-white flex items-center justify-center font-extrabold text-xl shadow-md uppercase">
                {user?.full_name?.charAt(0) || 'L'}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-zinc-900">{user?.full_name || 'Property Owner'}</h1>
                <p className="text-xs text-zinc-500">{user?.email} • Property Owner / Broker Dashboard</p>
              </div>
            </div>

            <Button
              variant="primary"
              icon={<Plus className="h-4 w-4" />}
              iconPosition="left"
              onClick={openCreateModal}
            >
              Post New Property
            </Button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex space-x-2 border-b border-zinc-200 mb-8">
            <button
              onClick={() => setActiveTab('listings')}
              className={`pb-3 px-4 text-sm font-semibold transition-all border-b-2 flex items-center gap-2 ${
                activeTab === 'listings'
                  ? 'border-[#f06023] text-[#f06023]'
                  : 'border-transparent text-zinc-500 hover:text-zinc-800'
              }`}
            >
              <Building2 className="h-4 w-4" /> My Listings ({properties.length})
            </button>

            <button
              onClick={() => setActiveTab('inquiries')}
              className={`pb-3 px-4 text-sm font-semibold transition-all border-b-2 flex items-center gap-2 ${
                activeTab === 'inquiries'
                  ? 'border-[#f06023] text-[#f06023]'
                  : 'border-transparent text-zinc-500 hover:text-zinc-800'
              }`}
            >
              <MessageSquare className="h-4 w-4" /> Tenant Inquiries ({inquiries.length})
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              className={`pb-3 px-4 text-sm font-semibold transition-all border-b-2 flex items-center gap-2 ${
                activeTab === 'profile'
                  ? 'border-[#f06023] text-[#f06023]'
                  : 'border-transparent text-zinc-500 hover:text-zinc-800'
              }`}
            >
              <User className="h-4 w-4" /> Profile Settings
            </button>
          </div>

          {/* Content */}
          {loading ? (
            <div className="flex justify-center items-center h-48">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#f06023]" />
            </div>
          ) : activeTab === 'listings' ? (
            <div className="space-y-4">
              {properties.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center border border-zinc-200">
                  <Building2 className="h-12 w-12 text-zinc-300 mx-auto mb-3" />
                  <h3 className="text-lg font-bold text-zinc-700">No Listings Created</h3>
                  <p className="text-zinc-500 text-xs mt-1 mb-4">Post your first property listing to reach verified tenants.</p>
                  <Button variant="primary" onClick={openCreateModal}>Post Property</Button>
                </div>
              ) : (
                properties.map((p) => (
                  <div key={p.id} className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-center gap-4">
                      <div className="h-20 w-24 rounded-xl bg-zinc-100 overflow-hidden flex-shrink-0">
                        {p.images && p.images[0] ? (
                          <img src={p.images[0].image_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-zinc-400 text-xs">No Photo</div>
                        )}
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                          <span
                            className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full text-white shadow-sm ${
                              p.status === 'published'
                                ? 'bg-[#f06023]'
                                : p.status === 'pending_review'
                                ? 'bg-amber-500'
                                : 'bg-red-600'
                            }`}
                          >
                            {p.status.replace('_', ' ')}
                          </span>
                          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full text-white shadow-sm ${p.is_available ? 'bg-zinc-900' : 'bg-zinc-500'}`}>
                            {p.is_available ? 'Available' : 'Marked Occupied'}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-50 text-[#f06023] border border-orange-200 shadow-sm capitalize flex items-center gap-1">
                            <Tag className="h-3 w-3 text-[#f06023]" /> {TYPE_LABELS[p.property_type] || p.property_type}
                          </span>
                          <span className="text-[10px] font-semibold text-zinc-500 flex items-center gap-1 ml-0.5">
                            <Calendar className="h-3 w-3 text-zinc-400" /> {formatDatePosted(p.created_at)}
                          </span>
                        </div>
                        <h3 className="font-bold text-zinc-900 text-base">{p.title}</h3>
                        <p className="text-xs text-zinc-500">{p.display_zone} • UGX {Number(p.price).toLocaleString()}/mo</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                      <button
                        onClick={() => openEditModal(p)}
                        className="px-3 py-1.5 rounded-xl border border-zinc-300 text-xs font-semibold hover:bg-zinc-50 flex items-center gap-1 text-zinc-700"
                        title="Edit Property Listing"
                      >
                        <Edit2 className="h-3.5 w-3.5 text-[#f06023]" /> Edit
                      </button>

                      <button
                        onClick={() => handleToggleAvailability(p.id)}
                        className="px-3 py-1.5 rounded-xl border border-zinc-300 text-xs font-semibold hover:bg-zinc-50 flex items-center gap-1"
                      >
                        {p.is_available ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                        {p.is_available ? 'Mark Occupied' : 'Mark Available'}
                      </button>

                      <button
                        onClick={() => handleDeleteProperty(p.id)}
                        className="p-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50"
                        title="Delete Property"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : activeTab === 'inquiries' ? (
            <div className="space-y-4">
              {inquiries.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center border border-zinc-200">
                  <MessageSquare className="h-12 w-12 text-zinc-300 mx-auto mb-3" />
                  <h3 className="text-lg font-bold text-zinc-700">No Inquiries Received</h3>
                  <p className="text-zinc-500 text-xs mt-1">Tenant messages and viewing requests will appear here.</p>
                </div>
              ) : (
                inquiries.map((inq) => (
                  <div key={inq.id} className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-zinc-900 text-sm">From: {inq.tenant?.full_name || 'Tenant'}</h4>
                        <p className="text-xs text-zinc-500">Property: {inq.property?.title}</p>
                      </div>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${inq.status === 'responded' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                        {inq.status}
                      </span>
                    </div>

                    <div className="bg-zinc-50 p-3 rounded-xl text-xs text-zinc-700 border border-zinc-200/60">
                      "{inq.message}"
                    </div>

                    {inq.response ? (
                      <p className="text-xs text-emerald-700 font-medium">Your reply: {inq.response}</p>
                    ) : (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setReplyingInquiry(inq);
                          setResponseText('');
                        }}
                      >
                        Reply to Tenant
                      </Button>
                    )}
                  </div>
                ))
              )}
            </div>
          ) : (
            /* Profile Tab */
            <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm max-w-xl">
              <h3 className="text-lg font-bold text-zinc-900 mb-4 flex items-center gap-2">
                <User className="h-5 w-5 text-[#f06023]" /> Edit Property Owner / Broker Profile
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
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">Full Name / Agency Name</label>
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
        </div>
      </div>

      {/* Add Listing Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setShowAddModal(false)} className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600">
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-xl font-bold text-zinc-900 mb-4">
              {editingPropertyId ? 'Edit Rental Listing' : 'Post New Rental Listing'}
            </h3>
            <form onSubmit={handleSaveProperty} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Property Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Modern 2-Bedroom Apartment in Kololo"
                  className="w-full p-3 border border-zinc-300 rounded-xl text-sm focus:outline-none focus:border-[#f06023]"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">Property Type</label>
                  <select
                    className="w-full p-3 border border-zinc-300 rounded-xl text-sm focus:outline-none focus:border-[#f06023]"
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value)}
                  >
                    <option value="apartment">Apartment / Flat</option>
                    <option value="house">Residential House</option>
                    <option value="studio">Studio Unit</option>
                    <option value="hostel">Hostel Room</option>
                    <option value="commercial">Commercial / Warehouse</option>
                    <option value="land">Land / Open Yard Plot</option>
                    <option value="vehicle">Vehicle (Car, SUV, Truck, Van)</option>
                    <option value="machinery">Heavy Machinery & Construction Tool</option>
                    <option value="event_equipment">Event Equipment (Sound, Lights, Mics)</option>
                    <option value="event_venue">Event Venue / Garden Hall</option>
                    <option value="agro_machinery">Farm Machinery & Agro Asset</option>
                    <option value="medical_equipment">Medical & Healthcare Equipment</option>
                    <option value="solar_power">Solar & Renewable Energy</option>
                    <option value="fashion_attire">Formal Wear & Cultural Attire</option>
                    <option value="it_hardware">IT & Computing Tech</option>
                    <option value="watercraft">Marine & Watercraft</option>
                    <option value="camping_sports">Camping & Sports Gear</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">Listing Type</label>
                  <select
                    className="w-full p-3 border border-zinc-300 rounded-xl text-sm focus:outline-none focus:border-[#f06023]"
                    value={listingType}
                    onChange={(e) => setListingType(e.target.value)}
                  >
                    <option value="rent">For Rent</option>
                    <option value="lease">For Lease</option>
                    <option value="sale">For Sale</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">Price (UGX)</label>
                  <input
                    type="number"
                    required
                    placeholder="800000"
                    className="w-full p-3 border border-zinc-300 rounded-xl text-sm focus:outline-none focus:border-[#f06023]"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">Bedrooms</label>
                  <input
                    type="number"
                    required
                    className="w-full p-3 border border-zinc-300 rounded-xl text-sm focus:outline-none focus:border-[#f06023]"
                    value={bedrooms}
                    onChange={(e) => setBedrooms(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">Bathrooms</label>
                  <input
                    type="number"
                    required
                    className="w-full p-3 border border-zinc-300 rounded-xl text-sm focus:outline-none focus:border-[#f06023]"
                    value={bathrooms}
                    onChange={(e) => setBathrooms(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Display Zone / Neighborhood</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kololo, Kampala"
                  className="w-full p-3 border border-zinc-300 rounded-xl text-sm focus:outline-none focus:border-[#f06023]"
                  value={displayZone}
                  onChange={(e) => setDisplayZone(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Full Description</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Describe amenities, location advantages, water supply, security..."
                  className="w-full p-3 border border-zinc-300 rounded-xl text-sm focus:outline-none focus:border-[#f06023]"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              {/* Property Photos & Media Gallery Section */}
              <div className="border-t border-b border-zinc-200 py-3 my-2 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-zinc-800 flex items-center gap-1.5">
                    <ImageIcon className="h-4 w-4 text-[#f06023]" /> Photos & Media Gallery
                  </label>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      userPlan === 'basic' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}>
                      {userPlan === 'basic'
                        ? `${propertyPhotos.length}/5 Photos (Basic)`
                        : `${propertyPhotos.length} Photos (Unlimited Pro)`}
                    </span>
                    {userPlan === 'basic' && (
                      <button
                        type="button"
                        onClick={() => handleUpgradePlan('standard')}
                        className="text-[10px] font-bold text-[#f06023] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Sparkles className="h-3 w-3" /> Upgrade to Unlimited
                      </button>
                    )}
                  </div>
                </div>

                {photoError && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
                      <span>{photoError}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleUpgradePlan('standard')}
                      className="px-2.5 py-1 bg-[#f06023] text-white rounded-lg text-[10px] font-bold shrink-0 hover:bg-[#d94b12] cursor-pointer"
                    >
                      Upgrade Plan
                    </button>
                  </div>
                )}

                {/* Uploaded Thumbnails Grid */}
                {propertyPhotos.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 p-2 bg-zinc-50 border border-zinc-200 rounded-xl max-h-44 overflow-y-auto">
                    {propertyPhotos.map((url, index) => (
                      <div key={index} className="relative group rounded-lg overflow-hidden border border-zinc-200 aspect-square bg-zinc-100">
                        <img src={url} alt={`Photo ${index + 1}`} className="w-full h-full object-cover" />
                        {index === 0 && (
                          <span className="absolute top-1 left-1 bg-[#f06023] text-white font-bold text-[8px] uppercase px-1.5 py-0.5 rounded shadow-sm">
                            Cover
                          </span>
                        )}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                          {index !== 0 && (
                            <button
                              type="button"
                              onClick={() => handleSetPrimaryPhoto(index)}
                              className="px-1.5 py-0.5 bg-white/90 text-zinc-900 rounded text-[9px] font-bold hover:bg-white"
                              title="Set as Cover Photo"
                            >
                              Cover
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemovePhoto(index)}
                            className="p-1 bg-red-600 text-white rounded hover:bg-red-700"
                            title="Delete Photo"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Photo Add Input Controls */}
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="url"
                      placeholder="Paste image web URL (https://...)"
                      className="flex-grow p-2.5 border border-zinc-300 rounded-xl text-xs focus:outline-none focus:border-[#f06023]"
                      value={newPhotoUrl}
                      onChange={(e) => setNewPhotoUrl(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={handleAddPhotoUrl}
                      className="px-3 py-2.5 bg-zinc-900 hover:bg-black text-white text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer shrink-0"
                    >
                      <Plus className="h-3.5 w-3.5" /> Add URL
                    </button>
                  </div>

                  <div className="relative">
                    <label className="w-full py-2.5 px-3 border border-dashed border-zinc-300 hover:border-[#f06023] bg-zinc-50 hover:bg-orange-50/40 rounded-xl text-xs font-semibold text-zinc-600 hover:text-[#f06023] flex items-center justify-center gap-2 cursor-pointer transition-all">
                      <Upload className="h-4 w-4 text-[#f06023]" />
                      <span>Upload Photo from Device (JPG / PNG)</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileUpload}
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Amenities Selection */}
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-2">Amenities & Property Features</label>
                <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto p-2 border border-zinc-200 rounded-xl bg-zinc-50">
                  {AVAILABLE_AMENITIES.map((item) => {
                    const isChecked = selectedAmenities.includes(item);
                    return (
                      <label key={item} className="flex items-center gap-2 text-xs text-zinc-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedAmenities([...selectedAmenities, item]);
                            } else {
                              setSelectedAmenities(selectedAmenities.filter((a) => a !== item));
                            }
                          }}
                          className="rounded text-[#f06023] focus:ring-[#f06023]"
                        />
                        <span>{item}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <Button variant="primary" fullWidth type="submit" disabled={submitting}>
                {submitting
                  ? 'Saving Listing...'
                  : editingPropertyId
                  ? 'Save Property Changes'
                  : 'Submit Property for Verification'}
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* Reply Modal */}
      {replyingInquiry && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <button onClick={() => setReplyingInquiry(null)} className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600">
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-lg font-bold text-zinc-900 mb-2">Reply to {replyingInquiry.tenant?.full_name}</h3>
            <p className="text-xs text-zinc-500 mb-4">"{replyingInquiry.message}"</p>

            <form onSubmit={handleSendResponse} className="space-y-4">
              <textarea
                required
                rows={4}
                className="w-full p-3 border border-zinc-300 rounded-xl text-sm focus:outline-none focus:border-[#f06023]"
                placeholder="Write your response to the tenant..."
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
              />
              <Button variant="primary" fullWidth type="submit" disabled={responding}>
                {responding ? 'Sending...' : 'Send Reply'}
              </Button>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
