import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { Calendar, CreditCard, Loader } from 'lucide-react';
import { motion } from 'framer-motion';
import { Room, Booking } from '../../../lib/types';
import { db } from '../../../lib/supabase';
import { useAuth } from '../../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Button from '../../ui/Button';

const bookingSchema = z.object({
  checkInDate: z.string().min(1, 'Check-in date is required'),
  checkOutDate: z.string().min(1, 'Check-out date is required'),
  agreeToTerms: z.boolean().refine((val) => val, 'You must agree to the terms'),
});

type BookingFormProps = {
  room: Room;
  onSuccess: (booking: Booking) => void;
  onCancel: () => void;
};

export default function BookingForm({ room, onSuccess, onCancel }: BookingFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(bookingSchema),
  });

  const onSubmit = async (data: any) => {
    if (!isAuthenticated) {
      // Redirect to login if not authenticated
      navigate('/login', { state: { from: location.pathname } });
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Create booking
      const booking = await db.bookings.create({
        room_id: room.id,
        user_id: user!.id,
        check_in_date: data.checkInDate,
        check_out_date: data.checkOutDate,
        total_price: room.price,
        status: 'pending'
      });

      // Update room status
      await db.rooms.update(room.id, { 
        status: 'booked'
      });
      
      onSuccess(booking);
    } catch (error) {
      console.error('Booking failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-6 rounded-xl shadow-lg"
    >
      <h3 className="text-xl font-semibold mb-4">Book Room {room.room_number}</h3>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Check-in Date
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="date"
              {...register('checkInDate')}
              min={format(new Date(), 'yyyy-MM-dd')}
              className="pl-10 w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-900 focus:border-transparent"
            />
          </div>
          {errors.checkInDate && (
            <p className="text-red-500 text-sm mt-1">{errors.checkInDate.message as string}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Check-out Date
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="date"
              {...register('checkOutDate')}
              min={format(new Date(), 'yyyy-MM-dd')}
              className="pl-10 w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-900 focus:border-transparent"
            />
          </div>
          {errors.checkOutDate && (
            <p className="text-red-500 text-sm mt-1">{errors.checkOutDate.message as string}</p>
          )}
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-600">Room Details</span>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Room Number</span>
              <span className="font-medium">{room.room_number}</span>
            </div>
            <div className="flex justify-between">
              <span>Floor</span>
              <span className="font-medium">{room.floor_number}</span>
            </div>
            <div className="flex justify-between">
              <span>Category</span>
              <span className="font-medium">{room.room_category}</span>
            </div>
            <div className="flex justify-between">
              <span>Type</span>
              <span className="font-medium">{room.type}</span>
            </div>
            <div className="border-t border-gray-200 pt-2 mt-2">
              <div className="flex justify-between items-center">
                <span className="font-medium">Total Price</span>
                <span className="text-lg font-bold text-primary-900">
                  {new Intl.NumberFormat('en-UG', {
                    style: 'currency',
                    currency: 'UGX',
                    minimumFractionDigits: 0,
                  }).format(room.price)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-start">
          <input
            type="checkbox"
            {...register('agreeToTerms')}
            className="mt-1 h-4 w-4 text-primary-900 focus:ring-primary-900 border-gray-300 rounded"
          />
          <label className="ml-2 text-sm text-gray-600">
            I agree to the terms and conditions of booking
          </label>
        </div>
        {errors.agreeToTerms && (
          <p className="text-red-500 text-sm">{errors.agreeToTerms.message as string}</p>
        )}

        <div className="flex space-x-3">
          <Button
            variant="outline"
            fullWidth
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          
          <Button
            variant="primary"
            fullWidth
            type="submit"
            disabled={isSubmitting}
            icon={isSubmitting ? <Loader className="animate-spin h-5 w-5" /> : <CreditCard className="h-5 w-5" />}
            iconPosition="left"
          >
            {isSubmitting ? 'Processing...' : 'Confirm Booking'}
          </Button>
        </div>
      </form>
    </motion.div>
  );