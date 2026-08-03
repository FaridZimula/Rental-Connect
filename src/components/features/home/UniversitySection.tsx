import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { universities } from '../../../data/mockData';

// Get top 3 universities by student count
const popularUniversities = [...universities]
  .sort((a, b) => (b.studentCount || 0) - (a.studentCount || 0))
  .slice(0, 3);

const UniversitySection = () => {
  return (
    <section className="py-20 bg-white border-t border-zinc-200">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <motion.h2 
            className="text-3xl md:text-4xl font-display font-extrabold mb-4 text-zinc-900"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Popular <span className="text-[#f06023]">Rental Locations</span>
          </motion.h2>
          <motion.p 
            className="text-zinc-900 max-w-2xl mx-auto text-lg font-medium leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Explore available hostels, property, and vehicle rentals near major Ugandan university hubs.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {popularUniversities.map((university, index) => (
            <motion.div
              key={university.id}
              className="group relative overflow-hidden rounded-2xl shadow-md transition-all duration-300 bg-white border border-zinc-200 hover:border-[#f06023]"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
            >
              <div className="relative w-full" style={{ paddingBottom: '75%' }}>
                <div className="absolute inset-0">
                  <img
                    src={university.imageUrl}
                    alt={university.name}
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                </div>
              </div>
              
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <h3 className="text-xl font-bold mb-2 group-hover:text-[#f06023] transition-colors">{university.name}</h3>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-zinc-200">
                    <MapPin className="h-4 w-4 text-[#f06023]" />
                    <span className="text-sm font-medium">{university.location}</span>
                  </div>
                  <span className="text-xs bg-[#f06023] text-white font-bold px-3 py-1 rounded-full shadow-md">
                    {university.hostelCount} rentals
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div 
          className="text-center mt-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <Link
            to="/universities"
            className="inline-flex items-center justify-center px-6 py-3 bg-[#f06023] hover:bg-[#d94b12] text-white font-bold rounded-xl transition-all duration-300 shadow-md"
          >
            View All Locations
            <svg
              className="ml-2 h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default UniversitySection;