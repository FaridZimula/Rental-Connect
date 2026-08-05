import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Building2, Zap } from 'lucide-react';
import Layout from '../components/layout/Layout';
import PropertyCard, { PropertySummary } from '../components/features/properties/PropertyCard';
import PropertyFilters, { FilterState } from '../components/features/properties/PropertyFilters';
import { propertiesApi } from '../lib/api';

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
  const [featured, setFeatured] = useState<PropertySummary[]>([]);
  const [meta, setMeta] = useState<Meta>({ total: 0, page: 1, limit: 20, pages: 1 });
  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTERS);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchProperties = useCallback(
    async (f: FilterState, p: number) => {
      setLoading(true);
      setError('');
      try {
        const params: Record<string, any> = { page: p, limit: 18 };
        if (f.search) params.search = f.search;
        if (f.listing_type) params.listing_type = f.listing_type;
        if (f.property_type) params.property_type = f.property_type;
        if (f.price_max) params.price_max = f.price_max;
        if (f.bedrooms) params.bedrooms = f.bedrooms;
        if (f.zone) params.zone = f.zone;

        const result = await propertiesApi.list(params);
        const all: PropertySummary[] = result.data ?? [];
        setProperties(all);
        setMeta(result.meta ?? { total: 0, page: 1, limit: 20, pages: 1 });

        // Pull featured separately on first page with no filters
        if (p === 1 && !Object.values(f).some(Boolean)) {
          setFeatured(all.filter((x) => x.is_featured).slice(0, 4));
        } else {
          setFeatured([]);
        }
      } catch {
        setError('Could not load properties. Make sure the backend is running.');
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // Debounce filter changes
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

  const nonFeatured = properties.filter((p) => !featured.some((f) => f.id === p.id) || featured.length === 0);

  return (
    <Layout>
      <div className="bg-white min-h-screen text-zinc-900">
        <div className="container mx-auto px-4 pt-24 pb-12">
          <div className="mb-8">
            <h1 className="text-3xl font-display font-extrabold text-zinc-900 mb-1">
              Browse <span className="text-[#f06023]">Rental Marketplace</span>
            </h1>
            <p className="text-zinc-500 text-sm">
              {meta.total > 0 ? `${meta.total} properties listed` : 'Showing all available listings'}
            </p>
          </div>

          <PropertyFilters
            filters={filters}
            onChange={(f) => setFilters(f)}
            onReset={() => setFilters(EMPTY_FILTERS)}
          />

          {/* Featured strip */}
          {featured.length > 0 && (
            <div className="mb-10">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="h-5 w-5 text-amber-500 fill-amber-500" />
                <h2 className="text-lg font-bold text-zinc-900">Featured Listings</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {featured.map((p, i) => (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.07 }}
                  >
                    <PropertyCard property={p} />
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Main grid */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#f06023]" />
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <Building2 className="h-14 w-14 mx-auto text-zinc-300 mb-4" />
              <p className="text-zinc-500">{error}</p>
            </div>
          ) : properties.length === 0 ? (
            <div className="text-center py-16 bg-zinc-50 rounded-2xl border border-zinc-200">
              <Building2 className="h-16 w-16 mx-auto text-zinc-300 mb-4" />
              <h3 className="text-xl font-semibold text-zinc-700 mb-2">No properties found</h3>
              <p className="text-zinc-500 text-sm">Try adjusting your search or filters.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {(featured.length > 0 ? nonFeatured : properties).map((p, i) => (
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
