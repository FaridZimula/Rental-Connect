import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Building2, Plus, MessageSquare, CheckCircle2, Clock, Trash2, Eye, EyeOff, X } from 'lucide-react';
import Layout from '../components/layout/Layout';
import Button from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import { propertiesApi, inquiriesApi } from '../lib/api';
import { Property, Inquiry } from '../types';
import { mockProperties } from '../data/mockData';

export default function LandlordDashboardPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'listings' | 'inquiries'>('listings');

  const [properties, setProperties] = useState<Property[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);

  // New Property Form State
  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [propertyType, setPropertyType] = useState('apartment');
  const [listingType, setListingType] = useState('rent');
  const [price, setPrice] = useState('');
  const [displayZone, setDisplayZone] = useState('');
  const [realAddress, setRealAddress] = useState('');
  const [bedrooms, setBedrooms] = useState('1');
  const [bathrooms, setBathrooms] = useState('1');
  const [submitting, setSubmitting] = useState(false);

  // Response Form State
  const [replyingInquiry, setReplyingInquiry] = useState<Inquiry | null>(null);
  const [responseText, setResponseText] = useState('');
  const [responding, setResponding] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [propsData, inqData] = await Promise.all([
        propertiesApi.myProperties(),
        inquiriesApi.landlordInquiries(),
      ]);
      setProperties(propsData.length > 0 ? propsData : mockProperties);
      setInquiries(inqData);
    } catch {
      setProperties(mockProperties);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await propertiesApi.create({
        title,
        description,
        property_type: propertyType,
        listing_type: listingType,
        price: Number(price),
        display_zone: displayZone,
        real_address: realAddress || displayZone,
        bedrooms: Number(bedrooms),
        bathrooms: Number(bathrooms),
        real_lat: 0.3476,
        real_lng: 32.5825,
      });
      setShowAddModal(false);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create listing.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleAvailability = async (id: string) => {
    try {
      await propertiesApi.toggleAvailability(id);
      fetchData();
    } catch {}
  };

  const handleDeleteProperty = async (id: string) => {
    if (!confirm('Are you sure you want to delete this listing?')) return;
    try {
      await propertiesApi.delete(id);
      fetchData();
    } catch {}
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
              <div className="h-14 w-14 rounded-2xl bg-[#f06023]/10 text-[#f06023] flex items-center justify-center font-extrabold text-xl">
                {user?.full_name?.charAt(0) || 'L'}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-zinc-900">{user?.full_name || 'Landlord'}</h1>
                <p className="text-xs text-zinc-500">{user?.email} • Landlord / Broker Dashboard</p>
              </div>
            </div>

            <Button
              variant="primary"
              icon={<Plus className="h-4 w-4" />}
              iconPosition="left"
              onClick={() => setShowAddModal(true)}
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
                  <Button variant="primary" onClick={() => setShowAddModal(true)}>Post Property</Button>
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
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                              p.status === 'published'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : p.status === 'pending_review'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-red-50 text-red-700 border border-red-200'
                            }`}
                          >
                            {p.status.replace('_', ' ')}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${p.is_available ? 'bg-blue-50 text-blue-700' : 'bg-zinc-100 text-zinc-500'}`}>
                            {p.is_available ? 'Available' : 'Marked Occupied'}
                          </span>
                        </div>
                        <h3 className="font-bold text-zinc-900 text-base">{p.title}</h3>
                        <p className="text-xs text-zinc-500">{p.display_zone} • UGX {Number(p.price).toLocaleString()}/mo</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-auto justify-end">
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
          ) : (
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

            <h3 className="text-xl font-bold text-zinc-900 mb-4">Post New Rental Listing</h3>
            <form onSubmit={handleCreateProperty} className="space-y-4">
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

              <Button variant="primary" fullWidth type="submit" disabled={submitting}>
                {submitting ? 'Submitting for Admin Verification...' : 'Submit Property for Verification'}
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
