import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building2 } from 'lucide-react';
import Layout from '../components/layout/Layout';
import PropertyCard, { PropertySummary } from '../components/features/properties/PropertyCard';
import PropertyFilters, { FilterState } from '../components/features/properties/PropertyFilters';
import { propertiesApi } from '../lib/api';
import { mockProperties } from '../data/mockData';

const EMPTY_FILTERS: FilterState = {
  search: '',
  listing_type: '',
  property_type: '',
  price_max: '',
  bedrooms: '',
  zone: '',
};

interface Meta {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

/**
 * Filter items strictly by category cluster and active search/filter criteria.
 */
function filterMockProperties(items: PropertySummary[], f: FilterState): PropertySummary[] {
  return items.filter((item) => {
    // 1. Property Type / Category Cluster matching
    if (f.property_type) {
      const target = f.property_type.toLowerCase();
      const itemType = (item.property_type || '').toLowerCase();

      if (target === 'apartment' || target === 'housing' || target === 'house' || target === 'studio' || target === 'hostel' || target === 'commercial') {
        if (!['apartment', 'house', 'studio', 'hostel', 'commercial'].includes(itemType)) return false;
      } else if (target === 'vehicle' || target === 'transport') {
        if (itemType !== 'vehicle') return false;
      } else if (target === 'machinery' || target === 'construction') {
        if (itemType !== 'machinery') return false;
      } else if (target === 'event_equipment' || target === 'events' || target === 'event_venue') {
        if (!['event_equipment', 'event_venue'].includes(itemType)) return false;
      } else if (target === 'agro_machinery' || target === 'agriculture' || target === 'land') {
        if (!['agro_machinery', 'land'].includes(itemType)) return false;
      } else if (target === 'medical_equipment' || target === 'medical') {
        if (itemType !== 'medical_equipment') return false;
      } else if (target === 'solar_power' || target === 'solar') {
        if (itemType !== 'solar_power') return false;
      } else if (target === 'fashion_attire' || target === 'fashion') {
        if (itemType !== 'fashion_attire') return false;
      } else if (target === 'it_hardware' || target === 'it') {
        if (itemType !== 'it_hardware') return false;
      } else if (target === 'watercraft' || target === 'marine') {
        if (itemType !== 'watercraft') return false;
      } else if (target === 'camping_sports' || target === 'camping') {
        if (itemType !== 'camping_sports') return false;
      } else {
        if (itemType !== target) return false;
      }
    }

    // 2. Search term
    if (f.search) {
      const s = f.search.toLowerCase();
      const matchTitle = item.title?.toLowerCase().includes(s);
      const matchDesc = item.description?.toLowerCase().includes(s);
      const matchZone = item.display_zone?.toLowerCase().includes(s);
      const matchType = item.property_type?.toLowerCase().includes(s);
      if (!matchTitle && !matchDesc && !matchZone && !matchType) return false;
    }

    // 3. Listing type
    if (f.listing_type && item.listing_type !== f.listing_type) {
      return false;
    }

    // 4. Max price
    if (f.price_max && item.price > Number(f.price_max)) {
      return false;
    }

    // 5. Bedrooms
    if (f.bedrooms && (item.bedrooms || 0) < Number(f.bedrooms)) {
      return false;
    }

    // 6. Zone
    if (f.zone && !item.display_zone?.toLowerCase().includes(f.zone.toLowerCase())) {
      return false;
    }

    return true;
  });
}

export default function PropertiesPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Initialize filters from URL search params (e.g. ?property_type=vehicle)
  const initialFilters: FilterState = {
    search: searchParams.get('search') || '',
    listing_type: searchParams.get('listing_type') || '',
    property_type: searchParams.get('property_type') || '',
    price_max: searchParams.get('price_max') || '',
    bedrooms: searchParams.get('bedrooms') || '',
    zone: searchParams.get('zone') || '',
  };

  const [properties, setProperties] = useState<PropertySummary[]>([]);
  const [meta, setMeta] = useState<Meta>({ total: 0, page: 1, limit: 20, pages: 1 });
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  // Sync state if URL search parameters change
  useEffect(() => {
    const pType = searchParams.get('property_type') || '';
    const qSearch = searchParams.get('search') || '';
    const qZone = searchParams.get('zone') || '';
    const qListing = searchParams.get('listing_type') || '';

    setFilters((prev) => ({
      ...prev,
      property_type: pType,
      search: qSearch,
      zone: qZone,
      listing_type: qListing,
    }));
  }, [searchParams]);

  const fetchProperties = useCallback(async (f: FilterState, p: number) => {
    setLoading(true);
    try {
      const params: Record<string, any> = { page: p, limit: 18 };
      if (f.search) params.search = f.search;
      if (f.listing_type) params.listing_type = f.listing_type;
      if (f.property_type) params.property_type = f.property_type;
      if (f.price_max) params.price_max = f.price_max;
      if (f.bedrooms) params.bedrooms = f.bedrooms;
      if (f.zone) params.zone = f.zone;

      let apiData: PropertySummary[] = [];
      try {
        const result = await propertiesApi.list(params);
        if (result.data) apiData = result.data;
      } catch {
        apiData = [];
      }

      const customPropsStr = localStorage.getItem('rc_custom_properties');
      const customProps: any[] = customPropsStr ? JSON.parse(customPropsStr) : [];
      const publishedCustomProps = customProps.filter((p) => p.status === 'published');

      // Combine API items, published custom items, and mock items, deduplicating by ID
      const combined = [...publishedCustomProps, ...apiData, ...mockProperties]
        .filter((item, index, self) => index === self.findIndex((t) => t.id === item.id))
        .filter((item) => !item.status || item.status === 'published');

      // ALWAYS strictly filter the items by category and filters
      const filtered = filterMockProperties(combined, f);

      setProperties(filtered);
      setMeta({
        total: filtered.length,
        page: p,
        limit: 18,
        pages: Math.ceil(filtered.length / 18) || 1,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const handleSync = () => fetchProperties(filters, page);
    window.addEventListener('rc_properties_updated', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('rc_properties_updated', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, [filters, page, fetchProperties]);

  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1);
      fetchProperties(filters, 1);
    }, 300);
    return () => clearTimeout(t);
  }, [filters, fetchProperties]);

  useEffect(() => {
    if (page > 1) fetchProperties(filters, page);
  }, [page, filters, fetchProperties]);

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    // Update URL search parameters
    const params = new URLSearchParams();
    if (newFilters.property_type) params.set('property_type', newFilters.property_type);
    if (newFilters.search) params.set('search', newFilters.search);
    if (newFilters.zone) params.set('zone', newFilters.zone);
    if (newFilters.listing_type) params.set('listing_type', newFilters.listing_type);
    setSearchParams(params, { replace: true });
  };

  const handleResetFilters = () => {
    setFilters(EMPTY_FILTERS);
    setSearchParams({}, { replace: true });
  };

  const getCategoryLabel = (type: string) => {
    const map: Record<string, string> = {
      apartment: 'Housing & Real Estate',
      house: 'Residential Houses',
      studio: 'Studio Units',
      hostel: 'Hostel Rooms',
      commercial: 'Commercial & Warehouses',
      land: 'Land & Plots',
      vehicle: 'Vehicles & Transport',
      machinery: 'Heavy Machinery & Construction Tools',
      event_equipment: 'Event & Media Equipment',
      event_venue: 'Event Venues & Gardens',
      agro_machinery: 'Agro Machinery & Land Assets',
      medical_equipment: 'Medical & Healthcare Tech',
      solar_power: 'Renewable Solar Power',
      fashion_attire: 'Formal Wear & Cultural Attire',
      it_hardware: 'IT & Computing Tech',
      watercraft: 'Marine & Speedboats',
      camping_sports: 'Camping & Sports Gear',
    };
    return map[type] || type.replace('_', ' ');
  };

  return (
    <Layout>
      <div className="bg-white min-h-screen text-zinc-900 pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-display font-extrabold text-zinc-900 mb-1">
              Browse <span className="text-[#f06023]">Verified Rental Assets</span>
            </h1>
            <p className="text-zinc-500 text-sm">
              {filters.property_type ? (
                <span className="font-semibold text-[#f06023]">
                  Category: {getCategoryLabel(filters.property_type)} ({meta.total} listings found)
                </span>
              ) : (
                `${meta.total} verified assets listed across Uganda`
              )}
            </p>
          </div>

          <PropertyFilters
            filters={filters}
            onChange={handleFilterChange}
            onReset={handleResetFilters}
          />

          {/* Main grid */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#f06023]" />
            </div>
          ) : properties.length === 0 ? (
            <div className="text-center py-16 bg-zinc-50 rounded-2xl border border-zinc-200">
              <Building2 className="h-16 w-16 mx-auto text-zinc-300 mb-4" />
              <h3 className="text-xl font-semibold text-zinc-700 mb-2">No assets found in this category</h3>
              <p className="text-zinc-500 text-sm mb-4">Try resetting your filters or browsing all physical asset clusters.</p>
              <button
                onClick={handleResetFilters}
                className="bg-[#f06023] hover:bg-[#d94b12] text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-sm"
              >
                Show All Categories
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 justify-items-center">
                {properties.map((p, i) => (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <PropertyCard property={p} />
                  </motion.div>
                ))}
              </div>

              {/* Pagination */}
              {meta.pages > 1 && (
                <div className="flex justify-center gap-2 mt-10">
                  {Array.from({ length: meta.pages }, (_, i) => i + 1).map((n) => (
                    <button
                      key={n}
                      onClick={() => setPage(n)}
                      className={`w-9 h-9 rounded-full text-sm font-semibold transition-colors ${
                        n === page
                          ? 'bg-[#f06023] text-white'
                          : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
