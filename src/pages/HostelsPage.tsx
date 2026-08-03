import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import HostelFilters from '../components/features/hostels/HostelFilters';
import HostelGrid from '../components/features/hostels/HostelGrid';
import { useHostels } from '../contexts/HostelContext';

const HostelsPage = () => {
  const location = useLocation();
  const { searchHostels, filterHostels, resetFilters } = useHostels();
  
  useEffect(() => {
    // Parse URL query parameters
    const searchParams = new URLSearchParams(location.search);
    const search = searchParams.get('search');
    const university = searchParams.get('university');
    
    // Reset filters first
    resetFilters();
    
    // Apply search if available
    if (search) {
      searchHostels(search);
    }
    
    // Apply university filter if available
    if (university) {
      filterHostels({ university });
    }
    
  }, [location.search, searchHostels, filterHostels, resetFilters]);

  return (
    <Layout>
      <div className="bg-white min-h-screen text-zinc-900">
        <div className="container mx-auto px-4 pt-20 sm:pt-24 md:pt-28 pb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
            <h1 className="text-3xl font-display font-extrabold text-zinc-900">
              Browse <span className="text-[#f06023]">Rental Marketplace</span>
            </h1>
          </div>
          
          <HostelFilters />
          <HostelGrid />
        </div>
      </div>
    </Layout>
  );
};

export default HostelsPage;