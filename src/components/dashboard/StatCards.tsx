/**
 * Simplified Stat Cards for Dashboard
 * Clean gradient cards with icons, no trend indicators
 */

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import CountUp from "react-countup";
import { staggerContainer, staggerItem } from "@/lib/animations";
import { MiniLoader, StatCardSkeleton } from "@/components/ui/mini-loader";

interface StatCardProps {
	title: string;
	value: number;
	suffix?: string;
	prefix?: string;
	icon: LucideIcon;
	gradient: "primary" | "success" | "warning" | "ocean" | "sunset" | "purple";
	delay?: number;
	isLoading?: boolean;
}

interface StatCardsProps {
	stats: StatCardProps[];
	isLoading?: boolean;
}

const gradientClasses = {
	primary: "from-purple-500 to-blue-600",
	success: "from-green-500 to-emerald-600",
	warning: "from-orange-500 to-red-600",
	ocean: "from-blue-400 to-cyan-500",
	sunset: "from-pink-500 to-orange-500",
	purple: "from-purple-600 to-indigo-600",
};

const iconBackgroundClasses = {
	primary: "bg-purple-500/20 text-purple-600 dark:text-purple-400",
	success: "bg-green-500/20 text-green-600 dark:text-green-400",
	warning: "bg-orange-500/20 text-orange-600 dark:text-orange-400",
	ocean: "bg-blue-500/20 text-blue-600 dark:text-blue-400",
	sunset: "bg-pink-500/20 text-pink-600 dark:text-pink-400",
	purple: "bg-indigo-500/20 text-indigo-600 dark:text-indigo-400",
};

export function StatCard({
	title,
	value,
	suffix = "",
	prefix = "",
	icon: Icon,
	gradient,
	delay = 0,
	isLoading = false,
}: StatCardProps) {
	if (isLoading) {
		return <StatCardSkeleton />;
	}

	return (
		<motion.div
			variants={staggerItem}
			whileHover={{ y: -5, scale: 1.02 }}
			transition={{ duration: 0.2 }}
		>
			<Card className="group relative overflow-hidden hover-lift">
				{/* Gradient Background Strip */}
				<div
					className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${gradientClasses[gradient]}`}
				/>

				<div className="p-6">
					<div className="flex justify-between items-start mb-4">
						{/* Icon */}
						<motion.div
							whileHover={{ rotate: 360 }}
							transition={{ duration: 0.5 }}
							className={`w-12 h-12 rounded-xl flex items-center justify-center ${iconBackgroundClasses[gradient]}`}
						>
							<Icon className="w-6 h-6" />
						</motion.div>
					</div>

					{/* Value */}
					<div className="space-y-1">
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ delay: delay + 0.2 }}
							className="font-bold text-3xl"
						>
							{prefix}
							<CountUp
								start={0}
								end={value}
								duration={2}
								delay={delay}
								separator=","
								decimals={0}
							/>
							{suffix}
						</motion.div>
						<p className="text-muted-foreground text-sm">{title}</p>
					</div>
				</div>

				{/* Hover Glow Effect */}
				<div
					className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 bg-gradient-to-br ${gradientClasses[gradient]}`}
				/>
			</Card>
		</motion.div>
	);
}

export function StatCards({ stats, isLoading = false }: StatCardsProps) {
	if (isLoading) {
		return (
			<div className="gap-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
				{Array.from({ length: 4 }).map((_, index) => (
					<StatCardSkeleton key={index} />
				))}
			</div>
		);
	}

	return (
		<motion.div
			variants={staggerContainer}
			initial="hidden"
			animate="visible"
			className="gap-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
		>
			{stats.map((stat, index) => (
				<StatCard key={index} {...stat} delay={index * 0.1} />
			))}
		</motion.div>
	);
}
