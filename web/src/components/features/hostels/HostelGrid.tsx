import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import HostelCard from './HostelCard';
import { useHostels } from '../../../contexts/HostelContext';
import { Building } from 'lucide-react';

const HostelGrid = () => {
  const { filteredHostels, filterHostels, searchHostels, loading, error } = useHostels();
  const [visibleCount, setVisibleCount] = useState(6);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const university = searchParams.get('university');

    if (category || university) {
      filterHostels({
        category: (category as any) || 'all',
        university: university || undefined
      });
    }

    if (search) {
      searchHostels(search);
    }
  }, [searchParams]);

  const loadMore = () => {
    setVisibleCount((prev) => prev + 6);
  };

  // Reset visible count when filtered hostels change
  useEffect(() => {
    setVisibleCount(6);
  }, [filteredHostels]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#f06023]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-400 p-4">
        Error: {error}
      </div>
    );
  }

  if (filteredHostels.length === 0) {
    return (
      <div className="text-center p-8 bg-zinc-900 border border-zinc-800 rounded-xl my-6">
        <Building className="h-16 w-16 mx-auto text-[#f06023] mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">No rentals found</h3>
        <p className="text-zinc-400">
          Try adjusting your search or category filter criteria to find available rentals.
        </p>
      </div>
    );
  }

  const visibleHostels = filteredHostels.slice(0, visibleCount);
  const hasMore = visibleCount < filteredHostels.length;

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {visibleHostels.map((hostel, index) => (
          <motion.div
            key={hostel.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <HostelCard hostel={hostel} />
          </motion.div>
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center mt-8">
          <button
            onClick={loadMore}
            className="bg-[#f06023] hover:bg-[#d94b12] text-white font-bold px-6 py-2.5 rounded-full transition-all duration-300 shadow-[0_0_12px_rgba(240,96,35,0.3)]"
          >
            Load More Rental Items
          </button>
        </div>
      )}
    </div>
  );
};

export default HostelGrid;