import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

// Types
export interface WithdrawalRequest {
  amount: number;
  account_type: 'CBE' | 'TeleBirr';
  account_number: string;
  account_holder_name: string;
  phone_number?: string;
}

export interface WithdrawalResponse {
  id: string;
  userId: string;
  amount: number;
  account_type: string;
  account_number: string;
  account_holder_name: string;
  phone_number?: string;
  status: 'pending' | 'approved' | 'rejected';
  admin_notes?: string;
  rejection_reason?: string;
  created_at: string;
  processed_at?: string;
  processed_by?: string;
  // Add user info for admin view
  userName?: string;
  userEmail?: string;
}

export interface WithdrawalStats {
  totalEarnings: number;
  totalWithdrawn: number;
  availableBalance: number;
  pendingWithdrawals: number;
}

class WithdrawalsService {
  private getAuthHeaders() {
    const token = localStorage.getItem('access_token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  private getAdminAuthHeaders() {
    const token = localStorage.getItem('adminToken');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  async createWithdrawalRequest(withdrawalData: WithdrawalRequest): Promise<WithdrawalResponse> {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/withdrawals/`,
        withdrawalData,
        { headers: this.getAuthHeaders() }
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create withdrawal request');
    }
  }

  async getMyWithdrawals(): Promise<WithdrawalResponse[]> {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/withdrawals/my`,
        { headers: this.getAuthHeaders() }
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch withdrawal requests');
    }
  }

  async getWithdrawalStats(): Promise<WithdrawalStats> {
    try {
      // Get user profile to extract earnings info
      const response = await axios.get(
        `${API_BASE_URL}/dashboard/stats`,
        { headers: this.getAuthHeaders() }
      );
      
      const stats = response.data;
      const withdrawals = await this.getMyWithdrawals();
      
      const totalWithdrawn = withdrawals
        .filter(w => w.status === 'approved')
        .reduce((sum, w) => sum + w.amount, 0);
      
      const pendingWithdrawals = withdrawals
        .filter(w => w.status === 'pending')
        .reduce((sum, w) => sum + w.amount, 0);

      return {
        totalEarnings: stats.totalEarnings || 0,
        totalWithdrawn,
        availableBalance: (stats.totalEarnings || 0) - totalWithdrawn,
        pendingWithdrawals
      };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch withdrawal stats');
    }
  }

  async getAllWithdrawals(): Promise<WithdrawalResponse[]> {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/withdrawals/`,
        { headers: this.getAdminAuthHeaders() }
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch all withdrawal requests');
    }
  }

  async approveWithdrawal(withdrawalId: string, admin_notes?: string): Promise<void> {
    try {
      const url = admin_notes 
        ? `${API_BASE_URL}/withdrawals/${withdrawalId}/approve?admin_notes=${encodeURIComponent(admin_notes)}`
        : `${API_BASE_URL}/withdrawals/${withdrawalId}/approve`;
      
      await axios.post(
        url,
        {},
        { headers: this.getAdminAuthHeaders() }
      );
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to approve withdrawal request');
    }
  }

  async rejectWithdrawal(withdrawalId: string, rejection_reason: string): Promise<void> {
    try {
      await axios.post(
        `${API_BASE_URL}/withdrawals/${withdrawalId}/reject?rejection_reason=${encodeURIComponent(rejection_reason)}`,
        {},
        { headers: this.getAdminAuthHeaders() }
      );
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to reject withdrawal request');
    }
  }
}

export const withdrawalsService = new WithdrawalsService();
