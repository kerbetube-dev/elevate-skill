/**
 * Environment Configuration
 * Centralized configuration for API URLs and environment-specific settings
 */

// Default values for development
const DEFAULT_CONFIG = {
	API_BASE_URL: "http://localhost:8000",
	FRONTEND_URL: "http://localhost:8080",
	ENVIRONMENT: "development",
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

// Export configuration object
export const env = {
	API_BASE_URL: getEnvVar("API_BASE_URL"),
	FRONTEND_URL: getEnvVar("FRONTEND_URL"),
	ENVIRONMENT: getEnvVar("ENVIRONMENT"),

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
} as const;

// Type for environment configuration
export type EnvConfig = typeof env;

// Export default for convenient importing
export default env;
