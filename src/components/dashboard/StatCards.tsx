/**
 * Animated Stat Cards for Dashboard
 * Beautiful gradient cards with icons and animations
 */

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import CountUp from "react-countup";
import { staggerContainer, staggerItem } from "@/lib/animations";

interface StatCardProps {
  title: string;
  value: number;
  suffix?: string;
  prefix?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    positive: boolean;
  };
  gradient: "primary" | "success" | "warning" | "ocean" | "sunset" | "purple";
  delay?: number;
}

interface StatCardsProps {
  stats: StatCardProps[];
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
  trend,
  gradient,
  delay = 0,
}: StatCardProps) {
  return (
    <motion.div
      variants={staggerItem}
      whileHover={{ y: -5, scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="relative overflow-hidden hover-lift group">
        {/* Gradient Background Strip */}
        <div
          className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${gradientClasses[gradient]}`}
        />

        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            {/* Icon */}
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
              className={`w-12 h-12 rounded-xl flex items-center justify-center ${iconBackgroundClasses[gradient]}`}
            >
              <Icon className="h-6 w-6" />
            </motion.div>

            {/* Trend Badge */}
            {trend && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: delay + 0.3 }}
                className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                  trend.positive
                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                }`}
              >
                <span>{trend.positive ? "↑" : "↓"}</span>
                <span>{Math.abs(trend.value)}%</span>
              </motion.div>
            )}
          </div>

          {/* Value */}
          <div className="space-y-1">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: delay + 0.2 }}
              className="text-3xl font-bold"
            >
              {prefix}
              <CountUp
                start={0}
                end={value}
                duration={2}
                delay={delay}
                separator=","
                decimals={suffix === "%" ? 0 : 0}
              />
              {suffix}
            </motion.div>
            <p className="text-sm text-muted-foreground">{title}</p>
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

export function StatCards({ stats }: StatCardsProps) {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
    >
      {stats.map((stat, index) => (
        <StatCard key={index} {...stat} delay={index * 0.1} />
      ))}
    </motion.div>
  );
}

