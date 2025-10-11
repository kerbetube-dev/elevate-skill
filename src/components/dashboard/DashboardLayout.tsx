/**
 * Modern Dashboard Layout with Collapsible Sidebar
 * Professional, responsive layout with smooth animations
 */

import { ReactNode, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
	Home,
	BookOpen,
	GraduationCap,
	Share2,
	DollarSign,
	User,
	LogOut,
	Search,
	Menu,
	X,
	ChevronLeft,
	ChevronRight,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import elevateSkillLogo from "@/assets/elevate-skill-logo.png";

interface Tab {
	id: string;
	label: string;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	icon: any;
	badge?: number;
}

interface DashboardLayoutProps {
	children: ReactNode;
	activeTab: string;
	onTabChange: (tabId: string) => void;
	userName: string;
	userEmail: string;
	onLogout: () => void;
}

const tabs: Tab[] = [
	{ id: "home", label: "Home", icon: Home },
	{ id: "courses", label: "Courses", icon: BookOpen },
	{ id: "enrolled", label: "My Courses", icon: GraduationCap },
	{ id: "refer", label: "Refer Friends", icon: Share2 },
	{ id: "withdrawals", label: "Withdrawals", icon: DollarSign },
];

export function DashboardLayout({
	children,
	activeTab,
	onTabChange,
	userName,
	userEmail,
	onLogout,
}: DashboardLayoutProps) {
	const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
	const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
	const navigate = useNavigate();

	const getUserInitials = (name: string) => {
		return name
			.split(" ")
			.map((n) => n[0])
			.join("")
			.toUpperCase()
			.substring(0, 2);
	};

	const SidebarContent = ({ isMobile = false }: { isMobile?: boolean }) => (
		<div className="flex flex-col bg-background h-full">
			{/* Logo */}
			<div className="p-6">
				<Link to="/" className="group flex items-center gap-3">
					<motion.img
						whileHover={{ scale: 1.1, rotate: 360 }}
						transition={{ duration: 0.5 }}
						src={elevateSkillLogo}
						alt="Elevate Skill"
						className="w-10 h-10"
					/>
					<AnimatePresence>
						{(!sidebarCollapsed || isMobile) && (
							<motion.h1
								initial={{ opacity: 0, width: 0 }}
								animate={{ opacity: 1, width: "auto" }}
								exit={{ opacity: 0, width: 0 }}
								className="bg-clip-text bg-gradient-primary font-bold text-transparent text-2xl whitespace-nowrap"
							>
								Elevate Skill
							</motion.h1>
						)}
					</AnimatePresence>
				</Link>
			</div>

			<Separator />

			{/* User Profile */}
			<div className="p-6">
				<div className="flex items-center gap-3">
					<Avatar className="bg-gradient-primary w-12 h-12">
						<AvatarFallback className="bg-gradient-primary font-semibold text-white">
							{getUserInitials(userName)}
						</AvatarFallback>
					</Avatar>
					<AnimatePresence>
						{(!sidebarCollapsed || isMobile) && (
							<motion.div
								initial={{ opacity: 0, width: 0 }}
								animate={{ opacity: 1, width: "auto" }}
								exit={{ opacity: 0, width: 0 }}
								className="flex-1 min-w-0"
							>
								<p className="font-semibold text-foreground text-sm truncate">
									{userName}
								</p>
								<p className="text-muted-foreground text-xs truncate">
									{userEmail}
								</p>
							</motion.div>
						)}
					</AnimatePresence>
				</div>
			</div>

			<Separator />

			{/* Navigation */}
			<nav className="flex-1 space-y-2 p-4 overflow-y-auto">
				{tabs.map((tab) => {
					const Icon = tab.icon;
					const isActive = activeTab === tab.id;

					return (
						<motion.button
							key={tab.id}
							whileHover={{ scale: 1.02 }}
							whileTap={{ scale: 0.98 }}
							onClick={() => {
								onTabChange(tab.id);
								setMobileSidebarOpen(false);
							}}
							className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
								isActive
									? "bg-gradient-primary text-white shadow-glow"
									: "hover:bg-muted text-muted-foreground hover:text-foreground"
							}`}
						>
							<Icon className="flex-shrink-0 w-5 h-5" />
							<AnimatePresence>
								{(!sidebarCollapsed || isMobile) && (
									<motion.span
										initial={{ opacity: 0, width: 0 }}
										animate={{ opacity: 1, width: "auto" }}
										exit={{ opacity: 0, width: 0 }}
										className="font-medium whitespace-nowrap"
									>
										{tab.label}
									</motion.span>
								)}
							</AnimatePresence>
							{tab.badge &&
								tab.badge > 0 &&
								(!sidebarCollapsed || isMobile) && (
									<Badge
										className="ml-auto"
										variant="destructive"
									>
										{tab.badge}
									</Badge>
								)}
						</motion.button>
					);
				})}
			</nav>

			<Separator />

			{/* Bottom Actions */}
			<div className="space-y-2 p-4">
				<Button
					variant="ghost"
					className="justify-start hover:bg-destructive/10 w-full text-destructive hover:text-destructive"
					onClick={onLogout}
				>
					<LogOut className="w-5 h-5" />
					{(!sidebarCollapsed || isMobile) && (
						<span className="ml-3">Logout</span>
					)}
				</Button>
			</div>

			{/* Collapse Toggle (Desktop only) */}
			{!isMobile && (
				<div className="hidden lg:block p-4">
					<Button
						variant="outline"
						size="sm"
						className="w-full"
						onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
					>
						{sidebarCollapsed ? (
							<ChevronRight className="w-4 h-4" />
						) : (
							<>
								<ChevronLeft className="w-4 h-4" />
								<span className="ml-2">Collapse</span>
							</>
						)}
					</Button>
				</div>
			)}
		</div>
	);

	return (
		<div className="flex bg-background min-h-screen">
			{/* Desktop Sidebar */}
			<motion.aside
				initial={false}
				animate={{ width: sidebarCollapsed ? 80 : 280 }}
				transition={{ duration: 0.3, ease: "easeInOut" }}
				className="hidden lg:block top-0 sticky bg-card border-r h-screen overflow-hidden"
			>
				<SidebarContent isMobile={false} />
			</motion.aside>

			{/* Mobile Sidebar */}
			<AnimatePresence>
				{mobileSidebarOpen && (
					<>
						{/* Backdrop */}
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							onClick={() => setMobileSidebarOpen(false)}
							className="lg:hidden z-40 fixed inset-0 bg-black/50"
						/>

						{/* Sidebar */}
						<motion.aside
							initial={{ x: -280 }}
							animate={{ x: 0 }}
							exit={{ x: -280 }}
							transition={{ type: "spring", damping: 25 }}
							className="lg:hidden top-0 left-0 z-50 fixed bg-background shadow-xl border-r border-border w-72 h-full"
						>
							<div className="top-4 right-4 z-10 absolute">
								<Button
									variant="ghost"
									size="icon"
									onClick={() => setMobileSidebarOpen(false)}
									className="bg-background/80 hover:bg-background text-foreground"
								>
									<X className="w-5 h-5" />
								</Button>
							</div>
							<SidebarContent />
						</motion.aside>
					</>
				)}
			</AnimatePresence>

			{/* Main Content */}
			<div className="flex flex-col flex-1 min-h-screen">
				{/* Top Navigation */}
				<header className="top-0 z-30 sticky bg-background/95 supports-[backdrop-filter]:bg-background/60 backdrop-blur border-b">
					<div className="flex items-center gap-4 px-4 md:px-6 h-16">
						{/* Mobile Menu Button */}
						<Button
							variant="ghost"
							size="icon"
							className="lg:hidden"
							onClick={() => setMobileSidebarOpen(true)}
						>
							<Menu className="w-5 h-5" />
						</Button>

						{/* Search Bar */}
						<div className="flex-1 max-w-md">
							<div className="relative">
								<Search className="top-1/2 left-3 absolute w-4 h-4 text-muted-foreground -translate-y-1/2 transform" />
								<input
									type="search"
									placeholder="Search courses..."
									className="bg-background pr-4 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary w-full h-10 text-sm"
								/>
							</div>
						</div>

						{/* Right Actions */}
						<div className="flex items-center gap-2">
							{/* User Menu (Mobile) */}
							<div className="lg:hidden">
								<Avatar className="bg-gradient-primary w-9 h-9 cursor-pointer">
									<AvatarFallback className="bg-gradient-primary font-semibold text-white text-xs">
										{getUserInitials(userName)}
									</AvatarFallback>
								</Avatar>
							</div>
						</div>
					</div>
				</header>

				{/* Page Content */}
				<main className="flex-1 p-4 md:p-6 lg:p-8">
					<motion.div
						key={activeTab}
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -20 }}
						transition={{ duration: 0.3 }}
					>
						{children}
					</motion.div>
				</main>
			</div>
		</div>
	);
}
