/**
 * Modern Navbar Component
 * Responsive navigation with animations and smooth scrolling
 */

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import {
	Menu,
	X,
	ChevronDown,
	LogIn,
	UserPlus,
	Home,
	BookOpen,
	Star,
	Phone,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import elevateSkillLogo from "@/assets/elevate-skill-logo.png";
import { env } from "@/config/env";

interface NavbarProps {
	className?: string;
}

export function Navbar({ className = "" }: NavbarProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [isScrolled, setIsScrolled] = useState(false);
	const navigate = useNavigate();

	// Handle scroll effect
	useEffect(() => {
		const handleScroll = () => {
			setIsScrolled(window.scrollY > 20);
		};

		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	// Navigation items
	const navItems = [
		{ href: "#home", label: "Home", icon: Home },
		{ href: "#features", label: "Features", icon: Star },
		{ href: "#courses", label: "Courses", icon: BookOpen },
		{ href: "#testimonials", label: "Reviews", icon: Star },
		{ href: "#contact", label: "Contact", icon: Phone },
	];

	const scrollToSection = (href: string) => {
		const targetId = href.substring(1);
		const element = document.getElementById(targetId);
		if (element) {
			element.scrollIntoView({ behavior: "smooth" });
		}
		setIsOpen(false);
	};

	return (
		<motion.nav
			initial={{ y: -100 }}
			animate={{ y: 0 }}
			transition={{ type: "spring", stiffness: 100, damping: 20 }}
			className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
				isScrolled
					? "bg-background/95 backdrop-blur-xl border-b shadow-lg"
					: "bg-transparent"
			} ${className}`}
		>
			<div className="mx-auto px-4 sm:px-6 lg:px-8 container">
				<div className="flex justify-between items-center h-16 md:h-20">
					{/* Logo */}
					<motion.div
						whileHover={{ scale: 1.05 }}
						className="flex items-center gap-2 sm:gap-3 cursor-pointer"
						onClick={() => scrollToSection("#home")}
					>
						<img
							src={elevateSkillLogo}
							alt="Elevate Skill"
							className="w-8 md:w-10 h-8 md:h-10"
						/>
						<h1 className="bg-clip-text bg-gradient-primary font-bold text-transparent text-lg sm:text-xl md:text-2xl">
							{env.APP_NAME}
						</h1>
					</motion.div>

					{/* Desktop Navigation */}
					<div className="hidden lg:flex items-center space-x-6 xl:space-x-8">
						{navItems.map((item, index) => (
							<motion.button
								key={item.href}
								initial={{ opacity: 0, y: -20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: index * 0.1 }}
								onClick={() => scrollToSection(item.href)}
								className="group flex items-center gap-2 font-medium text-foreground/80 hover:text-primary transition-colors"
							>
								<item.icon className="w-4 h-4 group-hover:scale-110 transition-transform" />
								{item.label}
							</motion.button>
						))}
					</div>

					{/* Desktop Auth Buttons */}
					<div className="hidden lg:flex items-center gap-3 xl:gap-4">
						<Button
							variant="ghost"
							size="sm"
							onClick={() => navigate("/login")}
							className="group"
						>
							<LogIn className="mr-2 w-4 h-4 group-hover:scale-110 transition-transform" />
							Login
						</Button>
						<Button
							variant="gradient"
							size="sm"
							onClick={() => navigate("/register")}
							className="group shadow-glow"
						>
							<UserPlus className="mr-2 w-4 h-4 group-hover:scale-110 transition-transform" />
							Get Started
						</Button>
					</div>

					{/* Mobile Menu Button */}
					<motion.button
						whileTap={{ scale: 0.95 }}
						onClick={() => setIsOpen(!isOpen)}
						className="lg:hidden hover:bg-muted p-2 rounded-lg transition-colors"
					>
						<AnimatePresence mode="wait">
							{isOpen ? (
								<motion.div
									key="close"
									initial={{ rotate: -90, opacity: 0 }}
									animate={{ rotate: 0, opacity: 1 }}
									exit={{ rotate: 90, opacity: 0 }}
									transition={{ duration: 0.2 }}
								>
									<X className="w-6 h-6" />
								</motion.div>
							) : (
								<motion.div
									key="menu"
									initial={{ rotate: 90, opacity: 0 }}
									animate={{ rotate: 0, opacity: 1 }}
									exit={{ rotate: -90, opacity: 0 }}
									transition={{ duration: 0.2 }}
								>
									<Menu className="w-6 h-6" />
								</motion.div>
							)}
						</AnimatePresence>
					</motion.button>
				</div>
			</div>

			{/* Mobile Menu */}
			<AnimatePresence>
				{isOpen && (
					<motion.div
						initial={{ opacity: 0, height: 0 }}
						animate={{ opacity: 1, height: "auto" }}
						exit={{ opacity: 0, height: 0 }}
						transition={{ duration: 0.3 }}
						className="lg:hidden bg-background/95 backdrop-blur-xl border-t"
					>
						<div className="mx-auto px-4 sm:px-6 py-6 container">
							<div className="space-y-4">
								{navItems.map((item, index) => (
									<motion.button
										key={item.href}
										initial={{ opacity: 0, x: -20 }}
										animate={{ opacity: 1, x: 0 }}
										transition={{ delay: index * 0.1 }}
										onClick={() =>
											scrollToSection(item.href)
										}
										className="group flex items-center gap-3 hover:bg-muted p-3 rounded-lg w-full text-left transition-colors"
									>
										<item.icon className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
										<span className="font-medium">
											{item.label}
										</span>
									</motion.button>
								))}

								{/* Mobile Auth Buttons */}
								<div className="space-y-3 pt-4 border-t">
									<Button
										variant="outline"
										size="lg"
										onClick={() => {
											navigate("/login");
											setIsOpen(false);
										}}
										className="group w-full"
									>
										<LogIn className="mr-2 w-4 h-4 group-hover:scale-110 transition-transform" />
										Login
									</Button>
									<Button
										variant="gradient"
										size="lg"
										onClick={() => {
											navigate("/register");
											setIsOpen(false);
										}}
										className="group shadow-glow w-full"
									>
										<UserPlus className="mr-2 w-4 h-4 group-hover:scale-110 transition-transform" />
										Get Started Free
									</Button>
								</div>
							</div>
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</motion.nav>
	);
}
