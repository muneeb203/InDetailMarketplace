import { Detailer, Customer, ServiceRequest, Booking, Message, Lead } from '../types';

export const mockDetailers: Detailer[] = [
  {
    id: 'd1',
    role: 'detailer',
    email: 'elite@detailing.com',
    phone: '(555) 123-4567',
    name: 'Mike Johnson',
    businessName: 'Elite Auto Detailing',
    bio: 'Professional mobile detailing with 10+ years experience. Specializing in luxury vehicles and ceramic coatings.',
    tagline: 'Luxury Car Care Expert',
    serviceArea: 'Downtown & Midtown (15 mile radius)',
    serviceAreaGeo: {
      center: { lat: 40.7128, lng: -74.0060 },
      radius: 15,
      address: '123 Main St, New York, NY 10001'
    },
    location: 'Downtown',
    priceRange: '$$$',
    rating: 4.9,
    reviewCount: 127,
    photos: [
      'https://images.unsplash.com/photo-1690049585211-fe8f5178fd0c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjbGVhbiUyMGx1eHVyeSUyMGNhcnxlbnwxfHx8fDE3NjA1MzY1OTh8MA&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1627469985627-5317a1b7abda?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXIlMjBkZXRhaWxpbmclMjBwcm9mZXNzaW9uYWx8ZW58MXx8fHwxNzYwNDgxMjg1fDA&ixlib=rb-4.1.0&q=80&w=1080'
    ],
    portfolioPhotos: [
      'https://images.unsplash.com/photo-1677423448565-fc7025621ebc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXIlMjBkZXRhaWxpbmclMjBwcm9mZXNzaW9uYWx8ZW58MXx8fHwxNzYwNjIzODY2fDA&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1597075496644-761d510e5b69?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjbGVhbiUyMGx1eHVyeSUyMGNhciUyMGludGVyaW9yfGVufDF8fHx8MTc2MDYyMzg2Nnww&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1732357417676-9c4c14cd23c7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXIlMjB3YXNoJTIwZGV0YWlsaW5nfGVufDF8fHx8MTc2MDYyMzg2N3ww&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1563843639822-22d7ba213d52?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb2xpc2hlZCUyMGNhciUyMGV4dGVyaW9yfGVufDF8fHx8MTc2MDYyMzg2N3ww&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1708805282695-ef186db20192?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXIlMjBwYWludCUyMGNvcnJlY3Rpb258ZW58MXx8fHwxNzYwNjIzODY4fDA&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1572359249699-5ced96364f59?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjZXJhbWljJTIwY29hdGluZyUyMGNhcnxlbnwxfHx8fDE3NjA2MjM4Njh8MA&ixlib=rb-4.1.0&q=80&w=1080'
    ],
    services: ['Full Detail', 'Exterior Wash', 'Interior Detail', 'Ceramic Coating', 'Paint Correction'],
    serviceTags: ['ceramic-coating', 'paint-correction', 'luxury-vehicles'],
    operatingHours: {
      mon: ['8:00', '18:00'],
      tue: ['8:00', '18:00'],
      wed: ['8:00', '18:00'],
      thu: ['8:00', '18:00'],
      fri: ['8:00', '18:00'],
      sat: ['9:00', '15:00']
    },
    isPro: true,
    wallet: 450,
    completedJobs: 342,
    responseTime: 8,
    createdAt: new Date('2023-01-15'),
    coordinates: { lat: 40.7128, lng: -74.0060 },
    verified: true,
    commPreference: 'voice-chat' as any,
    waterSourceRequirement: 'not-required' as any,
    introVideoUrl: 'https://example.com/video/elite-intro.mp4',
    isVerified: true,
    isInsured: true,
    yearsInBusiness: 10,
    certifications: ['IDA Certified', 'Ceramic Pro Installer', 'Paint Correction Expert'],
    beforeAfterPhotos: [
      {
        id: 'ba1',
        beforeUrl: 'https://images.unsplash.com/photo-1449130015084-2d48d6b97f0a?w=600&q=80',
        afterUrl: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=600&q=80',
        category: 'Interior Deep Clean',
        description: 'Complete interior restoration with steam cleaning and conditioning',
      },
      {
        id: 'ba2',
        beforeUrl: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=600&q=80',
        afterUrl: 'https://images.unsplash.com/photo-1601362840469-51e4d8d58785?w=600&q=80',
        category: 'Exterior Detail',
        description: 'Paint correction and ceramic coating application',
      },
    ],
    socialConnections: [
      {
        platform: 'instagram' as const,
        username: 'eliteautodetailing',
        url: 'https://instagram.com/eliteautodetailing',
        isConnected: true,
        followerCount: 12500,
      },
      {
        platform: 'tiktok' as const,
        username: 'elitedetailing',
        url: 'https://tiktok.com/@elitedetailing',
        isConnected: true,
        followerCount: 8900,
      },
    ],
    exposureMetrics: {
      profileViews: 1243,
      profileViewsTrend: 12.5,
      saves: 89,
      savesTrend: 8.2,
      leadOpens: 156,
      leadOpensTrend: -3.1,
      quoteAcceptRate: 68,
      quoteAcceptRateTrend: 5.4,
      period: '30' as const,
    },
  } as any,
  {
    id: 'd2',
    role: 'detailer',
    email: 'shine@mobile.com',
    phone: '(555) 234-5678',
    name: 'Sarah Martinez',
    businessName: 'Shine On Mobile Detailing',
    bio: 'Eco-friendly mobile detailing services. We come to you! Quick, reliable, and affordable.',
    serviceArea: 'North Side (10 mile radius)',
    location: 'North Side',
    priceRange: '$$',
    rating: 4.7,
    reviewCount: 89,
    photos: [
      'https://images.unsplash.com/photo-1732357417676-9c4c14cd23c7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXIlMjB3YXNoJTIwZGV0YWlsaW5nfGVufDF8fHx8MTc2MDQ2MjQwMnww&ixlib=rb-4.1.0&q=80&w=1080'
    ],
    portfolioPhotos: [
      'https://images.unsplash.com/photo-1732357417676-9c4c14cd23c7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXIlMjB3YXNoJTIwZGV0YWlsaW5nfGVufDF8fHx8MTc2MDYyMzg2N3ww&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1563843639822-22d7ba213d52?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb2xpc2hlZCUyMGNhciUyMGV4dGVyaW9yfGVufDF8fHx8MTc2MDYyMzg2N3ww&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1597075496644-761d510e5b69?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjbGVhbiUyMGx1eHVyeSUyMGNhciUyMGludGVyaW9yfGVufDF8fHx8MTc2MDYyMzg2Nnww&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1677423448565-fc7025621ebc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXIlMjBkZXRhaWxpbmclMjBwcm9mZXNzaW9uYWx8ZW58MXx8fHwxNzYwNjIzODY2fDA&ixlib=rb-4.1.0&q=80&w=1080'
    ],
    services: ['Full Detail', 'Exterior Wash', 'Interior Detail', 'Headlight Restoration'],
    isPro: true,
    wallet: 280,
    completedJobs: 198,
    createdAt: new Date('2023-03-20'),
    coordinates: { lat: 40.7589, lng: -73.9851 },
    verified: true,
    commPreference: 'voice' as any,
    waterSourceRequirement: 'case-by-case' as any
  } as any,
  {
    id: 'd3',
    role: 'detailer',
    email: 'precision@auto.com',
    phone: '(555) 345-6789',
    name: 'David Chen',
    businessName: 'Precision Auto Care',
    bio: 'Attention to detail is our specialty. From everyday cars to exotic vehicles.',
    serviceArea: 'West End (8 mile radius)',
    location: 'West End',
    priceRange: '$$$',
    rating: 4.8,
    reviewCount: 156,
    photos: [
      'https://images.unsplash.com/photo-1627469985627-5317a1b7abda?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXIlMjBkZXRhaWxpbmclMjBwcm9mZXNzaW9uYWx8ZW58MXx8fHwxNzYwNDgxMjg1fDA&ixlib=rb-4.1.0&q=80&w=1080'
    ],
    portfolioPhotos: [
      'https://images.unsplash.com/photo-1708805282695-ef186db20192?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXIlMjBwYWludCUyMGNvcnJlY3Rpb258ZW58MXx8fHwxNzYwNjIzODY4fDA&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1572359249699-5ced96364f59?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjZXJhbWljJTIwY29hdGluZyUyMGNhcnxlbnwxfHx8fDE3NjA2MjM4Njh8MA&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1677423448565-fc7025621ebc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXIlMjBkZXRhaWxpbmclMjBwcm9mZXNzaW9uYWx8ZW58MXx8fHwxNzYwNjIzODY2fDA&ixlib=rb-4.1.0&q=80&w=1080'
    ],
    services: ['Full Detail', 'Exterior Wash', 'Interior Detail', 'Engine Bay Cleaning', 'Scratch Removal'],
    isPro: false,
    wallet: 125,
    completedJobs: 267,
    createdAt: new Date('2022-11-10'),
    coordinates: { lat: 40.7614, lng: -73.9776 },
    verified: true,
    commPreference: 'chat-only' as any,
    waterSourceRequirement: 'required' as any
  } as any,
  {
    id: 'd4',
    role: 'detailer',
    email: 'quick@shine.com',
    phone: '(555) 456-7890',
    name: 'Alex Rodriguez',
    businessName: 'QuickShine Express',
    bio: 'Fast and affordable mobile detailing. Same-day service available!',
    serviceArea: 'South Side (6 mile radius)',
    location: 'South Side',
    priceRange: '$',
    rating: 4.5,
    reviewCount: 64,
    photos: [
      'https://images.unsplash.com/photo-1634330737124-e584ef52a2ca?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2JpbGUlMjBzZXJ2aWNlJTIwdmFufGVufDF8fHx8MTc2MDU2MDg3OHww&ixlib=rb-4.1.0&q=80&w=1080'
    ],
    services: ['Exterior Wash', 'Interior Detail', 'Quick Detail'],
    isPro: false,
    wallet: 85,
    completedJobs: 142,
    createdAt: new Date('2023-06-05'),
    coordinates: { lat: 40.6782, lng: -73.9442 },
    verified: false,
    commPreference: 'voice-chat' as any,
    waterSourceRequirement: 'not-required' as any
  } as any,
  {
    id: 'd5',
    role: 'detailer',
    email: 'luxury@detailing.com',
    phone: '(555) 567-8901',
    name: 'Jessica Williams',
    businessName: 'Luxury Detail Pro',
    bio: 'Premium detailing for premium vehicles. Certified in advanced ceramic coating applications.',
    serviceArea: 'East Side (7 mile radius)',
    location: 'East Side',
    priceRange: '$$$$',
    rating: 5.0,
    reviewCount: 43,
    photos: [
      'https://images.unsplash.com/photo-1690049585211-fe8f5178fd0c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjbGVhbiUyMGx1eHVyeSUyMGNhcnxlbnwxfHx8fDE3NjA1MzY1OTh8MA&ixlib=rb-4.1.0&q=80&w=1080'
    ],
    portfolioPhotos: [
      'https://images.unsplash.com/photo-1572359249699-5ced96364f59?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjZXJhbWljJTIwY29hdGluZyUyMGNhcnxlbnwxfHx8fDE3NjA2MjM4Njh8MA&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1597075496644-761d510e5b69?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjbGVhbiUyMGx1eHVyeSUyMGNhciUyMGludGVyaW9yfGVufDF8fHx8MTc2MDYyMzg2Nnww&ixlib=rb-4.1.0&q=80&w=1080'
    ],
    services: ['Full Detail', 'Ceramic Coating', 'Paint Correction', 'PPF Installation'],
    isPro: true,
    wallet: 620,
    completedJobs: 89,
    createdAt: new Date('2023-08-12'),
    coordinates: { lat: 40.7484, lng: -73.9680 },
    verified: true,
    commPreference: 'voice' as any,
    waterSourceRequirement: 'not-required' as any,
    introVideoUrl: 'https://example.com/video/luxury-intro.mp4'
  } as any
];

export const mockCustomer: Customer = {
  id: 'c1',
  role: 'customer',
  email: 'john.doe@email.com',
  phone: '(555) 999-0000',
  name: 'John Doe',
  location: 'Downtown',
  vehicles: [
    {
      id: 'v1',
      type: 'Sedan',
      make: 'Toyota',
      model: 'Camry',
      year: 2021
    }
  ],
  createdAt: new Date('2024-01-10')
};

export const mockServiceRequests: ServiceRequest[] = [
  {
    id: 'r1',
    customerId: 'c1',
    vehicleType: 'Sedan',
    services: ['Full Detail', 'Interior Detail'],
    preferredDate: '2025-10-18',
    preferredTime: '10:00 AM',
    location: '123 Main St, Downtown',
    notes: 'Please focus on pet hair removal in back seat',
    status: 'confirmed',
    createdAt: new Date('2025-10-14'),
    detailerId: 'd1',
    price: 180
  }
];

export const mockBookings: Booking[] = [
  {
    id: 'b1',
    requestId: 'r1',
    customerId: 'c1',
    detailerId: 'd1',
    services: ['Full Detail', 'Interior Detail'],
    vehicleType: 'Sedan',
    location: '123 Main St, Downtown',
    scheduledDate: '2025-10-18',
    scheduledTime: '10:00 AM',
    price: 180,
    status: 'confirmed',
    createdAt: new Date('2025-10-14')
  }
];

export const mockMessages: Message[] = [
  {
    id: 'm1',
    senderId: 'd1',
    receiverId: 'c1',
    requestId: 'r1',
    text: 'Hi! I got your request. I can definitely help with the pet hair. I have special tools for that!',
    timestamp: new Date('2025-10-14T14:30:00'),
    read: true
  },
  {
    id: 'm2',
    senderId: 'c1',
    receiverId: 'd1',
    requestId: 'r1',
    text: 'Great! Looking forward to Friday.',
    timestamp: new Date('2025-10-14T14:35:00'),
    read: true
  }
];

export const mockLeads: Lead[] = [
  {
    id: 'l1',
    requestId: 'r1',
    detailerId: 'd1',
    customerId: 'c1',
    status: 'accepted',
    cost: 7.50,
    sentAt: new Date('2025-10-14T14:00:00')
  }
];

export const availableServices = [
  'Full Detail',
  'Exterior Wash',
  'Interior Detail',
  'Ceramic Coating',
  'Paint Correction',
  'Headlight Restoration',
  'Engine Bay Cleaning',
  'Scratch Removal',
  'Quick Detail',
  'PPF Installation',
  'Fleet Services',
  'RV Detailing'
];

export const vehicleTypes = [
  'Sedan',
  'SUV',
  'Truck',
  'Coupe',
  'Van',
  'Sports Car',
  'Luxury Vehicle',
  'RV/Motorhome',
  'Fleet Vehicle'
];