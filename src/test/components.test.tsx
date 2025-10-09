/**
 * Frontend Component Test Suite for Elevate Skill
 * Tests React components, API integration, and user interactions
 */

import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';

// Mock API services
vi.mock('@/services/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock('@/services/auth', () => ({
  authService: {
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    getCurrentUser: vi.fn(),
  },
}));

vi.mock('@/services/courses', () => ({
  coursesService: {
    getAllCourses: vi.fn(),
    getCourseById: vi.fn(),
  },
}));

vi.mock('@/services/user', () => ({
  userService: {
    getUserProfile: vi.fn(),
    getUserEnrollments: vi.fn(),
    updateUserProfile: vi.fn(),
  },
}));

vi.mock('@/services/dashboard', () => ({
  dashboardService: {
    getDashboardStats: vi.fn(),
  },
}));

// Import components after mocking
import { LandingPage } from '@/components/LandingPage';
import { Dashboard } from '@/components/Dashboard';
import { LoginForm } from '@/components/LoginForm';
import { RegisterForm } from '@/components/RegisterForm';
import { CourseDetails } from '@/components/CourseDetails';

// Test wrapper component
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {children}
        <Toaster />
      </BrowserRouter>
    </QueryClientProvider>
  );
};

// Mock data
const mockCourses = [
  {
    id: '1',
    title: 'Web Development',
    description: 'Learn modern web development',
    price: 1500,
    duration: '12 weeks',
    instructor: 'John Doe',
    image: '/web-development.jpg',
    category: 'Programming',
    level: 'Beginner',
  },
  {
    id: '2',
    title: 'Digital Marketing',
    description: 'Master digital marketing strategies',
    price: 1200,
    duration: '8 weeks',
    instructor: 'Jane Smith',
    image: '/digital-marketing.jpg',
    category: 'Marketing',
    level: 'Intermediate',
  },
];

const mockUser = {
  id: 'user-1',
  fullName: 'Test User',
  email: 'test@example.com',
  created_at: '2024-01-01T00:00:00Z',
};

const mockEnrollments = [
  {
    id: 'enrollment-1',
    courseId: '1',
    userId: 'user-1',
    enrolledAt: '2024-01-01T00:00:00Z',
    progress: 25,
    status: 'active',
    course: mockCourses[0],
  },
];

const mockDashboardStats = {
  totalCourses: 6,
  enrolledCourses: 2,
  completedCourses: 0,
  totalSpent: 2700,
  recentActivity: [
    {
      id: 'activity-1',
      type: 'enrollment',
      description: 'Enrolled in Web Development',
      timestamp: '2024-01-01T00:00:00Z',
    },
  ],
};

describe('LandingPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock successful API response
    const { coursesService } = require('@/services/courses');
    coursesService.getAllCourses.mockResolvedValue(mockCourses);
  });

  it('renders landing page with course list', async () => {
    render(
      <TestWrapper>
        <LandingPage />
      </TestWrapper>
    );

    // Check if loading state appears initially
    expect(screen.getByText('Loading courses...')).toBeInTheDocument();

    // Wait for courses to load
    await waitFor(() => {
      expect(screen.getByText('Web Development')).toBeInTheDocument();
      expect(screen.getByText('Digital Marketing')).toBeInTheDocument();
    });

    // Check course details
    expect(screen.getByText('Learn modern web development')).toBeInTheDocument();
    expect(screen.getByText('Master digital marketing strategies')).toBeInTheDocument();
    expect(screen.getByText('1500 Birr')).toBeInTheDocument();
    expect(screen.getByText('1200 Birr')).toBeInTheDocument();
  });

  it('handles API errors gracefully', async () => {
    const { coursesService } = require('@/services/courses');
    coursesService.getAllCourses.mockRejectedValue(new Error('API Error'));

    render(
      <TestWrapper>
        <LandingPage />
      </TestWrapper>
    );

    // Wait for error state
    await waitFor(() => {
      expect(screen.getByText('Failed to load courses')).toBeInTheDocument();
      expect(screen.getByText('Retry')).toBeInTheDocument();
    });
  });

  it('retries loading courses on retry button click', async () => {
    const { coursesService } = require('@/services/courses');
    coursesService.getAllCourses
      .mockRejectedValueOnce(new Error('API Error'))
      .mockResolvedValueOnce(mockCourses);

    render(
      <TestWrapper>
        <LandingPage />
      </TestWrapper>
    );

    // Wait for error state
    await waitFor(() => {
      expect(screen.getByText('Failed to load courses')).toBeInTheDocument();
    });

    // Click retry button
    fireEvent.click(screen.getByText('Retry'));

    // Wait for courses to load
    await waitFor(() => {
      expect(screen.getByText('Web Development')).toBeInTheDocument();
    });

    expect(coursesService.getAllCourses).toHaveBeenCalledTimes(2);
  });
});

describe('LoginForm Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders login form with all fields', () => {
    render(
      <TestWrapper>
        <LoginForm />
      </TestWrapper>
    );

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    render(
      <TestWrapper>
        <LoginForm />
      </TestWrapper>
    );

    const submitButton = screen.getByRole('button', { name: /sign in/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });
  });

  it('validates email format', async () => {
    render(
      <TestWrapper>
        <LoginForm />
      </TestWrapper>
    );

    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
    });
  });

  it('handles successful login', async () => {
    const { authService } = require('@/services/auth');
    authService.login.mockResolvedValue({
      user: mockUser,
      token: 'mock-token',
    });

    render(
      <TestWrapper>
        <LoginForm />
      </TestWrapper>
    );

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(authService.login).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });
  });

  it('handles login errors', async () => {
    const { authService } = require('@/services/auth');
    authService.login.mockRejectedValue(new Error('Invalid credentials'));

    render(
      <TestWrapper>
        <LoginForm />
      </TestWrapper>
    );

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });
  });
});

describe('RegisterForm Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders registration form with all fields', () => {
    render(
      <TestWrapper>
        <RegisterForm />
      </TestWrapper>
    );

    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
  });

  it('validates password confirmation', async () => {
    render(
      <TestWrapper>
        <RegisterForm />
      </TestWrapper>
    );

    const passwordInput = screen.getByLabelText(/^password/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    const submitButton = screen.getByRole('button', { name: /create account/i });

    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'different123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
    });
  });

  it('handles successful registration', async () => {
    const { authService } = require('@/services/auth');
    authService.register.mockResolvedValue({
      user: mockUser,
      token: 'mock-token',
    });

    render(
      <TestWrapper>
        <RegisterForm />
      </TestWrapper>
    );

    const fullNameInput = screen.getByLabelText(/full name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/^password/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    const submitButton = screen.getByRole('button', { name: /create account/i });

    fireEvent.change(fullNameInput, { target: { value: 'Test User' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(authService.register).toHaveBeenCalledWith({
        fullName: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      });
    });
  });
});

describe('Dashboard Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock successful API responses
    const { coursesService } = require('@/services/courses');
    const { userService } = require('@/services/user');
    const { dashboardService } = require('@/services/dashboard');
    const { authService } = require('@/services/auth');

    coursesService.getAllCourses.mockResolvedValue(mockCourses);
    userService.getUserEnrollments.mockResolvedValue(mockEnrollments);
    dashboardService.getDashboardStats.mockResolvedValue(mockDashboardStats);
    authService.getCurrentUser.mockResolvedValue(mockUser);
  });

  it('renders dashboard with user stats', async () => {
    render(
      <TestWrapper>
        <Dashboard />
      </TestWrapper>
    );

    // Wait for dashboard to load
    await waitFor(() => {
      expect(screen.getByText('6')).toBeInTheDocument(); // totalCourses
      expect(screen.getByText('2')).toBeInTheDocument(); // enrolledCourses
      expect(screen.getByText('0')).toBeInTheDocument(); // completedCourses
      expect(screen.getByText('2,700')).toBeInTheDocument(); // totalSpent
    });
  });

  it('displays enrolled courses', async () => {
    render(
      <TestWrapper>
        <Dashboard />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Web Development')).toBeInTheDocument();
      expect(screen.getByText('25%')).toBeInTheDocument(); // progress
    });
  });

  it('displays recommended courses', async () => {
    render(
      <TestWrapper>
        <Dashboard />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Recommended for You')).toBeInTheDocument();
      expect(screen.getByText('Digital Marketing')).toBeInTheDocument();
    });
  });

  it('handles loading states', () => {
    const { coursesService } = require('@/services/courses');
    coursesService.getAllCourses.mockImplementation(() => new Promise(() => {})); // Never resolves

    render(
      <TestWrapper>
        <Dashboard />
      </TestWrapper>
    );

    expect(screen.getByText('Loading dashboard...')).toBeInTheDocument();
  });

  it('handles API errors gracefully', async () => {
    const { coursesService } = require('@/services/courses');
    coursesService.getAllCourses.mockRejectedValue(new Error('API Error'));

    render(
      <TestWrapper>
        <Dashboard />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Failed to load dashboard data')).toBeInTheDocument();
      expect(screen.getByText('Retry')).toBeInTheDocument();
    });
  });
});

describe('CourseDetails Component', () => {
  it('renders course details with all information', () => {
    const mockCourse = mockCourses[0];
    
    render(
      <TestWrapper>
        <CourseDetails course={mockCourse} />
      </TestWrapper>
    );

    expect(screen.getByText('Web Development')).toBeInTheDocument();
    expect(screen.getByText('Learn modern web development')).toBeInTheDocument();
    expect(screen.getByText('1500 Birr')).toBeInTheDocument();
    expect(screen.getByText('12 weeks')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('handles enroll button click', () => {
    const mockCourse = mockCourses[0];
    const mockOnEnroll = vi.fn();
    
    render(
      <TestWrapper>
        <CourseDetails course={mockCourse} onEnroll={mockOnEnroll} />
      </TestWrapper>
    );

    const enrollButton = screen.getByRole('button', { name: /enroll now/i });
    fireEvent.click(enrollButton);

    expect(mockOnEnroll).toHaveBeenCalledWith(mockCourse.id);
  });
});

describe('API Integration Tests', () => {
  it('handles network errors gracefully', async () => {
    const { coursesService } = require('@/services/courses');
    coursesService.getAllCourses.mockRejectedValue(new Error('Network Error'));

    render(
      <TestWrapper>
        <LandingPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Failed to load courses')).toBeInTheDocument();
    });
  });

  it('retries failed requests', async () => {
    const { coursesService } = require('@/services/courses');
    coursesService.getAllCourses
      .mockRejectedValueOnce(new Error('Network Error'))
      .mockResolvedValueOnce(mockCourses);

    render(
      <TestWrapper>
        <LandingPage />
      </TestWrapper>
    );

    // Wait for error
    await waitFor(() => {
      expect(screen.getByText('Failed to load courses')).toBeInTheDocument();
    });

    // Click retry
    fireEvent.click(screen.getByText('Retry'));

    // Wait for success
    await waitFor(() => {
      expect(screen.getByText('Web Development')).toBeInTheDocument();
    });

    expect(coursesService.getAllCourses).toHaveBeenCalledTimes(2);
  });
});
