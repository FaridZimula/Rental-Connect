import { useState, useEffect } from 'react';
import { Filter, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { universities } from '../../../data/mockData';
import { useHostels } from '../../../contexts/HostelContext';
import { FilterOptions } from '../../../types';
import Button from '../../ui/Button';

const HostelFilters = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedUniversity, setSelectedUniversity] = useState<string>('');
  const [priceRange, setPriceRange] = useState<[number, number]>([100000, 2000000]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [selectedRoomTypes, setSelectedRoomTypes] = useState<string[]>([]);
  const [maxDistance, setMaxDistance] = useState<number>(5);
  
  const { filterHostels, resetFilters } = useHostels();

  const categoriesList = [
    { id: 'all', label: 'All Categories' },
    { id: 'hostels', label: 'Student Hostels' },
    { id: 'rentals', label: 'Apartments & Flats' },
    { id: 'vehicles', label: 'Cars & Vehicles' },
    { id: 'land', label: 'Land Plots' },
    { id: 'equipment', label: 'Tools & Equipments' },
  ];
  
  const amenitiesList = [
    'WiFi', 'Security', 'Study Room', 'Laundry', 
    'Power Backup', 'Furnished', 'AC', '4WD', 'Parking'
  ];
  
  const roomTypesList = ['Single', 'Double', 'Triple', '2 Bedroom Flat', 'SUV Rental', 'Plot Lease'];

  useEffect(() => {
    applyFilters();
  }, [selectedCategory, selectedUniversity, priceRange, selectedAmenities, selectedRoomTypes, maxDistance]);

  const applyFilters = () => {
    const filterOptions: FilterOptions = {};
    
    if (selectedCategory && selectedCategory !== 'all') {
      filterOptions.category = selectedCategory as any;
    }

    if (selectedUniversity) {
      filterOptions.university = selectedUniversity;
    }
    
    filterOptions.priceRange = {
      min: priceRange[0],
      max: priceRange[1]
    };
    
    if (selectedAmenities.length > 0) {
      filterOptions.amenities = selectedAmenities;
    }
    
    if (selectedRoomTypes.length > 0) {
      filterOptions.roomTypes = selectedRoomTypes;
    }
    
    filterOptions.distance = maxDistance;
    
    filterHostels(filterOptions);
  };

  const handleReset = () => {
    setSelectedCategory('all');
    setSelectedUniversity('');
    setPriceRange([100000, 2000000]);
    setSelectedAmenities([]);
    setSelectedRoomTypes([]);
    setMaxDistance(5);
    resetFilters();
  };

  const toggleAmenity = (amenity: string) => {
    if (selectedAmenities.includes(amenity)) {
      setSelectedAmenities(selectedAmenities.filter(a => a !== amenity));
    } else {
      setSelectedAmenities([...selectedAmenities, amenity]);
    }
  };

  const toggleRoomType = (roomType: string) => {
    if (selectedRoomTypes.includes(roomType)) {
      setSelectedRoomTypes(selectedRoomTypes.filter(r => r !== roomType));
    } else {
      setSelectedRoomTypes([...selectedRoomTypes, roomType]);
    }
  };

  // Format price in UGX
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Count active filters
  const activeFiltersCount = 
    (selectedCategory !== 'all' ? 1 : 0) +
    (selectedUniversity ? 1 : 0) + 
    (selectedAmenities.length > 0 ? 1 : 0) + 
    (selectedRoomTypes.length > 0 ? 1 : 0) +
    (maxDistance !== 5 ? 1 : 0) +
    ((priceRange[0] !== 100000 || priceRange[1] !== 2000000) ? 1 : 0);

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <Button 
          variant="outline"
          size="md"
          icon={<Filter className="h-4 w-4 text-[#f06023]" />}
          onClick={() => setIsOpen(!isOpen)}
          className="relative border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50 hover:border-[#f06023]/60 shadow-sm"
        >
          Filter Listings
          {activeFiltersCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-[#f06023] text-white font-bold w-5 h-5 rounded-full text-xs flex items-center justify-center shadow-md">
              {activeFiltersCount}
            </span>
          )}
        </Button>
        
        {activeFiltersCount > 0 && (
          <button 
            onClick={handleReset}
            className="text-sm text-[#f06023] hover:text-[#d94b12] hover:underline flex items-center font-medium"
          >
            <X className="h-3 w-3 mr-1" /> Clear all filters
          </button>
        )}
      </div>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden bg-white border border-zinc-200 rounded-2xl shadow-xl mb-6 text-zinc-900"
          >
            <div className="p-5">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Category Filter */}
                <div>
                  <h3 className="text-sm font-semibold mb-2 text-zinc-700">Category</h3>
                  <select
                    className="w-full p-2.5 bg-zinc-50 text-zinc-900 border border-zinc-200 rounded-xl focus:outline-none focus:border-[#f06023] focus:bg-white"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    {categoriesList.map((cat) => (
                      <option key={cat.id} value={cat.id} className="bg-white text-zinc-900">
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Location Filter */}
                <div>
                  <h3 className="text-sm font-semibold mb-2 text-zinc-700">Location / Campus</h3>
                  <select
                    className="w-full p-2.5 bg-zinc-50 text-zinc-900 border border-zinc-200 rounded-xl focus:outline-none focus:border-[#f06023] focus:bg-white"
                    value={selectedUniversity}
                    onChange={(e) => setSelectedUniversity(e.target.value)}
                  >
                    <option value="" className="bg-white text-zinc-900">All Locations</option>
                    {universities.map((uni) => (
                      <option key={uni.id} value={uni.name} className="bg-white text-zinc-900">
                        {uni.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* Price Range Filter */}
                <div>
                  <h3 className="text-sm font-semibold mb-2 text-zinc-700">
                    Max Price: {formatPrice(priceRange[1])}
                  </h3>
                  <input
                    type="range"
                    min="100000"
                    max="2000000"
                    step="50000"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                    className="w-full h-2 bg-zinc-200 accent-[#f06023] rounded-lg appearance-none cursor-pointer mt-2"
                  />
                </div>
                
                {/* Distance Filter */}
                <div>
                  <h3 className="text-sm font-semibold mb-2 text-zinc-700">
                    Max Radius: {maxDistance} km
                  </h3>
                  <input
                    type="range"
                    min="0.5"
                    max="10"
                    step="0.5"
                    value={maxDistance}
                    onChange={(e) => setMaxDistance(parseFloat(e.target.value))}
                    className="w-full h-2 bg-zinc-200 accent-[#f06023] rounded-lg appearance-none cursor-pointer mt-2"
                  />
                </div>
              </div>
              
              {/* Property / Item Types */}
              <div className="mt-6">
                <h3 className="text-sm font-semibold mb-2 text-zinc-700">Property / Item Types</h3>
                <div className="flex flex-wrap gap-2">
                  {roomTypesList.map((type) => (
                    <button
                      key={type}
                      onClick={() => toggleRoomType(type)}
                      className={`px-3 py-1 rounded-full text-xs sm:text-sm font-medium transition-all ${
                        selectedRoomTypes.includes(type)
                          ? 'bg-[#f06023] text-white font-bold shadow-sm'
                          : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 border border-zinc-200'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Features & Amenities */}
              <div className="mt-6">
                <h3 className="text-sm font-semibold mb-2 text-zinc-700">Features & Amenities</h3>
                <div className="flex flex-wrap gap-2">
                  {amenitiesList.map((amenity) => (
                    <button
                      key={amenity}
                      onClick={() => toggleAmenity(amenity)}
                      className={`px-3 py-1 rounded-full text-xs sm:text-sm font-medium transition-all ${
                        selectedAmenities.includes(amenity)
                          ? 'bg-[#f06023] text-white font-bold shadow-sm'
                          : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 border border-zinc-200'
                      }`}
                    >
                      {amenity}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HostelFilters;