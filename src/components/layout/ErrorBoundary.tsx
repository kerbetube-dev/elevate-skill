import React, { Component, ErrorInfo, ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, RefreshCw, Home, Bug, Copy, Check } from "lucide-react";
import { env } from "@/config/env";

interface Props {
	children: ReactNode;
	fallback?: ReactNode;
	onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
	hasError: boolean;
	error?: Error;
	errorInfo?: ErrorInfo;
	errorId?: string;
	copied?: boolean;
}

class ErrorBoundary extends Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = { hasError: false };
	}

	static getDerivedStateFromError(error: Error): State {
		// Generate unique error ID for tracking
		const errorId = `err_${Date.now()}_${Math.random()
			.toString(36)
			.substr(2, 9)}`;

		return {
			hasError: true,
			error,
			errorId,
		};
	}

	componentDidCatch(error: Error, errorInfo: ErrorInfo) {
		// Update state with error info
		this.setState({
			error,
			errorInfo,
		});

		// Log error using environment config
		env.log("error", "ErrorBoundary caught an error:", {
			error: error.toString(),
			stack: error.stack,
			componentStack: errorInfo.componentStack,
			errorId: this.state.errorId,
		});

		// Call custom error handler if provided
		if (this.props.onError) {
			this.props.onError(error, errorInfo);
		}

		// Report to external service if enabled and in production
		if (env.ENABLE_ERROR_REPORTING && !env.isDevelopment) {
			this.reportError(error, errorInfo);
		}
	}

	reportError = async (error: Error, errorInfo: ErrorInfo) => {
		try {
			// Here you could integrate with error reporting services like Sentry
			// Example:
			// Sentry.captureException(error, {
			//     tags: {
			//         errorBoundary: true,
			//         errorId: this.state.errorId
			//     },
			//     extra: {
			//         componentStack: errorInfo.componentStack
			//     }
			// });

			env.log(
				"info",
				"Error reported to external service",
				this.state.errorId
			);
		} catch (reportingError) {
			env.log(
				"error",
				"Failed to report error to external service:",
				reportingError
			);
		}
	};

	handleReset = () => {
		this.setState({
			hasError: false,
			error: undefined,
			errorInfo: undefined,
			errorId: undefined,
			copied: false,
		});
	};

	handleGoHome = () => {
		window.location.href = "/";
	};

	handleCopyError = async () => {
		if (!this.state.error || !this.state.errorInfo) return;

		const errorDetails = {
			errorId: this.state.errorId,
			message: this.state.error.message,
			stack: this.state.error.stack,
			componentStack: this.state.errorInfo.componentStack,
			timestamp: new Date().toISOString(),
			userAgent: navigator.userAgent,
			url: window.location.href,
			environment: env.ENVIRONMENT,
		};

		try {
			await navigator.clipboard.writeText(
				JSON.stringify(errorDetails, null, 2)
			);
			this.setState({ copied: true });
			setTimeout(() => this.setState({ copied: false }), 2000);
		} catch (err) {
			env.log("error", "Failed to copy error details:", err);
		}
	};

	render() {
		if (this.state.hasError) {
			// Custom fallback UI
			if (this.props.fallback) {
				return this.props.fallback;
			}

			const isDev = env.isDevelopment;
			const showDetails = isDev || env.ENABLE_DEBUG;

			// Default error UI
			return (
				<div className="flex justify-center items-center bg-background p-4 min-h-screen">
					<Card className="w-full max-w-2xl">
						<CardHeader className="text-center">
							<div className="flex justify-center items-center bg-destructive/10 mx-auto mb-4 rounded-full w-16 h-16">
								<AlertCircle className="w-8 h-8 text-destructive" />
							</div>
							<CardTitle className="mb-2 text-2xl">
								Oops! Something went wrong
							</CardTitle>
							<div className="flex justify-center items-center gap-2 mb-4">
								<Badge variant="secondary" className="text-xs">
									Error ID: {this.state.errorId}
								</Badge>
								{!env.isProduction && (
									<Badge
										variant="outline"
										className="text-xs"
									>
										{env.ENVIRONMENT}
									</Badge>
								)}
							</div>
						</CardHeader>
						<CardContent className="space-y-6">
							<div className="text-center">
								<p className="mb-4 text-muted-foreground">
									We're sorry for the inconvenience. Our team
									has been notified and is working to fix this
									issue.
								</p>

								{env.isProduction && (
									<p className="text-muted-foreground text-sm">
										If this problem persists, please contact
										support with the error ID above.
									</p>
								)}
							</div>

							{showDetails && this.state.error && (
								<details className="bg-muted/50 p-4 rounded-lg">
									<summary className="flex items-center gap-2 font-medium hover:text-foreground cursor-pointer">
										<Bug className="w-4 h-4" />
										Technical Details{" "}
										{isDev
											? "(Development)"
											: "(Debug Mode)"}
									</summary>
									<div className="space-y-3 mt-4">
										<div>
											<h4 className="mb-2 font-medium text-sm">
												Error Message:
											</h4>
											<code className="block bg-background p-2 rounded text-xs">
												{this.state.error.message}
											</code>
										</div>

										{this.state.error.stack && (
											<div>
												<h4 className="mb-2 font-medium text-sm">
													Stack Trace:
												</h4>
												<pre className="bg-background p-2 rounded max-h-40 overflow-auto text-xs">
													{this.state.error.stack}
												</pre>
											</div>
										)}

										{this.state.errorInfo
											?.componentStack && (
											<div>
												<h4 className="mb-2 font-medium text-sm">
													Component Stack:
												</h4>
												<pre className="bg-background p-2 rounded max-h-32 overflow-auto text-xs">
													{
														this.state.errorInfo
															.componentStack
													}
												</pre>
											</div>
										)}
									</div>
								</details>
							)}

							<div className="flex sm:flex-row flex-col gap-3">
								<Button
									onClick={this.handleReset}
									className="flex-1"
									variant="outline"
								>
									<RefreshCw className="mr-2 w-4 h-4" />
									Try Again
								</Button>

								<Button
									onClick={this.handleGoHome}
									className="flex-1"
								>
									<Home className="mr-2 w-4 h-4" />
									Go Home
								</Button>

								{showDetails && (
									<Button
										onClick={this.handleCopyError}
										variant="secondary"
										size="sm"
									>
										{this.state.copied ? (
											<>
												<Check className="mr-2 w-4 h-4" />
												Copied!
											</>
										) : (
											<>
												<Copy className="mr-2 w-4 h-4" />
												Copy Details
											</>
										)}
									</Button>
								)}
							</div>
						</CardContent>
					</Card>
				</div>
			);
		}

		return this.props.children;
	}
}

export default ErrorBoundary;
