/**
 * FAQ Section with Animated Accordion
 * Answers common questions about Elevate Skill
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Plus,
	Minus,
	HelpCircle,
	MessageCircle,
	ArrowRight,
} from "lucide-react";
import { staggerContainer, staggerItem } from "@/lib/animations";

interface FAQItem {
	id: number;
	question: string;
	answer: string;
	category: "general" | "courses" | "payment" | "technical";
}

const faqData: FAQItem[] = [
	{
		id: 1,
		question: "What is Elevate Skill and how does it work?",
		answer: "Elevate Skill is an online learning platform that offers expert-led courses in digital marketing, web development, graphics design, video editing, English communication, and mobile app development. You can enroll in courses, learn at your own pace, and receive certificates upon completion.",
		category: "general",
	},
	{
		id: 2,
		question: "How much do the courses cost?",
		answer: "Course prices vary depending on the content and duration. Most courses range from 500 ETB to 2000 ETB. We also offer payment plans and occasional discounts. Check individual course pages for specific pricing.",
		category: "payment",
	},
	{
		id: 3,
		question: "Do I get a certificate after completing a course?",
		answer: "Yes! Upon successful completion of any course, you'll receive a verified certificate that you can download and share on your resume or LinkedIn profile. Our certificates are recognized by industry professionals.",
		category: "courses",
	},
	{
		id: 4,
		question: "Can I access courses on mobile devices?",
		answer: "Absolutely! Our platform is fully responsive and works seamlessly on all devices including smartphones, tablets, and computers. You can learn anywhere, anytime.",
		category: "technical",
	},
	{
		id: 5,
		question: "How long do I have access to course materials?",
		answer: "Once you enroll in a course, you have lifetime access to all course materials, including videos, resources, and updates. You can revisit the content anytime to refresh your knowledge.",
		category: "courses",
	},
	{
		id: 6,
		question: "What payment methods do you accept?",
		answer: "We accept various payment methods including bank transfers, mobile money (TeleBirr), and other local payment options. All payments are secure and encrypted.",
		category: "payment",
	},
	{
		id: 7,
		question: "Can I get a refund if I'm not satisfied?",
		answer: "Yes, we offer a 30-day money-back guarantee. If you're not satisfied with a course within the first 30 days of enrollment, you can request a full refund.",
		category: "payment",
	},
	{
		id: 8,
		question: "Do you provide job placement assistance?",
		answer: "While we don't guarantee job placement, our courses are designed to make you job-ready. We provide career guidance, portfolio building tips, and connect you with our alumni network.",
		category: "general",
	},
	{
		id: 9,
		question: "Are there any prerequisites for the courses?",
		answer: "Most of our courses are designed for beginners and don't require prior experience. However, some advanced courses may have prerequisites, which are clearly mentioned on the course page.",
		category: "courses",
	},
	{
		id: 10,
		question: "How do I contact support if I need help?",
		answer: "You can reach our support team through multiple channels: email support, live chat on our website, or through our community forum. We typically respond within 24 hours.",
		category: "technical",
	},
];

const categories = [
	{ key: "all", label: "All Questions", icon: HelpCircle },
	{ key: "general", label: "General", icon: MessageCircle },
	{ key: "courses", label: "Courses", icon: HelpCircle },
	{ key: "payment", label: "Payment", icon: MessageCircle },
	{ key: "technical", label: "Technical", icon: HelpCircle },
];

export function FAQSection() {
	const [activeId, setActiveId] = useState<number | null>(null);
	const [activeCategory, setActiveCategory] = useState<string>("all");

	const filteredFAQs =
		activeCategory === "all"
			? faqData
			: faqData.filter((faq) => faq.category === activeCategory);

	const toggleFAQ = (id: number) => {
		setActiveId(activeId === id ? null : id);
	};

	return (
		<section
			id="faq"
			className="relative bg-background py-20 md:py-32 overflow-hidden"
		>
			{/* Background Pattern */}
			<div className="absolute inset-0 opacity-30">
				<div className="top-0 left-0 absolute bg-[radial-gradient(circle_at_center,#8080800a_1px,transparent_1px)] bg-[size:20px_20px] w-full h-full" />
			</div>

			<div className="z-10 relative mx-auto px-4 container">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.5 }}
					className="mb-16 text-center"
				>
					<Badge className="bg-gradient-sunset mb-4 px-4 py-2 border-0 text-white">
						<HelpCircle className="mr-2 w-4 h-4" />
						Got Questions?
					</Badge>
					<h2 className="mb-6 font-bold text-4xl md:text-5xl lg:text-6xl">
						Frequently Asked{" "}
						<span className="bg-clip-text bg-gradient-sunset text-transparent">
							Questions
						</span>
					</h2>
					<p className="mx-auto max-w-3xl text-muted-foreground text-xl">
						Find answers to common questions about our courses,
						platform, and services.
					</p>
				</motion.div>

				{/* Category Filter */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.5, delay: 0.2 }}
					className="flex flex-wrap justify-center gap-3 mb-12"
				>
					{categories.map((category) => {
						const Icon = category.icon;
						return (
							<Button
								key={category.key}
								variant={
									activeCategory === category.key
										? "default"
										: "outline"
								}
								size="sm"
								onClick={() => setActiveCategory(category.key)}
								className={`group ${
									activeCategory === category.key
										? "bg-gradient-primary text-white shadow-glow"
										: "hover:bg-muted"
								}`}
							>
								<Icon className="mr-2 w-4 h-4 group-hover:scale-110 transition-transform" />
								{category.label}
							</Button>
						);
					})}
				</motion.div>

				{/* FAQ Items */}
				<motion.div
					variants={staggerContainer}
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true, margin: "-100px" }}
					className="space-y-4 mx-auto max-w-4xl"
				>
					<AnimatePresence mode="wait">
						{filteredFAQs.map((faq, index) => (
							<motion.div
								key={`${activeCategory}-${faq.id}`}
								variants={staggerItem}
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: -20 }}
								transition={{
									duration: 0.3,
									delay: index * 0.1,
								}}
								className="border hover:border-primary/30 border-border/50 rounded-2xl overflow-hidden transition-all duration-300 glass"
							>
								<motion.button
									onClick={() => toggleFAQ(faq.id)}
									className="flex justify-between items-center hover:bg-muted/30 p-6 w-full text-left transition-colors"
									whileHover={{
										backgroundColor: "rgba(0,0,0,0.02)",
									}}
								>
									<h3 className="pr-4 font-semibold group-hover:text-primary text-lg transition-colors">
										{faq.question}
									</h3>
									<motion.div
										animate={{
											rotate:
												activeId === faq.id ? 180 : 0,
										}}
										transition={{ duration: 0.3 }}
										className="flex-shrink-0"
									>
										{activeId === faq.id ? (
											<Minus className="w-5 h-5 text-primary" />
										) : (
											<Plus className="w-5 h-5 text-muted-foreground" />
										)}
									</motion.div>
								</motion.button>

								<AnimatePresence>
									{activeId === faq.id && (
										<motion.div
											initial={{ height: 0, opacity: 0 }}
											animate={{
												height: "auto",
												opacity: 1,
											}}
											exit={{ height: 0, opacity: 0 }}
											transition={{ duration: 0.3 }}
											className="overflow-hidden"
										>
											<div className="px-6 pb-6">
												<motion.p
													initial={{
														y: -10,
														opacity: 0,
													}}
													animate={{
														y: 0,
														opacity: 1,
													}}
													transition={{ delay: 0.1 }}
													className="text-muted-foreground text-base leading-relaxed"
												>
													{faq.answer}
												</motion.p>
											</div>
										</motion.div>
									)}
								</AnimatePresence>
							</motion.div>
						))}
					</AnimatePresence>
				</motion.div>

				{/* Still have questions CTA */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.5, delay: 0.4 }}
					className="mt-16 text-center"
				>
					<div className="mx-auto p-8 rounded-2xl max-w-2xl glass">
						<h3 className="mb-4 font-bold text-2xl">
							Still have questions?
						</h3>
						<p className="mb-6 text-muted-foreground">
							Can't find the answer you're looking for? Our
							support team is here to help.
						</p>
						<Button
							variant="gradient"
							size="lg"
							className="group shadow-glow"
						>
							<MessageCircle className="mr-2 w-5 h-5 group-hover:scale-110 transition-transform" />
							Contact Support
							<ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
						</Button>
					</div>
				</motion.div>
			</div>
		</section>
	);
}
