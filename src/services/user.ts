import api, { ApiResponse, handleApiError } from './api';

export interface UserProfile {
  user: {
    id: string;
    fullName: string;
    email: string;
    referralCode: string;
    createdAt: string;
    role: string;
  };
  enrolledCourses: any[];
  stats: {
    coursesEnrolled: number;
    hoursLearned: number;
    certificates: number;
    currentStreak: number;
    totalEarnings: number;
  };
}


export interface Enrollment {
  id: string;
  courseId: string;
  userId: string;
  enrolledAt: string;
  progress: number;
  status: 'active' | 'completed' | 'suspended';
  course?: any;
}

class UserService {
  // Get user profile
  async getUserProfile(): Promise<UserProfile> {
    try {
      const response = await api.get<UserProfile>('/user/profile');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }


  // Get user enrollments
  async getUserEnrollments(): Promise<Enrollment[]> {
    try {
      const response = await api.get<Enrollment[]>('/user/enrollments');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  // Update course progress
  async updateCourseProgress(enrollmentId: string, progress: number): Promise<{ message: string }> {
    try {
      const response = await api.put<{ message: string }>(`/user/enrollments/${enrollmentId}/progress`, { progress });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  // Get referral information
  async getReferralInfo(): Promise<any> {
    try {
      const response = await api.get('/user/referrals');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}

export const userService = new UserService();
