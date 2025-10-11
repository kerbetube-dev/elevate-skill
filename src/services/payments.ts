/**
 * Payment Services
 * Handles payment requests, file uploads, and enrollments
 */

import api from "./api";
import { env } from "@/config/env";

const API_BASE_URL = env.API_BASE_URL;

// ===================================
// Types
// ===================================

export interface PaymentAccount {
	id: string;
	type: string;
	accountName: string;
	account_number: string;
	bankName?: string;
	instructions?: string;
	qrCodeUrl?: string;
	isActive: boolean;
	displayOrder: number;
	created_at: string;
	updated_at: string;
}

export interface PaymentRequest {
	id: string;
	userId: string;
	courseId: string;
	paymentAccountId: string;
	amount: number;
	transactionScreenshotUrl: string;
	transactionReference?: string;
	status: "pending" | "approved" | "rejected";
	admin_notes?: string;
	rejection_reason?: string;
	approvedBy?: string;
	approvedAt?: string;
	created_at: string;
	updated_at: string;
	// Additional info
	userName?: string;
	userEmail?: string;
	courseTitle?: string;
	paymentAccountName?: string;
	paymentaccount_type?: string;
}

export interface Enrollment {
	id: string;
	userId: string;
	courseId: string;
	paymentRequestId?: string;
	enrolledAt: string;
	progress: number;
	completedAt?: string;
	// Course details
	courseTitle?: string;
	courseDescription?: string;
	courseLevel?: string;
	courseDuration?: string;
	coursePrice?: number;
}

export interface CreatePaymentRequestData {
	courseId: string;
	paymentAccountId: string;
	amount: number;
	transactionScreenshotUrl: string;
	transactionReference?: string;
}

export interface CreatePaymentRequestWithFile {
	courseId: string;
	paymentAccountId: string;
	transactionReference: string;
	transactionScreenshot: File;
}

// ===================================
// Payment Account Services
// ===================================

class PaymentService {
	/**
	 * Get all active payment accounts (for users)
	 */
	async getActivePaymentAccounts(): Promise<PaymentAccount[]> {
		try {
			const response = await api.get(
				`${API_BASE_URL}/payment-accounts/?active_only=true`
			);
			return response.data;
		} catch (error) {
			console.error("Error fetching payment accounts:", error);
			throw new Error(
				error.response?.data?.detail ||
					"Failed to fetch payment accounts"
			);
		}
	}

	/**
	 * Get payment accounts (alias for getActivePaymentAccounts)
	 */
	async getPaymentAccounts(): Promise<PaymentAccount[]> {
		return this.getActivePaymentAccounts();
	}

	/**
	 * Get a specific payment account
	 */
	async getPaymentAccountById(accountId: string): Promise<PaymentAccount> {
		try {
			const response = await api.get(
				`${API_BASE_URL}/payment-accounts/${accountId}`
			);
			return response.data;
		} catch (error: any) {
			console.error("Error fetching payment account:", error);
			throw new Error(
				error.response?.data?.detail ||
					"Failed to fetch payment account"
			);
		}
	}

	/**
	 * Upload transaction screenshot
	 */
	async uploadTransactionScreenshot(
		file: File
	): Promise<{ url: string; filename: string; message: string }> {
		try {
			const formData = new FormData();
			formData.append("file", file);

			const response = await api.post(
				`${API_BASE_URL}/payments/upload-screenshot`,
				formData,
				{
					headers: {
						"Content-Type": "multipart/form-data",
					},
				}
			);

			return response.data;
		} catch (error: any) {
			console.error("Error uploading screenshot:", error);
			throw new Error(
				error.response?.data?.detail || "Failed to upload screenshot"
			);
		}
	}

	/**
	 * Create a payment request
	 */
	async createPaymentRequest(
		data: CreatePaymentRequestData
	): Promise<PaymentRequest> {
		try {
			const response = await api.post(
				`${API_BASE_URL}/payments/requests`,
				data
			);
			return response.data;
		} catch (error: any) {
			console.error("Error creating payment request:", error);
			throw new Error(
				error.response?.data?.detail ||
					"Failed to create payment request"
			);
		}
	}

	/**
	 * Create a payment request with file upload
	 */
	async createPaymentRequestWithFile(
		data: CreatePaymentRequestWithFile
	): Promise<PaymentRequest> {
		try {
			// First upload the screenshot
			const uploadResult = await this.uploadTransactionScreenshot(
				data.transactionScreenshot
			);

			// Then create the payment request
			const paymentData: CreatePaymentRequestData = {
				courseId: data.courseId,
				paymentAccountId: data.paymentAccountId,
				amount: 0, // Will be set by backend based on course
				transactionScreenshotUrl: uploadResult.url,
				transactionReference: data.transactionReference,
			};

			return this.createPaymentRequest(paymentData);
		} catch (error: any) {
			console.error("Error creating payment request with file:", error);
			throw new Error(
				error.response?.data?.detail ||
					"Failed to create payment request"
			);
		}
	}

	/**
	 * Get my payment requests
	 */
	async getMyPaymentRequests(): Promise<PaymentRequest[]> {
		try {
			const response = await api.get(
				`${API_BASE_URL}/payments/requests/my`
			);
			return response.data;
		} catch (error: any) {
			console.error("Error fetching payment requests:", error);
			throw new Error(
				error.response?.data?.detail ||
					"Failed to fetch payment requests"
			);
		}
	}

	/**
	 * Get a specific payment request
	 */
	async getPaymentRequestById(requestId: string): Promise<PaymentRequest> {
		try {
			const response = await api.get(
				`${API_BASE_URL}/payments/requests/${requestId}`
			);
			return response.data;
		} catch (error: any) {
			console.error("Error fetching payment request:", error);
			throw new Error(
				error.response?.data?.detail ||
					"Failed to fetch payment request"
			);
		}
	}

	/**
	 * Get my enrollments (My Courses)
	 */
	async getMyEnrollments(): Promise<Enrollment[]> {
		try {
			const response = await api.get(
				`${API_BASE_URL}/payments/enrollments/my`
			);
			return response.data;
		} catch (error: any) {
			console.error("Error fetching enrollments:", error);
			throw new Error(
				error.response?.data?.detail || "Failed to fetch enrollments"
			);
		}
	}

	/**
	 * Check if enrolled in a course
	 */
	async checkEnrollment(courseId: string): Promise<boolean> {
		try {
			const response = await api.get(
				`${API_BASE_URL}/payments/enrollments/${courseId}/check`
			);
			return response.data.enrolled;
		} catch (error: any) {
			console.error("Error checking enrollment:", error);
			return false;
		}
	}

	/**
	 * Format amount for display
	 */
	formatAmount(amount: number): string {
		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: "ETB",
			minimumFractionDigits: 0,
			maximumFractionDigits: 2,
		})
			.format(amount)
			.replace("ETB", "ETB ");
	}

	/**
	 * Get status badge color
	 */
	getStatusColor(status: string): string {
		switch (status) {
			case "pending":
				return "bg-yellow-100 text-yellow-800";
			case "approved":
				return "bg-green-100 text-green-800";
			case "rejected":
				return "bg-red-100 text-red-800";
			default:
				return "bg-gray-100 text-gray-800";
		}
	}
}

export const paymentService = new PaymentService();
export default paymentService;
