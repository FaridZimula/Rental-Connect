import React, { useState } from 'react';
import { Shield, AlertTriangle, CheckCircle, XCircle, FileText } from 'lucide-react';

interface ModerationItem {
  id: string;
  type: 'hostel' | 'review' | 'owner';
  description: string;
  reportedBy: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
}

const mockModerationQueue: ModerationItem[] = [
  {
    id: '1',
    type: 'hostel',
    description: 'Hostel reported for false information',
    reportedBy: 'Student A',
    date: '2024-06-05',
    status: 'pending',
  },
  {
    id: '2',
    type: 'review',
    description: 'Review flagged as inappropriate',
    reportedBy: 'Owner B',
    date: '2024-06-04',
    status: 'pending',
  },
  {
    id: '3',
    type: 'owner',
    description: 'Owner suspected of fraudulent activity',
    reportedBy: 'System',
    date: '2024-06-03',
    status: 'pending',
  },
];

const BrokerModeration: React.FC = () => {
  const [queue, setQueue] = useState<ModerationItem[]>(mockModerationQueue);

  const handleAction = (id: string, action: 'approved' | 'rejected') => {
    setQueue(queue.map(item => item.id === id ? { ...item, status: action } : item));
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Shield className="w-6 h-6 text-orange-500" /> Moderation Queue
      </h2>
      <p className="text-gray-600 mb-6">Review and moderate reported content, reviews, and owner activities.</p>
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reported By</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {queue.map(item => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap flex items-center gap-2">
                    {item.type === 'hostel' && <FileText className="w-4 h-4 text-blue-500" />}
                    {item.type === 'review' && <AlertTriangle className="w-4 h-4 text-yellow-500" />}
                    {item.type === 'owner' && <Shield className="w-4 h-4 text-orange-500" />}
                    <span className="capitalize">{item.type}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{item.description}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{item.reportedBy}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{item.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${item.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : item.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {item.status === 'pending' && <AlertTriangle className="w-4 h-4 mr-1" />}
                      {item.status === 'approved' && <CheckCircle className="w-4 h-4 mr-1" />}
                      {item.status === 'rejected' && <XCircle className="w-4 h-4 mr-1" />}
                      {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap flex gap-2">
                    <button
                      className="text-green-600 hover:text-green-900 disabled:opacity-50"
                      disabled={item.status !== 'pending'}
                      onClick={() => handleAction(item.id, 'approved')}
                    >
                      <CheckCircle className="w-5 h-5" />
                    </button>
                    <button
                      className="text-red-600 hover:text-red-900 disabled:opacity-50"
                      disabled={item.status !== 'pending'}
                      onClick={() => handleAction(item.id, 'rejected')}
                    >
                      <XCircle className="w-5 h-5" />
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

export default BrokerModeration; 