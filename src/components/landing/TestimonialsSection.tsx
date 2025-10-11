/**
 * TestimonialsSection - Modern testimonials carousel with smooth animations
 */

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import {
	Star,
	Quote,
	ChevronLeft,
	ChevronRight,
	Users,
	Award,
} from "lucide-react";

interface Testimonial {
	id: number;
	name: string;
	role: string;
	company: string;
	avatar: string;
	rating: number;
	text: string;
	course: string;
	result: string;
}

const testimonials: Testimonial[] = [
	{
		id: 1,
		name: "Hanan Tadesse",
		role: "Senior Digital Marketing Manager",
		company: "Sheger Tech Solutions",
		avatar: "HT",
		rating: 5,
		text: "Elevate Skill completely transformed my career trajectory. The Digital Marketing course was incredibly comprehensive, and the hands-on projects prepared me for real-world challenges.",
		course: "Digital Marketing Mastery",
		result: "300% salary increase",
	},
	{
		id: 2,
		name: "Bereket Alemayehu",
		role: "Lead Full-Stack Developer",
		company: "Addis Innovation Labs",
		avatar: "BA",
		rating: 5,
		text: "The Web Development bootcamp exceeded all my expectations. The curriculum is cutting-edge, and the mentorship program was invaluable for my growth.",
		course: "Full-Stack Development",
		result: "Promoted to Team Lead",
	},
	{
		id: 3,
		name: "Meron Kifle",
		role: "Creative Director",
		company: "Ethiopia Brand Studio",
		avatar: "MK",
		rating: 5,
		text: "From complete beginner to Creative Director in 8 months! The Graphics Design course gave me the skills and confidence to excel in this competitive industry.",
		course: "Graphics Design Pro",
		result: "Started own agency",
	},
	{
		id: 4,
		name: "Samuel Habtamu",
		role: "Senior Video Producer",
		company: "Abyssinia Media House",
		avatar: "SH",
		rating: 5,
		text: "The Video Editing masterclass taught me industry-standard techniques that I use daily. The projects were challenging and prepared me for professional work.",
		course: "Video Production Mastery",
		result: "Doubled freelance income",
	},
	{
		id: 5,
		name: "Rahel Negash",
		role: "Corporate Training Manager",
		company: "Ethiopian Airlines",
		avatar: "RN",
		rating: 5,
		text: "This English Communication course revolutionized my presentation skills. I now lead training sessions for executives across multiple countries.",
		course: "Business English Excellence",
		result: "International promotions",
	},
	{
		id: 6,
		name: "Dawit Mekonnen",
		role: "Mobile App Developer",
		company: "Dashen Bank Technology",
		avatar: "DM",
		rating: 5,
		text: "The Mobile App Development program was exactly what I needed to transition from finance to tech. The practical approach made complex concepts accessible.",
		course: "Mobile App Development",
		result: "Career pivot success",
	},
	{
		id: 7,
		name: "Selamawit Bekele",
		role: "E-commerce Manager",
		company: "Addis Fashion Hub",
		avatar: "SB",
		rating: 5,
		text: "Thanks to the Digital Marketing course, I was able to scale our online business by 400%. The social media strategies were game-changing for our brand.",
		course: "Digital Marketing Mastery",
		result: "400% business growth",
	},
	{
		id: 8,
		name: "Yohannes Desta",
		role: "UI/UX Designer",
		company: "ZayRide Technologies",
		avatar: "YD",
		rating: 5,
		text: "The Graphics Design course opened doors I never imagined. I'm now designing for one of Ethiopia's leading tech companies and loving every moment.",
		course: "Graphics Design Pro",
		result: "Dream job achieved",
	},
];

export function TestimonialsSection() {
	const [currentIndex, setCurrentIndex] = useState(0);
	const [isAutoPlaying, setIsAutoPlaying] = useState(true);

	const currentTestimonial = testimonials[currentIndex];

	const nextTestimonial = () => {
		setCurrentIndex((prev) => (prev + 1) % testimonials.length);
	};

	const prevTestimonial = () => {
		setCurrentIndex(
			(prev) => (prev - 1 + testimonials.length) % testimonials.length
		);
	};

	const goToTestimonial = (index: number) => {
		setCurrentIndex(index);
	};

	// Auto-advance carousel
	useEffect(() => {
		if (!isAutoPlaying) return;

		const interval = setInterval(nextTestimonial, 6000);
		return () => clearInterval(interval);
	}, [isAutoPlaying]);

	const containerVariants = {
		hidden: { opacity: 0, y: 50 },
		visible: {
			opacity: 1,
			y: 0,
			transition: {
				duration: 0.6,
				staggerChildren: 0.2,
			},
		},
	};

	const itemVariants = {
		hidden: { opacity: 0, y: 30 },
		visible: {
			opacity: 1,
			y: 0,
			transition: { duration: 0.5 },
		},
	};

	return (
		<section className="relative bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 py-24 md:py-32 overflow-hidden">
			{/* Background Elements */}
			<div className="absolute inset-0">
				<div className="top-20 left-10 absolute bg-blue-400/10 blur-3xl rounded-full w-72 h-72" />
				<div className="right-10 bottom-20 absolute bg-purple-400/10 blur-3xl rounded-full w-96 h-96" />
			</div>

			<div className="z-10 relative mx-auto px-6 container">
				<motion.div
					variants={containerVariants}
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true, margin: "-100px" }}
					className="mb-20 text-center"
				>
					<motion.div variants={itemVariants}>
						<Badge className="bg-gradient-to-r from-blue-600 to-purple-600 mb-6 px-6 py-3 border-0 font-medium text-white text-sm">
							<Users className="mr-2 w-4 h-4" />
							Success Stories
						</Badge>
					</motion.div>

					<motion.h2
						variants={itemVariants}
						className="mb-8 font-bold text-4xl md:text-5xl lg:text-6xl leading-tight"
					>
						Trusted by{" "}
						<span className="bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-transparent">
							10,000+ Students
						</span>
						<br />
						Worldwide
					</motion.h2>

					<motion.p
						variants={itemVariants}
						className="mx-auto max-w-3xl text-slate-600 text-xl leading-relaxed"
					>
						Real stories from real students who transformed their
						careers and achieved their dreams with Elevate Skill.
					</motion.p>
				</motion.div>

				{/* Main Testimonial Card */}
				<motion.div
					initial={{ opacity: 0, scale: 0.95 }}
					whileInView={{ opacity: 1, scale: 1 }}
					viewport={{ once: true }}
					transition={{ duration: 0.6 }}
					className="mx-auto mb-16 max-w-5xl"
					onMouseEnter={() => setIsAutoPlaying(false)}
					onMouseLeave={() => setIsAutoPlaying(true)}
				>
					<Card className="relative bg-white/80 shadow-2xl shadow-slate-200/50 backdrop-blur-xl p-8 md:p-12 border-0">
						<div className="top-8 left-8 absolute">
							<div className="flex justify-center items-center bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl w-16 h-16">
								<Quote className="w-8 h-8 text-white" />
							</div>
						</div>

						<CardContent className="pt-20">
							<AnimatePresence mode="wait">
								<motion.div
									key={currentIndex}
									initial={{ opacity: 0, x: 50 }}
									animate={{ opacity: 1, x: 0 }}
									exit={{ opacity: 0, x: -50 }}
									transition={{ duration: 0.4 }}
								>
									{/* Rating */}
									<div className="flex gap-1 mb-8">
										{Array.from({ length: 5 }).map(
											(_, i) => (
												<Star
													key={i}
													className={`h-6 w-6 ${
														i <
														currentTestimonial.rating
															? "fill-yellow-400 text-yellow-400"
															: "text-slate-300"
													}`}
												/>
											)
										)}
									</div>

									{/* Testimonial Text */}
									<blockquote className="mb-12 font-medium text-slate-700 text-2xl md:text-3xl leading-relaxed">
										"{currentTestimonial.text}"
									</blockquote>

									{/* Student Profile */}
									<div className="flex md:flex-row flex-col items-center md:items-start gap-6">
										<div className="flex justify-center items-center bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg rounded-2xl w-20 h-20 font-bold text-white text-2xl">
											{currentTestimonial.avatar}
										</div>

										<div className="flex-1 md:text-left text-center">
											<h4 className="mb-2 font-bold text-slate-900 text-2xl">
												{currentTestimonial.name}
											</h4>
											<p className="mb-3 text-slate-600 text-lg">
												{currentTestimonial.role}
											</p>
											<p className="mb-4 text-slate-500">
												{currentTestimonial.company}
											</p>

											<div className="flex md:flex-row flex-col gap-3">
												<Badge
													variant="outline"
													className="border-blue-200 text-blue-600"
												>
													{currentTestimonial.course}
												</Badge>
												<Badge className="bg-gradient-to-r from-green-500 to-emerald-500 border-0 text-white">
													<Award className="mr-1 w-3 h-3" />
													{currentTestimonial.result}
												</Badge>
											</div>
										</div>
									</div>
								</motion.div>
							</AnimatePresence>
						</CardContent>
					</Card>
				</motion.div>

				{/* Navigation Controls */}
				<div className="flex flex-col items-center gap-8">
					{/* Arrow Navigation */}
					<div className="flex gap-4">
						<Button
							variant="outline"
							size="lg"
							onClick={prevTestimonial}
							className="hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-500 border-slate-200 hover:border-transparent rounded-full w-14 h-14 hover:text-white transition-all duration-300"
						>
							<ChevronLeft className="w-6 h-6" />
						</Button>
						<Button
							variant="outline"
							size="lg"
							onClick={nextTestimonial}
							className="hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-500 border-slate-200 hover:border-transparent rounded-full w-14 h-14 hover:text-white transition-all duration-300"
						>
							<ChevronRight className="w-6 h-6" />
						</Button>
					</div>

					{/* Dot Indicators */}
					<div className="flex gap-3">
						{testimonials.map((_, index) => (
							<button
								key={index}
								onClick={() => goToTestimonial(index)}
								className={`h-3 transition-all duration-300 rounded-full ${
									index === currentIndex
										? "w-12 bg-gradient-to-r from-blue-500 to-purple-500"
										: "w-3 bg-slate-300 hover:bg-slate-400"
								}`}
								aria-label={`Go to testimonial ${index + 1}`}
							/>
						))}
					</div>
				</div>

				{/* Stats Row */}
				<motion.div
					initial={{ opacity: 0, y: 30 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.6, delay: 0.3 }}
					className="gap-8 grid grid-cols-2 md:grid-cols-4 mt-20 text-center"
				>
					{[
						{
							label: "Happy Students",
							value: "10,000+",
							icon: Users,
						},
						{
							label: "Course Completion",
							value: "95%",
							icon: Award,
						},
						{ label: "Job Placement", value: "88%", icon: Star },
						{
							label: "Average Rating",
							value: "4.9/5",
							icon: Quote,
						},
					].map((stat, index) => (
						<div key={index} className="group">
							<div className="flex justify-center items-center bg-gradient-to-r from-blue-100 group-hover:from-blue-500 to-purple-100 group-hover:to-purple-500 mx-auto mb-4 rounded-2xl w-16 h-16 transition-all duration-300">
								<stat.icon className="w-8 h-8 text-slate-600 group-hover:text-white transition-colors duration-300" />
							</div>
							<div className="mb-2 font-bold text-slate-900 text-2xl md:text-3xl">
								{stat.value}
							</div>
							<div className="text-slate-600">{stat.label}</div>
						</div>
					))}
				</motion.div>
			</div>
		</section>
	);
}
