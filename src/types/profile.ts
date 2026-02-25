import { Order } from "./order";
import { Review, Product } from "./product";

export interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  gender: 'male' | 'female';
  dateOfBirth: string;
  location: string;
}

export interface Address {
  _id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  country: string;
  pinCode: number;
  phoneNo: string;
  isDefault: boolean;
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'upi' | 'netbanking' | 'wallet';
  name: string;
  details: string;
  isDefault: boolean;
  icon: string;
}

export interface WalletTransaction {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  date: string;
  status: 'completed' | 'pending';
}

export type ActiveSection = 'main' | 'personal-info' | 'addresses' | 'orders' | 'rewards' | 'reviews' | 'help' | 'logout';

export interface ProfileState {
  loading: boolean;
  error: string | null;
  message: string | null;
  isUpdated: boolean;
  isDeleted: boolean;
}

