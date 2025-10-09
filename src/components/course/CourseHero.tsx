/**
 * Course Hero Section - Phase 6
 * Eye-catching hero section with course image, title, description, ratings, and enrollment button
 */

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Star, Clock, Users, Award, Play, BookOpen, CheckCircle } from "lucide-react";
import { Course } from "@/services/courses";
import { statsService } from "@/services/stats";
import { getImageUrl } from "@/services/admin";
import { useState, useEffect } from "react";

interface CourseHeroProps {
  course: Course;
  onEnroll: () => void;
  isEnrolled?: boolean;
  isLoading?: boolean;
}

export function CourseHero({ course, onEnroll, isEnrolled = false, isLoading = false }: CourseHeroProps) {
  const [courseStats, setCourseStats] = useState({
    enrollmentCount: 0,
    averageRating: 4.8,
    completionRate: 0
  });
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    const fetchCourseStats = async () => {
      try {
        setStatsLoading(true);
        const stats = await statsService.getCourseStats(course.id);
        setCourseStats(stats);
      } catch (error) {
        console.error('Error fetching course stats:', error);
        // Keep fallback values
      } finally {
        setStatsLoading(false);
      }
    };

    fetchCourseStats();
  }, [course.id]);

  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const staggerChildren = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%239C92AC%22%20fill-opacity%3D%220.1%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20" />
      
      {/* Floating Orbs */}
      <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full blur-xl opacity-20 animate-pulse" />
      <div className="absolute bottom-20 right-20 w-40 h-40 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full blur-xl opacity-20 animate-pulse delay-1000" />
      
      <div className="relative z-10 container mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Course Info */}
          <motion.div
            variants={staggerChildren}
            initial="initial"
            animate="animate"
            className="space-y-8"
          >
            {/* Course Badge */}
            <motion.div variants={fadeInUp}>
              <Badge variant="secondary" className="bg-purple-100 text-purple-800 border-purple-200 px-4 py-2 text-sm font-medium">
                <Award className="w-4 h-4 mr-2" />
                {course.level} Level
              </Badge>
            </motion.div>

            {/* Course Title */}
            <motion.h1 
              variants={fadeInUp}
              className="text-4xl lg:text-6xl font-bold text-white leading-tight"
            >
              {course.title}
            </motion.h1>

            {/* Course Description */}
            <motion.p 
              variants={fadeInUp}
              className="text-xl text-slate-300 leading-relaxed max-w-2xl"
            >
              {course.description}
            </motion.p>

            {/* Course Stats */}
            <motion.div 
              variants={fadeInUp}
              className="flex flex-wrap gap-6 text-slate-300"
            >
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-400 fill-current" />
                <span className="font-medium">{courseStats.averageRating}</span>
                <span className="text-slate-400">({courseStats.enrollmentCount} reviews)</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-400" />
                <span className="font-medium">{course.duration || "8 weeks"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-green-400" />
                <span className="font-medium">{courseStats.enrollmentCount} students</span>
              </div>
            </motion.div>

            {/* Key Features */}
            <motion.div variants={fadeInUp} className="space-y-3">
              <h3 className="text-lg font-semibold text-white">What you'll learn:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  "Master fundamental concepts",
                  "Build real-world projects",
                  "Get lifetime access",
                  "Certificate of completion"
                ].map((feature, index) => (
                  <div key={index} className="flex items-center gap-3 text-slate-300">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Enrollment Button */}
            <motion.div variants={fadeInUp} className="pt-4">
              {isEnrolled ? (
                <Button 
                  size="xl" 
                  variant="success" 
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 text-lg font-semibold"
                  disabled
                >
                  <BookOpen className="w-6 h-6 mr-3" />
                  Already Enrolled
                </Button>
              ) : (
                <Button 
                  size="xl" 
                  variant="gradient"
                  onClick={onEnroll}
                  disabled={isLoading}
                  className="px-8 py-4 text-lg font-semibold"
                >
                  {isLoading ? (
                    <>
                      <div className="w-6 h-6 mr-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Play className="w-6 h-6 mr-3" />
                      Enroll Now - {course.price} ETB
                    </>
                  )}
                </Button>
              )}
            </motion.div>
          </motion.div>

          {/* Right Column - Course Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <Card className="overflow-hidden bg-white/10 backdrop-blur-sm border-white/20 shadow-2xl">
              <div className="relative">
                <img
                  src={getImageUrl(course.image) || "/placeholder.svg"}
                  alt={course.title}
                  className="w-full h-80 object-cover"
                />
                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                
                {/* Play Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center cursor-pointer border-2 border-white/30"
                  >
                    <Play className="w-8 h-8 text-white ml-1" fill="currentColor" />
                  </motion.div>
                </div>
              </div>
              
              {/* Course Info Footer */}
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-white">{course.price} ETB</span>
                  <Badge variant="outline" className="border-green-400 text-green-400">
                    Best Seller
                  </Badge>
                </div>
                
                <div className="text-slate-300 text-sm space-y-2">
                  <div className="flex justify-between">
                    <span>Course Level:</span>
                    <span className="text-white font-medium">{course.level}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Duration:</span>
                    <span className="text-white font-medium">{course.duration || "8 weeks"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Language:</span>
                    <span className="text-white font-medium">English</span>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}