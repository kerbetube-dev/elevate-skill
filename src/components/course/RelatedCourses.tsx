/**
 * Related Courses - Phase 6
 * Horizontal scrollable carousel of similar courses
 */

import { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { 
  Star, 
  Clock, 
  Users, 
  ChevronLeft, 
  ChevronRight, 
  Play,
  BookOpen,
  Award
} from "lucide-react";
import { Course } from "@/services/courses";
import { getImageUrl } from "@/services/admin";

interface RelatedCoursesProps {
  courses: Course[];
  currentCourseId: string;
  onCourseClick: (courseId: string) => void;
}

export function RelatedCourses({ courses, currentCourseId, onCourseClick }: RelatedCoursesProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const filteredCourses = courses.filter(course => course.id !== currentCourseId);
  const coursesPerView = 3;
  const maxIndex = Math.max(0, filteredCourses.length - coursesPerView);

  const scrollToIndex = (index: number) => {
    const clampedIndex = Math.max(0, Math.min(index, maxIndex));
    setCurrentIndex(clampedIndex);
    
    if (scrollContainerRef.current) {
      const cardWidth = 320; // Approximate card width + gap
      scrollContainerRef.current.scrollTo({
        left: clampedIndex * cardWidth,
        behavior: "smooth"
      });
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-3 h-3 ${
              star <= rating 
                ? "text-yellow-400 fill-current" 
                : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  if (filteredCourses.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Related Courses</h2>
          <p className="text-gray-600 mt-1">Continue your learning journey with these courses</p>
        </div>
        
        {/* Navigation */}
        {filteredCourses.length > coursesPerView && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => scrollToIndex(currentIndex - 1)}
              disabled={currentIndex === 0}
              className="p-2"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => scrollToIndex(currentIndex + 1)}
              disabled={currentIndex >= maxIndex}
              className="p-2"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Courses Carousel */}
      <div className="relative">
        <div
          ref={scrollContainerRef}
          className="flex gap-6 overflow-x-auto scrollbar-hide pb-4"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {filteredCourses.map((course, index) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="flex-shrink-0 w-80"
            >
              <Card 
                className="overflow-hidden cursor-pointer group hover:shadow-xl transition-all duration-300 border-2 hover:border-purple-200"
                onClick={() => onCourseClick(course.id)}
              >
                {/* Course Image */}
                <div className="relative overflow-hidden">
                  <img
                    src={getImageUrl(course.image) || "/placeholder.svg"}
                    alt={course.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* Play Button */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/30"
                    >
                      <Play className="w-6 h-6 text-white ml-1" fill="currentColor" />
                    </motion.div>
                  </div>

                  {/* Course Level Badge */}
                  <div className="absolute top-3 left-3">
                    <Badge variant="secondary" className="bg-white/90 text-gray-800">
                      <Award className="w-3 h-3 mr-1" />
                      {course.level}
                    </Badge>
                  </div>

                  {/* Price Badge */}
                  <div className="absolute top-3 right-3">
                    <Badge variant="outline" className="bg-white/90 text-gray-800 border-gray-300">
                      {course.price} ETB
                    </Badge>
                  </div>
                </div>

                <CardContent className="p-4 space-y-3">
                  {/* Course Title */}
                  <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-purple-600 transition-colors">
                    {course.title}
                  </h3>

                  {/* Course Description */}
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {course.description}
                  </p>

                  {/* Course Stats */}
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        {renderStars(course.rating || 4.8)}
                        <span className="text-xs">({course.enrollmentCount || 1250})</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{course.duration || "8 weeks"}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      <span>{course.enrollmentCount || 1250}</span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full group-hover:bg-purple-600 group-hover:text-white group-hover:border-purple-600 transition-colors"
                  >
                    <BookOpen className="w-4 h-4 mr-2" />
                    View Course
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Scroll Indicators */}
        {filteredCourses.length > coursesPerView && (
          <div className="flex justify-center gap-2 mt-4">
            {Array.from({ length: maxIndex + 1 }).map((_, index) => (
              <button
                key={index}
                onClick={() => scrollToIndex(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentIndex 
                    ? "bg-purple-600" 
                    : "bg-gray-300 hover:bg-gray-400"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* View All Courses CTA */}
      <div className="text-center">
        <Button variant="outline" size="lg">
          <BookOpen className="w-5 h-5 mr-2" />
          View All Courses
        </Button>
      </div>
    </div>
  );
}