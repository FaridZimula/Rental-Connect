import { useState } from 'react';
import { Search, Filter, X, ChevronDown } from 'lucide-react';

export interface FilterState {
  search: string;
  listing_type: string;
  property_type: string;
  price_max: string;
  bedrooms: string;
  zone: string;
}

interface Props {
  filters: FilterState;
  onChange: (f: FilterState) => void;
  onReset: () => void;
}

const PROPERTY_TYPES = [
  { value: '', label: 'All Physical Asset Clusters' },
  { value: 'apartment', label: 'Apartments & Flats' },
  { value: 'house', label: 'Residential Houses' },
  { value: 'studio', label: 'Studio Units' },
  { value: 'hostel', label: 'Hostel Rooms' },
  { value: 'commercial', label: 'Commercial & Warehouses' },
  { value: 'land', label: 'Land & Plots' },
  { value: 'vehicle', label: 'Vehicles & Transport' },
  { value: 'machinery', label: 'Heavy Machinery & Tools' },
  { value: 'event_equipment', label: 'Event & Media Equipment' },
  { value: 'event_venue', label: 'Event Venues & Gardens' },
  { value: 'agro_machinery', label: 'Farm Machinery & Agro Assets' },
  { value: 'medical_equipment', label: 'Medical & Healthcare Equipment' },
  { value: 'fashion_attire', label: 'Formal Wear & Cultural Attire' },
  { value: 'it_hardware', label: 'IT, Laptops & Office Tech' },
  { value: 'camping_sports', label: 'Camping, Sports & Fitness Gear' },
];

const formatPrice = (v: number) =>
  new Intl.NumberFormat('en-UG', { style: 'currency', currency: 'UGX', minimumFractionDigits: 0 }).format(v);

export default function PropertyFilters({ filters, onChange, onReset }: Props) {
  const [open, setOpen] = useState(false);

  const set = (key: keyof FilterState, value: string) =>
    onChange({ ...filters, [key]: value });

  const activeCount = [
    filters.listing_type,
    filters.property_type,
    filters.price_max,
    filters.bedrooms,
    filters.zone,
  ].filter(Boolean).length;

  return (
    <div className="mb-8">
      {/* Search bar row */}
      <div className="flex gap-2 mb-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search assets (e.g. Prado V8, CAT Excavator, Oxygen Concentrator)..."
            value={filters.search}
            onChange={(e) => set('search', e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-zinc-200 rounded-xl text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-[#f06023] text-sm shadow-sm font-medium"
          />
        </div>

        <button
          onClick={() => setOpen(!open)}
          className="relative flex items-center gap-2 px-4 py-2.5 bg-white border border-zinc-200 rounded-xl text-zinc-700 hover:border-[#f06023] text-sm font-medium shadow-sm transition-colors"
        >
          <Filter className="h-4 w-4 text-[#f06023]" />
          Asset Clusters
          <ChevronDown className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} />
          {activeCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-[#f06023] text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
              {activeCount}
            </span>
          )}
        </button>

        {activeCount > 0 && (
          <button
            onClick={onReset}
            className="flex items-center gap-1 px-3 py-2.5 text-sm text-[#f06023] hover:text-[#d94b12] font-medium"
          >
            <X className="h-4 w-4" /> Reset
          </button>
        )}
      </div>

      {/* Expanded filters */}
      {open && (
        <div className="bg-white border border-zinc-200 rounded-2xl shadow-xl p-5 mb-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {/* Listing Type */}
            <div>
              <label className="block text-xs font-semibold text-zinc-600 mb-1.5 uppercase tracking-wide">
                Listing Mode
              </label>
              <select
                value={filters.listing_type}
                onChange={(e) => set('listing_type', e.target.value)}
                className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-900 text-sm focus:outline-none focus:border-[#f06023] font-medium"
              >
                <option value="">Rent & Lease & Sale</option>
                <option value="rent">For Rent</option>
                <option value="lease">For Lease</option>
                <option value="sale">For Sale</option>
              </select>
            </div>

            {/* Asset Cluster Type */}
            <div>
              <label className="block text-xs font-semibold text-zinc-600 mb-1.5 uppercase tracking-wide">
                Asset Cluster Type
              </label>
              <select
                value={filters.property_type}
                onChange={(e) => set('property_type', e.target.value)}
                className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-900 text-sm focus:outline-none focus:border-[#f06023] font-medium"
              >
                {PROPERTY_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            {/* Zone / Area */}
            <div>
              <label className="block text-xs font-semibold text-zinc-600 mb-1.5 uppercase tracking-wide">
                Location / Zone
              </label>
              <input
                type="text"
                placeholder="e.g. Kampala, Jinja, Entebbe…"
                value={filters.zone}
                onChange={(e) => set('zone', e.target.value)}
                className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-900 text-sm focus:outline-none focus:border-[#f06023] font-medium"
              />
            </div>

            {/* Max price */}
            <div>
              <label className="block text-xs font-semibold text-zinc-600 mb-1.5 uppercase tracking-wide">
                Max Price {filters.price_max && `— ${formatPrice(Number(filters.price_max))}`}
              </label>
              <input
                type="range"
                min={30000}
                max={10000000}
                step={50000}
                value={filters.price_max || 10000000}
                onChange={(e) => set('price_max', e.target.value)}
                className="w-full h-2 accent-[#f06023] cursor-pointer mt-2"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
