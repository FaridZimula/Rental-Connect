import React, { useState } from 'react';
import { Calendar, Clock, User, Phone, Mail, Check, X, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Booking {
  id: string;
  roomId: string;
  roomNumber: string;
  studentName: string;
  studentEmail: string;
  studentPhone: string;
  checkIn: string;
  checkOut: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  amount: number;
  paymentStatus: 'pending' | 'paid' | 'refunded';
  createdAt: string;
  specialRequests?: string;
}

const BookingManagement: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'cancelled' | 'completed'>('all');
  const [view, setView] = useState<'list' | 'calendar'>('list');

  const handleStatusChange = (bookingId: string, newStatus: Booking['status']) => {
    setBookings(bookings.map(booking =>
      booking.id === bookingId ? { ...booking, status: newStatus } : booking
    ));
  };

  const handlePaymentStatusChange = (bookingId: string, newStatus: Booking['paymentStatus']) => {
    setBookings(bookings.map(booking =>
      booking.id === bookingId ? { ...booking, paymentStatus: newStatus } : booking
    ));
  };

  const filteredBookings = bookings.filter(booking => 
    filter === 'all' ? true : booking.status === filter
  );

  const getStatusColor = (status: Booking['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: Booking['paymentStatus']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'paid': return 'bg-green-100 text-green-800';
      case 'refunded': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const newBookingsCount = bookings.filter(b => b.status === 'pending').length;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
          Booking Management
          {newBookingsCount > 0 && (
            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800">
              {newBookingsCount} New
            </span>
          )}
        </h2>
        <div className="flex space-x-4">
          <div className="flex space-x-2">
            <button
              onClick={() => setView('list')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                view === 'list'
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              List View
            </button>
            <button
              onClick={() => setView('calendar')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                view === 'calendar'
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Calendar View
            </button>
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as typeof filter)}
            className="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          >
            <option value="all">All Bookings</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {view === 'list' ? (
        <div className="space-y-4">
          {filteredBookings.map(booking => (
            <motion.div
              key={booking.id}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={`bg-white rounded-xl shadow-md p-6 ${booking.status === 'pending' ? 'ring-2 ring-red-200' : ''}`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-lg font-medium text-gray-900">
                      Room {booking.roomNumber}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(booking.paymentStatus)}`}>
                      {booking.paymentStatus.charAt(0).toUpperCase() + booking.paymentStatus.slice(1)}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center text-sm text-gray-500">
                    <Calendar className="w-4 h-4 mr-1" />
                    {booking.checkIn} - {booking.checkOut}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-gray-900">
                    UGX {booking.amount.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-500">
                    Booked on {booking.createdAt}
                  </p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center">
                  <User className="w-5 h-5 text-gray-400 mr-2" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{booking.studentName}</p>
                    <p className="text-sm text-gray-500">{booking.studentEmail}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Phone className="w-5 h-5 text-gray-400 mr-2" />
                  <p className="text-sm text-gray-900">{booking.studentPhone}</p>
                </div>
                {booking.specialRequests && (
                  <div className="flex items-start">
                    <AlertTriangle className="w-5 h-5 text-yellow-400 mr-2 mt-0.5" />
                    <p className="text-sm text-gray-600">{booking.specialRequests}</p>
                  </div>
                )}
              </div>

              <div className="mt-4 flex justify-end space-x-2">
                {booking.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleStatusChange(booking.id, 'confirmed')}
                      className="flex items-center px-3 py-1.5 text-sm font-medium text-green-700 bg-green-50 rounded-md hover:bg-green-100"
                    >
                      <Check className="w-4 h-4 mr-1" />
                      Confirm
                    </button>
                    <button
                      onClick={() => handleStatusChange(booking.id, 'cancelled')}
                      className="flex items-center px-3 py-1.5 text-sm font-medium text-red-700 bg-red-50 rounded-md hover:bg-red-100"
                    >
                      <X className="w-4 h-4 mr-1" />
                      Cancel
                    </button>
                  </>
                )}
                {booking.status === 'confirmed' && booking.paymentStatus === 'pending' && (
                  <button
                    onClick={() => handlePaymentStatusChange(booking.id, 'paid')}
                    className="flex items-center px-3 py-1.5 text-sm font-medium text-green-700 bg-green-50 rounded-md hover:bg-green-100"
                  >
                    <Check className="w-4 h-4 mr-1" />
                    Mark as Paid
                  </button>
                )}
                {booking.status === 'confirmed' && booking.paymentStatus === 'paid' && (
                  <button
                    onClick={() => handleStatusChange(booking.id, 'completed')}
                    className="flex items-center px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-50 rounded-md hover:bg-blue-100"
                  >
                    <Check className="w-4 h-4 mr-1" />
                    Mark as Completed
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md p-6">
          {/* TODO: Implement calendar view using a calendar library like react-big-calendar */}
          <div className="h-[600px] flex items-center justify-center text-gray-500">
            Calendar view will be implemented here
          </div>
        </div>
      )}

      {/* Booking Details Modal */}
      <AnimatePresence>
        {selectedBooking && (
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
                <h3 className="text-xl font-semibold">Booking Details</h3>
                <button
                  onClick={() => setSelectedBooking(null)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Room</p>
                    <p className="mt-1 text-gray-900">Room {selectedBooking.roomNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Status</p>
                    <p className="mt-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedBooking.status)}`}>
                        {selectedBooking.status.charAt(0).toUpperCase() + selectedBooking.status.slice(1)}
                      </span>
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Check-in</p>
                    <p className="mt-1 text-gray-900">{selectedBooking.checkIn}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Check-out</p>
                    <p className="mt-1 text-gray-900">{selectedBooking.checkOut}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Amount</p>
                    <p className="mt-1 text-gray-900">UGX {selectedBooking.amount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Payment Status</p>
                    <p className="mt-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(selectedBooking.paymentStatus)}`}>
                        {selectedBooking.paymentStatus.charAt(0).toUpperCase() + selectedBooking.paymentStatus.slice(1)}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Student Information</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Name</p>
                      <p className="mt-1 text-gray-900">{selectedBooking.studentName}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Email</p>
                      <p className="mt-1 text-gray-900">{selectedBooking.studentEmail}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Phone</p>
                      <p className="mt-1 text-gray-900">{selectedBooking.studentPhone}</p>
                    </div>
                  </div>
                </div>

                {selectedBooking.specialRequests && (
                  <div className="border-t border-gray-200 pt-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Special Requests</h4>
                    <p className="text-gray-600">{selectedBooking.specialRequests}</p>
                  </div>
                )}

                <div className="border-t border-gray-200 pt-4 flex justify-end space-x-3">
                  <button
                    onClick={() => setSelectedBooking(null)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Close
                  </button>
                  {selectedBooking.status === 'pending' && (
                    <>
                      <button
                        onClick={() => {
                          handleStatusChange(selectedBooking.id, 'confirmed');
                          setSelectedBooking(null);
                        }}
                        className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
                      >
                        Confirm Booking
                      </button>
                      <button
                        onClick={() => {
                          handleStatusChange(selectedBooking.id, 'cancelled');
                          setSelectedBooking(null);
                        }}
                        className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                      >
                        Cancel Booking
                      </button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BookingManagement; 