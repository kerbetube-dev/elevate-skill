/**
 * Date utility functions for consistent date formatting
 */

export function formatDate(
	dateInput: string | Date | null | undefined
): string {
	if (!dateInput) return "N/A";

	try {
		const date = new Date(dateInput);

		// Check if date is valid
		if (isNaN(date.getTime())) {
			// If it's already a formatted string, return as is
			return typeof dateInput === "string" ? dateInput : "Invalid Date";
		}

		return date.toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
		});
	} catch (error) {
		// Fallback: return the original string if it exists
		return typeof dateInput === "string" ? dateInput : "Invalid Date";
	}
}

export function formatDateTime(
	dateInput: string | Date | null | undefined
): string {
	if (!dateInput) return "N/A";

	try {
		const date = new Date(dateInput);

		if (isNaN(date.getTime())) {
			return typeof dateInput === "string" ? dateInput : "Invalid Date";
		}

		return date.toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	} catch (error) {
		return typeof dateInput === "string" ? dateInput : "Invalid Date";
	}
}

export function isValidDate(
	dateInput: string | Date | null | undefined
): boolean {
	if (!dateInput) return false;

	try {
		const date = new Date(dateInput);
		return !isNaN(date.getTime());
	} catch {
		return false;
	}
}
