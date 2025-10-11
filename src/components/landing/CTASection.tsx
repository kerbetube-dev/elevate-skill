/**
 * Call-to-Action Section
 * Encourages users to take action with modern design
 */

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import {
	ArrowRight,
	Rocket,
	Star,
	Zap,
	TrendingUp,
	CheckCircle,
	Crown,
	Sparkles,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export function CTASection() {
	const navigate = useNavigate();

	return (
		<section className="relative py-24 md:py-32 overflow-hidden">
			{/* Animated Background */}
			<div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700" />

			{/* Animated pattern overlay */}
			<div className="absolute inset-0 opacity-10">
				<div className="absolute inset-0 bg-[length:60px_60px] bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,.1)_50%,transparent_75%,transparent_100%)] animate-pulse" />
			</div>

			{/* Floating Elements */}
			<div className="absolute inset-0 overflow-hidden">
				<motion.div
					animate={{
						y: [0, -30, 0],
						rotate: [0, 360],
					}}
					transition={{
						duration: 20,
						repeat: Infinity,
						ease: "linear",
					}}
					className="top-20 left-10 absolute opacity-20"
				>
					<Star className="w-16 h-16 text-white" />
				</motion.div>
				<motion.div
					animate={{
						y: [0, 30, 0],
						rotate: [360, 0],
					}}
					transition={{
						duration: 15,
						repeat: Infinity,
						ease: "linear",
					}}
					className="right-20 bottom-20 absolute opacity-20"
				>
					<Rocket className="w-24 h-24 text-white" />
				</motion.div>
				<motion.div
					animate={{
						x: [0, 20, 0],
						y: [0, -20, 0],
					}}
					transition={{
						duration: 12,
						repeat: Infinity,
						ease: "easeInOut",
					}}
					className="top-1/2 right-10 absolute opacity-20"
				>
					<Zap className="w-20 h-20 text-white" />
				</motion.div>
				<motion.div
					animate={{
						x: [0, -25, 0],
						y: [0, 15, 0],
					}}
					transition={{
						duration: 18,
						repeat: Infinity,
						ease: "easeInOut",
					}}
					className="top-1/3 left-1/4 absolute opacity-20"
				>
					<Crown className="w-18 h-18 text-white" />
				</motion.div>
			</div>

			<div className="z-10 relative mx-auto px-4 container">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.6 }}
					className="mx-auto max-w-5xl text-white text-center"
				>
					<motion.div
						initial={{ scale: 0 }}
						whileInView={{ scale: 1 }}
						viewport={{ once: true }}
						transition={{
							type: "spring",
							stiffness: 200,
							damping: 15,
							delay: 0.2,
						}}
					>
						<Badge className="bg-white/20 hover:bg-white/30 backdrop-blur-sm mb-8 px-6 py-3 border-white/30 font-medium text-white text-base transition-all duration-300">
							<Sparkles className="mr-2 w-5 h-5" />
							Limited Time Offer
						</Badge>
					</motion.div>

					<h2 className="mb-8 font-bold text-4xl md:text-5xl lg:text-6xl leading-tight">
						Ready to Transform
						<br />
						<span className="bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-300 text-transparent">
							Your Career?
						</span>
					</h2>

					<p className="mx-auto mb-12 max-w-4xl text-white/90 text-xl md:text-2xl leading-relaxed">
						Join thousands of students who are already learning and
						growing with Elevate Skill. Start your transformation
						journey today and unlock your potential!
					</p>

					<motion.div
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.6, delay: 0.3 }}
						className="flex sm:flex-row flex-col justify-center gap-6 mb-16"
					>
						<Button
							size="xl"
							onClick={() => navigate("/register")}
							className="group bg-white hover:bg-gray-50 shadow-2xl px-8 py-4 font-bold text-blue-600 text-lg hover:scale-105 transition-all duration-300"
						>
							<TrendingUp className="mr-3 w-6 h-6" />
							Get Started Free
							<ArrowRight className="ml-3 w-6 h-6 transition-transform group-hover:translate-x-1" />
						</Button>
						<Button
							variant="outline"
							size="xl"
							className="group bg-transparent hover:bg-white/10 px-8 py-4 border-white/50 hover:border-white font-bold text-white text-lg hover:scale-105 transition-all duration-300"
							onClick={() => {
								const coursesSection =
									document.getElementById("courses");
								coursesSection?.scrollIntoView({
									behavior: "smooth",
								});
							}}
						>
							<Rocket className="mr-3 w-6 h-6" />
							Browse Courses
						</Button>
					</motion.div>

					{/* Trust Indicators */}
					<motion.div
						initial={{ opacity: 0 }}
						whileInView={{ opacity: 1 }}
						viewport={{ once: true }}
						transition={{ duration: 0.6, delay: 0.5 }}
						className="gap-8 grid grid-cols-1 md:grid-cols-3"
					>
						{[
							{
								icon: CheckCircle,
								value: "100%",
								label: "Money-Back Guarantee",
								description: "30-day risk-free trial",
							},
							{
								icon: Star,
								value: "24/7",
								label: "Student Support",
								description: "Expert help when you need it",
							},
							{
								icon: Crown,
								value: "∞",
								label: "Lifetime Access",
								description: "Learn at your own pace forever",
							},
						].map((item, index) => {
							const Icon = item.icon;
							return (
								<motion.div
									key={index}
									whileHover={{ scale: 1.05, y: -5 }}
									transition={{ duration: 0.3 }}
								>
									<Card className="bg-white/10 hover:bg-white/20 backdrop-blur-xl p-8 border-white/20 transition-all duration-300">
										<Icon className="mx-auto mb-4 w-12 h-12 text-yellow-300" />
										<div className="mb-2 font-bold text-white text-4xl">
											{item.value}
										</div>
										<div className="mb-2 font-semibold text-white/90">
											{item.label}
										</div>
										<div className="text-white/70 text-sm">
											{item.description}
										</div>
									</Card>
								</motion.div>
							);
						})}
					</motion.div>

					{/* Additional CTA elements */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.6, delay: 0.7 }}
						className="mt-12 text-center"
					>
						<p className="mb-4 text-white/80 text-lg">
							🎉 <strong>Special Launch Offer:</strong> Get 50%
							off your first course!
						</p>
						<p className="text-white/60 text-sm">
							*Limited time offer. Terms and conditions apply.
						</p>
					</motion.div>
				</motion.div>
			</div>
		</section>
	);
}
