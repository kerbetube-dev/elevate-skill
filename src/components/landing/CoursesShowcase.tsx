/**
 * Courses Showcase with Horizontal Scroll
 * Modern course cards with enhanced visuals
 */

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton, SkeletonCourseCard } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { staggerContainer, staggerItem } from "@/lib/animations";
import {
  Users,
  Star,
  Clock,
  TrendingUp,
  ArrowRight,
  BookOpen,
  Award,
  Loader2,
  CheckCircle,
} from "lucide-react";
import { Course } from "@/services/courses";
import { getImageUrl } from "@/services/admin";

interface CoursesShowcaseProps {
  courses: Course[];
  loading: boolean;
  enrolledCourses: Set<string>;
  checkingEnrollment: string | null;
  onEnrollClick: (course: Course) => void;
}

export function CoursesShowcase({
  courses,
  loading,
  enrolledCourses,
  checkingEnrollment,
  onEnrollClick,
}: CoursesShowcaseProps) {
  const getLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case "beginner":
        return "bg-green-100 text-green-700 border-green-200";
      case "intermediate":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "advanced":
        return "bg-purple-100 text-purple-700 border-purple-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getImageSrc = (course: Course) => {
    if (course.image?.startsWith("/uploads/")) {
      return getImageUrl(course.image);
    }
    // Fallback to course image or placeholder
    return course.image || "/placeholder-course.jpg";
  };

  if (loading) {
    return (
      <section className="py-20 md:py-32 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Skeleton className="h-12 w-64 mx-auto mb-4" />
            <Skeleton className="h-6 w-96 mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <SkeletonCourseCard key={i} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 md:py-32 bg-muted/30 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-40">
        <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <Badge className="mb-4 bg-gradient-ocean text-white border-0 px-4 py-2">
            <BookOpen className="mr-2 h-4 w-4" />
            Featured Courses
          </Badge>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Start Your Learning{" "}
            <span className="bg-gradient-ocean bg-clip-text text-transparent">
              Journey
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Choose from our expertly crafted courses and start building skills that matter.
          </p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {courses.slice(0, 6).map((course, index) => {
            const isEnrolled = enrolledCourses.has(course.id);
            const isChecking = checkingEnrollment === course.id;

            return (
              <motion.div key={course.id} variants={staggerItem}>
                <Card
                  variant="elevated"
                  hover="lift"
                  className="h-full flex flex-col group overflow-hidden border-2 hover:border-primary/30 transition-all duration-300"
                >
                  {/* Course Image */}
                  <div className="relative h-48 overflow-hidden bg-gradient-mesh">
                    <motion.img
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.3 }}
                      src={getImageSrc(course)}
                      alt={course.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder-course.jpg";
                      }}
                    />
                    {/* Level Badge */}
                    <div className="absolute top-4 right-4">
                      <Badge className={getLevelColor(course.level)}>
                        {course.level}
                      </Badge>
                    </div>
                    {/* Enrolled Badge */}
                    {isEnrolled && (
                      <div className="absolute top-4 left-4">
                        <Badge className="bg-success-600 text-white border-0">
                          <CheckCircle className="mr-1 h-3 w-3" />
                          Enrolled
                        </Badge>
                      </div>
                    )}
                  </div>

                  <CardHeader className="flex-grow">
                    <CardTitle className="text-xl group-hover:text-primary transition-colors line-clamp-2">
                      {course.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-3 text-base">
                      {course.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Course Stats */}
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{course.students?.toLocaleString() || 0}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span>{course.rating || "4.5"}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{course.duration}</span>
                      </div>
                    </div>

                    {/* Instructor */}
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center text-white text-sm font-semibold">
                        {course.instructor?.charAt(0) || "I"}
                      </div>
                      <div className="text-sm">
                        <p className="font-medium">{course.instructor}</p>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-primary">
                        {course.price} ETB
                      </span>
                    </div>
                  </CardContent>

                  <CardFooter>
                    <Button
                      variant={isEnrolled ? "outline" : "gradient"}
                      size="lg"
                      className="w-full group"
                      onClick={() => onEnrollClick(course)}
                      disabled={isChecking}
                    >
                      {isChecking ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Checking...
                        </>
                      ) : isEnrolled ? (
                        <>
                          <BookOpen className="mr-2 h-4 w-4" />
                          Go to Course
                        </>
                      ) : (
                        <>
                          Enroll Now
                          <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        {/* View All Courses CTA */}
        {courses.length > 6 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-16 text-center"
          >
            <Button variant="gradient" size="xl" className="shadow-glow">
              <TrendingUp className="mr-2 h-5 w-5" />
              View All {courses.length} Courses
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        )}
      </div>
    </section>
  );
}

