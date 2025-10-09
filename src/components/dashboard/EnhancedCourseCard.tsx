/**
 * Enhanced Course Card Component
 * Beautiful, feature-rich course cards with animations
 */

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  BookOpen,
  Clock,
  Users,
  Award,
  PlayCircle,
  CheckCircle,
  Lock,
  TrendingUp,
  Star,
} from "lucide-react";
import { staggerItem } from "@/lib/animations";
import { getImageUrl } from "@/services/admin";
import { EnrichedCourse } from "@/services/courses";

interface EnhancedCourseCardProps {
  course: EnrichedCourse;
  onEnroll?: (id: string) => void;
  onContinue?: (id: string) => void;
  onViewDetails?: (id: string) => void;
  variant?: "default" | "enrolled";
  index?: number;
  pendingPayment?: boolean;
}

const levelColors = {
  Beginner: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  Intermediate: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  Advanced: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
};

export function EnhancedCourseCard({
  course,
  onEnroll,
  onContinue,
  onViewDetails,
  variant = "default",
  index = 0,
  pendingPayment = false,
}: EnhancedCourseCardProps) {
  const isEnrolled = variant === "enrolled" || course.enrolled;
  const levelColor = levelColors[course.level as keyof typeof levelColors] || levelColors.Beginner;

  return (
    <motion.div
      variants={staggerItem}
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="overflow-hidden group hover-lift h-full flex flex-col">
        {/* Course Image */}
        <div className="relative h-48 overflow-hidden bg-gradient-to-br from-primary/10 to-accent/10">
          {course.image ? (
            <motion.img
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.4 }}
              src={getImageUrl(course.image)}
              alt={course.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <BookOpen className="h-16 w-16 text-muted-foreground opacity-50" />
            </div>
          )}

          {/* Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

          {/* Top Badges */}
          <div className="absolute top-3 left-3 right-3 flex items-start justify-between">
            <div className="flex gap-2">
              {course.level && (
                <Badge className={levelColor}>{course.level}</Badge>
              )}
              {course.rating && (
                <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                  <Star className="h-3 w-3 mr-1 fill-current" />
                  {course.rating.toFixed(1)}
                </Badge>
              )}
            </div>
            {isEnrolled && course.progress !== undefined && (
              <Badge className="bg-green-500 text-white">
                <CheckCircle className="h-3 w-3 mr-1" />
                {Math.round(course.progress)}%
              </Badge>
            )}
            {pendingPayment && (
              <Badge className="bg-yellow-500 text-white">
                <Clock className="h-3 w-3 mr-1" />
                Payment Pending
              </Badge>
            )}
          </div>

          {/* Play Button Overlay (for enrolled courses) */}
          {isEnrolled && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileHover={{ opacity: 1, scale: 1 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <motion.div
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                className="w-16 h-16 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center cursor-pointer shadow-xl"
                onClick={() => onContinue?.(course.id)}
              >
                <PlayCircle className="h-10 w-10 text-primary" />
              </motion.div>
            </motion.div>
          )}
        </div>

        {/* Card Content */}
        <CardContent className="p-6 flex-1 flex flex-col">
          {/* Title */}
          <h3 className="font-bold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {course.title}
          </h3>

          {/* Description */}
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2 flex-1">
            {course.description}
          </p>

          {/* Instructor */}
          {course.instructor && (
            <div className="flex items-center gap-2 mb-3 text-sm text-muted-foreground">
              <Award className="h-4 w-4" />
              <span>{course.instructor}</span>
            </div>
          )}

          {/* Progress Bar (for enrolled courses) */}
          {isEnrolled && course.progress !== undefined && (
            <div className="mb-4">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-semibold">{Math.round(course.progress)}%</span>
              </div>
              <Progress value={course.progress} className="h-2" />
              {course.completedLessons !== undefined && course.totalLessons !== undefined && (
                <p className="text-xs text-muted-foreground mt-1">
                  {course.completedLessons} of {course.totalLessons} lessons completed
                </p>
              )}
            </div>
          )}

          {/* Next Lesson (for enrolled courses) */}
          {isEnrolled && course.nextLesson && (
            <div className="mb-4 p-3 bg-primary/5 rounded-lg border border-primary/10">
              <p className="text-xs text-muted-foreground mb-1">Up Next:</p>
              <p className="text-sm font-medium">{course.nextLesson}</p>
            </div>
          )}

          {/* Course Stats */}
          <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
            {course.duration && (
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{course.duration}</span>
              </div>
            )}
            {course.students !== undefined && (
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{course.students.toLocaleString()}</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 mt-auto">
            {isEnrolled ? (
              <>
                <Button
                  variant="gradient"
                  className="flex-1"
                  onClick={() => onContinue?.(course.id)}
                >
                  <PlayCircle className="h-4 w-4 mr-2" />
                  Continue Learning
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onViewDetails?.(course.id)}
                >
                  <TrendingUp className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="gradient"
                  className="flex-1"
                  onClick={() => onEnroll?.(course.id)}
                >
                  Enroll Now
                  {course.price !== undefined && course.price > 0 && (
                    <span className="ml-2">- {course.price} ETB</span>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onViewDetails?.(course.id)}
                >
                  <BookOpen className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </CardContent>

        {/* Hover Glow Effect */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 bg-gradient-primary pointer-events-none" />
      </Card>
    </motion.div>
  );
}

// Grid wrapper for course cards
interface EnhancedCourseGridProps {
  courses: any[];
  variant?: "default" | "enrolled";
  onEnroll?: (id: string) => void;
  onContinue?: (id: string) => void;
  onViewDetails?: (id: string) => void;
  paymentRequests?: any[];
}

export function EnhancedCourseGrid({
  courses,
  variant = "default",
  onEnroll,
  onContinue,
  onViewDetails,
  paymentRequests = [],
}: EnhancedCourseGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {courses.map((course, index) => {
        // Check if this course has a pending payment request
        const pendingPayment = paymentRequests.some(
          (request) => request.courseId === course.id && request.status === 'pending'
        );
        
        return (
          <EnhancedCourseCard
            key={course.id}
            course={course}
            variant={variant}
            onEnroll={onEnroll}
            onContinue={onContinue}
            onViewDetails={onViewDetails}
            index={index}
            pendingPayment={pendingPayment}
          />
        );
      })}
    </div>
  );
}

