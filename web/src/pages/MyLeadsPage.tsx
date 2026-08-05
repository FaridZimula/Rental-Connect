import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Lock,
  CheckCircle,
  Clock,
  Phone,
  Mail,
  MapPin,
  Building2,
  ArrowLeft,
  Coins,
} from 'lucide-react';
import Layout from '../components/layout/Layout';
import Button from '../components/ui/Button';
import { leadsApi, creditsApi } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';

interface Lead {
  id: string;
  status: 'pending_payment' | 'unlocked' | 'expired';
  buyer_message?: string;
  created_at: string;
  property: {
    id: string;
    title: string;
    display_zone: string;
    price: number | string;
    listing_type: string;
    images?: { image_url: string; is_primary: boolean }[];
  };
  owner?: {
    full_name: string;
    phone?: string;
    email?: string;
  };
  property_real_address?: string;
}

const STATUS_CONFIG = {
  pending_payment: {
    label: 'Awaiting payment',
    icon: <Clock className="h-4 w-4" />,
    className: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  unlocked: {
    label: 'Unlocked',
    icon: <CheckCircle className="h-4 w-4" />,
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  expired: {
    label: 'Expired',
    icon: <Lock className="h-4 w-4" />,
    className: 'bg-zinc-100 text-zinc-500 border-zinc-200',
  },
};

const formatPrice = (price: number | string, type: string) =>
  new Intl.NumberFormat('en-UG', {
    style: 'currency',
    currency: 'UGX',
    minimumFractionDigits: 0,
  }).format(Number(price)) + (type === 'rent' ? '/mo' : '');

export default function MyLeadsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [credits, setCredits] = useState(0);
  const [loading, setLoading] = useState(true);
  const [unlocking, setUnlocking] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) { navigate('/hostel-owner/login'); return; }
    Promise.all([leadsApi.myLeads(), creditsApi.balance()])
      .then(([leadsData, balanceData]) => {
        setLeads(leadsData ?? []);
        setCredits(balanceData.balance ?? 0);
      })
      .catch(() => setError('Could not load your connection requests.'))
      .finally(() => setLoading(false));
  }, [user, navigate]);

  const handleUnlock = async (leadId: string) => {
    setUnlocking(leadId);
    try {
      const contact = await leadsApi.unlock(leadId);
      setLeads((prev) =>
        prev.map((l) =>
          l.id === leadId
            ? {
                ...l,
                status: 'unlocked',
                owner: contact.owner,
                property_real_address: contact.property?.real_address,
              }
            : l,
        ),
      );
      setCredits((c) => c - 1);
    } catch (e: any) {
      alert(e?.response?.data?.message ?? 'Unlock failed. Please try again.');
    } finally {
      setUnlocking(null);
    }
  };

  return (
    <Layout>
      <div className="bg-white min-h-screen text-zinc-900">
        <div className="container mx-auto px-4 pt-24 pb-16 max-w-3xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <button
                onClick={() => navigate(-1)}
                className="flex items-center text-[#f06023] hover:text-[#d94b12] mb-3 text-sm font-medium"
              >
                <ArrowLeft className="h-4 w-4 mr-1" /> Back
              </button>
              <h1 className="text-2xl font-display font-extrabold text-zinc-900">
                My Connection Requests
              </h1>
              <p className="text-zinc-500 text-sm mt-1">
                {leads.length} request{leads.length !== 1 ? 's' : ''} total
              </p>
            </div>

            <div className="flex items-center gap-2 bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5">
              <Coins className="h-5 w-5 text-[#f06023]" />
              <div>
                <p className="text-xs text-zinc-400 leading-none">Credits</p>
                <p className="text-lg font-extrabold text-[#f06023] leading-none mt-0.5">{credits}</p>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-48">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#f06023]" />
            </div>
          ) : error ? (
            <div className="text-center py-16 bg-zinc-50 rounded-2xl border border-zinc-200">
              <Building2 className="h-12 w-12 mx-auto text-zinc-300 mb-3" />
              <p className="text-zinc-500">{error}</p>
            </div>
          ) : leads.length === 0 ? (
            <div className="text-center py-16 bg-zinc-50 rounded-2xl border border-zinc-200">
              <Lock className="h-14 w-14 mx-auto text-zinc-300 mb-4" />
              <h3 className="text-xl font-semibold text-zinc-700 mb-2">No connection requests yet</h3>
              <p className="text-zinc-500 text-sm mb-6">
                Browse properties and click "Request Connection" to get started.
              </p>
              <Link to="/properties">
                <Button variant="primary">Browse Properties</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {leads.map((lead, i) => {
                const cfg = STATUS_CONFIG[lead.status] ?? STATUS_CONFIG.pending_payment;
                const primaryImg = lead.property.images?.find((img) => img.is_primary) ?? lead.property.images?.[0];

                return (
                  <motion.div
                    key={lead.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <div className="flex gap-4 p-4">
                      {/* Thumbnail */}
                      <div className="w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden bg-zinc-100">
                        {primaryImg ? (
                          <img src={primaryImg.image_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-zinc-300">
                            <Building2 className="h-7 w-7" />
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <Link
                            to={`/properties/${lead.property.id}`}
                            className="font-bold text-zinc-900 text-sm hover:text-[#f06023] transition-colors truncate"
                          >
                            {lead.property.title}
                          </Link>
                          <span
                            className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border flex-shrink-0 ${cfg.className}`}
                          >
                            {cfg.icon}
                            {cfg.label}
                          </span>
                        </div>

                        <div className="flex items-center text-xs text-zinc-400 mb-2">
                          <MapPin className="h-3 w-3 mr-1 text-[#f06023]" />
                          {lead.property.display_zone}
                          <span className="mx-2">·</span>
                          <span className="font-semibold text-[#f06023]">
                            {formatPrice(lead.property.price, lead.property.listing_type)}
                          </span>
                        </div>

                        {lead.buyer_message && (
                          <p className="text-xs text-zinc-500 line-clamp-1 italic mb-2">
                            "{lead.buyer_message}"
                          </p>
                        )}

                        <p className="text-xs text-zinc-400">
                          Requested {new Date(lead.created_at).toLocaleDateString('en-UG', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                    </div>

                    {/* Unlocked contact info */}
                    {lead.status === 'unlocked' && lead.owner && (
                      <div className="border-t border-zinc-100 bg-emerald-50 px-4 py-3 space-y-1.5">
                        <p className="text-xs font-bold text-emerald-800 mb-1">Owner contact revealed</p>
                        <p className="text-sm font-semibold text-zinc-800">{lead.owner.full_name}</p>
                        {lead.owner.phone && (
                          <a
                            href={`tel:${lead.owner.phone}`}
                            className="flex items-center gap-1.5 text-sm text-[#f06023] hover:underline"
                          >
                            <Phone className="h-3.5 w-3.5" />
                            {lead.owner.phone}
                          </a>
                        )}
                        {lead.owner.email && (
                          <a
                            href={`mailto:${lead.owner.email}`}
                            className="flex items-center gap-1.5 text-sm text-[#f06023] hover:underline"
                          >
                            <Mail className="h-3.5 w-3.5" />
                            {lead.owner.email}
                          </a>
                        )}
                        {lead.property_real_address && (
                          <p className="flex items-center gap-1.5 text-sm text-zinc-700">
                            <MapPin className="h-3.5 w-3.5 text-[#f06023] flex-shrink-0" />
                            {lead.property_real_address}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Pending action */}
                    {lead.status === 'pending_payment' && (
                      <div className="border-t border-zinc-100 bg-amber-50 px-4 py-3 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-amber-800">Unlock this connection</p>
                          <p className="text-xs text-amber-600">
                            Spend 1 credit (you have {credits}) to reveal owner details.
                          </p>
                        </div>
                        <Button
                          variant="primary"
                          size="sm"
                          disabled={credits < 1 || unlocking === lead.id}
                          onClick={() => handleUnlock(lead.id)}
                        >
                          {unlocking === lead.id ? 'Unlocking…' : 'Use 1 Credit'}
                        </Button>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
