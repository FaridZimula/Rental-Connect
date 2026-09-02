import { useState } from 'react';
import { X, Upload, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../../ui/Button';
import { Property } from '../../../types';

interface RentalItemUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess?: (newItem: Partial<Property>) => void;
}

export default function RentalItemUploadModal({
  isOpen,
  onClose,
  onUploadSuccess
}: RentalItemUploadModalProps) {
  const [category, setCategory] = useState<'hostels' | 'rentals' | 'vehicles' | 'land' | 'equipment'>('rentals');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [locationName, setLocationName] = useState('Kampala');
  const [price, setPrice] = useState('');
  const [pricePeriod, setPricePeriod] = useState('/month');
  const [imageUrl, setImageUrl] = useState('');
  const [contactPhone, setContactPhone] = useState('+256 781 234 567');
  const [amenitiesInput, setAmenitiesInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !price) return;

    setIsSubmitting(true);
    
    // Process amenities array
    const amenities = amenitiesInput
      ? amenitiesInput.split(',').map((a) => a.trim()).filter(Boolean)
      : ['Verified Owner', 'Security', 'Fast Booking'];

    const newItem: any = {
      id: `rental-${Date.now()}`,
      name: title,
      description: description || `Quality ${category} listing available for rent in ${locationName}. Verified owner/broker item.`,
      category: category,
      university: locationName,
      pricePeriod: pricePeriod,
      imageUrls: [
        imageUrl ||
          (category === 'vehicles'
            ? 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=800'
            : category === 'land'
            ? 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=800'
            : category === 'equipment'
            ? 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=800'
            : 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=800')
      ],
      amenities,
      location: {
        address: `${locationName}, Uganda`,
        distance: 1.2,
      },
      rating: 4.9,
      reviewsCount: 12,
      rooms: [
        {
          id: `room-${Date.now()}`,
          name: 'Standard Rental Unit',
          type: category === 'vehicles' ? 'SUV / Sedan' : category === 'land' ? 'Plot Unit' : 'Single Room',
          price: parseInt(price) || 450000,
          capacity: 2,
          available: 1,
          amenities: amenities
        }
      ]
    };

    setTimeout(() => {
      setIsSubmitting(false);
      setShowSuccess(true);

      if (onUploadSuccess) {
        onUploadSuccess(newItem);
      }

      setTimeout(() => {
        setShowSuccess(false);
        onClose();
      }, 1500);
    }, 800);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white border border-zinc-200 text-zinc-900 rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Modal Header */}
          <div className="p-5 border-b border-zinc-200 flex items-center justify-between bg-zinc-50">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-xl bg-[#f06023]/10 border border-[#f06023]/30 flex items-center justify-center text-[#f06023]">
                <Upload className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-xl font-display font-extrabold text-zinc-900">
                  Upload Rental Listing
                </h3>
                <p className="text-xs text-zinc-500 font-medium">
                  Brokers & Owners: Post hostels, property, vehicles, land or equipment
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-zinc-400 hover:text-zinc-700 p-2 rounded-lg hover:bg-zinc-200 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Form Content */}
          <div className="p-6 overflow-y-auto flex-grow">
            {showSuccess ? (
              <div className="text-center py-12">
                <CheckCircle className="h-16 w-16 text-[#f06023] mx-auto mb-4 animate-bounce" />
                <h4 className="text-2xl font-bold text-zinc-900 mb-2">Item Listed Successfully!</h4>
                <p className="text-zinc-600 text-sm">
                  Your property/item is now live and visible to thousands of potential renters across Uganda.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Category Selection */}
                <div>
                  <label className="block text-zinc-700 text-xs font-bold uppercase tracking-wider mb-2">
                    Select Rental Category
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {[
                      { id: 'rentals', label: 'Apartments' },
                      { id: 'hostels', label: 'Hostels' },
                      { id: 'vehicles', label: 'Vehicles' },
                      { id: 'land', label: 'Land/Plots' },
                      { id: 'equipment', label: 'Equipment' }
                    ].map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setCategory(cat.id as any)}
                        className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                          category === cat.id
                            ? 'bg-[#f06023] text-white border-[#f06023] shadow-md'
                            : 'bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-100'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-zinc-700 text-sm font-semibold mb-1">
                    Listing Title
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full p-3 bg-zinc-50 border border-zinc-200 text-zinc-900 rounded-xl text-sm focus:outline-none focus:border-[#f06023] focus:bg-white"
                    placeholder="e.g. Executive 2-Bedroom Furnished Apartment"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                {/* Price and Period */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-zinc-700 text-sm font-semibold mb-1">
                      Rental Rate (UGX)
                    </label>
                    <input
                      type="number"
                      required
                      className="w-full p-3 bg-zinc-50 border border-zinc-200 text-zinc-900 rounded-xl text-sm focus:outline-none focus:border-[#f06023] focus:bg-white"
                      placeholder="e.g. 850000"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-700 text-sm font-semibold mb-1">
                      Rate Period
                    </label>
                    <select
                      className="w-full p-3 bg-zinc-50 border border-zinc-200 text-zinc-900 rounded-xl text-sm focus:outline-none focus:border-[#f06023] focus:bg-white"
                      value={pricePeriod}
                      onChange={(e) => setPricePeriod(e.target.value)}
                    >
                      <option value="/month">/ Month</option>
                      <option value="/day">/ Day (Vehicles & Equipment)</option>
                      <option value="/semester">/ Semester (Hostels)</option>
                      <option value="/year">/ Year (Land Plots)</option>
                    </select>
                  </div>
                </div>

                {/* Location */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-zinc-700 text-sm font-semibold mb-1">
                      Location / District
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full p-3 bg-zinc-50 border border-zinc-200 text-zinc-900 rounded-xl text-sm focus:outline-none focus:border-[#f06023] focus:bg-white"
                      placeholder="e.g. Nakasero, Kampala"
                      value={locationName}
                      onChange={(e) => setLocationName(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-700 text-sm font-semibold mb-1">
                      Broker / Owner Contact Phone
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full p-3 bg-zinc-50 border border-zinc-200 text-zinc-900 rounded-xl text-sm focus:outline-none focus:border-[#f06023] focus:bg-white"
                      placeholder="+256 781 234 567"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                    />
                  </div>
                </div>

                {/* Image URL */}
                <div>
                  <label className="block text-zinc-700 text-sm font-semibold mb-1">
                    Image URL (Optional)
                  </label>
                  <input
                    type="url"
                    className="w-full p-3 bg-zinc-50 border border-zinc-200 text-zinc-900 rounded-xl text-sm focus:outline-none focus:border-[#f06023] focus:bg-white"
                    placeholder="https://images.unsplash.com/..."
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-zinc-700 text-sm font-semibold mb-1">
                    Description & Specifications
                  </label>
                  <textarea
                    rows={3}
                    className="w-full p-3 bg-zinc-50 border border-zinc-200 text-zinc-900 rounded-xl text-sm focus:outline-none focus:border-[#f06023] focus:bg-white"
                    placeholder="Provide details about security, condition, features, accessibility..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                {/* Amenities / Key Features */}
                <div>
                  <label className="block text-zinc-700 text-sm font-semibold mb-1">
                    Key Features / Amenities (Comma Separated)
                  </label>
                  <input
                    type="text"
                    className="w-full p-3 bg-zinc-50 border border-zinc-200 text-zinc-900 rounded-xl text-sm focus:outline-none focus:border-[#f06023] focus:bg-white"
                    placeholder="e.g. WiFi, Backup Generator, Parking, 24/7 Guard"
                    value={amenitiesInput}
                    onChange={(e) => setAmenitiesInput(e.target.value)}
                  />
                </div>

                {/* Action Buttons */}
                <div className="pt-3 border-t border-zinc-200 flex space-x-3">
                  <Button variant="outline" fullWidth size="lg" onClick={onClose} type="button">
                    Cancel
                  </Button>
                  <Button variant="primary" fullWidth size="lg" disabled={isSubmitting} type="submit">
                    {isSubmitting ? 'Uploading Listing...' : 'Publish Listing Now'}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
