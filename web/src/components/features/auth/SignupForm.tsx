import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { UserPlus, Mail, Lock, User, Phone, School, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../../../contexts/AuthContext';
import Button from '../../ui/Button';
import { universities } from '../../../data/mockData';

const SignupForm = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'owner' as 'buyer' | 'owner',
    businessName: '',
    licenseNumber: '',
    operatingCity: 'Kampala',
    specialization: 'rentals',
    university: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  
  const { register, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'landlord' || (user.role as any) === 'owner') {
        navigate('/dashboard/landlord', { replace: true });
      } else {
        navigate('/dashboard/tenant', { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    if (location.pathname === '/hostel-owner/signup') {
      setFormData(prev => ({ ...prev, role: 'owner' }));
    } else {
      setFormData(prev => ({ ...prev, role: 'buyer' }));
    }
  }, [location.pathname]);

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Full name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';

    if (formData.role === 'owner') {
      if (!formData.businessName.trim()) newErrors.businessName = 'Business/Agency name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    
    if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
    else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handlePrevStep = () => {
    setStep(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep2()) return;

    setIsLoading(true);
    try {
      const mappedRole = formData.role === 'owner' ? 'landlord' : 'tenant';
      await register({
        full_name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: mappedRole,
      });
      navigate(mappedRole === 'landlord' ? '/dashboard/landlord' : '/dashboard/tenant');
    } catch (err: any) {
      setErrors({ submit: err?.message || 'Failed to create account. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div 
      className="bg-white border border-zinc-200 p-8 rounded-2xl shadow-xl max-w-lg w-full text-zinc-900"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center h-16 w-16 bg-[#f06023]/10 border border-[#f06023]/30 text-[#f06023] rounded-full mb-4 shadow-sm">
          <UserPlus className="h-8 w-8" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-zinc-900">
          {formData.role === 'owner' ? 'Property Owner Account' : 'Buyer / Renter Account'}
        </h2>
        <p className="text-zinc-600 mt-2 text-sm">
          Join <span className="text-[#f06023] font-bold">Rental Connect</span> to list, manage, or rent properties, vehicles & equipment.
        </p>
      </div>
      
      {errors.submit && (
        <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-xl mb-6 text-sm text-center font-medium">
          {errors.submit}
        </div>
      )}
      
      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-8 px-4">
        <div className="flex items-center">
          <div className="flex items-center justify-center w-8 h-8 bg-[#f06023] text-white font-bold rounded-full shadow-sm">
            1
          </div>
          <div className="ml-2 text-xs sm:text-sm font-semibold text-zinc-800">
            Profile & Business
          </div>
        </div>
        <div className="w-16 h-1 bg-zinc-200">
          <div className={`h-full ${step > 1 ? 'bg-[#f06023]' : 'bg-zinc-200'}`}></div>
        </div>
        <div className="flex items-center">
          <div className={`flex items-center justify-center w-8 h-8 ${step > 1 ? 'bg-[#f06023] text-white font-bold shadow-sm' : 'bg-zinc-100 text-zinc-400 border border-zinc-300'} rounded-full`}>
            2
          </div>
          <div className={`ml-2 text-xs sm:text-sm font-semibold ${step > 1 ? 'text-zinc-800' : 'text-zinc-400'}`}>
            Security
          </div>
        </div>
      </div>
      
      <form onSubmit={step === 1 ? (e) => { e.preventDefault(); handleNextStep(); } : handleSubmit}>
        {step === 1 && (
          <>
            {/* Account Role Selector */}
            <div className="mb-5">
              <label className="block text-zinc-700 text-sm font-semibold mb-2">
                I want to register as a
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => updateFormData('role', 'owner')}
                  className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold border transition-all ${
                    formData.role === 'owner'
                      ? 'bg-[#f06023] text-white border-[#f06023] shadow-md'
                      : 'bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-100'
                  }`}
                >
                  Property Owner
                </button>
                <button
                  type="button"
                  onClick={() => updateFormData('role', 'buyer')}
                  className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold border transition-all ${
                    formData.role === 'buyer'
                      ? 'bg-[#f06023] text-white border-[#f06023] shadow-md'
                      : 'bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-100'
                  }`}
                >
                  Buyer / Renter
                </button>
              </div>
            </div>

            {/* Step 1: Personal & Broker Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="name" className="block text-zinc-700 text-sm font-semibold mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#f06023]" />
                  <input
                    id="name"
                    type="text"
                    className="pl-10 w-full p-3 bg-zinc-50 border border-zinc-200 text-zinc-900 rounded-xl focus:outline-none focus:border-[#f06023] focus:bg-white text-sm"
                    placeholder="John Musisi"
                    value={formData.name}
                    onChange={(e) => updateFormData('name', e.target.value)}
                  />
                </div>
                {errors.name && <p className="text-red-500 text-xs mt-1 font-medium">{errors.name}</p>}
              </div>

              <div>
                <label htmlFor="phone" className="block text-zinc-700 text-sm font-semibold mb-1.5">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#f06023]" />
                  <input
                    id="phone"
                    type="tel"
                    className="pl-10 w-full p-3 bg-zinc-50 border border-zinc-200 text-zinc-900 rounded-xl focus:outline-none focus:border-[#f06023] focus:bg-white text-sm"
                    placeholder="+256 781 234 567"
                    value={formData.phone}
                    onChange={(e) => updateFormData('phone', e.target.value)}
                  />
                </div>
                {errors.phone && <p className="text-red-500 text-xs mt-1 font-medium">{errors.phone}</p>}
              </div>
            </div>

            <div className="mb-4">
              <label htmlFor="email" className="block text-zinc-700 text-sm font-semibold mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#f06023]" />
                <input
                  id="email"
                  type="email"
                  className="pl-10 w-full p-3 bg-zinc-50 border border-zinc-200 text-zinc-900 rounded-xl focus:outline-none focus:border-[#f06023] focus:bg-white text-sm"
                  placeholder="broker@rentalconnect.ug"
                  value={formData.email}
                  onChange={(e) => updateFormData('email', e.target.value)}
                />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1 font-medium">{errors.email}</p>}
            </div>

            {/* Owner-specific fields */}
            {formData.role === 'owner' && (
              <div className="p-4 bg-orange-50/60 border border-orange-200 rounded-xl mb-6 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#f06023]">
                  Owner Property Details
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-zinc-700 text-xs font-semibold mb-1">
                      Business / Agency Name
                    </label>
                    <input
                      type="text"
                      className="w-full p-2.5 bg-white border border-zinc-200 text-zinc-900 rounded-lg text-sm focus:border-[#f06023] focus:outline-none"
                      placeholder="e.g. Musisi Real Estate & Rentals"
                      value={formData.businessName}
                      onChange={(e) => updateFormData('businessName', e.target.value)}
                    />
                    {errors.businessName && <p className="text-red-500 text-xs mt-1">{errors.businessName}</p>}
                  </div>

                  <div>
                    <label className="block text-zinc-700 text-xs font-semibold mb-1">
                      NIN / License Number
                    </label>
                    <input
                      type="text"
                      className="w-full p-2.5 bg-white border border-zinc-200 text-zinc-900 rounded-lg text-sm focus:border-[#f06023] focus:outline-none"
                      placeholder="CM890234821XXXX"
                      value={formData.licenseNumber}
                      onChange={(e) => updateFormData('licenseNumber', e.target.value)}
                    />
                    {errors.licenseNumber && <p className="text-red-500 text-xs mt-1">{errors.licenseNumber}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-zinc-700 text-xs font-semibold mb-1">
                      Operating City / District
                    </label>
                    <input
                      type="text"
                      className="w-full p-2.5 bg-white border border-zinc-200 text-zinc-900 rounded-lg text-sm focus:border-[#f06023] focus:outline-none"
                      placeholder="Kampala, Entebbe, Jinja..."
                      value={formData.operatingCity}
                      onChange={(e) => updateFormData('operatingCity', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-700 text-xs font-semibold mb-1">
                      Primary Rental Specialization
                    </label>
                    <select
                      className="w-full p-2.5 bg-white border border-zinc-200 text-zinc-900 rounded-lg text-sm focus:border-[#f06023] focus:outline-none"
                      value={formData.specialization}
                      onChange={(e) => updateFormData('specialization', e.target.value)}
                    >
                      <option value="rentals">Apartments & Houses</option>
                      <option value="hostels">Student Hostels</option>
                      <option value="vehicles">Vehicles & Cars</option>
                      <option value="land">Commercial Land & Plots</option>
                      <option value="equipment">Equipments & Tools</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            <Button
              variant="primary"
              fullWidth
              size="lg"
              icon={<ArrowRight className="h-5 w-5 text-white" />}
              iconPosition="right"
              onClick={handleNextStep}
            >
              Continue to Security Setup
            </Button>
          </>
        )}
        
        {step === 2 && (
          <>
            {/* Step 2: Security Information */}
            <div className="mb-4">
              <label htmlFor="password" className="block text-zinc-700 text-sm font-semibold mb-2">
                Create Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#f06023]" />
                <input
                  id="password"
                  type="password"
                  className="pl-10 w-full p-3 bg-zinc-50 border border-zinc-200 text-zinc-900 rounded-xl focus:outline-none focus:border-[#f06023] focus:bg-white text-sm"
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={(e) => updateFormData('password', e.target.value)}
                />
                {errors.password && <p className="text-red-500 text-xs mt-1 font-medium">{errors.password}</p>}
              </div>
            </div>
            
            <div className="mb-6">
              <label htmlFor="confirmPassword" className="block text-zinc-700 text-sm font-semibold mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#f06023]" />
                <input
                  id="confirmPassword"
                  type="password"
                  className="pl-10 w-full p-3 bg-zinc-50 border border-zinc-200 text-zinc-900 rounded-xl focus:outline-none focus:border-[#f06023] focus:bg-white text-sm"
                  placeholder="Confirm password"
                  value={formData.confirmPassword}
                  onChange={(e) => updateFormData('confirmPassword', e.target.value)}
                />
                {errors.confirmPassword && <p className="text-red-500 text-xs mt-1 font-medium">{errors.confirmPassword}</p>}
              </div>
            </div>
            
            <div className="flex space-x-3">
              <Button
                variant="outline"
                fullWidth
                size="lg"
                onClick={handlePrevStep}
              >
                Back
              </Button>
              
              <Button
                variant="primary"
                fullWidth
                size="lg"
                icon={<ArrowRight className="h-5 w-5 text-white" />}
                iconPosition="right"
                disabled={isLoading}
              >
                {isLoading ? 'Registering Account...' : 'Complete Broker Registration'}
              </Button>
            </div>
          </>
        )}
        
        <p className="text-center text-zinc-600 text-sm mt-6 font-medium">
          Already have an account?{' '}
          <Link
            to="/hostel-owner/login"
            className="text-[#f06023] hover:text-[#d94b12] font-bold transition-colors"
          >
            Sign in
          </Link>
        </p>
      </form>
    </motion.div>
  );
};

export default SignupForm;