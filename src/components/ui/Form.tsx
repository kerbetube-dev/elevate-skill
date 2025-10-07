/**
 * Enhanced form components with real-time validation and error handling
 * Provides consistent form behavior across the application
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useErrorHandler } from '../../utils/errorHandler';
import { LoadingSpinner } from './Loading';
import { Eye, EyeOff } from 'lucide-react';

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'tel' | 'textarea' | 'select';
  placeholder?: string;
  required?: boolean;
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    custom?: (value: string) => string | null;
  };
  options?: Array<{ value: string; label: string }>;
  className?: string;
}

export interface FormProps {
  fields: FormField[];
  onSubmit: (data: Record<string, string>) => Promise<void>;
  submitText?: string;
  loading?: boolean;
  className?: string;
  initialData?: Record<string, string>;
  validateOnChange?: boolean;
}

export const Form: React.FC<FormProps> = ({
  fields,
  onSubmit,
  submitText = 'Submit',
  loading = false,
  className = '',
  initialData = {},
  validateOnChange = true
}) => {
  const [formData, setFormData] = useState<Record<string, string>>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [showPassword, setShowPassword] = useState<Record<string, boolean>>({});
  const { handleError, getFieldErrors } = useErrorHandler();

  // Toggle password visibility
  const togglePasswordVisibility = (fieldName: string) => {
    setShowPassword(prev => ({
      ...prev,
      [fieldName]: !prev[fieldName]
    }));
  };

  // Validate individual field
  const validateField = useCallback((name: string, value: string): string | null => {
    const field = fields.find(f => f.name === name);
    if (!field) return null;

    // Required validation
    if (field.required && !value.trim()) {
      return `${field.label} is required`;
    }

    // Skip validation if field is empty and not required
    if (!value.trim() && !field.required) {
      return null;
    }

    // Length validation
    if (field.validation?.minLength && value.length < field.validation.minLength) {
      return `${field.label} must be at least ${field.validation.minLength} characters long`;
    }

    if (field.validation?.maxLength && value.length > field.validation.maxLength) {
      return `${field.label} must be no more than ${field.validation.maxLength} characters long`;
    }

    // Pattern validation
    if (field.validation?.pattern && !field.validation.pattern.test(value)) {
      return `${field.label} format is invalid`;
    }

    // Custom validation
    if (field.validation?.custom) {
      return field.validation.custom(value);
    }

    return null;
  }, [fields]);

  // Validate all fields
  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    fields.forEach(field => {
      const value = formData[field.name] || '';
      const error = validateField(field.name, value);
      if (error) {
        newErrors[field.name] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [fields, formData, validateField]);

  // Handle field change
  const handleFieldChange = useCallback((name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (validateOnChange) {
      const error = validateField(name, value);
      setErrors(prev => ({
        ...prev,
        [name]: error || ''
      }));
    }
  }, [validateField, validateOnChange]);

  // Handle field blur
  const handleFieldBlur = useCallback((name: string) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    
    if (validateOnChange) {
      const value = formData[name] || '';
      const error = validateField(name, value);
      setErrors(prev => ({
        ...prev,
        [name]: error || ''
      }));
    }
  }, [formData, validateField, validateOnChange]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mark all fields as touched
    const allTouched = fields.reduce((acc, field) => {
      acc[field.name] = true;
      return acc;
    }, {} as Record<string, boolean>);
    setTouched(allTouched);

    // Validate form
    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData);
    } catch (error) {
      const apiErrors = getFieldErrors(error);
      setErrors(apiErrors);
      
      // Show general error if no field-specific errors
      if (Object.keys(apiErrors).length === 0) {
        const errorMessage = handleError(error);
        // You might want to show this in a toast or at the top of the form
        console.error('Form submission error:', errorMessage);
      }
    }
  };

  // Render field based on type
  const renderField = (field: FormField) => {
    const value = formData[field.name] || '';
    const error = errors[field.name];
    const isTouched = touched[field.name];
    const showError = isTouched && error;

    const baseInputClasses = `
      block w-full px-3 py-2 border rounded-md shadow-sm
      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
      transition-colors duration-200
      ${showError 
        ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
        : 'border-gray-300'
      }
      ${field.className || ''}
    `;

    const labelClasses = `
      block text-sm font-medium text-gray-700 mb-1
      ${field.required ? 'after:content-["*"] after:text-red-500 after:ml-1' : ''}
    `;

    const errorClasses = 'mt-1 text-sm text-red-600';

    return (
      <div key={field.name} className="mb-4">
        <label htmlFor={field.name} className={labelClasses}>
          {field.label}
        </label>
        
        {field.type === 'textarea' ? (
          <textarea
            id={field.name}
            name={field.name}
            value={value}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            onBlur={() => handleFieldBlur(field.name)}
            placeholder={field.placeholder}
            required={field.required}
            rows={4}
            className={baseInputClasses}
          />
        ) : field.type === 'select' ? (
          <select
            id={field.name}
            name={field.name}
            value={value}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            onBlur={() => handleFieldBlur(field.name)}
            required={field.required}
            className={baseInputClasses}
          >
            <option value="">Select {field.label}</option>
            {field.options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ) : (
          <div className="relative">
            <input
              id={field.name}
              name={field.name}
              type={field.type === 'password' ? (showPassword[field.name] ? 'text' : 'password') : field.type}
              value={value}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
              onBlur={() => handleFieldBlur(field.name)}
              placeholder={field.placeholder}
              required={field.required}
              className={`${baseInputClasses} ${field.type === 'password' ? 'pr-10' : ''}`}
            />
            {field.type === 'password' && (
              <button
                type="button"
                onClick={() => togglePasswordVisibility(field.name)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                tabIndex={-1}
              >
                {showPassword[field.name] ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            )}
          </div>
        )}
        
        {showError && (
          <p className={errorClasses}>{error}</p>
        )}
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit} className={`space-y-4 ${className}`}>
      {fields.map(renderField)}
      
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="
            inline-flex items-center px-4 py-2 border border-transparent
            text-sm font-medium rounded-md text-white bg-blue-600
            hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-colors duration-200
          "
        >
          {loading && <LoadingSpinner size="sm" className="mr-2" />}
          {submitText}
        </button>
      </div>
    </form>
  );
};

// Predefined form configurations for common use cases
export const createLoginForm = (): FormField[] => [
  {
    name: 'email',
    label: 'Email',
    type: 'email',
    placeholder: 'Enter your email',
    required: true,
    validation: {
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      custom: (value) => {
        if (!value.includes('@')) {
          return 'Please enter a valid email address';
        }
        return null;
      }
    }
  },
  {
    name: 'password',
    label: 'Password',
    type: 'password',
    placeholder: 'Enter your password',
    required: true,
    validation: {
      minLength: 6
    }
  }
];

export const createRegistrationForm = (): FormField[] => [
  {
    name: 'fullName',
    label: 'Full Name',
    type: 'text',
    placeholder: 'Enter your full name',
    required: true,
    validation: {
      minLength: 2,
      maxLength: 100,
      custom: (value) => {
        if (!/^[a-zA-Z\s\-']+$/.test(value)) {
          return 'Name can only contain letters, spaces, hyphens, and apostrophes';
        }
        return null;
      }
    }
  },
  {
    name: 'email',
    label: 'Email',
    type: 'email',
    placeholder: 'Enter your email',
    required: true,
    validation: {
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    }
  },
  {
    name: 'password',
    label: 'Password',
    type: 'password',
    placeholder: 'Create a password',
    required: true,
    validation: {
      minLength: 8,
      custom: (value) => {
        if (!/[A-Za-z]/.test(value)) {
          return 'Password must contain at least one letter';
        }
        if (!/\d/.test(value)) {
          return 'Password must contain at least one number';
        }
        return null;
      }
    }
  },
  {
    name: 'phone',
    label: 'Phone Number',
    type: 'tel',
    placeholder: 'Enter your phone number',
    required: false,
    validation: {
      custom: (value) => {
        if (value && !/^[\+]?[1-9][\d]{0,15}$/.test(value.replace(/[^\d+]/g, ''))) {
          return 'Please enter a valid phone number';
        }
        return null;
      }
    }
  },
  {
    name: 'referralCode',
    label: 'Referral Code',
    type: 'text',
    placeholder: 'Enter referral code (optional)',
    required: false,
    validation: {
      custom: (value) => {
        if (value && value.length < 6) {
          return 'Referral code must be at least 6 characters long';
        }
        return null;
      }
    }
  }
];
