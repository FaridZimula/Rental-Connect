import { Property } from '../types';

export const mockProperties: Property[] = [
  {
    id: 'p1',
    owner_id: 'landlord1',
    title: 'Executive 2-Bedroom Apartment in Kololo',
    description: 'Modern, fully finished 2-bedroom luxury apartment with modern kitchen, spacious living area, water heater, and 24/7 security guard.',
    property_type: 'apartment',
    listing_type: 'rent',
    price: 1500000,
    display_zone: 'Kololo, Kampala',
    bedrooms: 2,
    bathrooms: 2,
    area_sqft: 1200,
    status: 'published',
    is_available: true,
    created_at: new Date().toISOString(),
    images: [
      {
        id: 'img1',
        property_id: 'p1',
        image_url: 'https://images.pexels.com/photos/276724/pexels-photo-276724.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
        is_primary: true,
      },
    ],
    amenities: [
      { property_id: 'p1', amenity_id: 'a1', amenity: { id: 'a1', name: 'WiFi' } },
      { property_id: 'p1', amenity_id: 'a2', amenity: { id: 'a2', name: 'Security Guard' } },
      { property_id: 'p1', amenity_id: 'a3', amenity: { id: 'a3', name: 'Paved Parking' } },
    ],
    owner: {
      full_name: 'David Musoke',
    },
    _count: {
      inquiries: 12,
      reviews: 4,
    },
  },
  {
    id: 'p2',
    owner_id: 'landlord2',
    title: 'Cozy Self-Contained Studio Apartment near Kyambogo',
    description: 'Perfect for young professionals or students. Self-contained studio with kitchen counter, private washroom, and steady water supply.',
    property_type: 'studio',
    listing_type: 'rent',
    price: 550000,
    display_zone: 'Banda / Kyambogo, Kampala',
    bedrooms: 1,
    bathrooms: 1,
    area_sqft: 450,
    status: 'published',
    is_available: true,
    created_at: new Date().toISOString(),
    images: [
      {
        id: 'img2',
        property_id: 'p2',
        image_url: 'https://images.pexels.com/photos/1648776/pexels-photo-1648776.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
        is_primary: true,
      },
    ],
    amenities: [
      { property_id: 'p2', amenity_id: 'a4', amenity: { id: 'a4', name: 'Water Tank' } },
      { property_id: 'p2', amenity_id: 'a5', amenity: { id: 'a5', name: 'Individual Meter' } },
    ],
    owner: {
      full_name: 'Grace Nakato',
    },
    _count: {
      inquiries: 8,
      reviews: 2,
    },
  },
  {
    id: 'p3',
    owner_id: 'landlord1',
    title: 'Spacious 3-Bedroom Family House in Ntinda',
    description: 'Standalone 3-bedroom house with a private compound, perimeter wall, electric fence, and boys quarters.',
    property_type: 'house',
    listing_type: 'rent',
    price: 2500000,
    display_zone: 'Ntinda, Kampala',
    bedrooms: 3,
    bathrooms: 3,
    area_sqft: 2200,
    status: 'published',
    is_available: true,
    created_at: new Date().toISOString(),
    images: [
      {
        id: 'img3',
        property_id: 'p3',
        image_url: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
        is_primary: true,
      },
    ],
    amenities: [
      { property_id: 'p3', amenity_id: 'a6', amenity: { id: 'a6', name: 'Gated Compound' } },
      { property_id: 'p3', amenity_id: 'a7', amenity: { id: 'a7', name: 'Electric Fence' } },
      { property_id: 'p3', amenity_id: 'a8', amenity: { id: 'a8', name: 'Garden' } },
    ],
    owner: {
      full_name: 'David Musoke',
    },
    _count: {
      inquiries: 15,
      reviews: 6,
    },
  },
];