import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

// Create axios instance for referral API calls
const referralApi = axios.create({
  baseURL: `${API_BASE_URL}`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
referralApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor to handle auth errors
referralApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid, redirect to login
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export interface Referral {
  id: string;
  name: string;
  email: string;
  status: 'pending' | 'completed';
  rewardEarned: number;
  dateReferred: string;
  completedAt?: string;
}

export interface ReferralStats {
  totalReferrals: number;
  completedReferrals: number;
  pendingReferrals: number;
  totalEarnings: number;
  referralCode: string;
}

export interface ReferralEarning {
  id: string;
  referrerId: string;
  referredUserId: string;
  amount: number;
  status: 'pending' | 'completed';
  created_at: string;
  completedAt?: string;
  referredUserName: string;
  referredUserEmail: string;
}

class ReferralService {
  // Get user's referral statistics
  async getReferralStats(): Promise<ReferralStats> {
    try {
      const response = await referralApi.get('/referrals/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching referral stats:', error);
      throw error;
    }
  }

  // Get user's referrals
  async getReferrals(): Promise<Referral[]> {
    try {
      const response = await referralApi.get('/referrals/my');
      return response.data;
    } catch (error) {
      console.error('Error fetching referrals:', error);
      throw error;
    }
  }

  // Get user's referral earnings
  async getReferralEarnings(): Promise<ReferralEarning[]> {
    try {
      const response = await referralApi.get('/referrals/earnings');
      return response.data;
    } catch (error) {
      console.error('Error fetching referral earnings:', error);
      throw error;
    }
  }

  // Create a referral
  async createReferral(email: string): Promise<void> {
    try {
      await referralApi.post('/referrals', { email });
    } catch (error) {
      console.error('Error creating referral:', error);
      throw error;
    }
  }

  // Get referral code for current user
  async getReferralCode(): Promise<string> {
    try {
      const response = await referralApi.get('/referrals/code');
      return response.data.referralCode;
    } catch (error) {
      console.error('Error fetching referral code:', error);
      throw error;
    }
  }
}

export const referralService = new ReferralService();
