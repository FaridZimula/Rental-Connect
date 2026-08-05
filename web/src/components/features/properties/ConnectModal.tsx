import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageSquare, Coins, CreditCard, Lock, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { leadsApi, paymentsApi } from '../../../lib/api';
import { useAuth } from '../../../contexts/AuthContext';
import Button from '../../ui/Button';

interface Props {
  propertyId: string;
  propertyTitle: string;
  creditBalance: number;
  onClose: () => void;
  onUnlocked: (contactInfo: any) => void;
}

type Step = 'compose' | 'choose_payment' | 'unlocked' | 'error';

export default function ConnectModal({
  propertyId,
  propertyTitle,
  creditBalance,
  onClose,
  onUnlocked,
}: Props) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('compose');
  const [message, setMessage] = useState('');
  const [leadId, setLeadId] = useState<string | null>(null);
  const [contact, setContact] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreateLead = async () => {
    if (!user) {
      navigate('/hostel-owner/login');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const lead = await leadsApi.create(propertyId, message || undefined);
      setLeadId(lead.id);
      setStep('choose_payment');
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSpendCredit = async () => {
    if (!leadId) return;
    setLoading(true);
    setError('');
    try {
      const unlocked = await leadsApi.unlock(leadId);
      setContact(unlocked);
      setStep('unlocked');
      onUnlocked(unlocked);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Failed to unlock. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePayToUnlock = async () => {
    setLoading(true);
    try {
      const result = await paymentsApi.initiateCreditPurchase('5');
      if (result.payment_link) {
        window.location.href = result.payment_link;
      }
    } catch {
      setError('Could not initiate payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md z-10 overflow-hidden"
        >
          {/* Header */}
          <div className="bg-[#f06023] text-white px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              <h2 className="font-bold text-lg">Connect to Owner</h2>
            </div>
            <button onClick={onClose} className="hover:bg-white/20 p-1 rounded-lg transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="p-6">
            <p className="text-sm text-zinc-500 mb-4 truncate">
              <span className="font-semibold text-zinc-800">{propertyTitle}</span>
            </p>

            {/* Step: compose message */}
            {step === 'compose' && (
              <>
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4 text-sm text-amber-800 flex gap-2">
                  <Lock className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <span>
                    Owner contact details are revealed only after you complete payment. 1 connection credit
                    = 1 unlock.
                  </span>
                </div>

                <label className="block text-sm font-semibold text-zinc-700 mb-1.5">
                  Your message to the owner <span className="font-normal text-zinc-400">(optional)</span>
                </label>
                <div className="relative mb-1">
                  <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                  <textarea
                    rows={3}
                    maxLength={500}
                    placeholder="Introduce yourself or ask about the property… (no contact details — those will be shared after payment)"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-900 placeholder-zinc-400 text-sm focus:outline-none focus:border-[#f06023] resize-none"
                  />
                </div>
                <p className="text-xs text-zinc-400 mb-5 text-right">{message.length}/500</p>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-xl mb-4">
                    {error}
                  </div>
                )}

                <Button variant="primary" fullWidth size="lg" disabled={loading} onClick={handleCreateLead}>
                  {loading ? 'Processing…' : 'Continue to Payment'}
                </Button>
              </>
            )}

            {/* Step: choose payment method */}
            {step === 'choose_payment' && (
              <>
                <p className="text-sm text-zinc-600 mb-4">
                  Choose how to unlock the owner's contact details:
                </p>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-xl mb-4">
                    {error}
                  </div>
                )}

                {/* Option A: spend a credit */}
                <button
                  onClick={handleSpendCredit}
                  disabled={loading || creditBalance < 1}
                  className={`w-full flex items-start gap-3 p-4 rounded-xl border-2 mb-3 text-left transition-all ${
                    creditBalance >= 1
                      ? 'border-[#f06023] bg-orange-50 hover:bg-orange-100'
                      : 'border-zinc-200 bg-zinc-50 opacity-50 cursor-not-allowed'
                  }`}
                >
                  <Coins className="h-6 w-6 text-[#f06023] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-zinc-900">
                      Spend 1 Credit{' '}
                      <span className="font-normal text-zinc-500 text-sm">
                        (Balance: {creditBalance})
                      </span>
                    </p>
                    <p className="text-sm text-zinc-500">
                      {creditBalance >= 1
                        ? 'Instant unlock — no additional payment needed.'
                        : 'Not enough credits. Buy a bundle below.'}
                    </p>
                  </div>
                </button>

                {/* Option B: pay to unlock / buy credits */}
                <button
                  onClick={handlePayToUnlock}
                  disabled={loading}
                  className="w-full flex items-start gap-3 p-4 rounded-xl border-2 border-zinc-300 bg-zinc-50 hover:border-zinc-400 hover:bg-zinc-100 text-left transition-all"
                >
                  <CreditCard className="h-6 w-6 text-zinc-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-zinc-900">Buy 5 Credits — UGX 45,000</p>
                    <p className="text-sm text-zinc-500">
                      Pay via Mobile Money or card. Credits never expire.
                    </p>
                  </div>
                </button>

                <p className="text-xs text-zinc-400 text-center mt-4">
                  Paid securely via Flutterwave. Supports MTN, Airtel, Visa & Mastercard.
                </p>
              </>
            )}

            {/* Step: unlocked — show contact */}
            {step === 'unlocked' && contact && (
              <div>
                <div className="flex items-center gap-2 text-emerald-600 mb-4">
                  <CheckCircle className="h-6 w-6" />
                  <span className="font-bold text-lg">Connection unlocked!</span>
                </div>

                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 space-y-3">
                  <div>
                    <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-0.5">Owner</p>
                    <p className="font-bold text-zinc-900">{contact.owner?.full_name}</p>
                  </div>
                  {contact.owner?.phone && (
                    <div>
                      <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-0.5">Phone</p>
                      <a
                        href={`tel:${contact.owner.phone}`}
                        className="font-semibold text-[#f06023] hover:underline"
                      >
                        {contact.owner.phone}
                      </a>
                    </div>
                  )}
                  {contact.owner?.email && (
                    <div>
                      <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-0.5">Email</p>
                      <a
                        href={`mailto:${contact.owner.email}`}
                        className="font-semibold text-[#f06023] hover:underline"
                      >
                        {contact.owner.email}
                      </a>
                    </div>
                  )}
                  {contact.property?.real_address && (
                    <div>
                      <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-0.5">
                        Full Address
                      </p>
                      <p className="text-zinc-800">{contact.property.real_address}</p>
                    </div>
                  )}
                </div>

                <p className="text-xs text-zinc-400 mt-3 text-center">
                  This connection has been saved. View all your connections in My Leads.
                </p>

                <Button variant="outline" fullWidth className="mt-4" onClick={onClose}>
                  Close
                </Button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
