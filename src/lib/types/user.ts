export interface User {
  id: string;
  email: string;
  name: string;
  company?: string;
  address?: string;
  phone?: string;
  logo?: string; // URL to logo in Firebase Storage
  isPro: boolean;
  createdAt: Date;
  updatedAt?: Date;
}

export interface UserProfile {
  name: string;
  company?: string;
  address?: string;
  phone?: string;
  logo?: string;
}

export interface Client {
  name: string;
  email: string;
  company?: string;
  address?: string;
  phone?: string;
}
