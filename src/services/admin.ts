import axios from "axios";
import { handleApiError } from "./api";
import { env } from "@/config/env";

// API Configuration
const API_BASE_URL = env.API_BASE_URL;

// Utility function to get full image URL
export const getImageUrl = (imagePath: string) => {
	if (!imagePath) return null;
	// If it's already a full URL, return as is
	if (imagePath.startsWith("http")) return imagePath;

	// Handle backend uploaded images
	if (imagePath.startsWith("/uploads/")) {
		return `${API_BASE_URL}${imagePath}`;
	}

	// Handle frontend assets - convert /src/assets/ to /src/assets/ for Vite
	if (imagePath.startsWith("/src/assets/")) {
		return imagePath;
	}

	// Default: prepend the API base URL
	return `${API_BASE_URL}${imagePath}`;
};

// Create axios instance for admin API calls
const adminApi = axios.create({
	baseURL: `${API_BASE_URL}/admin`,
	headers: {
		"Content-Type": "application/json",
	},
});

// Add request interceptor to include auth token
adminApi.interceptors.request.use((config) => {
	const token = localStorage.getItem("adminToken");
	if (token) {
		config.headers.Authorization = `Bearer ${token}`;
	}
	return config;
});

// Add response interceptor to handle auth errors
adminApi.interceptors.response.use(
	(response) => response,
	(error) => {
		if (error.response?.status === 401) {
			// Token expired or invalid, redirect to login
			localStorage.removeItem("adminToken");
			localStorage.removeItem("adminUser");
			window.location.href = "/admin/login";
		}
		return Promise.reject(error);
	}
);

export interface AdminLoginRequest {
	email: string;
	password: string;
}

export interface AdminLoginResponse {
	access_token: string;
	token_type: string;
	user: {
		id: string;
		email: string;
		fullName: string;
		role: string;
		referralCode: string;
		created_at: string;
	};
}

export interface PaymentRequest {
	id: string;
	userId: string;
	courseId: string;
	paymentAccountId: string;
	amount: number;
	transactionScreenshotUrl?: string;
	transactionReference?: string;
	status: "pending" | "approved" | "rejected";
	admin_notes?: string;
	created_at: string;
	updated_at: string;
	approvedAt?: string;
	approvedBy?: string;
	rejection_reason?: string;
	userName: string;
	userEmail: string;
	courseTitle: string;
	paymentAccountName?: string;
	paymentaccount_type?: string;
}

export interface PaymentApprovalRequest {
	status: "approved" | "rejected";
	admin_notes?: string;
	rejection_reason?: string;
}

export interface AdminStats {
	pendingPayments: number;
	approvedPayments: number;
	rejectedPayments: number;
	totalPayments: number;
	totalUsers: number;
	activeUsers: number;
	inactiveUsers: number;
}

export interface User {
	id: string;
	email: string;
	fullName: string;
	role: string;
	referralCode: string;
	created_at: string;
	isActive?: boolean;
	totalEarnings?: number;
}

export interface UserDetails {
	user: User;
	enrollments: any[];
	paymentMethods: any[];
	referrals: any[];
}

export interface UsersResponse {
	users: User[];
	pagination: {
		page: number;
		limit: number;
		total: number;
		pages: number;
	};
}

export interface Course {
	isActive: any;
	id: string;
	title: string;
	description: string;
	instructor: string;
	price: number;
	duration: string;
	level: string;
	students: number;
	rating: number;
	image: string;
	outcomes?: string[];
	curriculum?: string[];
	created_at: string;
	updated_at: string;
}

export interface CourseDetails {
	course: Course;
	enrollments: any[];
	stats: {
		total_enrollments: number;
		active_enrollments: number;
		completed_enrollments: number;
		total_revenue: number;
	};
}

export interface CoursesResponse {
	courses: Course[];
	pagination: {
		page: number;
		limit: number;
		total: number;
		pages: number;
	};
}

export interface Coursecreated_ata {
	title: string;
	description: string;
	instructor: string;
	price: number;
	duration: string;
	level: string;
	image?: string;
	outcomes?: string[];
	curriculum?: string[];
}

export const adminService = {
	// Admin authentication
	async login(credentials: AdminLoginRequest): Promise<AdminLoginResponse> {
		try {
			const response = await axios.post(
				`${API_BASE_URL}/admin/login`,
				credentials
			);
			return response.data;
		} catch (error) {
			throw new Error(handleApiError(error));
		}
	},

	// Get admin profile
	async getProfile(): Promise<any> {
		const response = await adminApi.get("/profile");
		return response.data;
	},

	// Payment management
	async getPaymentRequests(status?: string): Promise<PaymentRequest[]> {
		const url = status ? `/payments?status=${status}` : "/payments";
		const response = await adminApi.get(url);
		return response.data;
	},

	async approvePaymentRequest(
		requestId: string,
		approval: PaymentApprovalRequest
	): Promise<void> {
		await adminApi.post(`/payments/${requestId}/approve`, approval);
	},

	async rejectPaymentRequest(
		requestId: string,
		approval: PaymentApprovalRequest
	): Promise<void> {
		await adminApi.post(`/payments/${requestId}/reject`, approval);
	},

	// Get admin statistics
	async getStats(): Promise<AdminStats> {
		const response = await adminApi.get("/stats");
		return response.data;
	},

	// User management
	async getUsers(
		page: number = 1,
		limit: number = 20,
		search?: string,
		status?: string
	): Promise<UsersResponse> {
		const params = new URLSearchParams({
			page: page.toString(),
			limit: limit.toString(),
		});
		if (search) params.append("search", search);
		if (status) params.append("status", status);

		const response = await adminApi.get(`/users?${params.toString()}`);
		return response.data;
	},

	async getUserDetails(userId: string): Promise<UserDetails> {
		const response = await adminApi.get(`/users/${userId}`);
		return response.data;
	},

	async updateUserStatus(userId: string, isActive: boolean): Promise<void> {
		await adminApi.put(`/users/${userId}/status`, { is_active: isActive });
	},

	async getUserEnrollments(userId: string): Promise<any[]> {
		const response = await adminApi.get(`/users/${userId}/enrollments`);
		return response.data.enrollments;
	},

	async getUserReferrals(userId: string): Promise<any[]> {
		const response = await adminApi.get(`/users/${userId}/referrals`);
		return response.data.referrals;
	},

	// Course management
	async getCourses(
		page: number = 1,
		limit: number = 20,
		search?: string,
		category?: string,
		status?: string
	): Promise<CoursesResponse> {
		const params = new URLSearchParams({
			page: page.toString(),
			limit: limit.toString(),
		});
		if (search) params.append("search", search);
		if (category) params.append("category", category);
		if (status) params.append("status", status);

		const response = await adminApi.get(`/courses?${params.toString()}`);
		return response.data;
	},

	async getCourseDetails(courseId: string): Promise<CourseDetails> {
		const response = await adminApi.get(`/courses/${courseId}`);
		return response.data;
	},

	async createCourse(
		courseData: Coursecreated_ata | FormData
	): Promise<Course> {
		const response = await adminApi.post("/courses", courseData, {
			headers: {
				"Content-Type":
					courseData instanceof FormData
						? "multipart/form-data"
						: "application/json",
			},
		});
		return response.data.course;
	},

	async updateCourse(
		courseId: string,
		courseData: Partial<Coursecreated_ata> | FormData
	): Promise<void> {
		await adminApi.put(`/courses/${courseId}`, courseData, {
			headers: {
				"Content-Type":
					courseData instanceof FormData
						? "multipart/form-data"
						: "application/json",
			},
		});
	},

	async deleteCourse(courseId: string): Promise<void> {
		await adminApi.delete(`/courses/${courseId}`);
	},

	async updateCourseStatus(
		courseId: string,
		isActive: boolean
	): Promise<void> {
		await adminApi.put(`/courses/${courseId}/status`, {
			is_active: isActive,
		});
	},

	async getCourseEnrollments(courseId: string): Promise<any[]> {
		const response = await adminApi.get(`/courses/${courseId}/enrollments`);
		return response.data.enrollments;
	},

	async getCourseCategories(): Promise<string[]> {
		const response = await adminApi.get("/courses/categories");
		return response.data.categories;
	},

	// Analytics
	async getAnalyticsOverview(): Promise<any> {
		const response = await adminApi.get("/analytics/overview");
		return response.data;
	},

	async getRevenueAnalytics(period: string = "30d"): Promise<any> {
		const response = await adminApi.get(
			`/analytics/revenue?period=${period}`
		);
		return response.data;
	},

	async getUserAnalytics(period: string = "30d"): Promise<any> {
		const response = await adminApi.get(
			`/analytics/users?period=${period}`
		);
		return response.data;
	},

	async getCourseAnalytics(): Promise<any> {
		const response = await adminApi.get("/analytics/courses");
		return response.data;
	},

	async getEnrollmentAnalytics(period: string = "30d"): Promise<any> {
		const response = await adminApi.get(
			`/analytics/enrollments?period=${period}`
		);
		return response.data;
	},

	async getReferralAnalytics(): Promise<any> {
		const response = await adminApi.get("/analytics/referrals");
		return response.data;
	},

	// Reports
	async getFinancialReport(
		startDate?: string,
		endDate?: string
	): Promise<any> {
		const params = new URLSearchParams();
		if (startDate) params.append("start_date", startDate);
		if (endDate) params.append("end_date", endDate);

		const response = await adminApi.get(
			`/reports/financial?${params.toString()}`
		);
		return response.data;
	},

	async getUserReport(startDate?: string, endDate?: string): Promise<any> {
		const params = new URLSearchParams();
		if (startDate) params.append("start_date", startDate);
		if (endDate) params.append("end_date", endDate);

		const response = await adminApi.get(
			`/reports/users?${params.toString()}`
		);
		return response.data;
	},

	async getCourseReport(startDate?: string, endDate?: string): Promise<any> {
		const params = new URLSearchParams();
		if (startDate) params.append("start_date", startDate);
		if (endDate) params.append("end_date", endDate);

		const response = await adminApi.get(
			`/reports/courses?${params.toString()}`
		);
		return response.data;
	},
};

export default adminService;
