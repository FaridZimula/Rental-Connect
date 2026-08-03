import { motion } from 'framer-motion';

const features = [
  {
    icon: <i className="fa-solid fa-building text-2xl text-white" />,
    title: 'Property & Hostel Rentals',
    description: 'Explore verified student hostels, studio apartments, and residential houses available across Uganda.',
  },
  {
    icon: <i className="fa-solid fa-sliders text-2xl text-white" />,
    title: 'Smart Category Filtering',
    description: 'Filter rentals by property type, vehicles, commercial land, equipment, price range, and radius.',
  },
  {
    icon: <i className="fa-solid fa-user-tie text-2xl text-white" />,
    title: 'Direct Owner Connection',
    description: 'Connect directly with verified owners and lessors for transparent agreements and quick check-ins.',
  },
  {
    icon: <i className="fa-solid fa-star text-2xl text-white" />,
    title: 'Verified Renter Reviews',
    description: 'Read authentic ratings and reviews from previous renters before booking any item or property.',
  },
  {
    icon: <i className="fa-solid fa-calendar-check text-2xl text-white" />,
    title: 'Flexible Rental Durations',
    description: 'Rent per day, per month, or per semester depending on your specific needs.',
  },
  {
    icon: <i className="fa-solid fa-shield-halved text-2xl text-white" />,
    title: 'Protected Agreements',
    description: 'Book with confidence knowing all listings, owner credentials, and rental transactions are secured.',
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
            Why Rent with <span className="text-[#f06023]">Rental Connect</span>?
          </motion.h2>
          <motion.p 
            className="text-zinc-700 max-w-2xl mx-auto text-lg font-medium"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Connecting property and item owners with renters seamlessly, securely, and transparently.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="bg-white border border-zinc-200 hover:border-[#f06023] p-8 rounded-2xl shadow-md transition-all duration-300 group"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
            >
              <div className="p-3 bg-[#f06023] text-white font-bold rounded-xl inline-flex mb-4 group-hover:scale-110 transition-transform shadow-md">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold mb-3 text-zinc-900 group-hover:text-[#f06023] transition-colors">{feature.title}</h3>
              <p className="text-zinc-600 font-normal leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Bottom Features Banner with FontAwesome Icons */}
      <div className="bg-orange-50/70 border border-orange-200 py-12 mt-8 mx-auto max-w-7xl rounded-2xl shadow-sm">
        <div className="px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-zinc-900 text-center">
          <div className="flex flex-col items-center">
            <i className="fa-solid fa-house-user text-[#f06023] text-3xl mb-3"></i>
            <p className="text-lg font-bold text-zinc-900">Hostels & Apartments</p>
          </div>
          <div className="flex flex-col items-center">
            <i className="fa-solid fa-car text-[#f06023] text-3xl mb-3"></i>
            <p className="text-lg font-bold text-zinc-900">Cars & 4x4 Vehicles</p>
          </div>
          <div className="flex flex-col items-center">
            <i className="fa-solid fa-map-location-dot text-[#f06023] text-3xl mb-3"></i>
            <p className="text-lg font-bold text-zinc-900">Commercial & Plot Land</p>
          </div>
          <div className="flex flex-col items-center">
            <i className="fa-solid fa-screwdriver-wrench text-[#f06023] text-3xl mb-3"></i>
            <p className="text-lg font-bold text-zinc-900">Tools & Heavy Equipment</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;