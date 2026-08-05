import React, { useState } from 'react';
import { Star, MessageSquare, Flag, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Review {
  id: string;
  roomId: string;
  roomNumber: string;
  studentName: string;
  rating: number;
  comment: string;
  date: string;
  status: 'pending' | 'approved' | 'reported';
  ownerResponse?: string;
}

const mockReviews: Review[] = [
  {
    id: '1',
    roomId: '101',
    roomNumber: '101',
    studentName: 'Alice Johnson',
    rating: 5,
    comment: 'Great room, very clean and comfortable!',
    date: '2024-06-01',
    status: 'pending',
  },
  {
    id: '2',
    roomId: '102',
    roomNumber: '102',
    studentName: 'Bob Smith',
    rating: 4,
    comment: 'Good value for money. Would recommend.',
    date: '2024-06-02',
    status: 'approved',
    ownerResponse: 'Thank you for your feedback!'
  },
  {
    id: '3',
    roomId: '103',
    roomNumber: '103',
    studentName: 'Carol Lee',
    rating: 2,
    comment: 'Room was noisy at night.',
    date: '2024-06-03',
    status: 'reported',
  },
];

const ReviewManagement: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>(mockReviews);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [responseText, setResponseText] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'reported'>('all');

  const handleApproveReview = (reviewId: string) => {
    setReviews(reviews.map(review =>
      review.id === reviewId ? { ...review, status: 'approved' } : review
    ));
  };

  const handleReportReview = (reviewId: string) => {
    setReviews(reviews.map(review =>
      review.id === reviewId ? { ...review, status: 'reported' } : review
    ));
  };

  const handleSubmitResponse = (reviewId: string) => {
    if (!responseText.trim()) return;
    
    setReviews(reviews.map(review =>
      review.id === reviewId ? { ...review, ownerResponse: responseText } : review
    ));
    setResponseText('');
    setSelectedReview(null);
  };

  const filteredReviews = reviews.filter(review => 
    filter === 'all' ? true : review.status === filter
  );

  const newReviewsCount = reviews.filter(r => r.status === 'pending').length;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
          Review Management
          {newReviewsCount > 0 && (
            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800">
              {newReviewsCount} New
            </span>
          )}
        </h2>
        <div className="flex space-x-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as typeof filter)}
            className="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          >
            <option value="all">All Reviews</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="reported">Reported</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {filteredReviews.map(review => (
          <motion.div
            key={review.id}
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-white rounded-xl shadow-md p-6"
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-lg font-medium text-gray-900">
                    Room {review.roomNumber}
                  </h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    review.status === 'approved' ? 'bg-green-100 text-green-800' :
                    review.status === 'reported' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {review.status.charAt(0).toUpperCase() + review.status.slice(1)}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  By {review.studentName} • {review.date}
                </p>
              </div>
              <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < review.rating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>

            <p className="mt-4 text-gray-600">{review.comment}</p>

            {review.ownerResponse && (
              <div className="mt-4 pl-4 border-l-4 border-primary-200">
                <p className="text-sm font-medium text-gray-900">Your Response:</p>
                <p className="mt-1 text-gray-600">{review.ownerResponse}</p>
              </div>
            )}

            <div className="mt-4 flex justify-end space-x-2">
              {review.status === 'pending' && (
                <>
                  <button
                    onClick={() => handleApproveReview(review.id)}
                    className="flex items-center px-3 py-1.5 text-sm font-medium text-green-700 bg-green-50 rounded-md hover:bg-green-100"
                  >
                    <Check className="w-4 h-4 mr-1" />
                    Approve
                  </button>
                  <button
                    onClick={() => handleReportReview(review.id)}
                    className="flex items-center px-3 py-1.5 text-sm font-medium text-red-700 bg-red-50 rounded-md hover:bg-red-100"
                  >
                    <Flag className="w-4 h-4 mr-1" />
                    Report
                  </button>
                </>
              )}
              {!review.ownerResponse && (
                <button
                  onClick={() => setSelectedReview(review)}
                  className="flex items-center px-3 py-1.5 text-sm font-medium text-primary-700 bg-primary-50 rounded-md hover:bg-primary-100"
                >
                  <MessageSquare className="w-4 h-4 mr-1" />
                  Respond
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Response Modal */}
      <AnimatePresence>
        {selectedReview && (
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
                <h3 className="text-xl font-semibold">Respond to Review</h3>
                <button
                  onClick={() => {
                    setSelectedReview(null);
                    setResponseText('');
                  }}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-500">Review by {selectedReview.studentName}</p>
                <p className="mt-2 text-gray-600">{selectedReview.comment}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Your Response</label>
                <textarea
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  rows={4}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Write your response to this review..."
                />
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setSelectedReview(null);
                    setResponseText('');
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleSubmitResponse(selectedReview.id)}
                  disabled={!responseText.trim()}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 disabled:opacity-50"
                >
                  Submit Response
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ReviewManagement; 