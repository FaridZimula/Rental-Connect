import React, { useState } from 'react';
import { Plus, Edit, Trash2, Upload, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Room {
  id: string;
  number: string;
  type: 'single' | 'double' | 'triple';
  price: number;
  status: 'available' | 'booked' | 'occupied';
  images: string[];
  amenities: string[];
  description: string;
  hostelId: string;
}

// Add mock hostels for selection
const mockHostels = [
  { id: '1', name: 'Sunrise Hostel' },
  { id: '2', name: 'Green Valley' },
];

const RoomManagement: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isAddingRoom, setIsAddingRoom] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedHostelId, setSelectedHostelId] = useState<string>(mockHostels[0].id);

  const handleAddRoom = () => {
    setIsAddingRoom(true);
  };

  const handleImageUpload = async (files: FileList) => {
    setIsUploading(true);
    // TODO: Implement image upload to cloud storage
    setIsUploading(false);
  };

  const handleSaveRoom = (roomData: Partial<Room>) => {
    if (selectedRoom) {
      // Update existing room
      setRooms(rooms.map(room => 
        room.id === selectedRoom.id ? { ...room, ...roomData } : room
      ));
    } else {
      // Add new room
      const newRoom: Room = {
        id: Date.now().toString(),
        number: roomData.number || '',
        type: roomData.type || 'single',
        price: roomData.price || 0,
        status: 'available',
        images: [],
        amenities: [],
        description: '',
        hostelId: selectedHostelId,
        ...roomData
      };
      setRooms([...rooms, newRoom]);
    }
    setIsAddingRoom(false);
    setSelectedRoom(null);
  };

  // Filter rooms by selected hostel
  const filteredRooms = rooms.filter(room => (room as any).hostelId === selectedHostelId);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">Room Management</h2>
        <select
          value={selectedHostelId}
          onChange={e => setSelectedHostelId(e.target.value)}
          className="ml-4 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
        >
          {mockHostels.map(h => (
            <option key={h.id} value={h.id}>{h.name}</option>
          ))}
        </select>
        <button
          onClick={handleAddRoom}
          className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 ml-4"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Room
        </button>
      </div>

      {/* Room List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRooms.map(room => (
          <motion.div
            key={room.id}
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-white rounded-xl shadow-md overflow-hidden"
          >
            <div className="relative h-48 bg-gray-200">
              {room.images[0] ? (
                <img
                  src={room.images[0]}
                  alt={`Room ${room.number}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  No Image
                </div>
              )}
              <div className="absolute top-2 right-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  room.status === 'available' ? 'bg-green-100 text-green-800' :
                  room.status === 'booked' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {room.status.charAt(0).toUpperCase() + room.status.slice(1)}
                </span>
              </div>
            </div>

            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold text-gray-900">Room {room.number}</h3>
                <span className="text-xs text-gray-500">Hostel: {mockHostels.find(h => h.id === (room as any).hostelId)?.name || 'N/A'}</span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setSelectedRoom(room)}
                    className="p-1 text-gray-600 hover:text-primary-600"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setRooms(rooms.filter(r => r.id !== room.id))}
                    className="p-1 text-gray-600 hover:text-red-600"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  Type: <span className="font-medium text-gray-900">{room.type}</span>
                </p>
                <p className="text-sm text-gray-600">
                  Price: <span className="font-medium text-gray-900">UGX {room.price.toLocaleString()}</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {room.amenities.map((amenity, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                    >
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Add/Edit Room Modal */}
      <AnimatePresence>
        {(isAddingRoom || selectedRoom) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6"
            >
              <h3 className="text-xl font-semibold mb-4">
                {selectedRoom ? 'Edit Room' : 'Add New Room'}
              </h3>
              
              <form onSubmit={(e) => {
                e.preventDefault();
                // Add hostelId to new room
                handleSaveRoom({
                  hostelId: selectedHostelId,
                });
              }}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Room Number</label>
                    <input
                      type="text"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                      defaultValue={selectedRoom?.number}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Room Type</label>
                    <select
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                      defaultValue={selectedRoom?.type}
                    >
                      <option value="single">Single</option>
                      <option value="double">Double</option>
                      <option value="triple">Triple</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Price (UGX)</label>
                    <input
                      type="number"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                      defaultValue={selectedRoom?.price}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Images</label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                      <div className="space-y-1 text-center">
                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="flex text-sm text-gray-600">
                          <label className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500">
                            <span>Upload images</span>
                            <input
                              type="file"
                              multiple
                              className="sr-only"
                              onChange={(e) => e.target.files && handleImageUpload(e.target.files)}
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                      rows={3}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                      defaultValue={selectedRoom?.description}
                    />
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingRoom(false);
                      setSelectedRoom(null);
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700"
                  >
                    {selectedRoom ? 'Save Changes' : 'Add Room'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RoomManagement; 