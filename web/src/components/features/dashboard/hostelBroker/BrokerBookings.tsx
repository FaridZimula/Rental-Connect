import React, { useState } from 'react';
import { CheckCircle, XCircle, Search, Eye } from 'lucide-react';

interface Booking {
  id: string;
  student: string;
  hostel: string;
  room: string;
  date: string;
  status: 'pending' | 'confirmed' | 'cancelled';
}

const mockBookings: Booking[] = [
  { id: '1', student: 'Jane Doe', hostel: 'Olympia Hostel', room: 'A1', date: '2024-06-05', status: 'pending' },
  { id: '2', student: 'Mark Smith', hostel: 'Sunset Residences', room: 'B2', date: '2024-06-04', status: 'confirmed' },
  { id: '3', student: 'Lucy Brown', hostel: 'Campus View', room: 'C3', date: '2024-06-03', status: 'cancelled' },
];

const statuses = ['All', 'pending', 'confirmed', 'cancelled'];

const BrokerBookings: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>(mockBookings);
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');

  const filteredBookings = bookings.filter(b =>
    (statusFilter === 'All' || b.status === statusFilter) &&
    (b.student.toLowerCase().includes(search.toLowerCase()) ||
      b.hostel.toLowerCase().includes(search.toLowerCase()) ||
      b.room.toLowerCase().includes(search.toLowerCase()))
  );

  const handleStatusChange = (id: string, newStatus: Booking['status']) => {
    setBookings(bookings.map(b => b.id === id ? { ...b, status: newStatus } : b));
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-gray-50 to-white flex flex-col items-center py-10 px-4">
      <div className="w-full max-w-6xl">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">All Bookings</h2>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div className="flex gap-4">
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
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search student, hostel, room..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent w-full"
            />
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-lg overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hostel</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBookings.map(b => (
                <tr key={b.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{b.student}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{b.hostel}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{b.room}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{b.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${b.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : b.status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {b.status.charAt(0).toUpperCase() + b.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap flex gap-2">
                    <button
                      className="text-green-600 hover:text-green-900 disabled:opacity-50"
                      disabled={b.status !== 'pending'}
                      onClick={() => handleStatusChange(b.id, 'confirmed')}
                    >
                      <CheckCircle className="w-5 h-5" />
                    </button>
                    <button
                      className="text-red-600 hover:text-red-900 disabled:opacity-50"
                      disabled={b.status !== 'pending'}
                      onClick={() => handleStatusChange(b.id, 'cancelled')}
                    >
                      <XCircle className="w-5 h-5" />
                    </button>
                    <button className="text-blue-600 hover:text-blue-900">
                      <Eye className="w-5 h-5" />
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

export default BrokerBookings; 