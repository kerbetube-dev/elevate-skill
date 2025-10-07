/**
 * Loading components for better user experience
 * Provides various loading states and spinners
 */

import React from 'react';
import { Loader2, RefreshCw } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <Loader2 
      className={`animate-spin ${sizeClasses[size]} ${className}`} 
    />
  );
};

interface LoadingButtonProps {
  loading: boolean;
  children: React.ReactNode;
  disabled?: boolean;
  className?: string;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

export const LoadingButton: React.FC<LoadingButtonProps> = ({
  loading,
  children,
  disabled,
  className = '',
  onClick,
  type = 'button'
}) => {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`
        inline-flex items-center justify-center px-4 py-2
        border border-transparent text-sm font-medium rounded-md
        text-white bg-blue-600 hover:bg-blue-700
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
        disabled:opacity-50 disabled:cursor-not-allowed
        transition-colors duration-200
        ${className}
      `}
    >
      {loading && <LoadingSpinner size="sm" className="mr-2" />}
      {children}
    </button>
  );
};

interface LoadingCardProps {
  loading: boolean;
  children: React.ReactNode;
  className?: string;
  loadingText?: string;
}

export const LoadingCard: React.FC<LoadingCardProps> = ({
  loading,
  children,
  className = '',
  loadingText = 'Loading...'
}) => {
  if (loading) {
    return (
      <div className={`
        flex flex-col items-center justify-center p-8
        bg-white rounded-lg shadow-sm border
        ${className}
      `}>
        <LoadingSpinner size="lg" className="mb-4" />
        <p className="text-gray-600 text-sm">{loadingText}</p>
      </div>
    );
  }

  return <>{children}</>;
};

interface LoadingOverlayProps {
  loading: boolean;
  children: React.ReactNode;
  loadingText?: string;
  className?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  loading,
  children,
  loadingText = 'Loading...',
  className = ''
}) => {
  return (
    <div className={`relative ${className}`}>
      {children}
      {loading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
          <div className="flex flex-col items-center">
            <LoadingSpinner size="lg" className="mb-2" />
            <p className="text-gray-600 text-sm">{loadingText}</p>
          </div>
        </div>
      )}
    </div>
  );
};

interface LoadingPageProps {
  loading: boolean;
  children: React.ReactNode;
  loadingText?: string;
}

export const LoadingPage: React.FC<LoadingPageProps> = ({
  loading,
  children,
  loadingText = 'Loading...'
}) => {
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <h2 className="text-lg font-medium text-gray-900 mb-2">{loadingText}</h2>
          <p className="text-gray-600">Please wait while we load your content...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

interface RefreshButtonProps {
  refreshing: boolean;
  onRefresh: () => void;
  children: React.ReactNode;
  className?: string;
}

export const RefreshButton: React.FC<RefreshButtonProps> = ({
  refreshing,
  onRefresh,
  children,
  className = ''
}) => {
  return (
    <button
      onClick={onRefresh}
      disabled={refreshing}
      className={`
        inline-flex items-center px-3 py-2 border border-gray-300
        text-sm font-medium rounded-md text-gray-700 bg-white
        hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
        disabled:opacity-50 disabled:cursor-not-allowed
        transition-colors duration-200
        ${className}
      `}
    >
      <RefreshCw 
        className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} 
      />
      {children}
    </button>
  );
};

interface LoadingTableProps {
  loading: boolean;
  children: React.ReactNode;
  columns: number;
  rows?: number;
}

export const LoadingTable: React.FC<LoadingTableProps> = ({
  loading,
  children,
  columns,
  rows = 5
}) => {
  if (loading) {
    return (
      <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            <tr>
              {Array.from({ length: columns }).map((_, index) => (
                <th
                  key={index}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  <div className="h-4 bg-gray-200 rounded animate-pulse" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <tr key={rowIndex}>
                {Array.from({ length: columns }).map((_, colIndex) => (
                  <td key={colIndex} className="px-6 py-4 whitespace-nowrap">
                    <div className="h-4 bg-gray-200 rounded animate-pulse" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return <>{children}</>;
};
