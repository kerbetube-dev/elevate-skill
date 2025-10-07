/**
 * Centralized error handling utilities for the frontend
 * Provides consistent error handling and user feedback
 */

export interface ApiError {
  error: boolean;
  message: string;
  error_code: string;
  details?: Record<string, any>;
}

export interface ValidationError extends ApiError {
  error_code: 'VALIDATION_ERROR';
  details: {
    field_errors?: Array<{
      field: string;
      message: string;
      type: string;
      input?: any;
    }>;
    total_errors?: number;
    field?: string;
    value?: any;
  };
}

export interface BusinessLogicError extends ApiError {
  error_code: 'BUSINESS_LOGIC_ERROR';
  details: Record<string, any>;
}

export interface AuthenticationError extends ApiError {
  error_code: 'AUTHENTICATION_ERROR';
  details: Record<string, any>;
}

export interface AuthorizationError extends ApiError {
  error_code: 'AUTHORIZATION_ERROR';
  details: Record<string, any>;
}

export type ElevateSkillError = 
  | ValidationError 
  | BusinessLogicError 
  | AuthenticationError 
  | AuthorizationError 
  | ApiError;

export class ErrorHandler {
  /**
   * Extract user-friendly error message from API response
   */
  static getErrorMessage(error: any): string {
    // Handle API errors with our standardized format
    if (error?.response?.data?.error) {
      const apiError = error.response.data as ElevateSkillError;
      return apiError.message;
    }
    
    // Handle validation errors with field-specific messages
    if (error?.response?.data?.error_code === 'VALIDATION_ERROR') {
      const validationError = error.response.data as ValidationError;
      
      if (validationError.details?.field_errors?.length) {
        const firstError = validationError.details.field_errors[0];
        return `${this.getFieldDisplayName(firstError.field)}: ${firstError.message}`;
      }
      
      if (validationError.details?.field) {
        return `${this.getFieldDisplayName(validationError.details.field)}: ${validationError.message}`;
      }
      
      return validationError.message;
    }
    
    // Handle network errors
    if (error?.code === 'NETWORK_ERROR' || !error?.response) {
      return 'Network error. Please check your connection and try again.';
    }
    
    // Handle HTTP status codes
    if (error?.response?.status) {
      switch (error.response.status) {
        case 401:
          return 'Authentication required. Please log in again.';
        case 403:
          return 'You do not have permission to perform this action.';
        case 404:
          return 'The requested resource was not found.';
        case 422:
          return 'Please check your input and try again.';
        case 500:
          return 'Server error. Please try again later.';
        default:
          return error.response.data?.message || 'An unexpected error occurred.';
      }
    }
    
    // Fallback to generic error message
    return error?.message || 'An unexpected error occurred.';
  }

  /**
   * Get user-friendly field names for validation errors
   */
  private static getFieldDisplayName(field: string): string {
    const fieldMap: Record<string, string> = {
      'email': 'Email',
      'password': 'Password',
      'fullName': 'Full Name',
      'phone': 'Phone Number',
      'referralCode': 'Referral Code',
      'courseId': 'Course',
      'paymentMethodId': 'Payment Method',
      'amount': 'Amount',
      'body -> email': 'Email',
      'body -> password': 'Password',
      'body -> fullName': 'Full Name',
      'body -> phone': 'Phone Number',
      'body -> referralCode': 'Referral Code'
    };
    
    return fieldMap[field] || field;
  }

  /**
   * Check if error is a validation error
   */
  static isValidationError(error: any): boolean {
    return error?.response?.data?.error_code === 'VALIDATION_ERROR';
  }

  /**
   * Check if error is an authentication error
   */
  static isAuthenticationError(error: any): boolean {
    return error?.response?.data?.error_code === 'AUTHENTICATION_ERROR' ||
           error?.response?.status === 401;
  }

  /**
   * Check if error is an authorization error
   */
  static isAuthorizationError(error: any): boolean {
    return error?.response?.data?.error_code === 'AUTHORIZATION_ERROR' ||
           error?.response?.status === 403;
  }

  /**
   * Get field-specific validation errors
   */
  static getFieldErrors(error: any): Record<string, string> {
    if (!this.isValidationError(error)) {
      return {};
    }

    const validationError = error.response.data as ValidationError;
    const fieldErrors: Record<string, string> = {};

    if (validationError.details?.field_errors) {
      validationError.details.field_errors.forEach(fieldError => {
        const fieldName = this.getFieldDisplayName(fieldError.field);
        fieldErrors[fieldName] = fieldError.message;
      });
    }

    return fieldErrors;
  }

  /**
   * Log error for debugging (in development)
   */
  static logError(error: any, context?: string): void {
    if (process.env.NODE_ENV === 'development') {
      console.group(`🚨 Error${context ? ` in ${context}` : ''}`);
      console.error('Error object:', error);
      console.error('Error message:', this.getErrorMessage(error));
      console.error('Error details:', error?.response?.data);
      console.groupEnd();
    }
  }
}

/**
 * Hook for handling errors in React components
 */
export const useErrorHandler = () => {
  const handleError = (error: any, context?: string) => {
    ErrorHandler.logError(error, context);
    return ErrorHandler.getErrorMessage(error);
  };

  const getFieldErrors = (error: any) => {
    return ErrorHandler.getFieldErrors(error);
  };

  const isValidationError = (error: any) => {
    return ErrorHandler.isValidationError(error);
  };

  const isAuthenticationError = (error: any) => {
    return ErrorHandler.isAuthenticationError(error);
  };

  const isAuthorizationError = (error: any) => {
    return ErrorHandler.isAuthorizationError(error);
  };

  return {
    handleError,
    getFieldErrors,
    isValidationError,
    isAuthenticationError,
    isAuthorizationError
  };
};
