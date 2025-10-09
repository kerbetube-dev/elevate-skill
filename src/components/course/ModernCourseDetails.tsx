/**
 * Modern Course Details - Phase 6
 * Main course details page with hero, curriculum, reviews, instructor, and related courses
 */

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { coursesService, Course } from "@/services/courses";
import { useToast } from "@/hooks/use-toast";
import { CourseHero } from "./CourseHero";
import { EnrollmentCard } from "./EnrollmentCard";
import { CourseCurriculum } from "./CourseCurriculum";
import { CourseReviews } from "./CourseReviews";
import { InstructorProfile } from "./InstructorProfile";
import { RelatedCourses } from "./RelatedCourses";

// Minimal default data for fallback
const defaultSections = [];

const defaultReviews = [];

const defaultInstructor = {
  id: "1",
  name: "Course Instructor",
  title: "Expert Instructor",
  avatar: "/placeholder.svg",
  bio: "Experienced instructor with expertise in the course subject matter.",
  credentials: [],
  stats: {
    totalStudents: 0,
    totalCourses: 1,
    averageRating: 4.8,
    totalReviews: 0
  },
  socialLinks: {
    linkedin: "",
    twitter: "",
    website: "",
    email: ""
  },
  joinDate: new Date().toISOString(),
  specialties: []
};

export function ModernCourseDetails() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    const fetchCourse = async () => {
      if (!courseId) return;
      
      try {
        setLoading(true);
        const courseData = await coursesService.getCourseById(courseId);
        setCourse(courseData);
        
        // Check enrollment status
        const token = localStorage.getItem('access_token');
        if (token) {
          // TODO: Implement enrollment check
          setIsEnrolled(false);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load course');
        console.error('Error fetching course:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [courseId]);

  const handleEnroll = async () => {
    if (!course) return;
    
    try {
      setEnrolling(true);
      
      // Check if user is logged in
      const token = localStorage.getItem('access_token');
      if (!token) {
        navigate('/login');
        return;
      }
      
      // Navigate to payment page
      navigate(`/payment?courseId=${course.id}`);
    } catch (err) {
      toast({
        title: "Enrollment Failed",
        description: err instanceof Error ? err.message : "Failed to enroll in course",
        variant: "destructive"
      });
    } finally {
      setEnrolling(false);
    }
  };

  const handleCourseClick = (relatedCourseId: string) => {
    navigate(`/course/${relatedCourseId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-600">Loading course details...</p>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-gray-900">Course Not Found</h1>
          <p className="text-gray-600">{error || "The course you're looking for doesn't exist."}</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Course Hero */}
      <CourseHero
        course={course}
        onEnroll={handleEnroll}
        isEnrolled={isEnrolled}
        isLoading={enrolling}
      />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Left Column - Course Content */}
          <div className="lg:col-span-2 space-y-16">
            {/* Curriculum */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <CourseCurriculum
                sections={defaultSections}
                isEnrolled={isEnrolled}
              />
            </motion.div>

            {/* Reviews */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <CourseReviews
                reviews={defaultReviews}
                averageRating={course.rating || 4.8}
                totalReviews={course.enrollmentCount || 0}
                ratingBreakdown={{ 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }}
              />
            </motion.div>

            {/* Instructor Profile */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <InstructorProfile instructor={defaultInstructor} />
            </motion.div>

            {/* Related Courses */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <RelatedCourses
                courses={[course]} // TODO: Fetch related courses
                currentCourseId={course.id}
                onCourseClick={handleCourseClick}
              />
            </motion.div>
          </div>

          {/* Right Column - Enrollment Card */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <EnrollmentCard
                course={course}
                onEnroll={handleEnroll}
                isEnrolled={isEnrolled}
                isLoading={enrolling}
              />
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}