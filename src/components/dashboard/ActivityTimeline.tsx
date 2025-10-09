/**
 * Activity Timeline Component
 * Beautiful timeline showing recent user activities
 */

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, 
  Award, 
  Share2, 
  CreditCard, 
  CheckCircle,
  Clock,
  TrendingUp,
  Gift,
  LucideIcon
} from "lucide-react";
import { staggerContainer, staggerItem } from "@/lib/animations";

interface Activity {
  id: string;
  type: "enrollment" | "completion" | "payment" | "referral" | "achievement" | "other";
  title: string;
  description: string;
  timestamp: string;
  icon?: LucideIcon;
  iconColor?: string;
}

interface ActivityTimelineProps {
  activities: Activity[];
  maxItems?: number;
}

const activityIcons: Record<string, { icon: LucideIcon; color: string; bg: string }> = {
  enrollment: {
    icon: BookOpen,
    color: "text-blue-600",
    bg: "bg-blue-100 dark:bg-blue-900/30",
  },
  completion: {
    icon: Award,
    color: "text-green-600",
    bg: "bg-green-100 dark:bg-green-900/30",
  },
  payment: {
    icon: CreditCard,
    color: "text-purple-600",
    bg: "bg-purple-100 dark:bg-purple-900/30",
  },
  referral: {
    icon: Share2,
    color: "text-pink-600",
    bg: "bg-pink-100 dark:bg-pink-900/30",
  },
  achievement: {
    icon: CheckCircle,
    color: "text-yellow-600",
    bg: "bg-yellow-100 dark:bg-yellow-900/30",
  },
  other: {
    icon: Clock,
    color: "text-gray-600",
    bg: "bg-gray-100 dark:bg-gray-900/30",
  },
};

function formatTimeAgo(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMins = Math.floor(diffInMs / 60000);
  const diffInHours = Math.floor(diffInMs / 3600000);
  const diffInDays = Math.floor(diffInMs / 86400000);

  if (diffInMins < 60) {
    return `${diffInMins} minute${diffInMins !== 1 ? "s" : ""} ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours !== 1 ? "s" : ""} ago`;
  } else if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays !== 1 ? "s" : ""} ago`;
  } else {
    return date.toLocaleDateString();
  }
}

export function ActivityTimeline({ activities, maxItems = 10 }: ActivityTimelineProps) {
  const displayedActivities = activities.slice(0, maxItems);

  return (
    <Card className="glass">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="space-y-4"
        >
          {displayedActivities.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No recent activity</p>
              <p className="text-sm mt-1">Start exploring courses to see your activity here</p>
            </div>
          ) : (
            displayedActivities.map((activity, index) => {
              const iconConfig = activityIcons[activity.type] || activityIcons.other;
              const Icon = activity.icon || iconConfig.icon;

              return (
                <motion.div
                  key={activity.id}
                  variants={staggerItem}
                  whileHover={{ x: 4 }}
                  className="relative flex gap-4 pb-4 last:pb-0"
                >
                  {/* Timeline Line */}
                  {index < displayedActivities.length - 1 && (
                    <div className="absolute left-5 top-12 bottom-0 w-px bg-border" />
                  )}

                  {/* Icon */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${iconConfig.bg}`}
                  >
                    <Icon className={`h-5 w-5 ${iconConfig.color}`} />
                  </motion.div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm truncate">{activity.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {activity.description}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs whitespace-nowrap">
                        {formatTimeAgo(activity.timestamp)}
                      </Badge>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </motion.div>

        {activities.length > maxItems && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-4 pt-4 border-t"
          >
            <button className="text-sm text-primary hover:underline w-full text-center">
              View all {activities.length} activities →
            </button>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}

// Sample activities for testing
export const sampleActivities: Activity[] = [
  {
    id: "1",
    type: "enrollment",
    title: "Enrolled in Web Development",
    description: "Successfully enrolled in the Web Development course",
    timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
  },
  {
    id: "2",
    type: "completion",
    title: "Completed Module 1",
    description: "Finished Introduction to HTML & CSS",
    timestamp: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
  },
  {
    id: "3",
    type: "payment",
    title: "Payment Approved",
    description: "Your payment for Digital Marketing course was approved",
    timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
  },
  {
    id: "4",
    type: "referral",
    title: "Referral Bonus Earned",
    description: "Earned 50 ETB from referring a friend",
    timestamp: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
  },
  {
    id: "5",
    type: "achievement",
    title: "Achievement Unlocked",
    description: "Earned 'Quick Learner' badge",
    timestamp: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
  },
];

