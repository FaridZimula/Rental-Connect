import React, { useState } from 'react';
import { Upload, MapPin, Phone, Mail, Building, Globe } from 'lucide-react';
import { motion } from 'framer-motion';

interface HostelSettings {
  hostelName: string;
  description: string;
  location: {
    address: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  contactInfo: {
    phone: string;
    email: string;
    website?: string;
  };
  images: string[];
}

const OwnerSettings: React.FC = () => {
  const [settings, setSettings] = useState<HostelSettings>({
    hostelName: '',
    description: '',
    location: {
      address: '',
      coordinates: {
        lat: 0,
        lng: 0
      }
    },
    contactInfo: {
      phone: '',
      email: '',
      website: ''
    },
    images: []
  });

  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleImageUpload = async (files: FileList) => {
    setIsUploading(true);
    try {
      // TODO: Implement image upload to cloud storage
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulated delay
      const newImages = Array.from(files).map(file => URL.createObjectURL(file));
      setSettings(prev => ({
        ...prev,
        images: [...prev.images, ...newImages]
      }));
    } catch (error) {
      console.error('Error uploading images:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      // TODO: Implement settings save to backend
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulated delay
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Hostel Settings</h2>

          <form onSubmit={handleSaveSettings}>
            <div className="space-y-6">
              {/* Hostel Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Hostel Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Hostel Name</label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Building className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        value={settings.hostelName}
                        onChange={(e) => setSettings({ ...settings, hostelName: e.target.value })}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        placeholder="Enter hostel name"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                      value={settings.description}
                      onChange={(e) => setSettings({ ...settings, description: e.target.value })}
                      rows={3}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Describe your hostel"
                    />
                  </div>
                </div>
              </div>

              {/* Location */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Location</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Address</label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MapPin className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        value={settings.location.address}
                        onChange={(e) => setSettings({
                          ...settings,
                          location: { ...settings.location, address: e.target.value }
                        })}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        placeholder="Enter hostel address"
                      />
                    </div>
                  </div>

                  {/* Google Maps Integration */}
                  <div className="h-64 bg-gray-100 rounded-lg">
                    {/* TODO: Implement Google Maps component */}
                    <div className="w-full h-full flex items-center justify-center text-gray-500">
                      Google Maps will be integrated here
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Phone className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="tel"
                        value={settings.contactInfo.phone}
                        onChange={(e) => setSettings({
                          ...settings,
                          contactInfo: { ...settings.contactInfo, phone: e.target.value }
                        })}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        placeholder="Enter phone number"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="email"
                        value={settings.contactInfo.email}
                        onChange={(e) => setSettings({
                          ...settings,
                          contactInfo: { ...settings.contactInfo, email: e.target.value }
                        })}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        placeholder="Enter email address"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Website (Optional)</label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Globe className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="url"
                        value={settings.contactInfo.website}
                        onChange={(e) => setSettings({
                          ...settings,
                          contactInfo: { ...settings.contactInfo, website: e.target.value }
                        })}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        placeholder="Enter website URL"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Images */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Hostel Images</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {settings.images.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={image}
                        alt={`Hostel image ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => setSettings({
                          ...settings,
                          images: settings.images.filter((_, i) => i !== index)
                        })}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <label className="relative flex items-center justify-center h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary-500">
                    <div className="text-center">
                      <Upload className="mx-auto h-8 w-8 text-gray-400" />
                      <span className="mt-2 block text-sm text-gray-600">
                        Upload Image
                      </span>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        className="sr-only"
                        onChange={(e) => e.target.files && handleImageUpload(e.target.files)}
                        disabled={isUploading}
                      />
                    </div>
                  </label>
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default OwnerSettings; 