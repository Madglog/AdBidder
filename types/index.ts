import {
  User,
  AdSpace,
  Bid,
  Campaign,
  CampaignSpace,
  Transaction,
  Message,
  Notification,
  Review,
  Favorite,
  UserRole,
  AdSpaceType,
  AdSpaceStatus,
  BidStatus,
  CampaignStatus,
  TransactionType,
  TransactionStatus,
  NotificationType
} from '@prisma/client';

// Export Prisma types
export type {
  User,
  AdSpace,
  Bid,
  Campaign,
  CampaignSpace,
  Transaction,
  Message,
  Notification,
  Review,
  Favorite,
  UserRole,
  AdSpaceType,
  AdSpaceStatus,
  BidStatus,
  CampaignStatus,
  TransactionType,
  TransactionStatus,
  NotificationType
};

// Extended types with relations
export type AdSpaceWithOwner = AdSpace & {
  owner: User;
  _count?: {
    reviews: number;
    favorites: number;
    bids: number;
  };
  reviews?: Review[];
};

export type BidWithDetails = Bid & {
  advertiser: User;
  space: AdSpaceWithOwner;
};

export type CampaignWithDetails = Campaign & {
  advertiser: User;
  spaces: (CampaignSpace & {
    space: AdSpaceWithOwner;
  })[];
  _count?: {
    spaces: number;
  };
};

export type MessageWithUsers = Message & {
  sender: User;
  receiver: User;
};

export type ReviewWithDetails = Review & {
  reviewer: User;
  space: AdSpace;
};

// Form types
export interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  role: UserRole;
  businessName?: string;
  phone?: string;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface AdSpaceFormData {
  title: string;
  description: string;
  type: AdSpaceType;
  address: string;
  city: string;
  state: string;
  country: string;
  zipCode?: string;
  latitude: number;
  longitude: number;
  width: number;
  height: number;
  unit: string;
  basePrice: number;
  pricingUnit: string;
  instantBook: boolean;
  minBidPrice?: number;
  visibilityScore?: number;
  trafficEstimate?: number;
  photos: string[];
  availableFrom?: Date;
  availableTo?: Date;
}

export interface BidFormData {
  spaceId: string;
  amount: number;
  duration: number;
  startDate: Date;
  endDate: Date;
  message?: string;
}

export interface CampaignFormData {
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  spaces: {
    spaceId: string;
    creativeUrl?: string;
    price: number;
  }[];
}

export interface SearchFilters {
  type?: AdSpaceType;
  city?: string;
  state?: string;
  minPrice?: number;
  maxPrice?: number;
  minWidth?: number;
  minHeight?: number;
  availableFrom?: Date;
  availableTo?: Date;
  instantBookOnly?: boolean;
  bounds?: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T = any> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Statistics types
export interface DashboardStats {
  totalSpaces?: number;
  activeSpaces?: number;
  totalBids?: number;
  activeBids?: number;
  totalEarnings?: number;
  totalCampaigns?: number;
  activeCampaigns?: number;
  pendingBids?: number;
}

export interface AnalyticsData {
  views: number;
  bids: number;
  bookings: number;
  revenue: number;
  chartData: {
    date: string;
    value: number;
  }[];
}
