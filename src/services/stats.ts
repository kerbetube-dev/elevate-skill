/**
 * Stats Service
 * Handles fetching statistics from the backend
 */

import api from './api';
import { ErrorHandler } from '@/lib/errorHandler';

const API_BASE_URL = 'http://localhost:8000';

export interface PlatformStats {
  totalStudents: number;
  totalCourses: number;
  successRate: number;
  averageRating: number;
}

class StatsService {
  /**
   * Get platform statistics
   */
  async getPlatformStats(): Promise<PlatformStats> {
    try {
      const response = await api.get(`${API_BASE_URL}/stats/platform`);
      return response.data;
    } catch (error: any) {
      ErrorHandler.handleApiError(error, 'fetching platform stats');
      return ErrorHandler.getFallbackData<PlatformStats>('platformStats');
    }
  }

  /**
   * Get course statistics
   */
  async getCourseStats(courseId: string): Promise<{
    enrollmentCount: number;
    averageRating: number;
    completionRate: number;
  }> {
    try {
      const response = await api.get(`${API_BASE_URL}/stats/course/${courseId}`);
      return response.data;
    } catch (error: any) {
      ErrorHandler.handleApiError(error, 'fetching course stats');
      return ErrorHandler.getFallbackData('courseStats');
    }
  }

  /**
   * Get user statistics
   */
  async getUserStats(userId: string): Promise<{
    enrolledCourses: number;
    completedCourses: number;
    totalEarnings: number;
    referralCount: number;
  }> {
    try {
      const response = await api.get(`${API_BASE_URL}/stats/user/${userId}`);
      return response.data;
    } catch (error: any) {
      ErrorHandler.handleApiError(error, 'fetching user stats');
      return ErrorHandler.getFallbackData('userStats');
    }
  }
}

export const statsService = new StatsService();
export default statsService;
