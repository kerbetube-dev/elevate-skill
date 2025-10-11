/**
 * Environment Status Component
 * Displays current environment configuration (for development/debugging)
 * Remove or disable in production
 */

import { env } from "@/config/env";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function EnvironmentStatus() {
	// Only show in development
	if (env.isProduction) {
		return null;
	}

	return (
		<Card className="right-4 bottom-4 z-50 fixed opacity-90 w-80">
			<CardHeader className="pb-2">
				<CardTitle className="flex items-center gap-2 text-sm">
					Environment Status
					<Badge
						variant={
							env.isDevelopment
								? "secondary"
								: env.isStaging
								? "outline"
								: "default"
						}
					>
						{env.ENVIRONMENT}
					</Badge>
				</CardTitle>
			</CardHeader>
			<CardContent className="pt-0">
				<div className="space-y-1 text-xs">
					<div>API: {env.API_BASE_URL}</div>
					<div>Frontend: {env.FRONTEND_URL}</div>
				</div>
			</CardContent>
		</Card>
	);
}
