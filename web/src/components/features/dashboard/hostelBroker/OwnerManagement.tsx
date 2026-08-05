import React, { useState } from 'react';
import { Edit, Trash2, Mail, Phone, MapPin, FileText, Shield, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface HostelOwner {
  id: string;
  name: string;
  email: string;
  phone: string;
  hostelName: string;
  location: string;
  status: 'active' | 'suspended' | 'pending';
  joinDate: string;
  lastActive: string;
  totalHostels: number;
  totalRooms: number;
  rating: number;
}

const OwnerManagement: React.FC = () => {
  const [owners, setOwners] = useState<HostelOwner[]>([]);
  const [selectedOwner, setSelectedOwner] = useState<HostelOwner | null>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  const handleStatusChange = (ownerId: string, newStatus: HostelOwner['status']) => {
    setOwners(owners.map(owner =>
      owner.id === ownerId ? { ...owner, status: newStatus } : owner
    ));
  };

  const handleDeleteOwner = (ownerId: string) => {
    if (window.confirm('Are you sure you want to delete this hostel owner? This action cannot be undone.')) {
      setOwners(owners.filter(owner => owner.id !== ownerId));
    }
  };

  const generateReport = async () => {
    setIsGeneratingReport(true);
    // TODO: Implement PDF report generation
    setIsGeneratingReport(false);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">Hostel Owner Management</h2>
        <button
          onClick={generateReport}
          disabled={isGeneratingReport}
          className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
        >
          <FileText className="w-5 h-5 mr-2" />
          {isGeneratingReport ? 'Generating...' : 'Generate Report'}
        </button>
      </div>

      {/* Owner List */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Owner Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hostel Info
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Activity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {owners.map(owner => (
                <motion.tr
                  key={owner.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="hover:bg-gray-50"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{owner.name}</div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <Mail className="w-4 h-4 mr-1" />
                          {owner.email}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <Phone className="w-4 h-4 mr-1" />
                          {owner.phone}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{owner.hostelName}</div>
                    <div className="text-sm text-gray-500 flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {owner.location}
                    </div>
                    <div className="text-sm text-gray-500">
                      {owner.totalHostels} hostels • {owner.totalRooms} rooms
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={owner.status}
                      onChange={(e) => handleStatusChange(owner.id, e.target.value as HostelOwner['status'])}
                      className={`text-sm rounded-full px-2 py-1 font-medium ${
                        owner.status === 'active' ? 'bg-green-100 text-green-800' :
                        owner.status === 'suspended' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      <option value="active">Active</option>
                      <option value="suspended">Suspended</option>
                      <option value="pending">Pending</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">Joined: {owner.joinDate}</div>
                    <div className="text-sm text-gray-500">Last active: {owner.lastActive}</div>
                    <div className="text-sm text-gray-500 flex items-center">
                      <Shield className="w-4 h-4 mr-1" />
                      Rating: {owner.rating}/5
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setSelectedOwner(owner)}
                        className="text-primary-600 hover:text-primary-900"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteOwner(owner.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Owner Modal */}
      <AnimatePresence>
        {selectedOwner && (
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
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold">Edit Hostel Owner</h3>
                <button
                  onClick={() => setSelectedOwner(null)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  ×
                </button>
              </div>

              <form onSubmit={(e) => {
                e.preventDefault();
                // TODO: Implement form submission
                setSelectedOwner(null);
              }}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <input
                      type="text"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                      defaultValue={selectedOwner.name}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                      type="email"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                      defaultValue={selectedOwner.email}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    <input
                      type="tel"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                      defaultValue={selectedOwner.phone}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Hostel Name</label>
                    <input
                      type="text"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                      defaultValue={selectedOwner.hostelName}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Location</label>
                    <input
                      type="text"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                      defaultValue={selectedOwner.location}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <select
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                      defaultValue={selectedOwner.status}
                    >
                      <option value="active">Active</option>
                      <option value="suspended">Suspended</option>
                      <option value="pending">Pending</option>
                    </select>
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setSelectedOwner(null)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700"
                  >
                    Save Changes
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

export default OwnerManagement; 