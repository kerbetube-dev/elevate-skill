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
	Loader2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { CourseDetails } from "../CourseDetails";
import { ReferFriends } from "../ReferFriends";
import { coursesService, Course } from "@/services/courses";
import { userService } from "@/services/user";
import { dashboardService } from "@/services/dashboard";
import { authService } from "@/services/auth";
import elevateSkillLogo from "@/assets/elevate-skill-logo.png";
import digitalMarketingImg from "@/assets/digital-marketing.jpg";
import graphicsDesignImg from "@/assets/graphics-design.jpg";
import videoEditingImg from "@/assets/video-editing.jpg";
import englishCommunicationImg from "@/assets/english-communication.jpg";
import webDevelopmentImg from "@/assets/web-development.jpg";
import appDevelopmentImg from "@/assets/app-development.jpg";
import { getImageUrl } from "@/services/admin";

const Dashboard = () => {
	const [activeTab, setActiveTab] = useState("home");
	const [selectedCourse, setSelectedCourse] = useState<any>(null);
	const [courses, setCourses] = useState<Course[]>([]);
	const [enrolledCourses, setEnrolledCourses] = useState<any[]>([]);
	const [dashboardStats, setDashboardStats] = useState<any>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const navigate = useNavigate();

	useEffect(() => {
		const fetchDashboardData = async () => {
			try {
				setLoading(true);

				// Check if user is authenticated
				if (!authService.isAuthenticated()) {
					navigate("/login");
					return;
				}

				// Fetch courses (public data)
				const coursesData = await coursesService.getAllCourses();
				setCourses(coursesData);

				// Fetch user-specific data only if authenticated
				try {
					const [enrollmentsData, statsData] = await Promise.all([
						userService.getUserEnrollments(),
						dashboardService.getDashboardStats(),
					]);

					setEnrolledCourses(enrollmentsData);
					setDashboardStats(statsData);
				} catch (userErr) {
					console.warn("Failed to fetch user data:", userErr);
					// Set empty data for user-specific fields
					setEnrolledCourses([]);
					setDashboardStats({
						enrolledCourses: 0,
						totalHours: 0,
						certificates: 0,
						currentStreak: 0,
					});
				}
			} catch (err) {
				setError(
					err instanceof Error
						? err.message
						: "Failed to load dashboard data"
				);
				console.error("Error fetching dashboard data:", err);
			} finally {
				setLoading(false);
			}
		};

		fetchDashboardData();
	}, [navigate]);

	const menuItems = [
		{ id: "home", icon: Home, label: "Home" },
		{ id: "account", icon: User, label: "My Account" },
		{ id: "courses", icon: GraduationCap, label: "Course List" },
		{ id: "payment", icon: CreditCard, label: "Payment Method" },
		{ id: "referral", icon: Share2, label: "Refer Friends" },
	];

	const renderContent = () => {
		if (loading) {
			return (
				<div className="flex justify-center items-center py-20">
					<Loader2 className="w-8 h-8 animate-spin" />
					<span className="ml-2">Loading dashboard...</span>
				</div>
			);
		}

		if (error) {
			return (
				<div className="py-20 text-center">
					<p className="mb-4 text-red-500">
						Failed to load dashboard: {error}
					</p>
					<Button onClick={() => window.location.reload()}>
						Retry
					</Button>
				</div>
			);
		}

		switch (activeTab) {
			case "home":
				return (
					<div className="space-y-6">
						{/* Welcome Section */}
						<div className="bg-gradient-to-r from-primary to-accent p-6 rounded-2xl text-primary-foreground">
							<h2 className="mb-2 font-bold text-2xl">
								Welcome back, John! 👋
							</h2>
							<p className="opacity-90">
								Continue your learning journey where you left
								off
							</p>
						</div>

						{/* Stats Grid */}
						<div className="gap-4 grid grid-cols-1 md:grid-cols-4">
							<Card className="shadow-elegant border-0">
								<CardHeader className="pb-2">
									<CardDescription>
										Courses Enrolled
									</CardDescription>
									<CardTitle className="font-bold text-primary text-3xl">
										{dashboardStats?.enrolledCourses || 0}
									</CardTitle>
								</CardHeader>
							</Card>

							<Card className="shadow-elegant border-0">
								<CardHeader className="pb-2">
									<CardDescription>
										Hours Learned
									</CardDescription>
									<CardTitle className="font-bold text-primary text-3xl">
										{dashboardStats?.totalHours || 0}
									</CardTitle>
								</CardHeader>
							</Card>

							<Card className="shadow-elegant border-0">
								<CardHeader className="pb-2">
									<CardDescription>
										Certificates
									</CardDescription>
									<CardTitle className="font-bold text-primary text-3xl">
										{dashboardStats?.certificates || 0}
									</CardTitle>
								</CardHeader>
							</Card>

							<Card className="shadow-elegant border-0">
								<CardHeader className="pb-2">
									<CardDescription>
										Current Streak
									</CardDescription>
									<CardTitle className="font-bold text-primary text-3xl">
										{dashboardStats?.currentStreak || 0}
									</CardTitle>
								</CardHeader>
							</Card>
						</div>

						{/* Continue Learning */}
						<div>
							<h3 className="flex items-center gap-2 mb-4 font-semibold text-xl">
								<Clock className="w-5 h-5 text-primary" />
								Continue Learning
							</h3>
							<div className="gap-4 grid">
								{enrolledCourses.length > 0 ? (
									enrolledCourses.map((course) => (
										<Card
											key={course.id}
											className="shadow-elegant border-0"
										>
											<CardContent className="p-6">
												<div className="flex gap-4">
													<img
														src={
															course.image ||
															digitalMarketingImg
														}
														alt={course.title}
														className="rounded-lg w-20 h-20 object-cover"
													/>
													<div className="flex-1">
														<h4 className="mb-1 font-semibold text-lg">
															{course.title}
														</h4>
														<p className="mb-2 text-muted-foreground text-sm">
															Instructor:{" "}
															{course.instructor ||
																"TBA"}
														</p>
														<div className="space-y-2">
															<div className="flex justify-between text-sm">
																<span>
																	Progress
																</span>
																<span>
																	{course.progress ||
																		0}
																	%
																</span>
															</div>
															<Progress
																value={
																	course.progress ||
																	0
																}
																className="h-2"
															/>
															<p className="text-muted-foreground text-sm">
																{course.completedLessons ||
																	0}
																/
																{course.totalLessons ||
																	0}{" "}
																lessons
																completed
															</p>
														</div>
													</div>
													<div className="flex flex-col gap-2">
														<Button
															variant="hero"
															size="sm"
														>
															Continue
														</Button>
														<p className="text-muted-foreground text-xs text-center">
															Next:{" "}
															{course.nextLesson ||
																"Continue Learning"}
														</p>
													</div>
												</div>
											</CardContent>
										</Card>
									))
								) : (
									<Card className="shadow-elegant border-0">
										<CardContent className="p-6 text-center">
											<BookOpen className="opacity-50 mx-auto mb-4 w-12 h-12 text-muted-foreground" />
											<h4 className="mb-2 font-semibold text-lg">
												No enrolled courses yet
											</h4>
											<p className="mb-4 text-muted-foreground">
												Start your learning journey by
												enrolling in a course!
											</p>
											<Button
												variant="hero"
												onClick={() =>
													setActiveTab("courses")
												}
											>
												Browse Courses
											</Button>
										</CardContent>
									</Card>
								)}
							</div>
						</div>

						{/* Recommended Courses */}
						<div>
							<h3 className="flex items-center gap-2 mb-4 font-semibold text-xl">
								<TrendingUp className="w-5 h-5 text-primary" />
								Recommended for You
							</h3>
							<div className="gap-4 grid md:grid-cols-2">
								{courses.slice(0, 2).map((course) => (
									<Card
										key={course.id}
										className="shadow-elegant hover:shadow-glow border-0 transition-all duration-300"
									>
										<div className="relative">
											<img
												src={
													course.image ||
													digitalMarketingImg
												}
												alt={course.title}
												className="rounded-t-lg w-full h-32 object-cover"
											/>
											<Badge className="top-2 left-2 absolute bg-primary text-primary-foreground">
												{course.price} Birr
											</Badge>
										</div>
										<CardHeader className="pb-2">
											<CardTitle className="text-lg">
												{course.title}
											</CardTitle>
											<div className="flex items-center gap-4 text-muted-foreground text-sm">
												<span>{course.duration}</span>
												<span>★ {course.rating}</span>
												<span>
													{course.students} students
												</span>
											</div>
										</CardHeader>
										<CardContent>
											<Button
												variant="outline"
												className="w-full"
												onClick={() =>
													setSelectedCourse(course)
												}
											>
												View Course
											</Button>
										</CardContent>
									</Card>
								))}
							</div>
						</div>
					</div>
				);

			case "account":
				return (
					<div className="space-y-6">
						<h2 className="font-bold text-2xl">My Account</h2>
						<Card className="shadow-elegant border-0">
							<CardHeader>
								<CardTitle>Profile Information</CardTitle>
								<CardDescription>
									Manage your account details
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="gap-4 grid grid-cols-2">
									<div>
										<label className="font-medium text-sm">
											Full Name
										</label>
										<p className="text-muted-foreground">
											John Doe
										</p>
									</div>
									<div>
										<label className="font-medium text-sm">
											Email
										</label>
										<p className="text-muted-foreground">
											john@example.com
										</p>
									</div>
									<div>
										<label className="font-medium text-sm">
											Member Since
										</label>
										<p className="text-muted-foreground">
											January 2024
										</p>
									</div>
									<div>
										<label className="font-medium text-sm">
											Subscription
										</label>
										<Badge variant="secondary">
											Premium
										</Badge>
									</div>
								</div>
								<Button variant="hero">Edit Profile</Button>
							</CardContent>
						</Card>
					</div>
				);

			case "courses":
				if (selectedCourse) {
					return (
						<CourseDetails
							course={selectedCourse}
							onBack={() => setSelectedCourse(null)}
							onEnroll={() => {
								alert(
									"To complete enrollment and payment processing, please connect to Supabase for backend functionality."
								);
							}}
						/>
					);
				}

				return (
					<div className="space-y-6">
						<h2 className="font-bold text-2xl">Course List</h2>

						<div className="gap-4 grid md:grid-cols-2 lg:grid-cols-3">
							{courses.map((course) => (
								<Card
									key={course.id}
									className="shadow-elegant hover:shadow-glow border-0 transition-all duration-300 cursor-pointer"
									onClick={() =>
										navigate(`/course/${course.id}`)
									}
								>
									<div className="relative">
										{course.image ? (
											<img
												src={getImageUrl(course.image)}
												alt={course.title}
												className="rounded-t-lg w-full h-32 object-cover"
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
											className={`w-full h-32 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center rounded-t-lg ${
												course.image ? "hidden" : ""
											}`}
										>
											<div className="text-white text-center">
												<BookOpen className="opacity-80 mx-auto mb-2 w-8 h-8" />
												<p className="opacity-90 text-xs">
													Course Preview
												</p>
											</div>
										</div>
										<Badge className="top-2 left-2 absolute bg-primary text-primary-foreground">
											{course.price} Birr
										</Badge>
									</div>
									<CardHeader className="pb-2">
										<CardTitle className="text-lg">
											{course.title}
										</CardTitle>
										<div className="flex items-center gap-4 text-muted-foreground text-sm">
											<span>{course.duration}</span>
											<span>★ {course.rating}</span>
										</div>
									</CardHeader>
									<CardContent>
										<Button
											variant="hero"
											className="w-full"
											onClick={(e) => {
												e.stopPropagation();
												navigate(
													`/course/${course.id}`
												);
											}}
										>
											View Details
										</Button>
									</CardContent>
								</Card>
							))}
						</div>
					</div>
				);

			case "payment":
				return (
					<div className="py-12 text-center">
						<CreditCard className="mx-auto mb-4 w-16 h-16 text-gray-400" />
						<h3 className="mb-2 font-medium text-gray-900 text-lg">
							Payment Methods
						</h3>
						<p className="mb-4 text-gray-600">
							Payment methods are now managed by administrators.
							When you enroll in a course, you'll see available
							payment options.
						</p>
						<Button onClick={() => setActiveTab("courses")}>
							Browse Courses
						</Button>
					</div>
				);

			case "referral":
				return <ReferFriends />;

			default:
				return <div>Select a menu item</div>;
		}
	};

	return (
		<div className="flex bg-background min-h-screen">
			{/* Sidebar */}
			<div className="bg-card shadow-elegant border-r w-64">
				<div className="p-6">
					<div className="flex items-center gap-2 mb-8">
						<img
							src={elevateSkillLogo}
							alt="Elevate Skill"
							className="w-8 h-8"
						/>
						<h1 className="bg-clip-text bg-gradient-to-r from-primary to-accent font-bold text-transparent text-xl">
							Elevate Skill
						</h1>
					</div>

					<nav className="space-y-2">
						{menuItems.map((item) => {
							const Icon = item.icon;
							return (
								<button
									key={item.id}
									onClick={() => setActiveTab(item.id)}
									className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
										activeTab === item.id
											? "bg-primary/10 text-primary border border-primary/20"
											: "hover:bg-muted text-muted-foreground"
									}`}
								>
									<Icon className="w-5 h-5" />
									{item.label}
								</button>
							);
						})}
					</nav>
				</div>

				<Separator />

				<div className="p-6">
					<div className="space-y-2">
						<button className="flex items-center gap-3 hover:bg-muted px-3 py-2 rounded-lg w-full text-muted-foreground text-left transition-colors">
							<Settings className="w-5 h-5" />
							Settings
						</button>
						<button
							onClick={() => navigate("/")}
							className="flex items-center gap-3 hover:bg-destructive/10 px-3 py-2 rounded-lg w-full text-muted-foreground hover:text-destructive text-left transition-colors"
						>
							<LogOut className="w-5 h-5" />
							Logout
						</button>
					</div>
				</div>
			</div>

			{/* Main Content */}
			<div className="flex flex-col flex-1">
				{/* Header */}
				<header className="bg-card/50 backdrop-blur-sm p-6 border-b">
					<div className="flex justify-between items-center">
						<div>
							<h1 className="font-bold text-foreground text-2xl">
								{menuItems.find((item) => item.id === activeTab)
									?.label || "Dashboard"}
							</h1>
							<p className="text-muted-foreground">
								{activeTab === "home"
									? "Track your progress and continue learning"
									: `Manage your ${menuItems
											.find(
												(item) => item.id === activeTab
											)
											?.label.toLowerCase()}`}
							</p>
						</div>

						<div className="flex items-center gap-4">
							<Button variant="ghost" size="icon">
								<Search className="w-5 h-5" />
							</Button>
							<Button variant="ghost" size="icon">
								<Bell className="w-5 h-5" />
							</Button>
							<div className="flex justify-center items-center bg-gradient-to-r from-primary to-accent rounded-full w-8 h-8">
								<span className="font-bold text-primary-foreground text-sm">
									J
								</span>
							</div>
						</div>
					</div>
				</header>

				{/* Content */}
				<main className="flex-1 p-6 overflow-y-auto">
					{renderContent()}
				</main>
			</div>
		</div>
	);
};

export default Dashboard;
