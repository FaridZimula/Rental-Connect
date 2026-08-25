import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Building2, Search, Filter } from 'lucide-react';
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

interface Meta { total: number; page: number; limit: number; pages: number }

export default function PropertiesPage() {
  const [properties, setProperties] = useState<PropertySummary[]>([]);
  const [meta, setMeta] = useState<Meta>({ total: 0, page: 1, limit: 20, pages: 1 });
  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTERS);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchProperties = useCallback(
    async (f: FilterState, p: number) => {
      setLoading(true);
      try {
        const params: Record<string, any> = { page: p, limit: 18 };
        if (f.search) params.search = f.search;
        if (f.listing_type) params.listing_type = f.listing_type;
        if (f.property_type) params.property_type = f.property_type;
        if (f.price_max) params.price_max = f.price_max;
        if (f.bedrooms) params.bedrooms = f.bedrooms;
        if (f.zone) params.zone = f.zone;

        const result = await propertiesApi.list(params);
        if (result.data && result.data.length > 0) {
          setProperties(result.data);
          setMeta(result.meta ?? { total: result.data.length, page: 1, limit: 20, pages: 1 });
        } else {
          // Fallback to mock data if backend returned empty
          setProperties(mockProperties);
          setMeta({ total: mockProperties.length, page: 1, limit: 20, pages: 1 });
        }
      } catch {
        // Fallback to mock data on error (e.g. backend offline)
        setProperties(mockProperties);
        setMeta({ total: mockProperties.length, page: 1, limit: 20, pages: 1 });
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1);
      fetchProperties(filters, 1);
    }, 350);
    return () => clearTimeout(t);
  }, [filters, fetchProperties]);

  useEffect(() => {
    if (page > 1) fetchProperties(filters, page);
  }, [page, filters, fetchProperties]);

  return (
    <Layout>
      <div className="bg-white min-h-screen text-zinc-900 pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-display font-extrabold text-zinc-900 mb-1">
              Browse <span className="text-[#f06023]">Verified Rental Properties</span>
            </h1>
            <p className="text-zinc-500 text-sm">
              {meta.total > 0 ? `${meta.total} properties listed & verified` : 'Showing available rental listings'}
            </p>
          </div>

          <PropertyFilters
            filters={filters}
            onChange={(f) => setFilters(f)}
            onReset={() => setFilters(EMPTY_FILTERS)}
          />

          {/* Main grid */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#f06023]" />
            </div>
          ) : properties.length === 0 ? (
            <div className="text-center py-16 bg-zinc-50 rounded-2xl border border-zinc-200">
              <Building2 className="h-16 w-16 mx-auto text-zinc-300 mb-4" />
              <h3 className="text-xl font-semibold text-zinc-700 mb-2">No properties found</h3>
              <p className="text-zinc-500 text-sm">Try adjusting your search criteria or resetting filters.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 justify-items-center">
                {properties.map((p, i) => (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
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
