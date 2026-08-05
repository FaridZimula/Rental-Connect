import React, { useState } from 'react';
import { Edit, Trash2, Building, Users, Filter, CheckCircle, XCircle } from 'lucide-react';

interface Hostel {
  id: string;
  name: string;
  university: string;
  owner: string;
  totalRooms: number;
  occupiedRooms: number;
  status: 'active' | 'suspended';
}

const mockHostels: Hostel[] = [
  {
    id: '1',
    name: 'Olympia Hostel',
    university: 'Makerere University',
    owner: 'John Doe',
    totalRooms: 12,
    occupiedRooms: 10,
    status: 'active',
  },
  {
    id: '2',
    name: 'Sunset Residences',
    university: 'Mbarara University',
    owner: 'Alice Smith',
    totalRooms: 30,
    occupiedRooms: 22,
    status: 'active',
  },
  {
    id: '3',
    name: 'Campus View',
    university: 'Kyambogo University',
    owner: 'Mike Johnson',
    totalRooms: 20,
    occupiedRooms: 13,
    status: 'suspended',
  },
];

const universities = [
  'All',
  'Makerere University',
  'Mbarara University',
  'Kyambogo University',
];

const statuses = ['All', 'active', 'suspended'];

const BrokerHostels: React.FC = () => {
  const [hostels, setHostels] = useState<Hostel[]>(mockHostels);
  const [universityFilter, setUniversityFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const filteredHostels = hostels.filter(h =>
    (universityFilter === 'All' || h.university === universityFilter) &&
    (statusFilter === 'All' || h.status === statusFilter)
  );

  const handleStatusChange = (id: string, newStatus: Hostel['status']) => {
    setHostels(hostels.map(h => h.id === id ? { ...h, status: newStatus } : h));
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">Hostels Management</h2>
        <div className="flex gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">University</label>
            <select
              value={universityFilter}
              onChange={e => setUniversityFilter(e.target.value)}
              className="border rounded px-2 py-1 text-sm"
            >
              {universities.map(u => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="border rounded px-2 py-1 text-sm"
            >
              {statuses.map(s => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hostel</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">University</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Occupancy</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredHostels.map(h => (
                <tr key={h.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap flex items-center gap-2">
                    <Building className="w-5 h-5 text-primary-600" />
                    <span className="font-medium text-gray-900">{h.name}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{h.university}</td>
                  <td className="px-6 py-4 whitespace-nowrap flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-500" />
                    {h.owner}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {h.occupiedRooms} / {h.totalRooms} rooms
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${h.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {h.status === 'active' ? <CheckCircle className="w-4 h-4 mr-1" /> : <XCircle className="w-4 h-4 mr-1" />}
                      {h.status.charAt(0).toUpperCase() + h.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap flex gap-2">
                    <button className="text-primary-600 hover:text-primary-900">
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      className="text-red-600 hover:text-red-900"
                      onClick={() => handleStatusChange(h.id, h.status === 'active' ? 'suspended' : 'active')}
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BrokerHostels; 