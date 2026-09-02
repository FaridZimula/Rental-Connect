import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  MapPin,
  Bed,
  Bath,
  ShieldCheck,
  Heart,
  ChevronLeft,
  ChevronRight,
  Building2,
  MessageSquare,
  Flag,
  CheckCircle2,
  X,
} from 'lucide-react';
import Layout from '../components/layout/Layout';
import Button from '../components/ui/Button';
import { propertiesApi, inquiriesApi, reportsApi, favoritesApi } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { Property } from '../types';
import { mockProperties } from '../data/mockData';

const formatPrice = (price: number | string, listingType: string) =>
  new Intl.NumberFormat('en-UG', {
    style: 'currency',
    currency: 'UGX',
    minimumFractionDigits: 0,
  }).format(Number(price)) + (listingType === 'rent' ? '/month' : '');

const TYPE_LABELS: Record<string, string> = {
  apartment: 'Apartment',
  house: 'House',
  studio: 'Studio',
  hostel: 'Hostel',
  land: 'Land',
  commercial: 'Commercial',
};

export default function PropertyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [isFav, setIsFav] = useState(false);

  // Inquiry Modal State
  const [showInquiryModal, setShowInquiryModal] = useState(false);
  const [inquiryMsg, setInquiryMsg] = useState('');
  const [viewingDate, setViewingDate] = useState('');
  const [inquirySubmitting, setInquirySubmitting] = useState(false);
  const [inquirySuccess, setInquirySuccess] = useState(false);

  // Report Modal State
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState<'fraudulent' | 'duplicate' | 'outdated' | 'misleading' | 'other'>('fraudulent');
  const [reportDetails, setReportDetails] = useState('');
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    propertiesApi
      .get(id)
      .then((data) => {
        setProperty(data);
      })
      .catch(() => {
        const foundMock = mockProperties.find((p) => p.id === id) || mockProperties[0];
        setProperty(foundMock);
      })
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!user || !id) return;
    favoritesApi
      .list()
      .then((favs: any[]) => setIsFav(favs.some((f: any) => f.property_id === id)))
      .catch(() => {});
  }, [user, id]);

  const toggleFavorite = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    try {
      if (isFav) {
        await favoritesApi.remove(id!);
        setIsFav(false);
      } else {
        await favoritesApi.add(id!);
        setIsFav(true);
      }
    } catch {}
  };

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryMsg.trim() || !id) return;
    setInquirySubmitting(true);

    const tenantName = user?.full_name || user?.email?.split('@')[0] || 'A tenant';
    const tenantPhone = user?.phone || 'N/A';
    const propertyTitle = property?.title || 'a property';
    const propertyZone = property?.display_zone || '';

    // 1️⃣ Save to localStorage so admin dashboard can show alert
    const newInquiry = {
      id: `inq_${Date.now()}`,
      property_id: id,
      property_title: propertyTitle,
      property_zone: propertyZone,
      tenant_name: tenantName,
      tenant_email: user?.email || '',
      tenant_phone: tenantPhone,
      message: inquiryMsg.trim(),
      viewing_date: viewingDate || null,
      created_at: new Date().toISOString(),
      is_read: false,
    };
    const existingStr = localStorage.getItem('rc_admin_inquiries');
    const existing = existingStr ? JSON.parse(existingStr) : [];
    localStorage.setItem('rc_admin_inquiries', JSON.stringify([newInquiry, ...existing]));
    window.dispatchEvent(new CustomEvent('rc_new_inquiry'));

    // 2️⃣ Open WhatsApp with pre-filled message to admin number
    const waText = encodeURIComponent(
      `🏠 *New Rental Connect Inquiry*

*Property:* ${propertyTitle} (${propertyZone})
*From:* ${tenantName}
*Email:* ${user?.email || 'N/A'}
*Phone:* ${tenantPhone}
*Viewing Date:* ${viewingDate || 'Not specified'}

*Message:*
${inquiryMsg.trim()}

— Sent via Rental Connect`
    );
    window.open(`https://wa.me/256765458906?text=${waText}`, '_blank');

    // 3️⃣ Try backend API in background (non-blocking)
    try {
      await inquiriesApi.create({
        property_id: id,
        message: inquiryMsg.trim(),
        viewing_date: viewingDate || undefined,
      });
    } catch {
      // Backend offline — WhatsApp + localStorage already handled it
    }

    setInquirySuccess(true);
    setInquirySubmitting(false);
  };

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setReportSubmitting(true);
    try {
      await reportsApi.create({
        property_id: id,
        reason: reportReason,
        details: reportDetails.trim(),
      });
      setReportSuccess(true);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to submit report.');
    } finally {
      setReportSubmitting(false);
    }
  };

  const images = property?.images ?? [];
  const amenityNames = property?.amenities?.map((a) => a.amenity.name) ?? [];

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-[70vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#f06023]" />
        </div>
      </Layout>
    );
  }

  if (!property) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-24 text-center">
          <Building2 className="h-16 w-16 mx-auto text-zinc-300 mb-4" />
          <h2 className="text-2xl font-bold text-zinc-700 mb-2">Property Not Found</h2>
          <Link to="/properties">
            <Button variant="primary" icon={<ArrowLeft className="h-4 w-4" />} iconPosition="left">
              Back to Properties
            </Button>
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="bg-white min-h-screen text-zinc-900 pt-24 pb-16">
        <div className="container mx-auto px-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-[#f06023] hover:text-[#d94b12] mb-6 font-semibold text-sm transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to listings
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Image Gallery */}
              <div className="relative h-72 md:h-[420px] rounded-2xl overflow-hidden mb-3 bg-zinc-100 shadow-md">
                {images.length > 0 ? (
                  <motion.img
                    key={activeImg}
                    src={images[activeImg].image_url}
                    alt={property.title}
                    className="w-full h-full object-cover"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-400 text-sm">
                    No photos uploaded
                  </div>
                )}

                <div className="absolute top-4 left-4 bg-[#f06023] text-white font-bold text-xs uppercase px-3 py-1.5 rounded-full flex items-center gap-1 shadow-md">
                  <ShieldCheck className="h-4 w-4" /> Verified Listing
                </div>

                {images.length > 1 && (
                  <>
                    <button
                      onClick={() => setActiveImg((i) => (i - 1 + images.length) % images.length)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/60 text-white p-2 rounded-full hover:bg-[#f06023] transition-colors"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => setActiveImg((i) => (i + 1) % images.length)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/60 text-white p-2 rounded-full hover:bg-[#f06023] transition-colors"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImg(i)}
                      className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                        i === activeImg ? 'border-[#f06023] shadow-md' : 'border-zinc-200'
                      }`}
                    >
                      <img src={img.image_url} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* Title Header */}
              <div className="flex items-start justify-between mb-4 gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="bg-zinc-100 text-zinc-700 text-xs font-semibold px-2.5 py-1 rounded-full uppercase">
                      {TYPE_LABELS[property.property_type] ?? property.property_type}
                    </span>
                    <span className="bg-emerald-50 text-emerald-700 text-xs font-semibold px-2.5 py-1 rounded-full capitalize border border-emerald-200">
                      For {property.listing_type}
                    </span>
                  </div>
                  <h1 className="text-2xl md:text-3xl font-display font-extrabold text-zinc-900 leading-tight">
                    {property.title}
                  </h1>
                </div>

                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={toggleFavorite}
                    className={`p-2.5 rounded-xl border transition-colors ${
                      isFav
                        ? 'bg-red-50 border-red-200 text-red-500'
                        : 'bg-white border-zinc-200 text-zinc-500 hover:border-red-300'
                    }`}
                  >
                    <Heart className={`h-5 w-5 ${isFav ? 'fill-red-500' : ''}`} />
                  </button>
                  <button
                    onClick={() => {
                      setShowReportModal(true);
                      setReportSuccess(false);
                    }}
                    className="p-2.5 rounded-xl border border-zinc-200 text-zinc-500 hover:border-amber-400 hover:text-amber-600 transition-colors"
                    title="Report / Flag listing"
                  >
                    <Flag className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Location */}
              <div className="flex items-center text-zinc-600 text-sm mb-6">
                <MapPin className="h-4 w-4 mr-1 text-[#f06023] flex-shrink-0" />
                <span>{property.display_zone}</span>
              </div>

              {/* Features Pill */}
              <div className="flex flex-wrap gap-4 mb-8">
                {property.bedrooms > 0 && (
                  <div className="flex items-center gap-1.5 bg-zinc-50 border border-zinc-200 px-3.5 py-2 rounded-xl text-sm font-semibold text-zinc-700">
                    <Bed className="h-4 w-4 text-[#f06023]" />
                    {property.bedrooms} Bedrooms
                  </div>
                )}
                {property.bathrooms > 0 && (
                  <div className="flex items-center gap-1.5 bg-zinc-50 border border-zinc-200 px-3.5 py-2 rounded-xl text-sm font-semibold text-zinc-700">
                    <Bath className="h-4 w-4 text-[#f06023]" />
                    {property.bathrooms} Bathrooms
                  </div>
                )}
                {property.area_sqft && (
                  <div className="flex items-center gap-1.5 bg-zinc-50 border border-zinc-200 px-3.5 py-2 rounded-xl text-sm font-semibold text-zinc-700">
                    {property.area_sqft} sq ft
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="mb-8">
                <h2 className="text-lg font-bold text-zinc-900 mb-2">Property Details</h2>
                <p className="text-zinc-600 leading-relaxed whitespace-pre-line text-sm md:text-base">{property.description}</p>
              </div>

              {/* Amenities */}
              {amenityNames.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-lg font-bold text-zinc-900 mb-3">Amenities & Features</h2>
                  <div className="flex flex-wrap gap-2">
                    {amenityNames.map((a) => (
                      <span
                        key={a}
                        className="bg-zinc-100 text-zinc-700 border border-zinc-200 text-sm px-3.5 py-1.5 rounded-full font-medium"
                      >
                        {a}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sticky Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white border border-zinc-200 rounded-2xl shadow-xl p-6 sticky top-24 space-y-6">
                <div>
                  <p className="text-xs text-zinc-400 uppercase tracking-widest font-semibold mb-1">Listed Price</p>
                  <p className="text-3xl font-extrabold text-[#f06023]">
                    {formatPrice(property.price, property.listing_type)}
                  </p>
                </div>

                <div className="border-t border-zinc-100 pt-4 space-y-3">
                  <Button
                    variant="primary"
                    fullWidth
                    size="lg"
                    icon={<MessageSquare className="h-5 w-5" />}
                    iconPosition="left"
                    onClick={() => {
                      if (!isAuthenticated) navigate('/login');
                      else {
                        setShowInquiryModal(true);
                        setInquirySuccess(false);
                      }
                    }}
                  >
                    {isAuthenticated ? 'Send Inquiry to Property Owner' : 'Log In to Inquire'}
                  </Button>

                  <button
                    onClick={() => {
                      if (!isAuthenticated) navigate('/login');
                      else {
                        setShowReportModal(true);
                        setReportSuccess(false);
                      }
                    }}
                    className="w-full text-center text-xs text-zinc-500 hover:text-amber-600 font-medium py-2 flex items-center justify-center gap-1"
                  >
                    <Flag className="h-3.5 w-3.5" /> Report suspicious or fraudulent listing
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Inquiry Modal */}
      {showInquiryModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setShowInquiryModal(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600"
            >
              <X className="h-5 w-5" />
            </button>

            {inquirySuccess ? (
              <div className="text-center py-6">
                <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto mb-3" />
                <h3 className="text-xl font-bold text-zinc-900 mb-1">Inquiry Sent!</h3>
                <p className="text-zinc-600 text-sm mb-6">
                  Your message has been sent to the property owner. Check your Tenant Dashboard for updates.
                </p>
                <Button variant="primary" fullWidth onClick={() => setShowInquiryModal(false)}>
                  Close
                </Button>
              </div>
            ) : (
              <form onSubmit={handleInquirySubmit} className="space-y-4">
                <h3 className="text-xl font-bold text-zinc-900 mb-1">Inquire About Property</h3>
                <p className="text-xs text-zinc-500">Send a direct inquiry message to the property owner.</p>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">Message</label>
                  <textarea
                    required
                    rows={4}
                    className="w-full p-3 border border-zinc-300 rounded-xl text-sm focus:outline-none focus:border-[#f06023]"
                    placeholder="Hello, I am interested in renting this property. Is it available for viewing?"
                    value={inquiryMsg}
                    onChange={(e) => setInquiryMsg(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    Preferred Viewing Date (Optional)
                  </label>
                  <input
                    type="date"
                    className="w-full p-3 border border-zinc-300 rounded-xl text-sm focus:outline-none focus:border-[#f06023]"
                    value={viewingDate}
                    onChange={(e) => setViewingDate(e.target.value)}
                  />
                </div>

                <Button variant="primary" fullWidth type="submit" disabled={inquirySubmitting}>
                  {inquirySubmitting ? 'Sending...' : 'Send Inquiry'}
                </Button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setShowReportModal(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600"
            >
              <X className="h-5 w-5" />
            </button>

            {reportSuccess ? (
              <div className="text-center py-6">
                <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto mb-3" />
                <h3 className="text-xl font-bold text-zinc-900 mb-1">Report Submitted</h3>
                <p className="text-zinc-600 text-sm mb-6">
                  Thank you for helping keep our platform safe. System managers will review this listing.
                </p>
                <Button variant="primary" fullWidth onClick={() => setShowReportModal(false)}>
                  Close
                </Button>
              </div>
            ) : (
              <form onSubmit={handleReportSubmit} className="space-y-4">
                <h3 className="text-xl font-bold text-zinc-900 mb-1">Report Listing</h3>
                <p className="text-xs text-zinc-500">Flag suspicious, fraudulent, or outdated content for admin review.</p>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">Reason for Report</label>
                  <select
                    className="w-full p-3 border border-zinc-300 rounded-xl text-sm focus:outline-none focus:border-[#f06023]"
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value as any)}
                  >
                    <option value="fraudulent">Fraudulent / Fake Agent</option>
                    <option value="misleading">Misleading Photos / Price</option>
                    <option value="outdated">Already Occupied / Outdated</option>
                    <option value="duplicate">Duplicate Listing</option>
                    <option value="other">Other Issue</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">Additional Details (Optional)</label>
                  <textarea
                    rows={3}
                    className="w-full p-3 border border-zinc-300 rounded-xl text-sm focus:outline-none focus:border-[#f06023]"
                    placeholder="Provide details about why you are flagging this listing..."
                    value={reportDetails}
                    onChange={(e) => setReportDetails(e.target.value)}
                  />
                </div>

                <Button variant="primary" fullWidth type="submit" disabled={reportSubmitting}>
                  {reportSubmitting ? 'Submitting...' : 'Submit Report'}
                </Button>
              </form>
            )}
          </div>
        </div>
      )}
    </Layout>
  );
}
