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
import { WithdrawalRequest } from "../WithdrawalRequest";
import { WithdrawalHistory } from "../WithdrawalHistory";
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
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { authService } from "@/services/auth";
import { coursesService, Course, EnrichedCourse } from "@/services/courses";
import { paymentService, Enrollment } from "@/services/payments";
import { dashboardService } from "@/services/dashboard";
import { referralService, ReferralStats, Referral } from "@/services/referrals";
import { fadeInUp, staggerContainer } from "@/lib/animations";

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
		toast({
			title: "Continue Learning",
			description: "Course player will be implemented soon!",
		});
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
					trend: { value: 12, positive: true },
				},
				{
					title: "Completed",
					value: dashboardStats.completedCourses || 0,
					icon: GraduationCap,
					gradient: "success" as const,
					trend: { value: 8, positive: true },
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
					trend: { value: 5, positive: true },
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
				className="flex justify-between items-center"
			>
				<div>
					<h1 className="mb-2 font-bold text-4xl">
						Welcome back,{" "}
						{userData?.fullName?.split(" ")[0] || "Student"}! 👋
					</h1>
					<p className="text-muted-foreground text-lg">
						Ready to continue your learning journey?
					</p>
				</div>
				<Button
					variant="outline"
					size="icon"
					onClick={() => fetchDashboardData(true)}
					disabled={refreshing}
				>
					<RefreshCw
						className={`h-5 w-5 ${
							refreshing ? "animate-spin" : ""
						}`}
					/>
				</Button>
			</motion.div>

			{/* Stat Cards */}
			<StatCards stats={statCardsData} />

			{/* Main Content Grid */}
			<div className="gap-8 grid grid-cols-1 lg:grid-cols-3">
				{/* Left Column - 2/3 width */}
				<div className="space-y-8 lg:col-span-2">
					{/* Continue Learning Section */}
					{enrolledCourses.length > 0 && (
						<Card className="glass">
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Sparkles className="w-5 h-5 text-primary" />
									Continue Learning
								</CardTitle>
							</CardHeader>
							<CardContent>
								<EnhancedCourseGrid
									courses={enrolledCourses.slice(0, 3)}
									variant="enrolled"
									onContinue={handleContinueCourse}
									onViewDetails={handleViewCourseDetails}
									paymentRequests={paymentRequests}
								/>
							</CardContent>
						</Card>
					)}
				</div>

				{/* Right Column - 1/3 width */}
				<div className="space-y-8">
					{/* Overall Progress */}
					<Card className="glass">
						<CardHeader>
							<CardTitle className="flex justify-center items-center gap-2">
								<Target className="w-5 h-5 text-primary" />
								Overall Progress
							</CardTitle>
						</CardHeader>
						<CardContent className="flex justify-center py-6">
							<ProgressRing
								progress={
									enrolledCourses.length > 0
										? Math.round(
												enrolledCourses.reduce(
													(sum, course) =>
														sum +
														(course.progress || 0),
													0
												) / enrolledCourses.length
										  )
										: 0
								}
								size={160}
								color="url(#gradient)"
							/>
						</CardContent>
					</Card>

					{/* Recent Activity */}
					<Card className="glass">
						<CardHeader>
							<CardTitle className="flex justify-center items-center gap-2">
								<TrendingUp className="w-5 h-5 text-primary" />
								Recent Activity
							</CardTitle>
						</CardHeader>
						<CardContent>
							{enrolledCourses.length > 0 ? (
								<div className="space-y-4">
									{enrolledCourses
										.slice(0, 5)
										.map((course, index) => {
											// Check if this course has a pending payment request
											const pendingPayment =
												paymentRequests.some(
													(request) =>
														request.courseId ===
															course.id &&
														request.status ===
															"pending"
												);

											return (
												<div
													key={course.id}
													className="flex items-center gap-3 bg-white/5 p-3 border border-white/10 rounded-lg"
												>
													<div
														className={`w-2 h-2 rounded-full ${
															pendingPayment
																? "bg-yellow-500"
																: "bg-primary"
														}`}
													/>
													<div className="flex-1">
														<p className="font-medium text-sm">
															{course.title}
														</p>
														<p className="text-muted-foreground text-xs">
															{pendingPayment
																? "Payment pending approval"
																: `${
																		course.progress ||
																		0
																  }% completed`}
														</p>
													</div>
													<div className="text-muted-foreground text-xs">
														{course.enrolledAt
															? new Date(
																	course.enrolledAt
															  ).toLocaleDateString()
															: "Recently"}
													</div>
												</div>
											);
										})}
								</div>
							) : (
								<div className="py-8 text-muted-foreground text-center">
									<BookOpen className="opacity-50 mx-auto mb-4 w-12 h-12" />
									<p>No recent activity</p>
									<p className="text-sm">
										Enroll in courses to see your progress
										here
									</p>
								</div>
							)}
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
			<div>
				<h2 className="mb-2 font-bold text-3xl">Available Courses</h2>
				<p className="text-muted-foreground">
					Explore our expert-led courses
				</p>
			</div>
			<EnhancedCourseGrid
				courses={courses}
				variant="default"
				onEnroll={handleEnrollCourse}
				onViewDetails={handleViewCourseDetails}
			/>
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
			<div>
				<h2 className="mb-2 font-bold text-3xl">My Courses</h2>
				<p className="text-muted-foreground">
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
				<Card className="p-12">
					<div className="space-y-4 text-center">
						<GraduationCap className="opacity-50 mx-auto w-16 h-16 text-muted-foreground" />
						<h3 className="font-semibold text-xl">
							No Courses Yet
						</h3>
						<p className="mx-auto max-w-md text-muted-foreground">
							You haven't enrolled in any courses yet. Explore our
							available courses and start learning today!
						</p>
						<Button
							variant="gradient"
							onClick={() => setActiveTab("courses")}
						>
							<BookOpen className="mr-2 w-4 h-4" />
							Browse Courses
						</Button>
					</div>
				</Card>
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
			<div>
				<h2 className="mb-2 font-bold text-3xl">Withdrawals</h2>
				<p className="text-muted-foreground">
					Manage your earnings withdrawals
				</p>
			</div>
			<div className="gap-6 grid grid-cols-1 lg:grid-cols-2">
				<WithdrawalRequest />
				<WithdrawalHistory />
			</div>
		</motion.div>
	);

	if (loading) {
		return (
			<div className="flex justify-center items-center min-h-screen">
				<div className="space-y-4 text-center">
					<motion.div
						animate={{ rotate: 360 }}
						transition={{
							duration: 1,
							repeat: Infinity,
							ease: "linear",
						}}
					>
						<BookOpen className="mx-auto w-16 h-16 text-primary" />
					</motion.div>
					<p className="text-muted-foreground text-lg">
						Loading your dashboard...
					</p>
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
								className="flex-1"
							>
								Retry
							</Button>
							<Button
								variant="outline"
								onClick={() => navigate("/")}
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
			</AnimatePresence>
		</DashboardLayout>
	);
}
