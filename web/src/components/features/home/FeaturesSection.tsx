import { useRef, useState } from 'react';
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
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft } = scrollContainerRef.current;
      const index = Math.round(scrollLeft / 320);
      setActiveIndex(Math.min(Math.max(0, index), features.length - 1));
    }
  };

  const scrollToSlide = (index: number) => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        left: index * 340,
        behavior: 'smooth',
      });
      setActiveIndex(index);
    }
  };

  return (
    <section className="py-16 md:py-20 bg-white text-zinc-900 border-t border-zinc-200 overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Header Row — Middle Alignment */}
        <div className="text-center mb-10 max-w-3xl mx-auto flex flex-col items-center">
          <motion.h2 
            className="text-2xl sm:text-3xl md:text-4xl font-display font-extrabold mb-3 text-zinc-900 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Core <span className="text-[#f06023]">System Objectives</span> & Features
          </motion.h2>
          <motion.p 
            className="text-zinc-600 max-w-2xl text-sm sm:text-base font-normal text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Built according to rigorous information system design standards for trust, transparency, and administrative control.
          </motion.p>
        </div>

        {/* Single Horizontal Line Scroll Container */}
        <div 
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex flex-nowrap overflow-x-auto gap-6 pb-4 pt-2 scroll-smooth snap-x snap-mandatory hide-scrollbar"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="w-[280px] sm:w-[320px] md:w-[360px] shrink-0 snap-start bg-white border-2 border-orange-100 hover:border-[#f06023] p-6 sm:p-8 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 group flex flex-col items-center justify-between text-center"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
              whileHover={{ y: -4 }}
            >
              <div className="flex flex-col items-center text-center w-full">
                <div className="h-14 w-14 rounded-full bg-[#f06023] border-2 border-[#f06023] text-white flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-md">
                  {feature.icon}
                </div>
                <h3 className="text-lg sm:text-xl font-bold mb-3 text-zinc-900 group-hover:text-[#f06023] transition-colors text-center">
                  {feature.title}
                </h3>
                <p className="text-zinc-600 text-sm leading-relaxed text-center">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Light Circular Pagination Dots Below Cards */}
        <div className="flex items-center justify-center gap-2 mt-6">
          {features.map((_, idx) => (
            <button
              key={idx}
              onClick={() => scrollToSlide(idx)}
              className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                activeIndex === idx
                  ? 'w-7 bg-[#f06023]'
                  : 'w-2.5 bg-orange-200 hover:bg-[#f06023]/60'
              }`}
              aria-label={`Go to feature slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;