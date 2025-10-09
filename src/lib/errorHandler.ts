/**
 * Centralized Error Handling Utility
 * Provides consistent error handling across the application
 */

import { toast } from "@/hooks/use-toast";

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
  details?: any;
}

export class ErrorHandler {
  /**
   * Handle API errors with user-friendly messages
   */
  static handleApiError(error: any, context?: string): ApiError {
    console.error(`Error in ${context || 'API call'}:`, error);

    let message = 'An unexpected error occurred';
    let status: number | undefined;
    let code: string | undefined;
    let details: any = undefined;

    if (error.response) {
      // Server responded with error status
      status = error.response.status;
      const responseData = error.response.data;
      
      if (responseData?.detail) {
        message = responseData.detail;
      } else if (responseData?.message) {
        message = responseData.message;
      } else if (responseData?.error) {
        message = responseData.error;
      } else {
        message = `Server error (${status})`;
      }

      code = responseData?.code;
      details = responseData;
    } else if (error.request) {
      // Request was made but no response received
      message = 'Unable to connect to server. Please check your internet connection.';
      status = 0;
    } else {
      // Something else happened
      message = error.message || 'An unexpected error occurred';
    }

    const apiError: ApiError = {
      message,
      status,
      code,
      details
    };

    // Show user-friendly toast notification
    this.showErrorToast(apiError, context);

    return apiError;
  }

  /**
   * Show error toast notification
   */
  static showErrorToast(error: ApiError, context?: string): void {
    const title = context ? `Error in ${context}` : 'Error';
    
    toast({
      title,
      description: error.message,
      variant: "destructive",
      duration: 5000
    });
  }

  /**
   * Handle specific error types
   */
  static handleNetworkError(): ApiError {
    const error: ApiError = {
      message: 'Network error. Please check your internet connection and try again.',
      status: 0,
      code: 'NETWORK_ERROR'
    };
    
    this.showErrorToast(error);
    return error;
  }

  static handleAuthError(): ApiError {
    const error: ApiError = {
      message: 'Authentication failed. Please log in again.',
      status: 401,
      code: 'AUTH_ERROR'
    };
    
    this.showErrorToast(error);
    return error;
  }

  static handleValidationError(details: any): ApiError {
    const error: ApiError = {
      message: 'Please check your input and try again.',
      status: 400,
      code: 'VALIDATION_ERROR',
      details
    };
    
    this.showErrorToast(error);
    return error;
  }

  static handleServerError(status: number): ApiError {
    const error: ApiError = {
      message: 'Server error. Please try again later.',
      status,
      code: 'SERVER_ERROR'
    };
    
    this.showErrorToast(error);
    return error;
  }

  /**
   * Retry mechanism for failed requests
   */
  static async withRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<T> {
    let lastError: any;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        
        if (attempt === maxRetries) {
          break;
        }

        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, delay * attempt));
      }
    }

    throw lastError;
  }

  /**
   * Fallback data for when API calls fail
   */
  static getFallbackData<T>(type: string): T {
    const fallbacks: Record<string, any> = {
      platformStats: {
        totalStudents: 8000,
        totalCourses: 6,
        successRate: 98.0,
        averageRating: 4.8
      },
      courseStats: {
        enrollmentCount: 0,
        averageRating: 4.8,
        completionRate: 0.0
      },
      userStats: {
        enrolledCourses: 0,
        completedCourses: 0,
        totalEarnings: 0.0,
        referralCount: 0
      },
      courses: [],
      payments: [],
      enrollments: []
    };

    return fallbacks[type] || null;
  }
}

/**
 * Higher-order function for API error handling
 */
export function withErrorHandling<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  context?: string
) {
  return async (...args: T): Promise<R> => {
    try {
      return await fn(...args);
    } catch (error) {
      throw ErrorHandler.handleApiError(error, context);
    }
  };
}

/**
 * React hook for error handling
 */
export function useErrorHandler() {
  return {
    handleError: ErrorHandler.handleApiError,
    showError: ErrorHandler.showErrorToast,
    handleNetworkError: ErrorHandler.handleNetworkError,
    handleAuthError: ErrorHandler.handleAuthError,
    handleValidationError: ErrorHandler.handleValidationError,
    handleServerError: ErrorHandler.handleServerError,
    withRetry: ErrorHandler.withRetry,
    getFallbackData: ErrorHandler.getFallbackData
  };
}
