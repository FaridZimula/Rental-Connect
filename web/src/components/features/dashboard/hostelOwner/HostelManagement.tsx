import React, { useState } from 'react';
import { Plus, Edit, Trash2, Building } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Hostel {
  id: string;
  name: string;
  location: string;
  status: 'active' | 'pending' | 'inactive';
  roomsCount: number;
  description: string;
}

const initialHostels: Hostel[] = [
  { id: '1', name: 'Sunrise Hostel', location: 'Kampala', status: 'active', roomsCount: 12, description: 'Modern hostel near campus.' },
  { id: '2', name: 'Green Valley', location: 'Wandegeya', status: 'pending', roomsCount: 8, description: 'Affordable and secure.' },
];

const HostelManagement: React.FC = () => {
  const [hostels, setHostels] = useState<Hostel[]>(initialHostels);
  const [isAdding, setIsAdding] = useState(false);
  const [selectedHostel, setSelectedHostel] = useState<Hostel | null>(null);

  const handleSaveHostel = (hostelData: Partial<Hostel>) => {
    if (selectedHostel) {
      setHostels(hostels.map(h => h.id === selectedHostel.id ? { ...h, ...hostelData } as Hostel : h));
    } else {
      const newHostel: Hostel = {
        id: Date.now().toString(),
        name: hostelData.name || '',
        location: hostelData.location || '',
        status: 'pending',
        roomsCount: 0,
        description: hostelData.description || '',
      };
      setHostels([...hostels, newHostel]);
    }
    setIsAdding(false);
    setSelectedHostel(null);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">Hostel Management</h2>
        <button
          onClick={() => { setIsAdding(true); setSelectedHostel(null); }}
          className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          <Plus className="w-5 h-5 mr-2" /> Add Hostel
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {hostels.map(hostel => (
          <motion.div
            key={hostel.id}
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-white rounded-xl shadow-md overflow-hidden"
          >
            <div className="p-4 flex items-center gap-3 border-b">
              <Building className="w-8 h-8 text-primary-500" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{hostel.name}</h3>
                <p className="text-sm text-gray-500">{hostel.location}</p>
              </div>
              <span className={`ml-auto px-2 py-1 rounded-full text-xs font-medium ${hostel.status === 'active' ? 'bg-green-100 text-green-800' : hostel.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>{hostel.status.charAt(0).toUpperCase() + hostel.status.slice(1)}</span>
            </div>
            <div className="p-4">
              <p className="text-gray-700 mb-2">{hostel.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Rooms: <span className="font-semibold text-gray-900">{hostel.roomsCount}</span></span>
                <div className="flex space-x-2">
                  <button onClick={() => { setSelectedHostel(hostel); setIsAdding(true); }} className="p-1 text-gray-600 hover:text-primary-600"><Edit className="w-5 h-5" /></button>
                  <button onClick={() => setHostels(hostels.filter(h => h.id !== hostel.id))} className="p-1 text-gray-600 hover:text-red-600"><Trash2 className="w-5 h-5" /></button>
                </div>
              </div>
            </div>
            {/* Optionally, link to RoomManagement for this hostel */}
          </motion.div>
        ))}
      </div>
      {/* Add/Edit Hostel Modal */}
      <AnimatePresence>
        {isAdding && (
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
              className="bg-white rounded-xl shadow-xl max-w-md w-full p-6"
            >
              <h3 className="text-xl font-semibold mb-4">{selectedHostel ? 'Edit Hostel' : 'Add New Hostel'}</h3>
              <form onSubmit={e => { e.preventDefault(); handleSaveHostel({
                name: (e.currentTarget.elements.namedItem('name') as HTMLInputElement).value,
                location: (e.currentTarget.elements.namedItem('location') as HTMLInputElement).value,
                description: (e.currentTarget.elements.namedItem('description') as HTMLInputElement).value,
              }); }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Hostel Name</label>
                  <input name="name" type="text" defaultValue={selectedHostel?.name} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Location</label>
                  <input name="location" type="text" defaultValue={selectedHostel?.location} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea name="description" rows={3} defaultValue={selectedHostel?.description} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" />
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button type="button" onClick={() => { setIsAdding(false); setSelectedHostel(null); }} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">Cancel</button>
                  <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700">{selectedHostel ? 'Save Changes' : 'Add Hostel'}</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HostelManagement; 