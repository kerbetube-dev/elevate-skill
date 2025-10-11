/**
 * Modern Landing Page - Phase 2
 * Beautiful, animated, responsive landing experience
 */

import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { statsService, PlatformStats } from "@/services/stats";
import { useToast } from "@/hooks/use-toast";
import elevateSkillLogo from "@/assets/elevate-skill-logo.png";

// Import new landing page sections
import { HeroSection } from "./HeroSection";
import { FeaturesSection } from "./FeaturesSection";
import { CTASection } from "./CTASection";
import { Course } from "@/services/courses";
import paymentService from "@/services/payments";

const ModernLandingPage = () => {
	const navigate = useNavigate();
	const { toast } = useToast();
	const [platformStats, setPlatformStats] = useState<PlatformStats | null>(
		null
	);
	const [enrolledCourses, setEnrolledCourses] = useState<Set<string>>(
		new Set()
	);
	const [checkingEnrollment, setCheckingEnrollment] = useState<string | null>(
		null
	);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchData = async () => {
			try {
				setLoading(true);

				// Fetch platform stats
				const statsData = await statsService.getPlatformStats();
				setPlatformStats(statsData);
			} catch (err) {
				setError(
					err instanceof Error ? err.message : "Failed to load data"
				);
				console.error("Error fetching data:", err);
			} finally {
				setLoading(false);
			}
		};

		fetchData();
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
		console.log("Redirecting to payment page for course:", course.id);
		navigate(`/payment?courseId=${course.id}`);
	};

	const scrollToSection = (ref: React.RefObject<HTMLDivElement>) => {
		ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
	};

	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ duration: 0.5 }}
			className="bg-background min-h-screen overflow-hidden"
		>
			{/* Modern Sticky Header */}
			<motion.header
				initial={{ y: -100 }}
				animate={{ y: 0 }}
				transition={{ type: "spring", stiffness: 100, damping: 20 }}
				className="top-0 z-50 sticky shadow-sm backdrop-blur-xl border-b glass"
			>
				<div className="flex justify-between items-center mx-auto px-4 py-4 container">
					<motion.div
						whileHover={{ scale: 1.05 }}
						className="flex items-center gap-2 cursor-pointer"
						onClick={() =>
							window.scrollTo({ top: 0, behavior: "smooth" })
						}
					>
						<img
							src={elevateSkillLogo}
							alt="Elevate Skill"
							className="w-8 h-8"
						/>
						<h1 className="bg-clip-text bg-gradient-primary font-bold text-transparent text-2xl">
							Elevate Skill
						</h1>
					</motion.div>
					<div className="flex items-center gap-4">
						<Button
							variant="ghost"
							onClick={() => navigate("/login")}
						>
							Login
						</Button>
						<Button
							variant="gradient"
							onClick={() => navigate("/register")}
							animated
						>
							Get Started
						</Button>
					</div>
				</div>
			</motion.header>

			{/* Hero Section */}
			<HeroSection
				onViewCourses={() => navigate("/dashboard")}
				stats={platformStats}
			/>

			{/* Features Section */}
			<FeaturesSection />

			{/* CTA Section */}
			<CTASection />

			{/* Footer */}
			<footer className="bg-card py-12 border-t">
				<div className="mx-auto px-4 container">
					<div className="gap-8 grid grid-cols-1 md:grid-cols-4">
						{/* Brand */}
						<div>
							<div className="flex items-center gap-2 mb-4">
								<img
									src={elevateSkillLogo}
									alt="Elevate Skill"
									className="w-8 h-8"
								/>
								<h3 className="bg-clip-text bg-gradient-primary font-bold text-transparent text-xl">
									Elevate Skill
								</h3>
							</div>
							<p className="text-muted-foreground">
								Transform your career with our expert-led online
								courses.
							</p>
						</div>

						{/* Quick Links */}
						<div>
							<h4 className="mb-4 font-semibold">Quick Links</h4>
							<ul className="space-y-2 text-muted-foreground">
								<li>
									<a
										href="#"
										className="hover:text-primary transition-colors"
									>
										About Us
									</a>
								</li>
								<li>
									<a
										href="#"
										className="hover:text-primary transition-colors"
									>
										Courses
									</a>
								</li>
								<li>
									<a
										href="#"
										className="hover:text-primary transition-colors"
									>
										Pricing
									</a>
								</li>
								<li>
									<a
										href="#"
										className="hover:text-primary transition-colors"
									>
										Contact
									</a>
								</li>
							</ul>
						</div>

						{/* Support */}
						<div>
							<h4 className="mb-4 font-semibold">Support</h4>
							<ul className="space-y-2 text-muted-foreground">
								<li>
									<a
										href="#"
										className="hover:text-primary transition-colors"
									>
										Help Center
									</a>
								</li>
								<li>
									<a
										href="#"
										className="hover:text-primary transition-colors"
									>
										FAQs
									</a>
								</li>
								<li>
									<a
										href="#"
										className="hover:text-primary transition-colors"
									>
										Terms of Service
									</a>
								</li>
								<li>
									<a
										href="#"
										className="hover:text-primary transition-colors"
									>
										Privacy Policy
									</a>
								</li>
							</ul>
						</div>

						{/* Newsletter */}
						<div>
							<h4 className="mb-4 font-semibold">Stay Updated</h4>
							<p className="mb-4 text-muted-foreground">
								Subscribe to get updates on new courses and
								offers.
							</p>
							<div className="flex gap-2">
								<Button variant="gradient" className="w-full">
									Subscribe
								</Button>
							</div>
						</div>
					</div>

					<div className="mt-8 pt-8 border-t text-muted-foreground text-center">
						<p>
							&copy; {new Date().getFullYear()} Elevate Skill. All
							rights reserved.
						</p>
					</div>
				</div>
			</footer>
		</motion.div>
	);
};

export default ModernLandingPage;
