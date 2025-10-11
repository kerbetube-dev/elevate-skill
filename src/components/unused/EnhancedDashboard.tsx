/**
 * Enhanced Dashboard with improved UX, loading states, and error handling
 * Uses the new loading components and error handling utilities
 */

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
	BookOpen,
	Home,
	User,
	CreditCard,
	Share2,
	GraduationCap,
	Clock,
	Award,
	TrendingUp,
	Settings,
	LogOut,
	Bell,
	Search,
	RefreshCw,
	DollarSign,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToastNotifications } from "../ui/CustomToast";
import { useErrorHandler } from "../../utils/errorHandler";
import {
	LoadingPage,
	LoadingCard,
	LoadingTable,
	RefreshButton,
} from "../ui/Loading";
import { CourseDetails } from "../CourseDetails";
import { ReferFriends } from "../ReferFriends";
import { WithdrawalRequest } from "../WithdrawalRequest";
import { WithdrawalHistory } from "../WithdrawalHistory";
import { coursesService, Course } from "@/services/courses";
import { userService } from "@/services/user";
import { dashboardService } from "@/services/dashboard";
import { authService } from "@/services/auth";
import {
	paymentService,
	Enrollment,
	PaymentRequest,
} from "@/services/payments";
import elevateSkillLogo from "@/assets/elevate-skill-logo.png";
import { getImageUrl } from "@/services/admin";

const EnhancedDashboard = () => {
	const [activeTab, setActiveTab] = useState("home");
	const [selectedCourse, setSelectedCourse] = useState<any>(null);
	const [courses, setCourses] = useState<Course[]>([]);
	const [enrolledCourses, setEnrolledCourses] = useState<Enrollment[]>([]);
	const [paymentRequests, setPaymentRequests] = useState<PaymentRequest[]>(
		[]
	);
	const [dashboardStats, setDashboardStats] = useState<any>(null);
	const [loading, setLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const { showSuccess, showError } = useToastNotifications();
	const { handleError } = useErrorHandler();
	const navigate = useNavigate();

	const fetchDashboardData = async (isRefresh = false) => {
		try {
			if (isRefresh) {
				setRefreshing(true);
			} else {
				setLoading(true);
			}
			setError(null);

			// Check if user is authenticated
			const token = localStorage.getItem("access_token");
			if (!token) {
				navigate("/login");
				return;
			}

			// Fetch data in parallel
			const [coursesData, enrollmentsData, paymentsData, statsData] =
				await Promise.all([
					coursesService.getAllCourses(),
					paymentService.getMyEnrollments(),
					paymentService.getMyPaymentRequests(),
					dashboardService.getDashboardStats(),
				]);

			setCourses(coursesData);
			setEnrolledCourses(enrollmentsData);
			setPaymentRequests(paymentsData);
			setDashboardStats(statsData);

			if (isRefresh) {
				showSuccess(
					"Dashboard Updated",
					"Your dashboard data has been refreshed."
				);
			}
		} catch (error) {
			const errorMessage = handleError(error);
			setError(errorMessage);
			showError("Failed to Load Dashboard", errorMessage);
		} finally {
			setLoading(false);
			setRefreshing(false);
		}
	};

	useEffect(() => {
		fetchDashboardData();
	}, []);

	const handleLogout = async () => {
		try {
			await authService.logout();
			showSuccess("Logged Out", "You have been successfully logged out.");
			navigate("/");
		} catch (error) {
			const errorMessage = handleError(error);
			showError("Logout Failed", errorMessage);
		}
	};

	const handleEnrollCourse = async (courseId: string) => {
		try {
			// Check if already enrolled
			const isEnrolled = await paymentService.checkEnrollment(courseId);
			if (isEnrolled) {
				showSuccess(
					"Already Enrolled",
					"You are already enrolled in this course!"
				);
				return;
			}

			// Redirect to payment page
			navigate(`/payment?courseId=${courseId}`);
		} catch (error) {
			console.error("Error checking enrollment:", error);
			// Still redirect to payment page if check fails
			navigate(`/payment?courseId=${courseId}`);
		}
	};

	const handleRefresh = () => {
		fetchDashboardData(true);
	};

	// Loading state
	if (loading) {
		return (
			<LoadingPage
				loading={true}
				loadingText="Loading your dashboard..."
				children={""}
			/>
		);
	}

	// Error state
	if (error) {
		return (
			<div className="flex justify-center items-center bg-gray-50 p-4 min-h-screen">
				<Card className="w-full max-w-md">
					<CardHeader>
						<CardTitle className="text-red-600 text-center">
							Error Loading Dashboard
						</CardTitle>
						<CardDescription className="text-center">
							{error}
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<Button onClick={handleRefresh} className="w-full">
							<RefreshCw className="mr-2 w-4 h-4" />
							Try Again
						</Button>
						<Button
							variant="outline"
							onClick={() => navigate("/")}
							className="w-full"
						>
							Go Home
						</Button>
					</CardContent>
				</Card>
			</div>
		);
	}

	const tabs = [
		{ id: "home", label: "Home", icon: Home },
		{ id: "courses", label: "Courses", icon: BookOpen },
		{ id: "enrolled", label: "My Courses", icon: GraduationCap },
		{ id: "refer", label: "Refer Friends", icon: Share2 },
		{ id: "withdrawals", label: "Withdrawals", icon: DollarSign },
	];

	const renderHomeTab = () => (
		<div className="space-y-6">
			{/* Welcome Section */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Home className="w-5 h-5" />
						Welcome Back!
					</CardTitle>
					<CardDescription>
						Here's what's happening with your learning journey
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="gap-4 grid grid-cols-1 md:grid-cols-3">
						<div className="bg-blue-50 p-4 rounded-lg text-center">
							<div className="font-bold text-blue-600 text-2xl">
								{dashboardStats?.totalCourses || 0}
							</div>
							<div className="text-blue-600 text-sm">
								Available Courses
							</div>
						</div>
						<div className="bg-green-50 p-4 rounded-lg text-center">
							<div className="font-bold text-green-600 text-2xl">
								{enrolledCourses.length}
							</div>
							<div className="text-green-600 text-sm">
								Enrolled Courses
							</div>
						</div>
						<div className="bg-purple-50 p-4 rounded-lg text-center">
							<div className="font-bold text-purple-600 text-2xl">
								{dashboardStats?.totalEarnings || 0}
							</div>
							<div className="text-purple-600 text-sm">
								Total Earnings
							</div>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Quick Actions */}
			<Card>
				<CardHeader>
					<CardTitle>Quick Actions</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="gap-4 grid grid-cols-1 md:grid-cols-2">
						<Button
							onClick={() => setActiveTab("courses")}
							className="flex flex-col justify-center items-center h-20"
						>
							<BookOpen className="mb-2 w-6 h-6" />
							Browse Courses
						</Button>
						<Button
							onClick={() => setActiveTab("refer")}
							variant="outline"
							className="flex flex-col justify-center items-center h-20"
						>
							<Share2 className="mb-2 w-6 h-6" />
							Refer Friends
						</Button>
					</div>
				</CardContent>
			</Card>

			{/* Recent Activity */}
			<Card>
				<CardHeader>
					<CardTitle>Recent Activity</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-3">
						{enrolledCourses.slice(0, 3).map((course, index) => (
							<div
								key={index}
								className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg"
							>
								<BookOpen className="w-5 h-5 text-blue-600" />
								<div className="flex-1">
									<div className="font-medium">
										{course.courseTitle}
									</div>
									<div className="text-gray-600 text-sm">
										Enrolled
									</div>
								</div>
								<Badge variant="secondary">Active</Badge>
							</div>
						))}
						{enrolledCourses.length === 0 && (
							<div className="py-8 text-gray-500 text-center">
								No recent activity. Start by enrolling in a
								course!
							</div>
						)}
					</div>
				</CardContent>
			</Card>
		</div>
	);

	const renderCoursesTab = () => (
		<div className="space-y-6">
			<div className="flex justify-between items-center">
				<h2 className="font-bold text-2xl">Available Courses</h2>
				<RefreshButton
					refreshing={refreshing}
					onRefresh={handleRefresh}
				>
					Refresh
				</RefreshButton>
			</div>

			<LoadingCard
				loading={refreshing}
				loadingText="Refreshing courses..."
			>
				<div className="gap-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
					{courses.map((course) => (
						<Card
							key={course.id}
							className="hover:shadow-lg overflow-hidden transition-shadow cursor-pointer"
							onClick={() => navigate(`/course/${course.id}`)}
						>
							<div className="relative aspect-video">
								{course.image ? (
									<img
										src={getImageUrl(course.image)}
										alt={course.title}
										className="w-full h-full object-cover"
										onError={(e) => {
											e.currentTarget.style.display =
												"none";
											e.currentTarget.nextElementSibling?.classList.remove(
												"hidden"
											);
										}}
									/>
								) : null}
								<div
									className={`w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center ${
										course.image ? "hidden" : ""
									}`}
								>
									<div className="text-white text-center">
										<BookOpen className="opacity-80 mx-auto mb-2 w-12 h-12" />
										<p className="opacity-90 text-sm">
											Course Preview
										</p>
									</div>
								</div>
							</div>
							<CardContent className="p-4">
								<CardTitle className="mb-2 text-lg">
									{course.title}
								</CardTitle>
								<CardDescription className="mb-4">
									{course.description}
								</CardDescription>
								<div className="flex justify-between items-center mb-4">
									<Badge variant="secondary">
										{course.level}
									</Badge>
									<span className="font-bold text-lg">
										${course.price}
									</span>
								</div>
								<Button
									onClick={(e) => {
										e.stopPropagation();
										navigate(`/course/${course.id}`);
									}}
									className="w-full"
								>
									View Details
								</Button>
							</CardContent>
						</Card>
					))}
				</div>
			</LoadingCard>
		</div>
	);

	const renderEnrolledTab = () => (
		<div className="space-y-6">
			<div className="flex justify-between items-center">
				<h2 className="font-bold text-2xl">My Courses</h2>
				<RefreshButton
					onRefresh={() => fetchDashboardData(true)}
					refreshing={refreshing}
				>
					Refresh
				</RefreshButton>
			</div>

			{/* Enrolled Courses */}
			<div className="space-y-4">
				<h3 className="font-semibold text-gray-700 text-lg">
					Enrolled Courses ({enrolledCourses.length})
				</h3>
				<LoadingCard
					loading={refreshing}
					loadingText="Loading your courses..."
				>
					{enrolledCourses.length > 0 ? (
						<div className="gap-4 grid grid-cols-1 md:grid-cols-2">
							{enrolledCourses.map((enrollment) => (
								<Card
									key={enrollment.id}
									className="hover:shadow-md transition-shadow"
								>
									<CardHeader>
										<div className="flex justify-between items-start">
											<div className="flex items-center gap-2">
												<GraduationCap className="w-5 h-5 text-primary" />
												<CardTitle className="text-base">
													{enrollment.courseTitle}
												</CardTitle>
											</div>
											<Badge
												variant="secondary"
												className="bg-green-100 text-green-700"
											>
												Enrolled
											</Badge>
										</div>
										<CardDescription className="mt-2 text-sm">
											{enrollment.courseDescription}
										</CardDescription>
									</CardHeader>
									<CardContent className="space-y-4">
										<div className="gap-2 grid grid-cols-2 text-sm">
											<div className="flex items-center gap-2">
												<Award className="w-4 h-4 text-gray-500" />
												<span className="text-gray-600">
													{enrollment.courseLevel}
												</span>
											</div>
											<div className="flex items-center gap-2">
												<Clock className="w-4 h-4 text-gray-500" />
												<span className="text-gray-600">
													{enrollment.courseDuration}
												</span>
											</div>
										</div>

										{/* Progress Bar */}
										<div className="space-y-2">
											<div className="flex justify-between items-center text-sm">
												<span className="text-gray-600">
													Progress
												</span>
												<span className="font-semibold text-primary">
													{enrollment.progress}%
												</span>
											</div>
											<Progress
												value={enrollment.progress}
												className="h-2"
											/>
										</div>

										{/* Enrolled Date */}
										<div className="text-gray-500 text-xs">
											Enrolled:{" "}
											{new Date(
												enrollment.enrolledAt
											).toLocaleDateString()}
										</div>

										<Button
											className="w-full"
											variant="default"
											onClick={() =>
												navigate(
													`/course/${enrollment.courseId}`
												)
											}
										>
											<BookOpen className="mr-2 w-4 h-4" />
											Continue Learning
										</Button>
									</CardContent>
								</Card>
							))}
						</div>
					) : (
						<Card>
							<CardContent className="py-12 text-center">
								<GraduationCap className="mx-auto mb-4 w-16 h-16 text-gray-300" />
								<h3 className="mb-2 font-semibold text-lg">
									No Enrolled Courses Yet
								</h3>
								<p className="mb-4 text-gray-600">
									Browse our courses and enroll to start
									learning!
								</p>
								<Button onClick={() => navigate("/")}>
									Browse Courses
								</Button>
							</CardContent>
						</Card>
					)}
				</LoadingCard>
			</div>

			{/* Payment Requests Section */}
			<div className="space-y-4">
				<h3 className="font-semibold text-gray-700 text-lg">
					Payment Requests ({paymentRequests.length})
				</h3>
				<LoadingCard
					loading={refreshing}
					loadingText="Loading payment requests..."
				>
					{paymentRequests.length > 0 ? (
						<div className="space-y-3">
							{paymentRequests.map((payment) => (
								<Card key={payment.id}>
									<CardContent className="p-4">
										<div className="flex justify-between items-center">
											<div className="flex-1">
												<div className="flex items-center gap-2 mb-2">
													<CreditCard className="w-4 h-4 text-gray-500" />
													<span className="font-medium">
														{payment.courseTitle}
													</span>
												</div>
												<div className="space-y-1 text-gray-600 text-sm">
													<div>
														Amount:{" "}
														<span className="font-semibold">
															{paymentService.formatAmount(
																payment.amount
															)}
														</span>
													</div>
													<div>
														Submitted:{" "}
														{new Date(
															payment.created_at
														).toLocaleDateString()}
													</div>
													{payment.transactionReference && (
														<div>
															Reference:{" "}
															<span className="font-mono text-xs">
																{
																	payment.transactionReference
																}
															</span>
														</div>
													)}
												</div>
											</div>
											<div className="text-right">
												<Badge
													className={paymentService.getStatusColor(
														payment.status
													)}
												>
													{payment.status
														.charAt(0)
														.toUpperCase() +
														payment.status.slice(1)}
												</Badge>
												{payment.status ===
													"pending" && (
													<div className="mt-2 text-gray-500 text-xs">
														Under Review
													</div>
												)}
												{payment.status ===
													"rejected" &&
													payment.rejection_reason && (
														<div className="mt-2 max-w-xs text-red-600 text-xs">
															{
																payment.rejection_reason
															}
														</div>
													)}
												{payment.status ===
													"approved" && (
													<div className="mt-2 text-green-600 text-xs">
														Approved!
													</div>
												)}
											</div>
										</div>
									</CardContent>
								</Card>
							))}
						</div>
					) : (
						<Card>
							<CardContent className="py-8 text-center">
								<CreditCard className="mx-auto mb-3 w-12 h-12 text-gray-300" />
								<p className="text-gray-600">
									No payment requests
								</p>
							</CardContent>
						</Card>
					)}
				</LoadingCard>
			</div>
		</div>
	);

	const renderWithdrawalsTab = () => (
		<div className="space-y-6">
			<div className="flex justify-between items-center">
				<h2 className="font-bold text-2xl">Withdrawals</h2>
				<RefreshButton
					refreshing={refreshing}
					onRefresh={handleRefresh}
				>
					Refresh
				</RefreshButton>
			</div>

			<div className="gap-6 grid grid-cols-1 lg:grid-cols-2">
				<WithdrawalRequest
					userEarnings={dashboardStats?.totalEarnings || 0}
					onSuccess={handleRefresh}
				/>
				<WithdrawalHistory onRefresh={handleRefresh} />
			</div>
		</div>
	);

	// Keep the old empty state
	const renderOldEmptyState = () => (
		<LoadingCard loading={false}>
			<div className="py-12 text-center">
				<BookOpen className="mx-auto mb-4 w-16 h-16 text-gray-400" />
				<h3 className="mb-2 font-medium text-gray-900 text-lg">
					No Enrolled Courses
				</h3>
				<p className="mb-4 text-gray-600">
					Start your learning journey by enrolling in a course.
				</p>
				<Button onClick={() => setActiveTab("courses")}>
					Browse Courses
				</Button>
			</div>
		</LoadingCard>
	);

	return (
		<div className="bg-gray-50 min-h-screen">
			{/* Header */}
			<header className="bg-white shadow-sm border-b">
				<div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
					<div className="flex justify-between items-center h-16">
						<div className="flex items-center gap-3">
							<img
								src={elevateSkillLogo}
								alt="Elevate Skil"
								className="h-8"
							/>
							<h1 className="font-bold text-xl">Elevate Skil</h1>
						</div>
						<div className="flex items-center gap-4">
							<Button variant="ghost" size="sm">
								<Bell className="w-4 h-4" />
							</Button>
							<Button variant="ghost" size="sm">
								<Settings className="w-4 h-4" />
							</Button>
							<Button
								variant="ghost"
								size="sm"
								onClick={handleLogout}
							>
								<LogOut className="w-4 h-4" />
							</Button>
						</div>
					</div>
				</div>
			</header>

			<div className="mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
				<div className="flex gap-8">
					{/* Sidebar */}
					<div className="space-y-2 w-64">
						{tabs.map((tab) => {
							const Icon = tab.icon;
							return (
								<Button
									key={tab.id}
									variant={
										activeTab === tab.id
											? "default"
											: "ghost"
									}
									className="justify-start w-full"
									onClick={() => setActiveTab(tab.id)}
								>
									<Icon className="mr-2 w-4 h-4" />
									{tab.label}
								</Button>
							);
						})}
					</div>

					{/* Main Content */}
					<div className="flex-1">
						{activeTab === "home" && renderHomeTab()}
						{activeTab === "courses" && renderCoursesTab()}
						{activeTab === "enrolled" && renderEnrolledTab()}
						{activeTab === "refer" && <ReferFriends />}
						{activeTab === "withdrawals" && renderWithdrawalsTab()}
					</div>
				</div>
			</div>
		</div>
	);
};

export default EnhancedDashboard;
