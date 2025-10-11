/**
 * Modern Dashboard Component
 * Complete redesigned dashboard integrating all new components
 */

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DashboardLayout } from "./DashboardLayout";
import { StatCards } from "./StatCards";
import { ProgressRing } from "./ProgressRing";
import { EnhancedCourseGrid } from "./EnhancedCourseCard";
import { ReferralDashboard } from "./ReferralDashboard";
import { WithdrawalRequest } from "./WithdrawalRequest";
import { WithdrawalHistory } from "./WithdrawalHistory";
import { PaymentManagement } from "./PaymentManagement";
import { UserSettings } from "./UserSettings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
	BookOpen,
	GraduationCap,
	TrendingUp,
	Users,
	DollarSign,
	AlertCircle,
	Sparkles,
	Target,
	RefreshCw,
	ArrowRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { authService } from "@/services/auth";
import { coursesService, Course, EnrichedCourse } from "@/services/courses";
import { paymentService, Enrollment } from "@/services/payments";
import { dashboardService } from "@/services/dashboard";
import { referralService, ReferralStats, Referral } from "@/services/referrals";
import { fadeInUp, staggerContainer } from "@/lib/animations";
import { NoCourses } from "@/components/ui/empty-state";
import { CourseCardSkeleton } from "@/components/ui/mini-loader";

export function ModernDashboard() {
	const [activeTab, setActiveTab] = useState("home");
	const [loading, setLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [userData, setUserData] = useState(null);
	const [courses, setCourses] = useState<Course[]>([]);
	const [enrolledCourses, setEnrolledCourses] = useState<EnrichedCourse[]>(
		[]
	);
	const [dashboardStats, setDashboardStats] = useState(null);
	const [paymentRequests, setPaymentRequests] = useState([]);
	const [referralStats, setReferralStats] = useState<ReferralStats | null>(
		null
	);
	const [referrals, setReferrals] = useState<Referral[]>([]);
	const { toast } = useToast();
	const navigate = useNavigate();

	const fetchDashboardData = useCallback(
		async (isRefresh = false) => {
			try {
				if (isRefresh) {
					setRefreshing(true);
				} else {
					setLoading(true);
				}
				setError(null);

				const token = localStorage.getItem("access_token");
				if (!token) {
					navigate("/login");
					return;
				}

				// Fetch user data from token
				const user = JSON.parse(localStorage.getItem("user") || "{}");
				setUserData(user);

				// Fetch data in parallel with fallback handling
				const [
					coursesData,
					enrollmentsData,
					statsData,
					paymentRequestsData,
					referralStatsData,
					referralsData,
				] = await Promise.allSettled([
					coursesService.getAllCourses(),
					paymentService.getMyEnrollments(),
					dashboardService.getDashboardStats(),
					paymentService.getMyPaymentRequests(),
					referralService.getReferralStats(),
					referralService.getReferrals(),
				]);

				// Extract data with fallbacks
				const courses =
					coursesData.status === "fulfilled" ? coursesData.value : [];
				const enrollments =
					enrollmentsData.status === "fulfilled"
						? enrollmentsData.value
						: [];
				const stats =
					statsData.status === "fulfilled"
						? statsData.value
						: {
								coursesEnrolled: 0,
								hoursLearned: 0,
								certificates: 0,
								currentStreak: 0,
								totalEarnings: 0,
								successfulReferrals: 0,
						  };
				const paymentRequests =
					paymentRequestsData.status === "fulfilled"
						? paymentRequestsData.value
						: [];
				const referralStats =
					referralStatsData.status === "fulfilled"
						? referralStatsData.value
						: {
								totalReferrals: 0,
								completedReferrals: 0,
								pendingReferrals: 0,
								totalEarnings: 0,
								referralCode:
									userData?.referralCode || "LOADING...",
						  };
				const referrals =
					referralsData.status === "fulfilled"
						? referralsData.value
						: [];

				setCourses(courses);
				setPaymentRequests(paymentRequests);
				setReferralStats(referralStats);
				setReferrals(referrals);

				// Map enrollments to course data with progress
				const enrichedEnrollments: EnrichedCourse[] = enrollments.map(
					(enrollment: Enrollment) => {
						const course = courses.find(
							(c) => c.id === enrollment.courseId
						);
						return {
							...course,
							enrollmentId: enrollment.id,
							enrolledAt: enrollment.enrolledAt,
							progress: enrollment.progress || 0,
							completedLessons: Math.floor(
								(enrollment.progress || 0) * 0.15
							), // Estimate based on progress
							totalLessons: 15, // Default total lessons
							nextLesson: "Continue Learning", // Default next lesson
						};
					}
				);

				setEnrolledCourses(enrichedEnrollments);
				setDashboardStats(stats);

				if (isRefresh) {
					toast({
						title: "Dashboard Updated",
						description: "Your dashboard data has been refreshed.",
					});
				}
			} catch (error) {
				console.error("Dashboard error:", error);
				setError(
					error.response?.data?.detail || "Failed to load dashboard"
				);
				toast({
					title: "Error",
					description: "Failed to load dashboard data",
					variant: "destructive",
				});
			} finally {
				setLoading(false);
				setRefreshing(false);
			}
		},
		[navigate, toast, userData?.referralCode]
	);

	useEffect(() => {
		fetchDashboardData();
	}, [fetchDashboardData]);

	const handleLogout = async () => {
		try {
			await authService.logout();
			toast({
				title: "Logged Out",
				description: "You have been successfully logged out.",
			});
			navigate("/");
		} catch (error) {
			console.error("Logout error:", error);
		}
	};

	const handleEnrollCourse = async (courseId: string) => {
		try {
			const isEnrolled = await paymentService.checkEnrollment(courseId);
			if (isEnrolled) {
				toast({
					title: "Already Enrolled",
					description: "You are already enrolled in this course!",
				});
				return;
			}
			navigate(`/payment?courseId=${courseId}`);
		} catch (error) {
			console.error("Enrollment check error:", error);
			navigate(`/payment?courseId=${courseId}`);
		}
	};

	const handleContinueCourse = (courseId: string) => {
		navigate(`/course/${courseId}`);
	};

	const handleViewCourseDetails = (courseId: string) => {
		navigate(`/course/${courseId}`);
	};

	// Prepare stat cards data
	const statCardsData = dashboardStats
		? [
				{
					title: "Enrolled Courses",
					value: dashboardStats.enrolledCourses || 0,
					icon: BookOpen,
					gradient: "primary" as const,
				},
				{
					title: "Completed",
					value: dashboardStats.completedCourses || 0,
					icon: GraduationCap,
					gradient: "success" as const,
				},
				{
					title: "Total Earnings",
					value:
						(dashboardStats.totalEarnings || 0) +
						(referralStats?.totalEarnings || 0),
					prefix: "",
					suffix: " ETB",
					icon: DollarSign,
					gradient: "warning" as const,
				},
				{
					title: "Referrals",
					value: referralStats?.totalReferrals || 0,
					icon: Users,
					gradient: "ocean" as const,
				},
		  ]
		: [];

	// Home Tab Content
	const renderHomeTab = () => (
		<motion.div
			variants={staggerContainer}
			initial="hidden"
			animate="visible"
			className="space-y-8"
		>
			{/* Welcome Header */}
			<motion.div
				variants={fadeInUp}
				className="flex sm:flex-row flex-col sm:justify-between sm:items-start lg:items-center gap-4 space-y-4 sm:space-y-0"
			>
				<div className="flex-1">
					<h1 className="mb-2 font-bold text-2xl sm:text-3xl md:text-4xl leading-tight">
						Welcome back,{" "}
						<span className="text-primary">
							{userData?.fullName?.split(" ")[0] || "Student"}
						</span>
						! 👋
					</h1>
					<p className="text-muted-foreground text-sm sm:text-base md:text-lg">
						Ready to continue your learning journey?
					</p>
				</div>
				<Button
					variant="outline"
					size="icon"
					onClick={() => fetchDashboardData(true)}
					disabled={refreshing}
					className="flex-shrink-0 self-start sm:self-auto"
				>
					<RefreshCw
						className={`h-4 w-4 sm:h-5 sm:w-5 ${
							refreshing ? "animate-spin" : ""
						}`}
					/>
				</Button>
			</motion.div>

			{/* Stat Cards */}
			<StatCards stats={statCardsData} isLoading={!dashboardStats} />

			{/* Main Content - Focus on Learning */}
			<div className="space-y-8">
				{/* Continue Learning Section */}
				{enrolledCourses.length > 0 ? (
					<Card className="glass">
						<CardHeader className="pb-4">
							<CardTitle className="flex items-center gap-2 text-lg sm:text-xl md:text-2xl">
								<Sparkles className="flex-shrink-0 w-5 sm:w-6 h-5 sm:h-6 text-primary" />
								Continue Learning
							</CardTitle>
						</CardHeader>
						<CardContent className="pt-0">
							<EnhancedCourseGrid
								courses={enrolledCourses.slice(0, 6)}
								variant="enrolled"
								onContinue={handleContinueCourse}
								onViewDetails={handleViewCourseDetails}
								paymentRequests={paymentRequests}
							/>
							{enrolledCourses.length > 6 && (
								<div className="mt-6 text-center">
									<Button
										variant="outline"
										onClick={() => setActiveTab("enrolled")}
										className="w-full sm:w-auto"
									>
										View All My Courses (
										{enrolledCourses.length})
										<ArrowRight className="ml-2 w-4 h-4" />
									</Button>
								</div>
							)}
						</CardContent>
					</Card>
				) : (
					// No Courses Empty State
					<NoCourses
						onBrowseCourses={() => setActiveTab("courses")}
					/>
				)}

				{/* Quick Actions Section */}
				<div className="gap-4 sm:gap-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
					{/* Browse Courses Card */}
					<Card
						className="transition-all duration-200 cursor-pointer hover-lift"
						onClick={() => setActiveTab("courses")}
					>
						<CardContent className="p-4 sm:p-6 text-center">
							<div className="flex justify-center items-center bg-blue-100 mx-auto mb-3 sm:mb-4 rounded-xl w-10 sm:w-12 h-10 sm:h-12 text-blue-600">
								<BookOpen className="w-5 sm:w-6 h-5 sm:h-6" />
							</div>
							<h3 className="mb-2 font-semibold text-sm sm:text-base">
								Browse Courses
							</h3>
							<p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
								Discover new skills and advance your career
							</p>
						</CardContent>
					</Card>

					{/* Refer Friends Card */}
					<Card
						className="transition-all duration-200 cursor-pointer hover-lift"
						onClick={() => setActiveTab("refer")}
					>
						<CardContent className="p-4 sm:p-6 text-center">
							<div className="flex justify-center items-center bg-green-100 mx-auto mb-3 sm:mb-4 rounded-xl w-10 sm:w-12 h-10 sm:h-12 text-green-600">
								<Users className="w-5 sm:w-6 h-5 sm:h-6" />
							</div>
							<h3 className="mb-2 font-semibold text-sm sm:text-base">
								Refer Friends
							</h3>
							<p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
								Earn rewards by sharing with friends
							</p>
						</CardContent>
					</Card>

					{/* Earnings Card */}
					<Card
						className="sm:col-span-2 lg:col-span-1 transition-all duration-200 cursor-pointer hover-lift"
						onClick={() => setActiveTab("withdrawals")}
					>
						<CardContent className="p-4 sm:p-6 text-center">
							<div className="flex justify-center items-center bg-orange-100 mx-auto mb-3 sm:mb-4 rounded-xl w-10 sm:w-12 h-10 sm:h-12 text-orange-600">
								<DollarSign className="w-5 sm:w-6 h-5 sm:h-6" />
							</div>
							<h3 className="mb-2 font-semibold text-sm sm:text-base">
								Manage Earnings
							</h3>
							<p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
								Track and withdraw your earnings
							</p>
						</CardContent>
					</Card>
				</div>
			</div>
		</motion.div>
	);

	// Courses Tab Content
	const renderCoursesTab = () => (
		<motion.div
			key="courses"
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0, y: -20 }}
			className="space-y-6"
		>
			<div className="space-y-2">
				<h2 className="font-bold text-xl sm:text-2xl md:text-3xl">
					Available Courses
				</h2>
				<p className="text-muted-foreground text-sm sm:text-base">
					Explore our expert-led courses
				</p>
			</div>
			{loading ? (
				<div className="gap-4 sm:gap-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
					{Array.from({ length: 6 }).map((_, index) => (
						<CourseCardSkeleton key={index} />
					))}
				</div>
			) : (
				<EnhancedCourseGrid
					courses={courses}
					variant="default"
					onEnroll={handleEnrollCourse}
					onViewDetails={handleViewCourseDetails}
				/>
			)}
		</motion.div>
	);

	// My Courses Tab Content
	const renderEnrolledTab = () => (
		<motion.div
			key="enrolled"
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0, y: -20 }}
			className="space-y-6"
		>
			<div className="space-y-2">
				<h2 className="font-bold text-xl sm:text-2xl md:text-3xl">
					My Courses
				</h2>
				<p className="text-muted-foreground text-sm sm:text-base">
					{enrolledCourses.length} course
					{enrolledCourses.length !== 1 ? "s" : ""} in progress
				</p>
			</div>
			{enrolledCourses.length > 0 ? (
				<EnhancedCourseGrid
					courses={enrolledCourses}
					variant="enrolled"
					onContinue={handleContinueCourse}
					onViewDetails={handleViewCourseDetails}
					paymentRequests={paymentRequests}
				/>
			) : (
				<NoCourses onBrowseCourses={() => setActiveTab("courses")} />
			)}
		</motion.div>
	);

	// Refer Friends Tab Content
	const renderReferTab = () => {
		// Use actual referral data from referral service
		const referralCode =
			referralStats?.referralCode ||
			userData?.referralCode ||
			"LOADING...";
		const totalEarnings = referralStats?.totalEarnings || 0;
		const pendingEarnings = referralStats?.pendingReferrals * 100 || 0; // Assuming 100 ETB per pending referral
		const totalReferrals = referralStats?.totalReferrals || 0;
		const completedReferrals = referralStats?.completedReferrals || 0;

		// Transform referrals data to match component interface
		const transformedReferrals = referrals.map((referral) => ({
			id: referral.id,
			referredUserName: referral.name || referral.email.split("@")[0],
			status: referral.status as "pending" | "completed",
			rewardEarned: referral.rewardEarned,
			createdAt: referral.dateReferred,
			completedAt: referral.completedAt,
		}));

		return (
			<motion.div
				key="refer"
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				exit={{ opacity: 0, y: -20 }}
			>
				<ReferralDashboard
					referralCode={referralCode}
					totalEarnings={totalEarnings}
					pendingEarnings={pendingEarnings}
					totalReferrals={totalReferrals}
					completedReferrals={completedReferrals}
					referrals={transformedReferrals}
					rewardPerReferral={100}
				/>
			</motion.div>
		);
	};

	// Withdrawals Tab Content
	const renderWithdrawalsTab = () => (
		<motion.div
			key="withdrawals"
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0, y: -20 }}
			className="space-y-6"
		>
			<div className="space-y-2">
				<h2 className="font-bold text-xl sm:text-2xl md:text-3xl">
					Withdrawals
				</h2>
				<p className="text-muted-foreground text-sm sm:text-base">
					Manage your earnings withdrawals
				</p>
			</div>
			<div className="gap-4 sm:gap-6 grid grid-cols-1 lg:grid-cols-2">
				<WithdrawalRequest />
				<WithdrawalHistory />
			</div>
		</motion.div>
	);

	// // Payment Management Tab Content
	// const renderPaymentsTab = () => (
	// 	<motion.div
	// 		key="payments"
	// 		initial={{ opacity: 0, y: 20 }}
	// 		animate={{ opacity: 1, y: 0 }}
	// 		exit={{ opacity: 0, y: -20 }}
	// 	>
	// 		<PaymentManagement />
	// 	</motion.div>
	// );

	// Settings Tab Content
	const renderSettingsTab = () => (
		<motion.div
			key="settings"
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0, y: -20 }}
		>
			<UserSettings />
		</motion.div>
	);

	if (loading) {
		return (
			<div className="flex justify-center items-center p-4 min-h-screen">
				<div className="space-y-4 sm:space-y-6 w-full max-w-sm text-center">
					<motion.div
						animate={{ rotate: 360 }}
						transition={{
							duration: 1,
							repeat: Infinity,
							ease: "linear",
						}}
					>
						<BookOpen className="mx-auto w-10 sm:w-12 md:w-16 h-10 sm:h-12 md:h-16 text-primary" />
					</motion.div>
					<div className="space-y-2">
						<p className="font-medium text-sm sm:text-base md:text-lg">
							Loading your dashboard...
						</p>
						<p className="text-muted-foreground text-xs sm:text-sm">
							Getting your latest data
						</p>
					</div>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex justify-center items-center p-4 min-h-screen">
				<Card className="w-full max-w-md">
					<CardContent className="pt-6">
						<Alert variant="destructive">
							<AlertCircle className="w-4 h-4" />
							<AlertDescription>{error}</AlertDescription>
						</Alert>
						<div className="flex gap-2 mt-4">
							<Button
								onClick={() => fetchDashboardData()}
								className="flex-1 text-sm"
							>
								Retry
							</Button>
							<Button
								variant="outline"
								onClick={() => navigate("/")}
								className="flex-1 text-sm"
							>
								Go Home
							</Button>
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<DashboardLayout
			activeTab={activeTab}
			onTabChange={setActiveTab}
			userName={userData?.fullName || "Student"}
			userEmail={userData?.email || ""}
			onLogout={handleLogout}
		>
			<AnimatePresence mode="wait">
				{activeTab === "home" && renderHomeTab()}
				{activeTab === "courses" && renderCoursesTab()}
				{activeTab === "enrolled" && renderEnrolledTab()}
				{activeTab === "refer" && renderReferTab()}
				{activeTab === "withdrawals" && renderWithdrawalsTab()}
				{/* {activeTab === "payments" && renderPaymentsTab()} */}
				{activeTab === "settings" && renderSettingsTab()}
			</AnimatePresence>
		</DashboardLayout>
	);
}
