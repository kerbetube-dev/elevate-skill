import axios from 'axios';

const API_BASE_URL = 'http://localhost:8004';

// Types
export interface WithdrawalRequest {
  amount: number;
  accountType: 'CBE' | 'TeleBirr';
  accountNumber: string;
  accountHolderName: string;
  phoneNumber?: string;
}

export interface WithdrawalResponse {
  id: string;
  userId: string;
  amount: number;
  accountType: string;
  accountNumber: string;
  accountHolderName: string;
  phoneNumber?: string;
  status: 'pending' | 'approved' | 'rejected';
  adminNotes?: string;
  rejectionReason?: string;
  createdAt: string;
  processedAt?: string;
  processedBy?: string;
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
        { headers: this.getAuthHeaders() }
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch all withdrawal requests');
    }
  }

  async approveWithdrawal(withdrawalId: string, adminNotes?: string): Promise<void> {
    try {
      await axios.post(
        `${API_BASE_URL}/withdrawals/${withdrawalId}/approve`,
        { adminNotes },
        { headers: this.getAuthHeaders() }
      );
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to approve withdrawal request');
    }
  }

  async rejectWithdrawal(withdrawalId: string, rejectionReason: string): Promise<void> {
    try {
      await axios.post(
        `${API_BASE_URL}/withdrawals/${withdrawalId}/reject`,
        { rejectionReason },
        { headers: this.getAuthHeaders() }
      );
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to reject withdrawal request');
    }
  }
}

export const withdrawalsService = new WithdrawalsService();
