export enum USERROLE {
  ADMIN = "admin",
  USER = "user",
  MERCHANT = "merchant",
}

export enum PaymentStatus {
  NOT_RECIVED = "NOT_RECIVED",
  RECIVED = "RECIVED",
  SEND = "SEND",
  REFUND = "REFUND",
}

export enum PROPERTYSTATUS {
  OPEN = "open",
  CLOSE = "close",
}

export enum ServiceProvided {
  WIFI = "wifi",
  AC = "ac",
  TV = "tv",
  FRIDGE = "fridge",
  PARKING = "parking",
  HOUSEKEEPING = "housekeeping",
  LAUNDRY = "laundry",
  POWER_BACKUP = "power_backup",
  GEYSER = "geyser",
  SECURITY = "security",
  BREAKFAST = "breakfast",
  MEALS = "meals",
}

export interface User {
  _id: string;
  name: {
    firstName: string;
    middleName?: string;
    lastName?: string;
  };
  email: string;
  role: USERROLE;
  wallet: number;
  contactInfo?: {
    phone?: string;
    emergencyContact?: string;
  };
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
  };
}

export interface Room {
  _id: string;
  property: string;
  roomName: string;
  title: string;
  roomNo: string;
  description: string;
  price: number;
  images: string[];
  services: ServiceProvided[];
  tag: string;
  mapLocation: string;
  isAvalabile: boolean;
  Booking?: string[];
}

export interface Property {
  _id: string;
  name: string;
  address: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
  };
  owner: string | User;
  status: PROPERTYSTATUS;
  verification: boolean;
  wallet: number;
  rooms?: string[] | Room[];
  BankDetails?: {
    accountNumber?: string;
    ifscCode?: string;
    bankName?: string;
  };
}

export interface Booking {
  _id: string;
  user: string;
  room: string;
  startDate: string;
  endDate: string;
  price: number;
  duration: number;
  Payment?: string[];
}

export interface MerchantPayment {
  _id: string;
  userId: string;
  room: string;
  property: string;
  amount: number;
  payableAmount: number;
  paymentDate: string;
  status: PaymentStatus;
}

export interface AppNotification {
  _id: string;
  user: string;
  title: string;
  read: boolean;
  createdAt?: string;
}

export interface Commission {
  _id: string;
  user: string;
  property: string;
  room: string;
  commission: string;
  amount: number;
  createdAt?: string;
}
