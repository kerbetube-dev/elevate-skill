/**
 * Modern Footer Component
 * Comprehensive footer with links, social media, and newsletter
 */

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import {
	Mail,
	Phone,
	MapPin,
	Send,
	Heart,
	ArrowUp,
	Facebook,
	Twitter,
	Instagram,
	Linkedin,
	Youtube,
	BookOpen,
	Users,
	Award,
	Shield,
	Clock,
	Star,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import elevateSkillLogo from "@/assets/elevate-skill-logo.png";
import { env } from "@/config/env";
import { useToast } from "@/hooks/use-toast";

export function Footer() {
	const [email, setEmail] = useState("");
	const [isSubscribing, setIsSubscribing] = useState(false);
	const { toast } = useToast();

	const handleNewsletterSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!email.trim()) return;

		setIsSubscribing(true);

		// Simulate API call
		setTimeout(() => {
			toast({
				title: "Successfully Subscribed!",
				description:
					"You'll receive updates about new courses and offers.",
			});
			setEmail("");
			setIsSubscribing(false);
		}, 1000);
	};

	const scrollToTop = () => {
		window.scrollTo({ top: 0, behavior: "smooth" });
	};

	const footerLinks = {
		platform: [
			{ label: "All Courses", href: "/courses" },
			{ label: "Course Categories", href: "/categories" },
			{ label: "Become Instructor", href: "/instructor" },
			{ label: "Student Dashboard", href: "/dashboard" },
		],
		company: [
			{ label: "About Us", href: "/about" },
			{ label: "Our Story", href: "/story" },
			{ label: "Careers", href: "/careers" },
			{ label: "Press Kit", href: "/press" },
		],
		support: [
			{ label: "Help Center", href: "/help" },
			{ label: "Contact Support", href: "/support" },
			{ label: "System Status", href: "/status" },
			{ label: "Course Refunds", href: "/refunds" },
		],
		legal: [
			{ label: "Terms of Service", href: "/terms" },
			{ label: "Privacy Policy", href: "/privacy" },
			{ label: "Cookie Policy", href: "/cookies" },
			{ label: "Copyright", href: "/copyright" },
		],
	};

	const socialLinks = [
		{
			icon: Facebook,
			href: "#",
			label: "Facebook",
			color: "hover:text-blue-600",
		},
		{
			icon: Twitter,
			href: "#",
			label: "Twitter",
			color: "hover:text-blue-400",
		},
		{
			icon: Instagram,
			href: "#",
			label: "Instagram",
			color: "hover:text-pink-600",
		},
		{
			icon: Linkedin,
			href: "#",
			label: "LinkedIn",
			color: "hover:text-blue-700",
		},
		{
			icon: Youtube,
			href: "#",
			label: "YouTube",
			color: "hover:text-red-600",
		},
	];

	const stats = [
		{ icon: Users, value: "8,000+", label: "Active Students" },
		{ icon: BookOpen, value: "6", label: "Expert Courses" },
		{ icon: Award, value: "5,000+", label: "Certificates Issued" },
		{ icon: Star, value: "4.9", label: "Average Rating" },
	];

	return (
		<footer className="relative bg-gradient-mesh overflow-hidden">
			{/* Background Pattern */}
			<div className="absolute inset-0 opacity-30">
				<div className="top-0 left-0 absolute bg-[linear-gradient(45deg,#8080800a_1px,transparent_1px),linear-gradient(-45deg,#8080800a_1px,transparent_1px)] bg-[size:20px_20px] w-full h-full" />
			</div>

			<div className="z-10 relative">
				{/* Newsletter Section */}
				<section className="py-16 border-b border-border/20">
					<div className="mx-auto px-4 container">
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
							transition={{ duration: 0.5 }}
							className="mx-auto max-w-4xl text-center"
						>
							<Badge className="bg-gradient-primary mb-4 px-4 py-2 border-0 text-white">
								<Mail className="mr-2 w-4 h-4" />
								Stay Updated
							</Badge>
							<h3 className="mb-4 font-bold text-3xl md:text-4xl">
								Get the Latest Course Updates
							</h3>
							<p className="mx-auto mb-8 max-w-2xl text-muted-foreground text-lg">
								Subscribe to our newsletter and be the first to
								know about new courses, special offers, and
								learning opportunities.
							</p>

							<form
								onSubmit={handleNewsletterSubmit}
								className="flex sm:flex-row flex-col gap-4 mx-auto max-w-md"
							>
								<Input
									type="email"
									placeholder="Enter your email address"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									className="flex-1 h-12 text-base"
									required
								/>
								<Button
									type="submit"
									variant="gradient"
									size="lg"
									disabled={isSubscribing}
									className="group shadow-glow"
								>
									{isSubscribing ? (
										"Subscribing..."
									) : (
										<>
											Subscribe
											<Send className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
										</>
									)}
								</Button>
							</form>
						</motion.div>
					</div>
				</section>

				{/* Stats Section */}
				<section className="py-12 border-b border-border/20">
					<div className="mx-auto px-4 container">
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
							transition={{ duration: 0.5 }}
							className="gap-8 grid grid-cols-2 md:grid-cols-4"
						>
							{stats.map((stat, index) => {
								const Icon = stat.icon;
								return (
									<motion.div
										key={index}
										initial={{ opacity: 0, scale: 0.8 }}
										whileInView={{ opacity: 1, scale: 1 }}
										viewport={{ once: true }}
										transition={{
											duration: 0.5,
											delay: index * 0.1,
										}}
										className="group text-center"
									>
										<div className="inline-flex justify-center items-center bg-primary/10 mb-3 rounded-xl w-12 h-12 text-primary group-hover:scale-110 transition-transform">
											<Icon className="w-6 h-6" />
										</div>
										<div className="mb-1 font-bold text-2xl md:text-3xl">
											{stat.value}
										</div>
										<div className="text-muted-foreground text-sm">
											{stat.label}
										</div>
									</motion.div>
								);
							})}
						</motion.div>
					</div>
				</section>

				{/* Main Footer Content */}
				<section className="py-16">
					<div className="mx-auto px-4 container">
						<div className="gap-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6">
							{/* Brand Section */}
							<motion.div
								initial={{ opacity: 0, y: 20 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true }}
								transition={{ duration: 0.5 }}
								className="space-y-6 lg:col-span-2"
							>
								<div className="flex items-center gap-3">
									<img
										src={elevateSkillLogo}
										alt="Elevate Skill"
										className="w-10 h-10"
									/>
									<h3 className="bg-clip-text bg-gradient-primary font-bold text-transparent text-2xl">
										{env.APP_NAME}
									</h3>
								</div>

								<p className="text-muted-foreground leading-relaxed">
									{env.APP_DESCRIPTION}. Join thousands of
									students who are already transforming their
									careers with our expert-led courses.
								</p>

								{/* Contact Info */}
								<div className="space-y-3">
									<div className="flex items-center gap-3 text-muted-foreground">
										<MapPin className="w-5 h-5 text-primary" />
										<span>Addis Ababa, Ethiopia</span>
									</div>
									<div className="flex items-center gap-3 text-muted-foreground">
										<Phone className="w-5 h-5 text-primary" />
										<span>+251 91 234 5678</span>
									</div>
									<div className="flex items-center gap-3 text-muted-foreground">
										<Mail className="w-5 h-5 text-primary" />
										<span>hello@elevateskill.com</span>
									</div>
								</div>

								{/* Social Links */}
								<div className="flex items-center gap-4">
									{socialLinks.map((social, index) => {
										const Icon = social.icon;
										return (
											<motion.a
												key={index}
												href={social.href}
												aria-label={social.label}
												whileHover={{
													scale: 1.1,
													y: -2,
												}}
												whileTap={{ scale: 0.95 }}
												className={`p-2 rounded-lg bg-muted/50 text-muted-foreground transition-colors ${social.color}`}
											>
												<Icon className="w-5 h-5" />
											</motion.a>
										);
									})}
								</div>
							</motion.div>

							{/* Footer Links */}
							{Object.entries(footerLinks).map(
								([category, links], columnIndex) => (
									<motion.div
										key={category}
										initial={{ opacity: 0, y: 20 }}
										whileInView={{ opacity: 1, y: 0 }}
										viewport={{ once: true }}
										transition={{
											duration: 0.5,
											delay: columnIndex * 0.1,
										}}
										className="space-y-4"
									>
										<h4 className="font-semibold text-foreground capitalize">
											{category === "platform"
												? "Platform"
												: category === "company"
												? "Company"
												: category === "support"
												? "Support"
												: "Legal"}
										</h4>
										<ul className="space-y-3">
											{links.map((link, index) => (
												<li key={index}>
													<Link
														to={link.href}
														className="group inline-flex items-center text-muted-foreground hover:text-primary transition-colors"
													>
														{link.label}
														<motion.span
															initial={{
																x: -10,
																opacity: 0,
															}}
															whileHover={{
																x: 0,
																opacity: 1,
															}}
															className="ml-1"
														>
															→
														</motion.span>
													</Link>
												</li>
											))}
										</ul>
									</motion.div>
								)
							)}
						</div>
					</div>
				</section>

				{/* Bottom Bar */}
				<section className="py-6 border-t border-border/20">
					<div className="mx-auto px-4 container">
						<div className="flex md:flex-row flex-col justify-between items-center gap-4">
							<motion.div
								initial={{ opacity: 0 }}
								whileInView={{ opacity: 1 }}
								viewport={{ once: true }}
								className="flex items-center gap-2 text-muted-foreground text-sm"
							>
								<span>
									© {new Date().getFullYear()} {env.APP_NAME}.
									All rights reserved.
								</span>
								<span className="hidden md:inline">•</span>
								<span className="flex items-center gap-1">
									Made with{" "}
									<Heart className="fill-current w-4 h-4 text-red-500" />{" "}
									in Ethiopia
								</span>
							</motion.div>

							<motion.div
								initial={{ opacity: 0 }}
								whileInView={{ opacity: 1 }}
								viewport={{ once: true }}
								className="flex items-center gap-4"
							>
								<div className="flex items-center gap-2 text-muted-foreground text-sm">
									<Shield className="w-4 h-4 text-green-500" />
									<span>Secure & Trusted</span>
								</div>
								<Button
									variant="outline"
									size="sm"
									onClick={scrollToTop}
									className="group"
								>
									<ArrowUp className="w-4 h-4 transition-transform group-hover:-translate-y-1" />
									Top
								</Button>
							</motion.div>
						</div>
					</div>
				</section>
			</div>
		</footer>
	);
}
