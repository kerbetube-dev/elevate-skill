/**
 * Courses Showcase with Horizontal Scroll
 * Modern course cards with enhanced visuals and self-contained data fetching
 */

import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { staggerContainer, staggerItem } from "@/lib/animations";
import {
	Users,
	Star,
	Clock,
	TrendingUp,
	ArrowRight,
	BookOpen,
	Award,
	Loader2,
	CheckCircle,
	Play,
	Globe,
} from "lucide-react";
import { Course } from "@/services/courses";
import { getImageUrl } from "@/services/admin";
import { useState, useEffect } from "react";
import { coursesService } from "@/services/courses";
import { paymentService } from "@/services/payments";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export function CoursesShowcase() {
	const navigate = useNavigate();
	const { toast } = useToast();

	const [courses, setCourses] = useState<Course[]>([]);
	const [loading, setLoading] = useState(false);
	const [enrolledCourses, setEnrolledCourses] = useState<Set<string>>(
		new Set()
	);
	const [checkingEnrollment, setCheckingEnrollment] = useState<string | null>(
		null
	);

	useEffect(() => {
		// Placeholder courses for immediate display
		const placeholderCourses: Course[] = [
			{
				id: "1",
				title: "Complete Digital Marketing Course",
				description:
					"Master social media marketing, SEO, content creation, and analytics to grow any business online.",
				image: "/placeholder-course.jpg",
				price: 2500,
				duration: "8 weeks",
				students: 1250,
				rating: 4.9,
				level: "Intermediate",
				instructor: "Hanan Tadesse",
			},
			{
				id: "2",
				title: "Full-Stack Web Development",
				description:
					"Learn modern web development with React, Node.js, and databases. Build real-world applications.",
				image: "/placeholder-course.jpg",
				price: 3500,
				duration: "12 weeks",
				students: 890,
				rating: 4.8,
				level: "Advanced",
				instructor: "Bereket Alemayehu",
			},
			{
				id: "3",
				title: "Professional Graphics Design",
				description:
					"Create stunning visual designs using Photoshop, Illustrator, and modern design principles.",
				image: "/placeholder-course.jpg",
				price: 2200,
				duration: "6 weeks",
				students: 750,
				rating: 4.7,
				level: "Beginner",
				instructor: "Meron Kifle",
			},
			{
				id: "4",
				title: "Video Editing & Production",
				description:
					"Master professional video editing techniques with industry-standard tools and creative storytelling.",
				image: "/placeholder-course.jpg",
				price: 2800,
				duration: "10 weeks",
				students: 680,
				rating: 4.8,
				level: "Intermediate",
				instructor: "Samuel Habtamu",
			},
			{
				id: "5",
				title: "Business English Communication",
				description:
					"Develop professional English skills for international business and career advancement.",
				image: "/placeholder-course.jpg",
				price: 1800,
				duration: "6 weeks",
				students: 920,
				rating: 4.9,
				level: "Beginner",
				instructor: "Rahel Negash",
			},
			{
				id: "6",
				title: "Mobile App Development",
				description:
					"Build native mobile applications for iOS and Android using modern development frameworks.",
				image: "/placeholder-course.jpg",
				price: 4200,
				duration: "16 weeks",
				students: 450,
				rating: 4.8,
				level: "Advanced",
				instructor: "Dawit Mekonnen",
			},
		];

		// Start with placeholder courses for immediate display
		setCourses(placeholderCourses);

		// Fetch real courses in the background
		const fetchCourses = async () => {
			try {
				setLoading(true);
				const realCourses = await coursesService.getAllCourses();
				setCourses(
					realCourses.length > 0 ? realCourses : placeholderCourses
				);

				// Check enrollment status for logged-in users
				const token = localStorage.getItem("access_token");
				if (token) {
					await checkEnrollmentStatus(realCourses);
				}
			} catch (error) {
				console.log("Using placeholder courses:", error);
				// Keep placeholder courses if fetch fails
			} finally {
				setLoading(false);
			}
		};

		fetchCourses();
	}, []);

	const checkEnrollmentStatus = async (coursesToCheck: Course[]) => {
		const enrolled = new Set<string>();
		for (const course of coursesToCheck) {
			try {
				const isEnrolled = await paymentService.checkEnrollment(
					course.id
				);
				if (isEnrolled) {
					enrolled.add(course.id);
				}
			} catch (err) {
				console.error(
					`Error checking enrollment for course ${course.id}:`,
					err
				);
			}
		}
		setEnrolledCourses(enrolled);
	};

	const handleEnrollClick = async (course: Course) => {
		const token = localStorage.getItem("access_token");

		if (!token) {
			toast({
				title: "Login Required",
				description: "Please login or register to enroll in courses",
				variant: "default",
			});
			navigate("/login");
			return;
		}

		// Check if already enrolled
		if (enrolledCourses.has(course.id)) {
			toast({
				title: "Already Enrolled",
				description:
					"You are already enrolled in this course. Check your dashboard!",
				variant: "default",
			});
			navigate("/dashboard");
			return;
		}

		// Check enrollment status one more time before redirecting
		setCheckingEnrollment(course.id);
		try {
			const isEnrolled = await paymentService.checkEnrollment(course.id);
			if (isEnrolled) {
				toast({
					title: "Already Enrolled",
					description: "You are already enrolled in this course!",
				});
				navigate("/dashboard");
				return;
			}
		} catch (err) {
			console.error("Error checking enrollment:", err);
			// Continue with enrollment if check fails
		} finally {
			setCheckingEnrollment(null);
		}

		// Always redirect to payment page after enrollment check
		navigate(`/payment?courseId=${course.id}`);
	};
	const getLevelColor = (level: string) => {
		switch (level.toLowerCase()) {
			case "beginner":
				return "bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-200";
			case "intermediate":
				return "bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200";
			case "advanced":
				return "bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-200";
			default:
				return "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200";
		}
	};

	const getImageSrc = (course: Course) => {
		if (course.image?.startsWith("/uploads/")) {
			return getImageUrl(course.image);
		}
		return course.image || "/placeholder-course.jpg";
	};

	return (
		<section className="relative bg-gradient-to-br from-slate-50 dark:from-slate-900 via-blue-50 dark:via-slate-800 to-indigo-50 dark:to-slate-900 py-24 md:py-32 overflow-hidden">
			{/* Background Pattern */}
			<div className="absolute inset-0 opacity-30">
				<div className="top-0 left-0 absolute bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] w-full h-full" />
			</div>

			{/* Floating Background Elements */}
			<div className="absolute inset-0 overflow-hidden">
				<motion.div
					animate={{
						y: [0, -20, 0],
						x: [0, 10, 0],
					}}
					transition={{
						duration: 8,
						repeat: Infinity,
						ease: "easeInOut",
					}}
					className="top-20 left-10 absolute bg-blue-400/10 blur-3xl rounded-full w-64 h-64"
				/>
				<motion.div
					animate={{
						y: [0, 20, 0],
						x: [0, -10, 0],
					}}
					transition={{
						duration: 10,
						repeat: Infinity,
						ease: "easeInOut",
					}}
					className="right-10 bottom-20 absolute bg-purple-400/10 blur-3xl rounded-full w-80 h-80"
				/>
			</div>

			<div className="z-10 relative mx-auto px-4 container">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.6 }}
					className="mb-20 text-center"
				>
					<Badge className="bg-gradient-to-r from-blue-600 hover:from-blue-700 to-purple-600 hover:to-purple-700 mb-6 px-6 py-3 border-0 font-medium text-white text-base transition-all duration-300">
						<BookOpen className="mr-2 w-5 h-5" />
						Featured Courses
					</Badge>
					<h2 className="mb-8 font-bold text-4xl md:text-5xl lg:text-6xl leading-tight">
						Start Your Learning{" "}
						<span className="bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 text-transparent">
							Journey
						</span>
					</h2>
					<p className="mx-auto max-w-4xl text-muted-foreground text-xl md:text-2xl leading-relaxed">
						Choose from our expertly crafted courses and start
						building skills that matter in today's digital world.
					</p>
				</motion.div>

				<motion.div
					variants={staggerContainer}
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true, margin: "-100px" }}
					className="gap-8 lg:gap-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
				>
					{courses.slice(0, 6).map((course, index) => {
						const isEnrolled = enrolledCourses.has(course.id);
						const isChecking = checkingEnrollment === course.id;

						return (
							<motion.div key={course.id} variants={staggerItem}>
								<Card className="group flex flex-col bg-white/90 hover:bg-white shadow-lg hover:shadow-2xl backdrop-blur-sm border-0 h-full overflow-hidden transition-all duration-500">
									{/* Course Image */}
									<div className="relative h-56 overflow-hidden">
										<motion.img
											whileHover={{ scale: 1.1 }}
											transition={{ duration: 0.5 }}
											src={getImageSrc(course)}
											alt={course.title}
											className="w-full h-full object-cover"
											onError={(e) => {
												e.currentTarget.src =
													"/placeholder-course.jpg";
											}}
										/>
										{/* Gradient Overlay */}
										<div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

										{/* Level Badge */}
										<div className="top-4 right-4 absolute">
											<Badge
												className={`${getLevelColor(
													course.level
												)} transition-all duration-300 font-medium`}
											>
												{course.level}
											</Badge>
										</div>

										{/* Enrolled Badge */}
										{isEnrolled && (
											<div className="top-4 left-4 absolute">
												<Badge className="bg-emerald-600 border-0 font-medium text-white">
													<CheckCircle className="mr-1 w-4 h-4" />
													Enrolled
												</Badge>
											</div>
										)}

										{/* Play Button Overlay */}
										<div className="absolute inset-0 flex justify-center items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
											<div className="flex justify-center items-center bg-white/20 backdrop-blur-sm rounded-full w-16 h-16">
												<Play className="ml-1 w-8 h-8 text-white" />
											</div>
										</div>
									</div>

									<CardHeader className="flex-grow p-6">
										<CardTitle className="mb-3 font-bold group-hover:text-blue-600 text-xl line-clamp-2 leading-tight transition-colors">
											{course.title}
										</CardTitle>
										<CardDescription className="text-gray-600 text-base line-clamp-3 leading-relaxed">
											{course.description}
										</CardDescription>
									</CardHeader>

									<CardContent className="space-y-6 px-6">
										{/* Course Stats */}
										<div className="flex justify-between items-center text-sm">
											<div className="flex items-center gap-2 text-gray-600">
												<Users className="w-4 h-4" />
												<span className="font-medium">
													{course.students?.toLocaleString() ||
														0}
												</span>
											</div>
											<div className="flex items-center gap-2 text-amber-600">
												<Star className="fill-current w-4 h-4" />
												<span className="font-medium">
													{course.rating || "4.5"}
												</span>
											</div>
											<div className="flex items-center gap-2 text-gray-600">
												<Clock className="w-4 h-4" />
												<span className="font-medium">
													{course.duration}
												</span>
											</div>
										</div>

										{/* Instructor */}
										<div className="flex items-center gap-3">
											<div className="flex justify-center items-center bg-gradient-to-r from-blue-600 to-purple-600 rounded-full w-10 h-10 font-bold text-white text-sm">
												{course.instructor?.charAt(0) ||
													"I"}
											</div>
											<div className="text-sm">
												<p className="font-semibold text-gray-900">
													{course.instructor}
												</p>
												<p className="text-gray-500 text-xs">
													Course Instructor
												</p>
											</div>
										</div>

										{/* Price */}
										<div className="flex items-baseline gap-2">
											<span className="font-bold text-blue-600 text-3xl">
												{course.price} ETB
											</span>
											<span className="text-gray-500 text-sm line-through">
												{Math.round(course.price * 1.5)}{" "}
												ETB
											</span>
										</div>
									</CardContent>

									<CardFooter className="p-6 pt-0">
										<Button
											variant={
												isEnrolled
													? "outline"
													: "default"
											}
											size="lg"
											className={`w-full group font-semibold transition-all duration-300 ${
												isEnrolled
													? "hover:bg-blue-50 hover:border-blue-300"
													: "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl hover:scale-[1.02]"
											}`}
											onClick={() =>
												handleEnrollClick(course)
											}
											disabled={isChecking}
										>
											{isChecking ? (
												<>
													<Loader2 className="mr-2 w-5 h-5 animate-spin" />
													Checking...
												</>
											) : isEnrolled ? (
												<>
													<BookOpen className="mr-2 w-5 h-5" />
													Go to Course
												</>
											) : (
												<>
													Enroll Now
													<ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
												</>
											)}
										</Button>
									</CardFooter>
								</Card>
							</motion.div>
						);
					})}
				</motion.div>

				{/* View All Courses CTA */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.6, delay: 0.3 }}
					className="mt-20 text-center"
				>
					<Button
						variant="default"
						size="xl"
						className="bg-gradient-to-r from-blue-600 hover:from-blue-700 to-purple-600 hover:to-purple-700 shadow-xl hover:shadow-2xl font-semibold text-white hover:scale-105 transition-all duration-300"
						onClick={() => navigate("/login")}
					>
						<Globe className="mr-3 w-6 h-6" />
						View All{" "}
						{courses.length > 0 ? courses.length : "Available"}{" "}
						Courses
						<ArrowRight className="ml-3 w-6 h-6" />
					</Button>
				</motion.div>
			</div>
		</section>
	);
}
