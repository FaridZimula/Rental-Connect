import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  MapPin,
  Bed,
  Bath,
  Zap,
  Lock,
  Heart,
  Share2,
  ChevronLeft,
  ChevronRight,
  Building2,
} from 'lucide-react';
import Layout from '../components/layout/Layout';
import Button from '../components/ui/Button';
import ConnectModal from '../components/features/properties/ConnectModal';
import { propertiesApi, creditsApi, favoritesApi } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { PropertySummary } from '../components/features/properties/PropertyCard';

interface PropertyDetail extends PropertySummary {
  display_lat: number;
  display_lng: number;
  size_sqft?: number;
  status: string;
  amenities: { amenity: { name: string } }[];
}

const formatPrice = (price: number | string, listingType: string) =>
  new Intl.NumberFormat('en-UG', {
    style: 'currency',
    currency: 'UGX',
    minimumFractionDigits: 0,
  }).format(Number(price)) + (listingType === 'rent' ? '/mo' : '');

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
  const { user } = useAuth();

  const [property, setProperty] = useState<PropertyDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeImg, setActiveImg] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [credits, setCredits] = useState(0);
  const [isFav, setIsFav] = useState(false);
  const [favLoading, setFavLoading] = useState(false);
  const [unlockedContact, setUnlockedContact] = useState<any>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    propertiesApi
      .get(id)
      .then((data) => {
        setProperty(data);
        setLoading(false);
      })
      .catch(() => {
        setError('Property not found.');
        setLoading(false);
      });
  }, [id]);

  useEffect(() => {
    if (!user) return;
    creditsApi.balance().then((b) => setCredits(b.balance ?? 0)).catch(() => {});
    favoritesApi
      .list()
      .then((favs: any[]) => setIsFav(favs.some((f: any) => f.property_id === id)))
      .catch(() => {});
  }, [user, id]);

  const toggleFavorite = async () => {
    if (!user) { navigate('/hostel-owner/login'); return; }
    setFavLoading(true);
    try {
      if (isFav) {
        await favoritesApi.remove(id!);
        setIsFav(false);
      } else {
        await favoritesApi.add(id!);
        setIsFav(true);
      }
    } finally {
      setFavLoading(false);
    }
  };

  const images = property?.images ?? [];
  const amenityNames = property?.amenities?.map((a) => a.amenity.name) ?? [];

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-[70vh]">
          <div className="animate-spin rounded-full h-14 w-14 border-t-2 border-b-2 border-[#f06023]" />
        </div>
      </Layout>
    );
  }

  if (error || !property) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-24 text-center">
          <Building2 className="h-16 w-16 mx-auto text-zinc-300 mb-4" />
          <h2 className="text-2xl font-bold text-zinc-700 mb-2">{error || 'Not found'}</h2>
          <Link to="/properties">
            <Button variant="primary" icon={<ArrowLeft className="h-4 w-4" />} iconPosition="left">
              Back to listings
            </Button>
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="bg-white min-h-screen text-zinc-900">
        <div className="container mx-auto px-4 pt-24 pb-16">
          {/* Breadcrumb */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-[#f06023] hover:text-[#d94b12] mb-6 font-medium text-sm transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to results
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Images + Details */}
            <div className="lg:col-span-2">
              {/* Image gallery */}
              <div className="relative h-72 md:h-[420px] rounded-2xl overflow-hidden mb-3 bg-zinc-100 shadow-lg">
                {images.length > 0 ? (
                  <motion.img
                    key={activeImg}
                    src={images[activeImg].image_url}
                    alt={property.title}
                    className="w-full h-full object-cover"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.25 }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-400 text-sm">
                    No photos available
                  </div>
                )}

                {/* Featured badge */}
                {property.is_featured && (
                  <div className="absolute top-4 left-4 bg-amber-400 text-amber-900 font-bold text-xs uppercase px-3 py-1.5 rounded-full flex items-center gap-1 shadow-md">
                    <Zap className="h-3.5 w-3.5 fill-amber-900" /> Featured
                  </div>
                )}

                {/* Gallery nav */}
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
                    <div className="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
                      {activeImg + 1} / {images.length}
                    </div>
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

              {/* Title row */}
              <div className="flex items-start justify-between mb-3 gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="bg-[#f06023] text-white text-xs font-bold uppercase px-2.5 py-1 rounded-full">
                      {TYPE_LABELS[property.property_type] ?? property.property_type}
                    </span>
                    <span className="bg-zinc-100 text-zinc-700 text-xs font-semibold px-2.5 py-1 rounded-full capitalize">
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
                    disabled={favLoading}
                    className={`p-2.5 rounded-xl border transition-colors ${
                      isFav
                        ? 'bg-red-50 border-red-200 text-red-500'
                        : 'bg-white border-zinc-200 text-zinc-500 hover:border-red-300 hover:text-red-400'
                    }`}
                    title={isFav ? 'Remove from favourites' : 'Save to favourites'}
                  >
                    <Heart className={`h-5 w-5 ${isFav ? 'fill-red-500' : ''}`} />
                  </button>
                  <button
                    onClick={() => navigator.clipboard.writeText(window.location.href)}
                    className="p-2.5 rounded-xl border border-zinc-200 text-zinc-500 hover:border-zinc-400 transition-colors"
                    title="Copy link"
                  >
                    <Share2 className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Location */}
              <div className="flex items-center text-zinc-500 text-sm mb-4">
                <MapPin className="h-4 w-4 mr-1 text-[#f06023] flex-shrink-0" />
                <span>{property.display_zone}</span>
                <span className="ml-2 text-xs text-zinc-400">(approximate area — exact address revealed after connection)</span>
              </div>

              {/* Bed / Bath / Size */}
              <div className="flex flex-wrap gap-4 mb-6">
                {property.bedrooms > 0 && (
                  <div className="flex items-center gap-1.5 bg-zinc-50 border border-zinc-200 px-3 py-2 rounded-xl">
                    <Bed className="h-4 w-4 text-[#f06023]" />
                    <span className="text-sm font-semibold text-zinc-700">{property.bedrooms} Bedroom{property.bedrooms !== 1 ? 's' : ''}</span>
                  </div>
                )}
                {property.bathrooms > 0 && (
                  <div className="flex items-center gap-1.5 bg-zinc-50 border border-zinc-200 px-3 py-2 rounded-xl">
                    <Bath className="h-4 w-4 text-[#f06023]" />
                    <span className="text-sm font-semibold text-zinc-700">{property.bathrooms} Bathroom{property.bathrooms !== 1 ? 's' : ''}</span>
                  </div>
                )}
                {(property as any).size_sqft && (
                  <div className="flex items-center gap-1.5 bg-zinc-50 border border-zinc-200 px-3 py-2 rounded-xl">
                    <span className="text-sm font-semibold text-zinc-700">{(property as any).size_sqft} sq ft</span>
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="mb-8">
                <h2 className="text-lg font-bold text-zinc-900 mb-2">About this property</h2>
                <p className="text-zinc-600 leading-relaxed whitespace-pre-line">{property.description}</p>
              </div>

              {/* Amenities */}
              {amenityNames.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-lg font-bold text-zinc-900 mb-3">Amenities</h2>
                  <div className="flex flex-wrap gap-2">
                    {amenityNames.map((a) => (
                      <span
                        key={a}
                        className="bg-zinc-100 text-zinc-700 border border-zinc-200 text-sm px-3 py-1.5 rounded-full font-medium"
                      >
                        {a}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Privacy notice */}
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3">
                <Lock className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-amber-800 mb-0.5">Mediated listing</p>
                  <p className="text-sm text-amber-700">
                    Owner contact details, exact address, and GPS coordinates are hidden for safety. They are
                    revealed instantly after you spend 1 connection credit.
                  </p>
                </div>
              </div>
            </div>

            {/* Right: Sticky sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white border border-zinc-200 rounded-2xl shadow-xl p-6 sticky top-24 space-y-5">
                {/* Price */}
                <div>
                  <p className="text-xs text-zinc-400 uppercase tracking-widest font-semibold mb-0.5">Price</p>
                  <p className="text-3xl font-extrabold text-[#f06023]">
                    {formatPrice(property.price, property.listing_type)}
                  </p>
                  {property.listing_type === 'rent' && (
                    <p className="text-xs text-zinc-400 mt-0.5">per month</p>
                  )}
                </div>

                {/* Revealed contact (if already unlocked this session) */}
                {unlockedContact ? (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 space-y-2 text-sm">
                    <p className="font-bold text-emerald-800">Connection unlocked!</p>
                    <p><span className="text-zinc-500">Owner: </span><span className="font-semibold">{unlockedContact.owner?.full_name}</span></p>
                    {unlockedContact.owner?.phone && (
                      <p><span className="text-zinc-500">Phone: </span>
                        <a href={`tel:${unlockedContact.owner.phone}`} className="text-[#f06023] font-semibold hover:underline">
                          {unlockedContact.owner.phone}
                        </a>
                      </p>
                    )}
                    {unlockedContact.owner?.email && (
                      <p><span className="text-zinc-500">Email: </span>
                        <a href={`mailto:${unlockedContact.owner.email}`} className="text-[#f06023] font-semibold hover:underline">
                          {unlockedContact.owner.email}
                        </a>
                      </p>
                    )}
                    {unlockedContact.property?.real_address && (
                      <p><span className="text-zinc-500">Address: </span>{unlockedContact.property.real_address}</p>
                    )}
                  </div>
                ) : (
                  <>
                    {/* Credits balance */}
                    {user && (
                      <div className="flex items-center justify-between bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5">
                        <span className="text-sm text-zinc-600">Your credits</span>
                        <span className="font-bold text-[#f06023]">{credits}</span>
                      </div>
                    )}

                    <Button
                      variant="primary"
                      fullWidth
                      size="lg"
                      icon={<Lock className="h-5 w-5" />}
                      iconPosition="left"
                      onClick={() => {
                        if (!user) navigate('/hostel-owner/login');
                        else setShowModal(true);
                      }}
                    >
                      {user ? 'Request Connection' : 'Log in to Connect'}
                    </Button>

                    <p className="text-xs text-zinc-400 text-center">
                      1 credit = 1 connection unlock. Credits never expire.
                    </p>
                  </>
                )}

                {user && (
                  <Link
                    to="/leads"
                    className="block text-center text-sm text-[#f06023] hover:underline font-medium"
                  >
                    View my connection requests →
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Connect modal */}
      {showModal && (
        <ConnectModal
          propertyId={id!}
          propertyTitle={property.title}
          creditBalance={credits}
          onClose={() => setShowModal(false)}
          onUnlocked={(contact) => {
            setUnlockedContact(contact);
            setShowModal(false);
          }}
        />
      )}
    </Layout>
  );
}
