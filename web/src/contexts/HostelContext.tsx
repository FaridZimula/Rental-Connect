import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Hostel, FilterOptions } from '../types';
import { hostels as mockHostels } from '../data/mockData';

interface HostelContextType {
  hostels: Hostel[];
  filteredHostels: Hostel[];
  loading: boolean;
  error: string | null;
  getHostelById: (id: string) => Hostel | undefined;
  searchHostels: (searchTerm: string) => void;
  filterHostels: (options: FilterOptions) => void;
  resetFilters: () => void;
  addRentalItem: (item: Partial<Hostel>) => void;
}

const HostelContext = createContext<HostelContextType | undefined>(undefined);

export function HostelProvider({ children }: { children: ReactNode }) {
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [filteredHostels, setFilteredHostels] = useState<Hostel[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({});

  // Load mock data on mount
  useEffect(() => {
    try {
      setHostels(mockHostels);
      setFilteredHostels(mockHostels);
      setLoading(false);
    } catch (err) {
      setError('Failed to load hostels');
      setLoading(false);
    }
  }, []);

  // Add new uploaded rental item
  const addRentalItem = (item: Partial<Hostel>) => {
    const fullItem = item as Hostel;
    setHostels((prev) => [fullItem, ...prev]);
    setFilteredHostels((prev) => [fullItem, ...prev]);
  };

  // Get hostel by ID
  const getHostelById = (id: string) => {
    return hostels.find((hostel) => hostel.id === id);
  };

  // Search hostels by name or university
  const searchHostels = (term: string) => {
    setSearchTerm(term);
    applyFiltersAndSearch(term, filterOptions);
  };

  // Filter hostels by options
  const filterHostels = (options: FilterOptions) => {
    setFilterOptions(options);
    applyFiltersAndSearch(searchTerm, options);
  };

  // Apply both filters and search
  const applyFiltersAndSearch = (term: string, options: FilterOptions) => {
    let result = [...hostels];

    // Apply category filter
    if (options.category && options.category !== 'all') {
      result = result.filter((item) => (item.category || 'hostels') === options.category);
    }

    // Apply search term
    if (term) {
      result = result.filter(
        (hostel) =>
          hostel.name.toLowerCase().includes(term.toLowerCase()) ||
          hostel.description.toLowerCase().includes(term.toLowerCase()) ||
          hostel.university.toLowerCase().includes(term.toLowerCase())
      );
    }

    // Apply university filter
    if (options.university) {
      result = result.filter((hostel) => hostel.university === options.university);
    }

    // Apply price range filter
    if (options.priceRange) {
      result = result.filter((hostel) => {
        const cheapestRoom = Math.min(...hostel.rooms.map((room) => room.price));
        return (
          cheapestRoom >= options.priceRange!.min && cheapestRoom <= options.priceRange!.max
        );
      });
    }

    // Apply room type filter
    if (options.roomTypes && options.roomTypes.length > 0) {
      result = result.filter((hostel) =>
        hostel.rooms.some((room) => options.roomTypes!.includes(room.type))
      );
    }

    // Apply amenities filter
    if (options.amenities && options.amenities.length > 0) {
      result = result.filter((hostel) =>
        options.amenities!.every((amenity) => hostel.amenities.includes(amenity))
      );
    }

    // Apply distance filter
    if (options.distance) {
      result = result.filter((hostel) => hostel.location.distance <= options.distance!);
    }

    setFilteredHostels(result);
  };

  // Reset filters
  const resetFilters = () => {
    setSearchTerm('');
    setFilterOptions({});
    setFilteredHostels(hostels);
  };

  return (
    <HostelContext.Provider
      value={{
        hostels,
        filteredHostels,
        loading,
        error,
        getHostelById,
        searchHostels,
        filterHostels,
        resetFilters,
      }}
    >
      {children}
    </HostelContext.Provider>
  );
}

export const useHostels = () => {
  const context = useContext(HostelContext);
  if (context === undefined) {
    throw new Error('useHostels must be used within a HostelProvider');
  }
  return context;
};