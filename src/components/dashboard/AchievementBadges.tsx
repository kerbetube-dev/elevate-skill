/**
 * Achievement Badges Component
 * Showcase user achievements and milestones
 */

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Award,
  Trophy,
  Star,
  Zap,
  Target,
  Flame,
  Crown,
  Medal,
  Lock,
  LucideIcon,
} from "lucide-react";
import { staggerContainer, staggerItem } from "@/lib/animations";

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  earned: boolean;
  earnedDate?: string;
  rarity: "common" | "rare" | "epic" | "legendary";
  progress?: {
    current: number;
    total: number;
  };
}

interface AchievementBadgesProps {
  achievements: Achievement[];
  showAll?: boolean;
}

const rarityConfig = {
  common: {
    gradient: "from-gray-400 to-gray-600",
    bg: "bg-gray-100 dark:bg-gray-900/30",
    text: "text-gray-700 dark:text-gray-300",
    glow: "shadow-gray-500/50",
  },
  rare: {
    gradient: "from-blue-400 to-blue-600",
    bg: "bg-blue-100 dark:bg-blue-900/30",
    text: "text-blue-700 dark:text-blue-300",
    glow: "shadow-blue-500/50",
  },
  epic: {
    gradient: "from-purple-400 to-purple-600",
    bg: "bg-purple-100 dark:bg-purple-900/30",
    text: "text-purple-700 dark:text-purple-300",
    glow: "shadow-purple-500/50",
  },
  legendary: {
    gradient: "from-yellow-400 to-orange-600",
    bg: "bg-yellow-100 dark:bg-yellow-900/30",
    text: "text-yellow-700 dark:text-yellow-300",
    glow: "shadow-yellow-500/50",
  },
};

function AchievementBadge({ achievement, index }: { achievement: Achievement; index: number }) {
  const config = rarityConfig[achievement.rarity];
  const Icon = achievement.icon;
  const progressPercentage = achievement.progress
    ? (achievement.progress.current / achievement.progress.total) * 100
    : 0;

  return (
    <motion.div
      variants={staggerItem}
      whileHover={{ scale: achievement.earned ? 1.05 : 1.02, y: -4 }}
      className="relative"
    >
      <Card
        className={`relative overflow-hidden transition-all ${
          achievement.earned
            ? `hover:shadow-lg ${config.glow} cursor-pointer`
            : "opacity-60 cursor-not-allowed"
        }`}
      >
        {/* Rarity Indicator */}
        {achievement.earned && (
          <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${config.gradient}`} />
        )}

        <CardContent className="p-6">
          <div className="flex flex-col items-center text-center space-y-3">
            {/* Icon Container */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: index * 0.1, type: "spring" }}
              className={`relative w-20 h-20 rounded-full flex items-center justify-center ${
                achievement.earned ? config.bg : "bg-muted"
              }`}
            >
              {achievement.earned ? (
                <>
                  <Icon className={`h-10 w-10 ${config.text}`} />
                  {/* Animated Glow */}
                  <motion.div
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.5, 0.8, 0.5],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className={`absolute inset-0 rounded-full bg-gradient-to-r ${config.gradient} opacity-30 blur-md`}
                  />
                </>
              ) : (
                <Lock className="h-10 w-10 text-muted-foreground" />
              )}
            </motion.div>

            {/* Badge Info */}
            <div className="space-y-1">
              <h3 className="font-semibold text-sm">{achievement.name}</h3>
              <p className="text-xs text-muted-foreground line-clamp-2">
                {achievement.description}
              </p>
            </div>

            {/* Rarity Badge */}
            <Badge
              variant="outline"
              className={`text-xs capitalize ${achievement.earned ? config.text : ""}`}
            >
              {achievement.rarity}
            </Badge>

            {/* Earned Date or Progress */}
            {achievement.earned && achievement.earnedDate ? (
              <p className="text-xs text-muted-foreground">
                Earned {new Date(achievement.earnedDate).toLocaleDateString()}
              </p>
            ) : achievement.progress ? (
              <div className="w-full space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-semibold">
                    {achievement.progress.current}/{achievement.progress.total}
                  </span>
                </div>
                <Progress value={progressPercentage} className="h-1.5" />
              </div>
            ) : null}
          </div>
        </CardContent>

        {/* Shimmer Effect for Legendary */}
        {achievement.earned && achievement.rarity === "legendary" && (
          <motion.div
            animate={{
              x: ["-100%", "100%"],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            style={{ width: "50%" }}
          />
        )}
      </Card>
    </motion.div>
  );
}

export function AchievementBadges({ achievements, showAll = false }: AchievementBadgesProps) {
  const earnedCount = achievements.filter((a) => a.earned).length;
  const displayedAchievements = showAll ? achievements : achievements.slice(0, 6);

  return (
    <Card className="glass">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Achievements
          </CardTitle>
          <Badge variant="secondary">
            {earnedCount}/{achievements.length}
          </Badge>
        </div>
        <Progress value={(earnedCount / achievements.length) * 100} className="h-2 mt-2" />
      </CardHeader>
      <CardContent>
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {displayedAchievements.map((achievement, index) => (
            <AchievementBadge key={achievement.id} achievement={achievement} index={index} />
          ))}
        </motion.div>

        {!showAll && achievements.length > 6 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-6 text-center"
          >
            <button className="text-sm text-primary hover:underline">
              View all {achievements.length} achievements →
            </button>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}

// Sample achievements for testing
export const sampleAchievements: Achievement[] = [
  {
    id: "1",
    name: "First Steps",
    description: "Complete your first course enrollment",
    icon: Star,
    earned: true,
    earnedDate: new Date(Date.now() - 86400000 * 7).toISOString(),
    rarity: "common",
  },
  {
    id: "2",
    name: "Quick Learner",
    description: "Complete a course within 7 days",
    icon: Zap,
    earned: true,
    earnedDate: new Date(Date.now() - 86400000 * 3).toISOString(),
    rarity: "rare",
  },
  {
    id: "3",
    name: "Master",
    description: "Complete 5 courses with 90%+ score",
    icon: Crown,
    earned: false,
    rarity: "epic",
    progress: { current: 2, total: 5 },
  },
  {
    id: "4",
    name: "Influencer",
    description: "Refer 10 friends successfully",
    icon: Target,
    earned: false,
    rarity: "rare",
    progress: { current: 3, total: 10 },
  },
  {
    id: "5",
    name: "Legend",
    description: "Complete all available courses",
    icon: Trophy,
    earned: false,
    rarity: "legendary",
    progress: { current: 2, total: 6 },
  },
  {
    id: "6",
    name: "Dedication",
    description: "Login for 30 consecutive days",
    icon: Flame,
    earned: true,
    earnedDate: new Date(Date.now() - 86400000).toISOString(),
    rarity: "epic",
  },
  {
    id: "7",
    name: "Top Performer",
    description: "Achieve 100% in any course",
    icon: Medal,
    earned: false,
    rarity: "rare",
    progress: { current: 95, total: 100 },
  },
  {
    id: "8",
    name: "Early Bird",
    description: "One of the first 100 students",
    icon: Award,
    earned: true,
    earnedDate: new Date(Date.now() - 86400000 * 30).toISOString(),
    rarity: "legendary",
  },
];

