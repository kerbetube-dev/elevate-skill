/**
 * Features Section with Icon Animations
 * Showcases why users should choose Elevate Skill
 * Modern, professional design with enhanced animations
 */

import {
	Card,
	CardHeader,
	CardTitle,
	CardDescription,
	CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { staggerContainer, staggerItem } from "@/lib/animations";
import {
	BookOpen,
	Users,
	Award,
	TrendingUp,
	Video,
	Clock,
	MessageSquare,
	Shield,
	Zap,
	Globe,
	Star,
	Target,
	Rocket,
	Heart,
	CheckCircle,
	Trophy,
} from "lucide-react";

const features = [
	{
		icon: BookOpen,
		title: "Expert-Led Courses",
		description:
			"Learn from industry professionals with years of real-world experience and proven track records.",
		color: "text-blue-600",
		bgColor: "bg-blue-50",
		hoverColor: "group-hover:bg-blue-100",
	},
	{
		icon: Video,
		title: "High-Quality Content",
		description:
			"HD video lessons, downloadable resources, interactive projects, and hands-on assignments.",
		color: "text-purple-600",
		bgColor: "bg-purple-50",
		hoverColor: "group-hover:bg-purple-100",
	},
	{
		icon: Clock,
		title: "Learn at Your Pace",
		description:
			"Lifetime access to course materials. Study whenever and wherever you want, at your own speed.",
		color: "text-emerald-600",
		bgColor: "bg-emerald-50",
		hoverColor: "group-hover:bg-emerald-100",
	},
	{
		icon: Award,
		title: "Certificates",
		description:
			"Earn recognized certificates upon course completion to boost your resume and career prospects.",
		color: "text-amber-600",
		bgColor: "bg-amber-50",
		hoverColor: "group-hover:bg-amber-100",
	},
	{
		icon: Users,
		title: "Community Support",
		description:
			"Join thousands of learners, share knowledge, get help, and grow together in our vibrant community.",
		color: "text-pink-600",
		bgColor: "bg-pink-50",
		hoverColor: "group-hover:bg-pink-100",
	},
	{
		icon: TrendingUp,
		title: "Career Growth",
		description:
			"Develop in-demand skills that employers are actively seeking in today's competitive job market.",
		color: "text-indigo-600",
		bgColor: "bg-indigo-50",
		hoverColor: "group-hover:bg-indigo-100",
	},
	{
		icon: MessageSquare,
		title: "Expert Mentorship",
		description:
			"Get personalized guidance, feedback, and answers from experienced instructors and mentors.",
		color: "text-orange-600",
		bgColor: "bg-orange-50",
		hoverColor: "group-hover:bg-orange-100",
	},
	{
		icon: Shield,
		title: "Trusted Platform",
		description:
			"Secure payments, verified instructors, quality-assured content, and reliable customer support.",
		color: "text-teal-600",
		bgColor: "bg-teal-50",
		hoverColor: "group-hover:bg-teal-100",
	},
];

const highlights = [
	{
		icon: Zap,
		title: "Fast Learning",
		description:
			"Accelerated learning paths designed to get you job-ready quickly with practical, hands-on experience.",
		gradient: "from-yellow-400 to-orange-500",
	},
	{
		icon: Globe,
		title: "Global Access",
		description:
			"Learn from anywhere in the world with our cloud-based platform and mobile-friendly interface.",
		gradient: "from-blue-400 to-cyan-500",
	},
	{
		icon: Target,
		title: "Goal-Oriented",
		description:
			"Structured curriculum designed to help you achieve your specific career goals and aspirations.",
		gradient: "from-purple-400 to-pink-500",
	},
];

export function FeaturesSection() {
	return (
		<section className="relative bg-white py-24 md:py-32 overflow-hidden">
			{/* Background decoration */}
			<div className="-z-10 absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />

			{/* Floating background elements */}
			<div className="absolute inset-0 overflow-hidden">
				<motion.div
					animate={{
						y: [0, -30, 0],
						x: [0, 15, 0],
					}}
					transition={{
						duration: 12,
						repeat: Infinity,
						ease: "easeInOut",
					}}
					className="top-20 left-10 absolute bg-blue-200/20 blur-3xl rounded-full w-72 h-72"
				/>
				<motion.div
					animate={{
						y: [0, 25, 0],
						x: [0, -20, 0],
					}}
					transition={{
						duration: 15,
						repeat: Infinity,
						ease: "easeInOut",
					}}
					className="right-10 bottom-20 absolute bg-purple-200/20 blur-3xl rounded-full w-80 h-80"
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
					<Badge className="bg-gradient-to-r from-blue-600 to-purple-600 mb-6 px-6 py-3 border-0 font-medium text-white text-base">
						<Star className="mr-2 w-5 h-5" />
						Why Choose Us
					</Badge>
					<h2 className="mb-8 font-bold text-4xl md:text-5xl lg:text-6xl leading-tight">
						Why Choose{" "}
						<span className="bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 text-transparent">
							Elevate Skill
						</span>
						?
					</h2>
					<p className="mx-auto max-w-4xl text-gray-600 text-xl md:text-2xl leading-relaxed">
						We're committed to providing the best learning
						experience with features designed for your success and
						career transformation.
					</p>
				</motion.div>

				<motion.div
					variants={staggerContainer}
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true, margin: "-100px" }}
					className="gap-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 mb-20"
				>
					{features.map((feature, index) => {
						const Icon = feature.icon;
						return (
							<motion.div key={index} variants={staggerItem}>
								<Card className="group bg-white shadow-lg hover:shadow-xl border-0 h-full hover:scale-105 transition-all duration-500 cursor-pointer">
									<CardHeader className="text-center">
										<motion.div
											whileHover={{
												rotate: [0, -10, 10, -5, 0],
												scale: 1.1,
											}}
											transition={{ duration: 0.6 }}
											className={`w-16 h-16 rounded-2xl ${feature.bgColor} ${feature.hoverColor} ${feature.color} flex items-center justify-center mb-6 mx-auto group-hover:shadow-lg transition-all duration-300`}
										>
											<Icon className="w-8 h-8" />
										</motion.div>
										<CardTitle className="mb-3 font-bold group-hover:text-blue-600 text-xl transition-colors">
											{feature.title}
										</CardTitle>
									</CardHeader>
									<CardContent className="text-center">
										<CardDescription className="text-gray-600 text-base leading-relaxed">
											{feature.description}
										</CardDescription>
									</CardContent>
								</Card>
							</motion.div>
						);
					})}
				</motion.div>

				{/* Additional Features Highlight */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.6, delay: 0.3 }}
					className="gap-8 grid grid-cols-1 md:grid-cols-3"
				>
					{highlights.map((highlight, index) => {
						const Icon = highlight.icon;
						return (
							<motion.div
								key={index}
								whileHover={{ y: -10 }}
								className="bg-gradient-to-br from-white to-gray-50 shadow-lg hover:shadow-xl p-8 border border-gray-100 rounded-3xl text-center transition-all duration-500"
							>
								<motion.div
									whileHover={{ scale: 1.2, rotate: 360 }}
									transition={{ duration: 0.6 }}
									className={`inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r ${highlight.gradient} text-white mb-6 shadow-lg`}
								>
									<Icon className="w-10 h-10" />
								</motion.div>
								<h3 className="mb-4 font-bold text-gray-900 text-2xl">
									{highlight.title}
								</h3>
								<p className="text-gray-600 text-base leading-relaxed">
									{highlight.description}
								</p>
							</motion.div>
						);
					})}
				</motion.div>

				{/* Trust Indicators */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.6, delay: 0.5 }}
					className="gap-6 grid grid-cols-1 md:grid-cols-4 mt-20"
				>
					{[
						{
							icon: CheckCircle,
							value: "100%",
							label: "Money-Back Guarantee",
							color: "text-emerald-600",
						},
						{
							icon: Trophy,
							value: "24/7",
							label: "Student Support",
							color: "text-blue-600",
						},
						{
							icon: Heart,
							value: "∞",
							label: "Lifetime Access",
							color: "text-purple-600",
						},
						{
							icon: Rocket,
							value: "98%",
							label: "Success Rate",
							color: "text-orange-600",
						},
					].map((item, index) => {
						const Icon = item.icon;
						return (
							<motion.div
								key={index}
								whileHover={{ scale: 1.05 }}
								className="bg-gradient-to-br from-gray-50 to-white p-6 border border-gray-200 hover:border-gray-300 rounded-2xl text-center transition-all duration-300"
							>
								<Icon
									className={`h-12 w-12 ${item.color} mx-auto mb-3`}
								/>
								<div
									className={`text-3xl font-bold ${item.color} mb-2`}
								>
									{item.value}
								</div>
								<div className="font-medium text-gray-600 text-sm">
									{item.label}
								</div>
							</motion.div>
						);
					})}
				</motion.div>
			</div>
		</section>
	);
}
