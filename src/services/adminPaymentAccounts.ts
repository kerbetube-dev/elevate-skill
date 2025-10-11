/**
 * Admin Payment Accounts Service
 * Handles admin operations for managing payment accounts
 */

import axios from "axios";
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

export interface CreatePaymentAccountData {
	type: string;
	accountName: string;
	account_number: string;
	bankName?: string;
	instructions?: string;
	qrCodeUrl?: string;
	isActive?: boolean;
	displayOrder?: number;
}

export interface UpdatePaymentAccountData {
	type?: string;
	accountName?: string;
	account_number?: string;
	bankName?: string;
	instructions?: string;
	qrCodeUrl?: string;
	isActive?: boolean;
	displayOrder?: number;
}

// ===================================
// Admin Payment Account Service
// ===================================

class AdminPaymentAccountService {
	private getAuthHeader() {
		const token = localStorage.getItem("adminToken");
		return {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		};
	}

	/**
	 * Get all payment accounts (including inactive)
	 */
	async getAllPaymentAccounts(): Promise<PaymentAccount[]> {
		try {
			const response = await axios.get(
				`${API_BASE_URL}/payment-accounts/?active_only=false`,
				this.getAuthHeader()
			);
			return response.data;
		} catch (error: any) {
			console.error("Error fetching payment accounts:", error);
			throw new Error(
				error.response?.data?.detail ||
					"Failed to fetch payment accounts"
			);
		}
	}

	/**
	 * Get a specific payment account
	 */
	async getPaymentAccountById(accountId: string): Promise<PaymentAccount> {
		try {
			const response = await axios.get(
				`${API_BASE_URL}/payment-accounts/${accountId}`,
				this.getAuthHeader()
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
	 * Create a new payment account
	 */
	async createPaymentAccount(
		data: CreatePaymentAccountData
	): Promise<PaymentAccount> {
		try {
			const response = await axios.post(
				`${API_BASE_URL}/payment-accounts/`,
				data,
				this.getAuthHeader()
			);
			return response.data;
		} catch (error: any) {
			console.error("Error creating payment account:", error);
			throw new Error(
				error.response?.data?.detail ||
					"Failed to create payment account"
			);
		}
	}

	/**
	 * Update a payment account
	 */
	async updatePaymentAccount(
		accountId: string,
		data: UpdatePaymentAccountData
	): Promise<PaymentAccount> {
		try {
			const response = await axios.put(
				`${API_BASE_URL}/payment-accounts/${accountId}`,
				data,
				this.getAuthHeader()
			);
			return response.data;
		} catch (error: any) {
			console.error("Error updating payment account:", error);
			throw new Error(
				error.response?.data?.detail ||
					"Failed to update payment account"
			);
		}
	}

	/**
	 * Delete a payment account
	 */
	async deletePaymentAccount(accountId: string): Promise<void> {
		try {
			await axios.delete(
				`${API_BASE_URL}/payment-accounts/${accountId}`,
				this.getAuthHeader()
			);
		} catch (error: any) {
			console.error("Error deleting payment account:", error);
			throw new Error(
				error.response?.data?.detail ||
					"Failed to delete payment account"
			);
		}
	}

	/**
	 * Toggle payment account active status
	 */
	async toggleAccountStatus(
		accountId: string,
		isActive: boolean
	): Promise<PaymentAccount> {
		return this.updatePaymentAccount(accountId, { isActive });
	}

	/**
	 * Get payment type options
	 */
	getPaymentTypeOptions(): string[] {
		return [
			"CBE",
			"TeleBirr",
			"Commercial Bank",
			"Awash Bank",
			"Dashen Bank",
			"Abyssinia Bank",
			"Other",
		];
	}
}

export const adminPaymentAccountService = new AdminPaymentAccountService();
export default adminPaymentAccountService;
