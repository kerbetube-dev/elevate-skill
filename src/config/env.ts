/**
 * Environment Configuration
 * Centralized configuration for API URLs and environment-specific settings
 */

// Default values for development
const DEFAULT_CONFIG = {
	API_BASE_URL: "http://localhost:8000",
	FRONTEND_URL: "http://localhost:5173",
	ENVIRONMENT: "development",
	APP_NAME: "Elevate Skill",
	APP_VERSION: "1.0.0",
	APP_DESCRIPTION: "Transform your career with expert-led online courses",
	ENABLE_DEBUG: "true",
	ENABLE_ANALYTICS: "false",
	ENABLE_ERROR_REPORTING: "false",
	LOG_LEVEL: "debug",
	API_TIMEOUT: "30000",
	TOAST_DURATION: "5000",
	REFERRAL_CODE_LENGTH: "8",
	REFERRAL_REWARD_AMOUNT: "100",
	REFERRAL_BASE_URL: "http://localhost:5173/register?ref=",
} as const;

// Get environment variables with fallbacks
const getEnvVar = (key: keyof typeof DEFAULT_CONFIG): string => {
	// Try to get from Vite environment variables
	const viteKey = `VITE_${key}` as keyof ImportMetaEnv;
	const envValue = import.meta.env[viteKey];

	if (envValue) {
		return envValue;
	}

	// Fallback to default
	return DEFAULT_CONFIG[key];
};

// Helper functions for type conversion
const getBooleanEnv = (key: keyof typeof DEFAULT_CONFIG): boolean => {
	return getEnvVar(key).toLowerCase() === "true";
};

const getNumberEnv = (key: keyof typeof DEFAULT_CONFIG): number => {
	return parseInt(getEnvVar(key), 10);
};

// Export configuration object
export const env = {
	// Core URLs
	API_BASE_URL: getEnvVar("API_BASE_URL"),
	FRONTEND_URL: getEnvVar("FRONTEND_URL"),
	ENVIRONMENT: getEnvVar("ENVIRONMENT"),

	// App Information
	APP_NAME: getEnvVar("APP_NAME"),
	APP_VERSION: getEnvVar("APP_VERSION"),
	APP_DESCRIPTION: getEnvVar("APP_DESCRIPTION"),

	// Feature Flags
	ENABLE_DEBUG: getBooleanEnv("ENABLE_DEBUG"),
	ENABLE_ANALYTICS: getBooleanEnv("ENABLE_ANALYTICS"),
	ENABLE_ERROR_REPORTING: getBooleanEnv("ENABLE_ERROR_REPORTING"),

	// Settings
	LOG_LEVEL: getEnvVar("LOG_LEVEL"),
	API_TIMEOUT: getNumberEnv("API_TIMEOUT"),
	TOAST_DURATION: getNumberEnv("TOAST_DURATION"),

	// Referral System
	REFERRAL_CODE_LENGTH: getNumberEnv("REFERRAL_CODE_LENGTH"),
	REFERRAL_REWARD_AMOUNT: getNumberEnv("REFERRAL_REWARD_AMOUNT"),
	REFERRAL_BASE_URL: getEnvVar("REFERRAL_BASE_URL"),

	// Computed values
	get isDevelopment() {
		return this.ENVIRONMENT === "development";
	},

	get isProduction() {
		return this.ENVIRONMENT === "production";
	},

	get isStaging() {
		return this.ENVIRONMENT === "staging";
	},

	// Helper methods
	getFullApiUrl(endpoint: string): string {
		return `${this.API_BASE_URL}${
			endpoint.startsWith("/") ? endpoint : "/" + endpoint
		}`;
	},

	getReferralUrl(code: string): string {
		return `${this.REFERRAL_BASE_URL}${code}`;
	},

	log(
		level: "debug" | "info" | "warn" | "error",
		message: string,
		...args: unknown[]
	) {
		if (!this.ENABLE_DEBUG && level === "debug") return;

		const logMethod = console[level] || console.log;
		logMethod(`[${this.APP_NAME}] ${message}`, ...args);
	},
} as const;

// Type for environment configuration
export type EnvConfig = typeof env;

// Export default for convenient importing
export default env;
