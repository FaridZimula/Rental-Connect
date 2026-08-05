import { CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Booking } from '../../../lib/types';
import Button from '../../ui/Button';

type BookingConfirmationProps = {
  booking: Booking;
  onClose: () => void;
};

export default function BookingConfirmation({ booking, onClose }: BookingConfirmationProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white p-6 rounded-xl shadow-lg text-center"
    >
      <div className="mb-4 flex justify-center">
        <div className="bg-green-100 p-3 rounded-full">
          <CheckCircle className="h-12 w-12 text-green-500" />
        </div>
      </div>

      <h3 className="text-xl font-semibold mb-2">Booking Confirmed!</h3>
      <p className="text-gray-600 mb-6">
        Your booking has been successfully confirmed. You will receive a confirmation email shortly.
      </p>

      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Booking ID</span>
            <span className="font-medium">{booking.id.slice(0, 8)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Check-in</span>
            <span className="font-medium">{new Date(booking.check_in_date).toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Check-out</span>
            <span className="font-medium">{new Date(booking.check_out_date).toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between pt-2 border-t border-gray-200">
            <span className="font-medium">Total Amount</span>
            <span className="font-bold text-primary-900">
              {new Intl.NumberFormat('en-UG', {
                style: 'currency',
                currency: 'UGX',
                minimumFractionDigits: 0,
              }).format(booking.total_price)}
            </span>
          </div>
        </div>
      </div>

      <Button
        variant="primary"
        fullWidth
        onClick={onClose}
      >
        Done
      </Button>
    </motion.div>
  );
}