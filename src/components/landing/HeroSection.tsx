/**
 * Modern Hero Section with Animations
 * Features: Animated gradient background, typewriter effect, floating elements
 * Self-contained with data fetching and placeholder stats
 */

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Zap, Target, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { staggerContainer, staggerItem } from "@/lib/animations";
import { TypeAnimation } from "react-type-animation";
import CountUp from "react-countup";
import { useState, useEffect } from "react";
import { statsService } from "@/services/stats";

interface PlatformStats {
	totalStudents: number;
	totalCourses: number;
	successRate: number;
	averageRating: number;
}

export function HeroSection() {
	const navigate = useNavigate();
	const [stats, setStats] = useState<PlatformStats>({
		totalStudents: 800,
		totalCourses: 6,
		successRate: 98,
		averageRating: 4.8,
	});

	useEffect(() => {
		// Fetch real stats in the background without blocking UI
		const fetchStats = async () => {
			try {
				const realStats = await statsService.getPlatformStats();
				setStats(realStats);
			} catch (error) {
				console.log("Using placeholder stats:", error);
				// Keep placeholder stats if fetch fails
			}
		};

		fetchStats();
	}, []);

	return (
		<section className="relative flex justify-center items-center bg-gradient-mesh min-h-[90vh] overflow-hidden">
			{/* Animated Background Elements */}
			<div className="absolute inset-0 overflow-hidden">
				{/* Floating Orbs */}
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
					className="top-20 left-10 absolute bg-primary/20 blur-3xl rounded-full w-72 h-72"
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
					className="right-10 bottom-20 absolute bg-accent/20 blur-3xl rounded-full w-96 h-96"
				/>
				<motion.div
					animate={{
						y: [0, -15, 0],
						x: [0, -15, 0],
					}}
					transition={{
						duration: 12,
						repeat: Infinity,
						ease: "easeInOut",
					}}
					className="top-1/2 left-1/2 absolute bg-success-500/20 blur-3xl rounded-full w-64 h-64"
				/>
			</div>

			{/* Main Content */}
			<div className="z-10 relative mx-auto px-4 container">
				<motion.div
					variants={staggerContainer}
					initial="hidden"
					animate="visible"
					className="mx-auto max-w-5xl text-center"
				>
					{/* Badge */}
					<motion.div
						variants={staggerItem}
						className="flex justify-center mb-6"
					>
						<Badge className="bg-gradient-primary shadow-glow px-6 py-2 border-0 text-white text-sm">
							<Sparkles className="mr-2 w-4 h-4 animate-pulse" />
							Transform Your Career Today
						</Badge>
					</motion.div>

					{/* Main Heading with Gradient */}
					<motion.h1
						variants={staggerItem}
						className="mb-6 font-bold text-5xl md:text-6xl lg:text-7xl leading-tight"
					>
						<span className="bg-clip-text bg-gradient-primary text-transparent">
							Elevate Your Skills,
						</span>
						<br />
						<span className="inline-block mt-2">
							<TypeAnimation
								sequence={[
									"Elevate Your Future",
									3000,
									"Transform Your Career",
									3000,
									"Achieve Your Dreams",
									3000,
									"Unlock Your Potential",
									3000,
								]}
								wrapper="span"
								speed={50}
								repeat={Infinity}
								className="bg-clip-text bg-gradient-sunset text-transparent"
							/>
						</span>
					</motion.h1>

					{/* Description */}
					<motion.p
						variants={staggerItem}
						className="mx-auto mb-12 max-w-3xl text-muted-foreground text-xl md:text-2xl leading-relaxed"
					>
						Master in-demand skills with our comprehensive online
						courses. From digital marketing to app development,{" "}
						<span className="font-semibold text-foreground">
							build expertise that opens doors
						</span>
						.
					</motion.p>

					{/* CTA Buttons */}
					<motion.div
						variants={staggerItem}
						className="flex sm:flex-row flex-col justify-center gap-6 mb-16"
					>
						<Button
							variant="gradient"
							size="xl"
							onClick={() => navigate("/register")}
							className="group shadow-glow hover:shadow-glow-lg hover:scale-105 transition-all duration-300"
						>
							<Zap className="mr-3 w-5 h-5" />
							Start Learning Today
							<ArrowRight className="ml-3 w-5 h-5 transition-transform group-hover:translate-x-1" />
						</Button>
						<Button
							variant="glass"
							size="xl"
							onClick={() => {
								const coursesSection =
									document.getElementById("courses");
								coursesSection?.scrollIntoView({
									behavior: "smooth",
								});
							}}
							className="group hover:scale-105 transition-all duration-300"
						>
							<Target className="mr-3 w-5 h-5" />
							Explore Courses
						</Button>
					</motion.div>

					{/* Animated Stats */}
					<motion.div
						variants={staggerItem}
						className="gap-8 grid grid-cols-2 md:grid-cols-4 mx-auto max-w-4xl"
					>
						{[
							{
								value: 237,
								suffix: "+",
								label: "Active Students",
								color: "text-primary",
								icon: <TrendingUp className="w-5 h-5" />,
							},
							{
								value: 7,
								suffix: "",
								label: "Expert Courses",
								color: "text-accent",
								icon: <Target className="w-5 h-5" />,
							},
							{
								value: 87,
								suffix: "%",
								label: "Success Rate",
								color: "text-emerald-600",
								icon: <Sparkles className="w-5 h-5" />,
							},
							{
								value: 4.7,
								suffix: "⭐",
								label: "Average Rating",
								color: "text-amber-600",
								decimals: 1,
								icon: <Zap className="w-5 h-5" />,
							},
						].map((stat, index) => (
							<motion.div
								key={index}
								variants={staggerItem}
								className="group backdrop-blur-sm p-8 border border-white/10 rounded-3xl cursor-pointer glass hover-lift"
								whileHover={{
									scale: 1.05,
									backgroundColor: "rgba(255, 255, 255, 0.1)",
								}}
								transition={{
									type: "spring",
									stiffness: 300,
									damping: 20,
								}}
							>
								<div className="flex justify-center items-center opacity-70 group-hover:opacity-100 mb-3 transition-opacity">
									{stat.icon}
								</div>
								<div
									className={`text-4xl md:text-5xl lg:text-6xl font-bold ${stat.color} mb-3 leading-none`}
								>
									<CountUp
										end={stat.value}
										duration={2.5}
										delay={index * 0.2}
										decimals={stat.decimals || 0}
										suffix={stat.suffix}
									/>
								</div>
								<div className="font-medium text-muted-foreground text-sm md:text-base leading-tight">
									{stat.label}
								</div>
							</motion.div>
						))}
					</motion.div>
				</motion.div>
			</div>
		</section>
	);
}
