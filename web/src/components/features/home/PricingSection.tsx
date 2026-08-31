import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Sparkles, Building2, UserCheck, ShieldCheck, Zap, ArrowRight, Info } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PricingSection() {
  const [isAnnual, setIsAnnual] = useState(false);
  const [selectedPlanModal, setSelectedPlanModal] = useState<string | null>(null);

  const plans = [
    {
      id: 'starter',
      name: 'Tenant Basic',
      icon: UserCheck,
      badge: 'Free Forever',
      badgeColor: 'bg-zinc-100 text-zinc-700 border-zinc-200',
      description: 'Ideal for home seekers looking to search, discover, and contact verified landlords directly.',
      monthlyPrice: 0,
      annualPrice: 0,
      period: 'free',
      isPopular: false,
      buttonText: 'Get Started Free',
      buttonVariant: 'outline',
      features: [
        'Unlimited property searches & filters',
        'Direct landlord contact & inquiry forms',
        'Save & bookmark favorite listings',
        'Fraud reporting & safety verification',
        'Email notification alerts for new listings',
      ],
    },
    {
      id: 'standard',
      name: 'Landlord Standard',
      icon: ShieldCheck,
      badge: 'Most Popular',
      badgeColor: 'bg-[#f06023] text-white border-[#f06023]',
      description: 'Perfect for individual property owners wanting to list, manage, and verify up to 5 properties.',
      monthlyPrice: 50000,
      annualPrice: 40000, // equivalent monthly rate when billed annually
      period: 'per month',
      isPopular: true,
      buttonText: 'Choose Standard Plan',
      buttonVariant: 'primary',
      features: [
        'Up to 5 Active Property Listings',
        'Verified Landlord Trust Badge',
        'Direct WhatsApp & Instant Inquiries',
        'High-Res Photo Gallery (Up to 15 photos)',
        'Real-time Availability Status Control',
        'Listing View Analytics & Performance',
        'Priority Listing Verification (< 12 hours)',
      ],
    },
    {
      id: 'agency',
      name: 'Agency & Enterprise',
      icon: Building2,
      badge: 'Pro Agency',
      badgeColor: 'bg-zinc-900 text-white border-zinc-900',
      description: 'Built for real estate agencies, property managers, and developers with large property portfolios.',
      monthlyPrice: 150000,
      annualPrice: 120000,
      period: 'per month',
      isPopular: false,
      buttonText: 'Get Agency Access',
      buttonVariant: 'dark',
      features: [
        'Unlimited Active Property Listings',
        'Top Search Ranking & Featured Placement',
        'Auction & Hot Deals Listing Access',
        'Verified Premium Agency Trust Seal',
        'Dedicated Account Manager & 24/7 Support',
        'Multi-agent Team Dashboard & Roles',
        'Exportable Lead Reports & Advanced Analytics',
      ],
    },
  ];

  const formatPrice = (amount: number) => {
    if (amount === 0) return 'Free';
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      maximumFractionDigits: 0,
    }).format(amount).replace('UGX', 'USh');
  };

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-zinc-50 to-white border-t border-zinc-200 overflow-hidden relative">
      {/* Decorative background blur elements */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-orange-100/50 rounded-full blur-3xl -z-10 pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-50 border border-orange-200 text-[#f06023] font-bold text-xs uppercase tracking-wider mb-4"
          >
            <Sparkles className="h-4 w-4" /> Transparent Pricing Plans
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl font-display font-extrabold text-zinc-900 tracking-tight mb-4"
          >
            Plans Built for <span className="text-[#f06023]">Tenants & Landlords</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-zinc-600 text-sm sm:text-base md:text-lg max-w-2xl mx-auto font-normal leading-relaxed"
          >
            Simple, honest pricing with zero hidden fees. Choose a plan tailored to your property search or leasing objectives.
          </motion.p>

          {/* Billing Cycle Toggle */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="mt-8 inline-flex items-center gap-3 p-1.5 bg-zinc-100/90 rounded-2xl border border-zinc-200 shadow-inner"
          >
            <button
              onClick={() => setIsAnnual(false)}
              className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 ${
                !isAnnual
                  ? 'bg-white text-zinc-900 shadow-sm border border-zinc-200/80'
                  : 'text-zinc-500 hover:text-zinc-900'
              }`}
            >
              Monthly Billing
            </button>

            <button
              onClick={() => setIsAnnual(true)}
              className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 flex items-center gap-2 ${
                isAnnual
                  ? 'bg-[#f06023] text-white shadow-sm'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              <span>Annual Billing</span>
              <span className={`text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full ${
                isAnnual ? 'bg-white/20 text-white' : 'bg-orange-100 text-[#f06023]'
              }`}>
                Save 20%
              </span>
            </button>
          </motion.div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-7xl mx-auto items-stretch">
          {plans.map((plan, index) => {
            const IconComponent = plan.icon;
            const currentPrice = isAnnual ? plan.annualPrice : plan.monthlyPrice;

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.12 }}
                whileHover={{ y: -6 }}
                className={`relative bg-white rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 ${
                  plan.isPopular
                    ? 'border-2 border-[#f06023] shadow-xl shadow-orange-500/10 ring-4 ring-orange-500/10'
                    : 'border border-zinc-200 hover:border-zinc-300 shadow-sm hover:shadow-md'
                }`}
              >
                {/* Popular Badge */}
                {plan.isPopular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#f06023] text-white font-extrabold text-[11px] uppercase tracking-wider px-4 py-1 rounded-full shadow-md flex items-center gap-1">
                    <Zap className="h-3.5 w-3.5 fill-white" /> {plan.badge}
                  </div>
                )}

                <div>
                  {/* Top Card Info */}
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-2xl ${plan.isPopular ? 'bg-orange-50 text-[#f06023]' : 'bg-zinc-100 text-zinc-700'}`}>
                      <IconComponent className="h-6 w-6" />
                    </div>
                    {!plan.isPopular && (
                      <span className={`text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full border ${plan.badgeColor}`}>
                        {plan.badge}
                      </span>
                    )}
                  </div>

                  <h3 className="text-xl sm:text-2xl font-bold text-zinc-900 mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-500 mb-6 leading-relaxed">
                    {plan.description}
                  </p>

                  {/* Pricing Display */}
                  <div className="mb-6 pb-6 border-b border-zinc-100">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-3xl sm:text-4xl font-extrabold text-zinc-900 tracking-tight">
                        {formatPrice(currentPrice)}
                      </span>
                      {currentPrice > 0 && (
                        <span className="text-xs sm:text-sm font-semibold text-zinc-500">
                          / month
                        </span>
                      )}
                    </div>
                    {isAnnual && currentPrice > 0 && (
                      <p className="text-[11px] text-[#f06023] font-semibold mt-1">
                        Billed annually (USh {(currentPrice * 12).toLocaleString()}/yr)
                      </p>
                    )}
                  </div>

                  {/* Feature Checklist */}
                  <div className="space-y-3 mb-8">
                    <p className="text-xs font-bold uppercase text-zinc-400 tracking-wider mb-3">What's Included</p>
                    {plan.features.map((feature, fIdx) => (
                      <div key={fIdx} className="flex items-start gap-2.5 text-xs sm:text-sm text-zinc-700">
                        <div className={`mt-0.5 rounded-full p-0.5 shrink-0 ${plan.isPopular ? 'bg-orange-100 text-[#f06023]' : 'bg-zinc-100 text-zinc-800'}`}>
                          <Check className="h-3.5 w-3.5 font-bold" />
                        </div>
                        <span className="font-medium leading-snug">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Call to Action Button */}
                <div>
                  <Link to="/register">
                    <button
                      onClick={() => setSelectedPlanModal(plan.name)}
                      className={`w-full py-3.5 px-6 rounded-2xl font-bold text-xs sm:text-sm transition-all duration-300 flex items-center justify-center gap-2 shadow-sm active:scale-98 cursor-pointer ${
                        plan.isPopular
                          ? 'bg-[#f06023] hover:bg-[#d94b12] text-white shadow-orange-500/20 shadow-md'
                          : plan.buttonVariant === 'dark'
                          ? 'bg-zinc-900 hover:bg-black text-white'
                          : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-900 border border-zinc-200'
                      }`}
                    >
                      {plan.buttonText} <ArrowRight className="h-4 w-4" />
                    </button>
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Footer Note */}
        <div className="mt-12 text-center text-xs text-zinc-500 flex items-center justify-center gap-2">
          <Info className="h-4 w-4 text-[#f06023]" />
          <span>Need a custom plan for large property management portfolios? <Link to="/register" className="text-[#f06023] font-bold underline hover:text-[#d94b12]">Contact our sales team</Link></span>
        </div>
      </div>
    </section>
  );
}
