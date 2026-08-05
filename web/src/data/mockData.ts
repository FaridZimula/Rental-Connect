import { Hostel, University, User, Review } from '../types';

export interface University {
  id: string;
  name: string;
  location: string;
  imageUrl: string;
  description?: string;
  studentCount?: number;
  hostelCount?: number;
  establishedYear?: number;
  website?: string;
}

export const universities: University[] = [
  {
    id: '1',
    name: 'Makerere University',
    location: 'Kampala',
    imageUrl: '/images/universities/makerere.jpg',
    description: 'Uganda\'s oldest and premier university, known for excellence in research and education.',
    studentCount: 35000,
    hostelCount: 15,
    establishedYear: 1922,
    website: 'https://www.mak.ac.ug'
  },
  {
    id: '2',
    name: 'Kyambogo University',
    location: 'Kampala',
    imageUrl: '/images/universities/kyambogo.jpg',
    description: 'A leading university in technical and vocational education, teacher training, and special needs education.',
    studentCount: 25000,
    hostelCount: 8,
    establishedYear: 2003,
    website: 'https://www.kyu.ac.ug'
  },
  {
    id: '3',
    name: 'Mbarara University of Science and Technology',
    location: 'Mbarara',
    imageUrl: '/images/universities/must.jpg',
    description: 'A leading science and technology university, particularly known for its medical school.',
    studentCount: 5000,
    hostelCount: 6,
    establishedYear: 1989,
    website: 'https://www.must.ac.ug'
  },
  {
    id: '4',
    name: 'Gulu University',
    location: 'Gulu',
    imageUrl: '/images/universities/gulu.jpg',
    description: 'A public university serving northern Uganda, offering diverse academic programs.',
    studentCount: 8000,
    hostelCount: 5,
    establishedYear: 2002,
    website: 'https://www.gu.ac.ug'
  },
  {
    id: '5',
    name: 'Busitema University',
    location: 'Tororo',
    imageUrl: '/images/universities/busitema.jpg',
    description: 'A specialized university focusing on engineering, technology, and agricultural sciences.',
    studentCount: 6000,
    hostelCount: 4,
    establishedYear: 2007,
    website: 'https://www.busitema.ac.ug'
  },
  {
    id: '6',
    name: 'Kampala International University',
    location: 'Kampala',
    imageUrl: '/images/universities/kiu.jpg',
    description: 'A private university offering diverse programs in health sciences, business, and technology.',
    studentCount: 12000,
    hostelCount: 7,
    establishedYear: 2001,
    website: 'https://www.kiu.ac.ug'
  },
  {
    id: '7',
    name: 'Uganda Christian University',
    location: 'Mukono',
    imageUrl: '/images/universities/ucu.jpg',
    description: 'A private Christian university known for its quality education and research.',
    studentCount: 10000,
    hostelCount: 8,
    establishedYear: 1997,
    website: 'https://www.ucu.ac.ug'
  },
  {
    id: '8',
    name: 'Uganda Martyrs University',
    location: 'Nkozi',
    imageUrl: '/images/universities/ugm.jpg',
    description: 'A private Catholic university offering programs in various disciplines.',
    studentCount: 5000,
    hostelCount: 5,
    establishedYear: 1993,
    website: 'https://www.umu.ac.ug'
  }
];

export const hostels: Hostel[] = [
  {
    id: '1',
    name: 'Olympia Hostel',
    category: 'hostels',
    pricePeriod: '/semester',
    description: 'Modern accommodation with excellent facilities for students. Located just 5 minutes from campus.',
    ownerId: 'owner1',
    location: {
      address: '23 University Road, Kampala',
      distance: 0.5,
      coordinates: {
        lat: 0.3476,
        lng: 32.5825
      }
    },
    university: 'Makerere University',
    rating: 4.5,
    reviewCount: 120,
    amenities: ['WiFi', 'Security', 'Study Room', 'Laundry', 'Power Backup'],
    rooms: [
      {
        id: 'room1',
        type: 'Single',
        price: 450000, // UGX
        available: true,
        capacity: 1,
        amenities: ['Bed', 'Desk', 'Wardrobe', 'Private Bathroom'],
        imageUrls: ['https://images.pexels.com/photos/1648776/pexels-photo-1648776.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1']
      },
      {
        id: 'room2',
        type: 'Double',
        price: 350000, // UGX
        available: true,
        capacity: 2,
        amenities: ['Beds', 'Desks', 'Wardrobe', 'Shared Bathroom'],
        imageUrls: ['https://images.pexels.com/photos/1879061/pexels-photo-1879061.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1']
      }
    ],
    imageUrls: [
      'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      'https://images.pexels.com/photos/2121121/pexels-photo-2121121.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
    ]
  },
  {
    id: '2',
    name: 'Livingstone Hostel',
    category: 'hostels',
    pricePeriod: '/semester',
    description: 'Affordable and comfortable accommodation for students with all essential amenities.',
    ownerId: 'owner2',
    location: {
      address: '15 Kyambogo Road, Kampala',
      distance: 0.8,
      coordinates: {
        lat: 0.3484,
        lng: 32.6282
      }
    },
    university: 'Kyambogo University',
    rating: 4.2,
    reviewCount: 85,
    amenities: ['WiFi', 'Security', 'Cafeteria', 'Laundry'],
    rooms: [
      {
        id: 'room3',
        type: 'Single',
        price: 400000, // UGX
        available: true,
        capacity: 1,
        amenities: ['Bed', 'Desk', 'Wardrobe', 'Shared Bathroom'],
        imageUrls: ['https://images.pexels.com/photos/439227/pexels-photo-439227.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1']
      },
      {
        id: 'room4',
        type: 'Triple',
        price: 300000, // UGX
        available: false,
        capacity: 3,
        amenities: ['Beds', 'Desks', 'Wardrobe', 'Shared Bathroom'],
        imageUrls: ['https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1']
      }
    ],
    imageUrls: [
      'https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      'https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
    ]
  },
  {
    id: '101',
    name: 'Executive 2-Bedroom Apartment',
    category: 'rentals',
    pricePeriod: '/month',
    description: 'Fully furnished luxury apartment in Kololo with high-speed WiFi, fitted kitchen, and secure parking.',
    ownerId: 'owner3',
    location: {
      address: 'Plot 12 Kololo Terrace, Kampala',
      distance: 1.5,
    },
    university: 'Kampala Central',
    rating: 4.8,
    reviewCount: 42,
    amenities: ['Furnished', 'WiFi', 'CCTV Security', 'Balcony', 'Parking', 'Backup Generator'],
    rooms: [
      {
        id: 'rental_r1',
        type: '2 Bedroom Flat',
        price: 1500000,
        available: true,
        capacity: 4,
        amenities: ['Master Suite', 'Modern Kitchen', 'Air Conditioning'],
        imageUrls: ['https://images.pexels.com/photos/276724/pexels-photo-276724.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1']
      }
    ],
    imageUrls: [
      'https://images.pexels.com/photos/276724/pexels-photo-276724.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
    ]
  },
  {
    id: '201',
    name: 'Toyota Land Cruiser Prado V8',
    category: 'vehicles',
    pricePeriod: '/day',
    description: 'Reliable 4x4 SUV available for self-drive or chauffeur rental across Uganda.',
    ownerId: 'owner4',
    location: {
      address: 'Entebbe Road, Kampala',
      distance: 2.0,
    },
    university: 'Kampala Central',
    rating: 4.9,
    reviewCount: 64,
    amenities: ['Automatic', 'AC', '4WD', 'GPS', 'Leather Interior', 'Unlimited Mileage'],
    rooms: [
      {
        id: 'veh_r1',
        type: 'SUV Rental',
        price: 250000,
        available: true,
        capacity: 7,
        amenities: ['Full Tank Option', 'Comprehensive Insurance'],
        imageUrls: ['https://images.pexels.com/photos/116675/pexels-photo-116675.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1']
      }
    ],
    imageUrls: [
      'https://images.pexels.com/photos/116675/pexels-photo-116675.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
    ]
  },
  {
    id: '301',
    name: 'Commercial Prime Land (50x100ft)',
    category: 'land',
    pricePeriod: '/month',
    description: 'Prime commercial plot suitable for event hosting, pop-up markets, storage, or temporary business setup.',
    ownerId: 'owner5',
    location: {
      address: 'Ntinda Bypass Road, Kampala',
      distance: 3.0,
    },
    university: 'Kyambogo Area',
    rating: 4.6,
    reviewCount: 18,
    amenities: ['Fenced', 'Water Access', 'Power Line', 'Road Frontage', '24/7 Guarded'],
    rooms: [
      {
        id: 'land_r1',
        type: 'Plot Lease',
        price: 800000,
        available: true,
        capacity: 100,
        amenities: ['Level Ground', 'Gated Entry'],
        imageUrls: ['https://images.pexels.com/photos/440731/pexels-photo-440731.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1']
      }
    ],
    imageUrls: [
      'https://images.pexels.com/photos/440731/pexels-photo-440731.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
    ]
  },
  {
    id: '401',
    name: 'Heavy Duty 50kVA Power Generator & Sound System',
    category: 'equipment',
    pricePeriod: '/day',
    description: 'Professional industrial power generator and full concert sound system available for events and construction.',
    ownerId: 'owner6',
    location: {
      address: 'Industrial Area, Kampala',
      distance: 2.5,
    },
    university: 'Kampala Industrial Zone',
    rating: 4.7,
    reviewCount: 31,
    amenities: ['Silent Operation', 'Operator Included', 'Fuel Tank', 'Wireless Mics', 'Stage Speakers'],
    rooms: [
      {
        id: 'eq_r1',
        type: 'Equipment Package',
        price: 350000,
        available: true,
        capacity: 1,
        amenities: ['Delivery Included', 'Technical Support'],
        imageUrls: ['https://images.pexels.com/photos/257904/pexels-photo-257904.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1']
      }
    ],
    imageUrls: [
      'https://images.pexels.com/photos/257904/pexels-photo-257904.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
    ]
  },
  {
    id: '3',
    name: 'Sunset Residences',
    description: 'Premium hostel with modern facilities and a great view of the city.',
    ownerId: 'owner1',
    location: {
      address: '55 Mbarara Hill, Mbarara',
      distance: 1.2,
      coordinates: {
        lat: -0.6166,
        lng: 30.6536
      }
    },
    university: 'Mbarara University',
    rating: 4.8,
    reviewCount: 64,
    amenities: ['WiFi', 'Security', 'Gym', 'Swimming Pool', 'Study Room', 'Laundry', 'Power Backup'],
    rooms: [
      {
        id: 'room5',
        type: 'Single Deluxe',
        price: 550000, // UGX
        available: true,
        capacity: 1,
        amenities: ['Bed', 'Desk', 'Wardrobe', 'Private Bathroom', 'AC', 'TV'],
        imageUrls: ['https://images.pexels.com/photos/1743229/pexels-photo-1743229.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1']
      },
      {
        id: 'room6',
        type: 'Double',
        price: 450000, // UGX
        available: true,
        capacity: 2,
        amenities: ['Beds', 'Desks', 'Wardrobe', 'Shared Bathroom', 'AC'],
        imageUrls: ['https://images.pexels.com/photos/1454806/pexels-photo-1454806.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1']
      }
    ],
    imageUrls: [
      'https://images.pexels.com/photos/1838640/pexels-photo-1838640.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      'https://images.pexels.com/photos/2294125/pexels-photo-2294125.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
    ]
  },
  {
    id: '4',
    name: 'Northern Star Hostel',
    description: 'Comfortable and safe accommodation for Gulu University students.',
    ownerId: 'owner3',
    location: {
      address: '12 Gulu Avenue, Gulu',
      distance: 0.7,
      coordinates: {
        lat: 2.7746,
        lng: 32.2990
      }
    },
    university: 'Gulu University',
    rating: 4.1,
    reviewCount: 45,
    amenities: ['WiFi', 'Security', 'Cafeteria', 'Power Backup'],
    rooms: [
      {
        id: 'room7',
        type: 'Single',
        price: 380000, // UGX
        available: true,
        capacity: 1,
        amenities: ['Bed', 'Desk', 'Wardrobe', 'Shared Bathroom'],
        imageUrls: ['https://images.pexels.com/photos/2082087/pexels-photo-2082087.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1']
      },
      {
        id: 'room8',
        type: 'Double',
        price: 320000, // UGX
        available: true,
        capacity: 2,
        amenities: ['Beds', 'Desks', 'Wardrobe', 'Shared Bathroom'],
        imageUrls: ['https://images.pexels.com/photos/271619/pexels-photo-271619.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1']
      }
    ],
    imageUrls: [
      'https://images.pexels.com/photos/2034335/pexels-photo-2034335.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      'https://images.pexels.com/photos/1974596/pexels-photo-1974596.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
    ]
  },
  {
    id: '5',
    name: 'Eastern Comfort',
    description: 'Peaceful and well-maintained hostel for Busitema University students.',
    ownerId: 'owner4',
    location: {
      address: '32 Tororo Road, Tororo',
      distance: 1.5,
      coordinates: {
        lat: 0.6933,
        lng: 34.1755
      }
    },
    university: 'Busitema University',
    rating: 4.3,
    reviewCount: 38,
    amenities: ['WiFi', 'Security', 'Study Room', 'Laundry', 'Garden'],
    rooms: [
      {
        id: 'room9',
        type: 'Single',
        price: 400000, // UGX
        available: true,
        capacity: 1,
        amenities: ['Bed', 'Desk', 'Wardrobe', 'Shared Bathroom'],
        imageUrls: ['https://images.pexels.com/photos/262048/pexels-photo-262048.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1']
      },
      {
        id: 'room10',
        type: 'Double',
        price: 350000, // UGX
        available: true,
        capacity: 2,
        amenities: ['Beds', 'Desks', 'Wardrobe', 'Shared Bathroom'],
        imageUrls: ['https://images.pexels.com/photos/279746/pexels-photo-279746.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1']
      }
    ],
    imageUrls: [
      'https://images.pexels.com/photos/2079249/pexels-photo-2079249.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      'https://images.pexels.com/photos/2029694/pexels-photo-2029694.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
    ]
  }
];

export const reviews: Review[] = [
  {
    id: 'r1',
    hostelId: '1',
    userId: 'user1',
    userName: 'John Doe',
    rating: 5,
    comment: 'Amazing hostel with great facilities. The location is perfect for students.',
    date: '2023-12-15'
  },
  {
    id: 'r2',
    hostelId: '1',
    userId: 'user2',
    userName: 'Sarah Johnson',
    rating: 4,
    comment: 'Good facilities and friendly staff. Could improve on the internet speed.',
    date: '2023-11-20'
  },
  {
    id: 'r3',
    hostelId: '2',
    userId: 'user3',
    userName: 'Michael Brown',
    rating: 4,
    comment: 'Affordable and clean. Great value for money.',
    date: '2023-10-05'
  },
  {
    id: 'r4',
    hostelId: '3',
    userId: 'user4',
    userName: 'Emily Wilson',
    rating: 5,
    comment: 'Premium accommodation with excellent facilities. Worth every shilling!',
    date: '2023-12-30'
  }
];

export const currentUser: User = {
  id: 'user1',
  name: 'John Doe',
  email: 'john.doe@example.com',
  role: 'student',
  university: 'Makerere University',
  phone: '256-78-123-4567',
  avatar: 'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
};