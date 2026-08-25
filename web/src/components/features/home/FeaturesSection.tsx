import { motion } from 'framer-motion';
import { ShieldCheck, Filter, MessageSquare, Flag, Activity, CheckCircle } from 'lucide-react';

const features = [
  {
    icon: <ShieldCheck className="h-6 w-6 text-white" />,
    title: 'Listing Verification',
    description: 'System managers review and approve every property before it goes public, eliminating fake listings and agent scams.',
  },
  {
    icon: <Filter className="h-6 w-6 text-white" />,
    title: 'Advanced Search & Filters',
    description: 'Filter rental properties by zone, exact price range, property type (apartment, house, studio), bedrooms, and amenities.',
  },
  {
    icon: <MessageSquare className="h-6 w-6 text-white" />,
    title: 'Direct Landlord Inquiries',
    description: 'Tenants send inquiries and request property viewings directly to verified landlords without intermediary friction.',
  },
  {
    icon: <Flag className="h-6 w-6 text-white" />,
    title: 'Fraud Reporting & Flagging',
    description: 'Report suspicious, duplicate, or outdated listings instantly. System administrators review reports and take immediate action.',
  },
  {
    icon: <Activity className="h-6 w-6 text-white" />,
    title: 'Audit & System Monitoring',
    description: 'Comprehensive activity logs record administrative actions, approvals, and moderations to maintain platform integrity.',
  },
  {
    icon: <CheckCircle className="h-6 w-6 text-white" />,
    title: 'Realtime Availability Control',
    description: 'Landlords update vacancy status in real-time, while stale listings are automatically flagged to ensure fresh data.',
  },
];

const FeaturesSection = () => {
  return (
    <section className="py-20 bg-white text-zinc-900 border-t border-zinc-200">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <motion.h2 
            className="text-3xl md:text-4xl font-display font-extrabold mb-4 text-zinc-900"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Core <span className="text-[#f06023]">System Objectives</span> & Features
          </motion.h2>
          <motion.p 
            className="text-zinc-600 max-w-2xl mx-auto text-base md:text-lg font-normal"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Built according to rigorous information system design standards for trust, transparency, and administrative control.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="bg-white border border-zinc-200 hover:border-[#f06023] p-8 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 group"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -4 }}
            >
              <div className="p-3.5 bg-[#f06023] text-white font-bold rounded-xl inline-flex mb-5 group-hover:scale-105 transition-transform shadow-md">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold mb-3 text-zinc-900 group-hover:text-[#f06023] transition-colors">{feature.title}</h3>
              <p className="text-zinc-600 text-sm leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;