import api, { ApiResponse, handleApiError } from './api';

export interface DashboardStats {
  coursesEnrolled: number;
  hoursLearned: number;
  certificates: number;
  currentStreak: number;
  totalEarnings: number;
  successfulReferrals: number;
}

export interface RecentActivity {
  id: string;
  type: 'enrollment' | 'completion' | 'referral' | 'payment';
  title: string;
  description: string;
  timestamp: string;
  courseId?: string;
}

export interface ProgressOverview {
  courseId: string;
  courseTitle: string;
  progress: number;
  totalLessons: number;
  completedLessons: number;
  lastAccessed: string;
}

class DashboardService {
  // Get dashboard statistics
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const response = await api.get<DashboardStats>('/dashboard/stats');
      console.log("Dashboard stats response:");
      console.log(response.data);
      return response.data;
    } catch (error) {
      console.error("Error getting dashboard stats:", error);
      throw new Error(handleApiError(error));
    }
  }

  // Get recent activity
  async getRecentActivity(): Promise<RecentActivity[]> {
    try {
      const response = await api.get<RecentActivity[]>('/dashboard/recent-activity');
      console.log("Recent activity response:");
      console.log(response.data);
      return response.data;
    } catch (error) {
      console.error("Error getting recent activity:", error);
      throw new Error(handleApiError(error));
    }
  }

  // Get progress overview
  async getProgressOverview(): Promise<ProgressOverview[]> {
    try {
      const response = await api.get<ProgressOverview[]>('/dashboard/progress-overview');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}

export const dashboardService = new DashboardService();
