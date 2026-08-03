import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Star, Phone, Calendar, ArrowLeft, Mail, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import Layout from '../components/layout/Layout';
import Button from '../components/ui/Button';
import { useHostels } from '../contexts/HostelContext';
import { reviews } from '../data/mockData';

const HostelDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getHostelById } = useHostels();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [activeRoomImageIndex, setActiveRoomImageIndex] = useState<Record<string, number>>({});
  
  const hostel = getHostelById(id || '');
  const hostelReviews = reviews.filter(review => review.hostelId === id);
  
  if (!hostel) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h2 className="text-2xl font-bold mb-4">Hostel not found</h2>
          <p className="mb-6">The hostel you're looking for doesn't exist or may have been removed.</p>
          <Button 
            variant="primary" 
            onClick={() => navigate('/hostels')}
            icon={<ArrowLeft className="h-4 w-4" />}
            iconPosition="left"
          >
            Back to Hostels
          </Button>
        </div>
      </Layout>
    );
  }
  
  // Format price in UGX
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };
  
  const handleRoomSelect = (roomId: string) => {
    setSelectedRoomId(roomId === selectedRoomId ? null : roomId);
  };

  const handleBookNow = () => {
    if (selectedRoomId) {
      // In a real app, this would navigate to a booking page
      alert('Booking functionality would be implemented here');
    } else {
      alert('Please select a room first');
    }
  };

  const handlePrevRoomImage = (roomId: string, maxImages: number) => {
    setActiveRoomImageIndex(prev => ({
      ...prev,
      [roomId]: ((prev[roomId] || 0) - 1 + maxImages) % maxImages
    }));
  };

  const handleNextRoomImage = (roomId: string, maxImages: number) => {
    setActiveRoomImageIndex(prev => ({
      ...prev,
      [roomId]: ((prev[roomId] || 0) + 1) % maxImages
    }));
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 pt-20 sm:pt-24 md:pt-28 pb-8 text-zinc-100">
        {/* Back Button */}
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center text-orange-500 hover:text-orange-400 mb-6 font-medium transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to results
        </button>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Gallery and Details Section */}
          <div className="lg:col-span-2">
            {/* Main Image */}
            <div className="relative h-64 md:h-96 rounded-xl overflow-hidden mb-2 border border-zinc-800">
              <img 
                src={hostel.imageUrls[activeImageIndex]} 
                alt={hostel.name}
                className="w-full h-full object-cover"
              />
              
              {/* Rating Badge */}
              <div className="absolute top-4 right-4 flex items-center bg-orange-500 text-black px-3 py-1 rounded-full font-bold shadow-md">
                <Star className="h-4 w-4 fill-black text-black mr-1" />
                <span>{hostel.rating}</span>
                <span className="text-xs ml-1 font-normal text-zinc-900">({hostel.reviewCount} reviews)</span>
              </div>
            </div>
            
            {/* Thumbnails */}
            <div className="flex space-x-2 mb-6 overflow-x-auto pb-2">
              {hostel.imageUrls.map((image, index) => (
                <div 
                  key={index}
                  className={`w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden cursor-pointer border-2 transition-colors ${index === activeImageIndex ? 'border-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]' : 'border-zinc-800'}`}
                  onClick={() => setActiveImageIndex(index)}
                >
                  <img 
                    src={image} 
                    alt={`${hostel.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
            
            {/* Hostel Details */}
            <div className="mb-8">
              <h1 className="text-3xl font-display font-bold mb-2 text-white">{hostel.name}</h1>
              
              <div className="flex items-center text-sm text-zinc-400 mb-4">
                <MapPin className="h-4 w-4 mr-1 text-orange-500" />
                <span>{hostel.location.address} • {hostel.location.distance} km from {hostel.university}</span>
              </div>
              
              <p className="text-zinc-300 mb-6">{hostel.description}</p>
              
              {/* Amenities */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3 text-orange-500">Amenities</h3>
                <div className="flex flex-wrap gap-2">
                  {hostel.amenities.map((amenity, index) => (
                    <span 
                      key={index} 
                      className="bg-zinc-900 border border-zinc-800 text-zinc-300 px-3 py-1 rounded-full text-sm"
                    >
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>
              
              {/* Rooms */}
              <div>
                <h3 className="text-lg font-semibold mb-3 text-orange-500">Available Rooms</h3>
                <div className="space-y-6">
                  {hostel.rooms.map((room) => (
                    <motion.div 
                      key={room.id}
                      className={`bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-xl transition-all ${
                        selectedRoomId === room.id ? 'ring-2 ring-orange-500 border-orange-500/50' : ''
                      }`}
                      whileHover={{ scale: 1.01 }}
                    >
                      {/* Room Image Carousel */}
                      <div className="relative h-64 md:h-80">
                        <img 
                          src={room.imageUrls[activeRoomImageIndex[room.id] || 0]} 
                          alt={room.type}
                          className="w-full h-full object-cover"
                        />
                        
                        {/* Image Navigation Buttons */}
                        {room.imageUrls.length > 1 && (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePrevRoomImage(room.id, room.imageUrls.length);
                              }}
                              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/70 text-white p-2 rounded-full hover:bg-orange-500 hover:text-black transition-colors"
                            >
                              <ChevronLeft className="h-5 w-5" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleNextRoomImage(room.id, room.imageUrls.length);
                              }}
                              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/70 text-white p-2 rounded-full hover:bg-orange-500 hover:text-black transition-colors"
                            >
                              <ChevronRight className="h-5 w-5" />
                            </button>
                          </>
                        )}
                        
                        {/* Image Counter */}
                        <div className="absolute bottom-2 right-2 bg-black/80 text-white px-2 py-1 rounded-full text-sm">
                          {(activeRoomImageIndex[room.id] || 0) + 1} / {room.imageUrls.length}
                        </div>
                      </div>
                      
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h4 className="text-xl font-semibold text-white">{room.type} Room</h4>
                            <p className="text-zinc-400">
                              Capacity: {room.capacity} {room.capacity === 1 ? 'person' : 'people'}
                            </p>
                          </div>
                          <div className="text-2xl font-extrabold text-orange-500">
                            {formatPrice(room.price)}
                            <span className="text-xs text-zinc-400 font-normal">/semester</span>
                          </div>
                        </div>
                        
                        <div className="mb-4">
                          <h5 className="font-medium mb-2 text-zinc-300">Room Features</h5>
                          <div className="flex flex-wrap gap-2">
                            {room.amenities.map((amenity, index) => (
                              <span 
                                key={index} 
                                className="bg-zinc-950 border border-zinc-800 text-zinc-300 px-3 py-1 rounded-full text-sm"
                              >
                                {amenity}
                              </span>
                            ))}
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            {room.available ? (
                              <span className="text-emerald-400 font-medium flex items-center">
                                <span className="w-2 h-2 bg-emerald-400 rounded-full mr-2 animate-pulse"></span>
                                Available
                              </span>
                            ) : (
                              <span className="text-red-400 font-medium flex items-center">
                                <span className="w-2 h-2 bg-red-400 rounded-full mr-2"></span>
                                Currently Full
                              </span>
                            )}
                          </div>
                          
                          <Button
                            variant={selectedRoomId === room.id ? "primary" : "outline"}
                            size="lg"
                            disabled={!room.available}
                            onClick={() => room.available && handleRoomSelect(room.id)}
                          >
                            {selectedRoomId === room.id ? "Selected" : "Select Room"}
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Reviews Section */}
            <div>
              <h3 className="text-xl font-semibold mb-4 text-orange-500">
                Reviews ({hostelReviews.length})
              </h3>
              
              {hostelReviews.length > 0 ? (
                <div className="space-y-4">
                  {hostelReviews.map((review) => (
                    <div key={review.id} className="border border-zinc-800 bg-zinc-900/80 rounded-xl p-4">
                      <div className="flex justify-between mb-2">
                        <div className="font-medium text-white">{review.userName}</div>
                        <div className="text-zinc-500 text-sm">{review.date}</div>
                      </div>
                      <div className="flex items-center mb-3">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < review.rating ? 'fill-orange-500 text-orange-500' : 'text-zinc-700'
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-zinc-300">{review.comment}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-zinc-500">No reviews yet.</p>
              )}
            </div>
          </div>
          
          {/* Booking Section */}
          <div className="lg:col-span-1">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl p-6 sticky top-24">
              <h3 className="text-xl font-semibold mb-4 text-white">Book Your Stay</h3>
              
              {selectedRoomId ? (
                <div className="mb-6 p-4 bg-zinc-950 border border-orange-500/30 rounded-lg">
                  <h4 className="font-medium mb-2 text-zinc-300">Selected Room</h4>
                  {hostel.rooms.find(room => room.id === selectedRoomId) && (
                    <>
                      <p className="font-bold text-white">
                        {hostel.rooms.find(room => room.id === selectedRoomId)?.type} Room
                      </p>
                      <p className="text-orange-500 font-extrabold mt-1">
                        {formatPrice(hostel.rooms.find(room => room.id === selectedRoomId)?.price || 0)}
                        <span className="text-xs text-zinc-400 font-normal">/semester</span>
                      </p>
                    </>
                  )}
                </div>
              ) : (
                <div className="mb-6 p-4 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-500 text-center text-sm">
                  Please select a room from the options above
                </div>
              )}
              
              <Button
                variant="primary"
                fullWidth
                size="lg"
                icon={<Calendar className="h-5 w-5" />}
                iconPosition="left"
                disabled={!selectedRoomId}
                onClick={handleBookNow}
                className="mb-4"
              >
                Book Now
              </Button>
              
              <div className="text-center text-sm text-zinc-500 mb-6">
                No payment required to book
              </div>
              
              <div className="border-t border-zinc-800 pt-4">
                <h4 className="font-medium mb-3 text-zinc-300">Contact Hostel</h4>
                <Button
                  variant="outline"
                  fullWidth
                  icon={<Phone className="h-5 w-5" />}
                  iconPosition="left"
                  className="mb-2"
                >
                  Call Hostel
                </Button>
                <Button
                  variant="outline"
                  fullWidth
                  icon={<Mail className="h-5 w-5" />}
                  iconPosition="left"
                >
                  Email Hostel
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default HostelDetailPage;