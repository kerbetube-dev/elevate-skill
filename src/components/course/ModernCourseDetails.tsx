/**
 * Modern Course Details - Rewritten
 * Clean, data-driven course details page that matches backend structure
 */

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Clock, Users, Star, BookOpen, CheckCircle, PlayCircle } from "lucide-react";
import { coursesService, Course } from "@/services/courses";
import { paymentService } from "@/services/payments";
import { useToast } from "@/hooks/use-toast";
import { getImageUrl } from "@/services/admin";

export function ModernCourseDetails() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
    const [checkingEnrollment, setCheckingEnrollment] = useState(false);

  useEffect(() => {
        const fetchCourseData = async () => {
      if (!courseId) return;
      
      try {
        setLoading(true);
                setError(null);
                
                // Fetch course data
        const courseData = await coursesService.getCourseById(courseId);
        setCourse(courseData);
        
                // Check enrollment status if user is logged in
        const token = localStorage.getItem('access_token');
        if (token) {
                    setCheckingEnrollment(true);
                    try {
                        const enrolled = await paymentService.checkEnrollment(courseId);
                        setIsEnrolled(enrolled);
                    } catch (enrollmentError) {
                        console.warn('Failed to check enrollment:', enrollmentError);
          setIsEnrolled(false);
                    } finally {
                        setCheckingEnrollment(false);
                    }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load course');
        console.error('Error fetching course:', err);
      } finally {
        setLoading(false);
      }
    };

        fetchCourseData();
  }, [courseId]);

  const handleEnroll = async () => {
    if (!course) return;
    
    try {
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
    }
  };

    const handleBack = () => {
        navigate(-1);
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
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <Card className="w-full max-w-md">
                    <CardContent className="pt-6 text-center">
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Course Not Found</h1>
                        <p className="text-gray-600 mb-4">
                            {error || "The course you're looking for doesn't exist."}
                        </p>
                        <div className="flex gap-2">
                            <Button onClick={handleBack} variant="outline">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Go Back
                            </Button>
                            <Button onClick={() => navigate('/')}>
                                Go Home
                            </Button>
        </div>
                    </CardContent>
                </Card>
      </div>
    );
  }

    const getImageSrc = () => {
        if (course.image?.startsWith("/uploads/")) {
            return getImageUrl(course.image);
        }
        return course.image || "/placeholder-course.jpg";
    };

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

  return (
    <div className="min-h-screen bg-gray-50">
            {/* Header with Back Button */}
            <div className="bg-white border-b">
                <div className="container mx-auto px-4 py-4">
                    <Button 
                        onClick={handleBack}
                        variant="ghost"
                        className="mb-4"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Courses
                    </Button>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="grid lg:grid-cols-3 gap-8">
      {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Course Hero */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <Card className="overflow-hidden">
                                <div className="relative">
                                    <img 
                                        src={getImageSrc()} 
                                        alt={course.title}
                                        className="w-full h-64 object-cover"
                                        onError={(e) => {
                                            e.currentTarget.style.display = 'none';
                                            e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                        }}
                                    />
                                    <div className="hidden w-full h-64 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                        <div className="text-center text-white">
                                            <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-80" />
                                            <p className="text-lg font-medium">{course.title}</p>
                                        </div>
                                    </div>
                                    
                                    {/* Course Badges */}
                                    <div className="absolute top-4 left-4 flex gap-2">
                                        <Badge className={getLevelColor(course.level)}>
                                            {course.level}
                                        </Badge>
                                        {isEnrolled && (
                                            <Badge className="bg-green-100 text-green-700 border-green-200">
                                                <CheckCircle className="w-3 h-3 mr-1" />
                                                Enrolled
                                            </Badge>
                                        )}
                                    </div>
                                </div>

                                <CardHeader>
                                    <CardTitle className="text-2xl">{course.title}</CardTitle>
                                    <div className="flex items-center gap-4 text-sm text-gray-600">
                                        <div className="flex items-center gap-1">
                                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                            <span>{course.rating}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Users className="w-4 h-4" />
                                            <span>{course.students} students</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Clock className="w-4 h-4" />
                                            <span>{course.duration}</span>
                                        </div>
                                    </div>
                                </CardHeader>

                                <CardContent>
                                    <p className="text-gray-700 leading-relaxed">
                                        {course.description}
                                    </p>
                                </CardContent>
                            </Card>
            </motion.div>

                        {/* Course Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                        >
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <BookOpen className="w-5 h-5" />
                                        Course Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                            <h4 className="font-medium text-gray-900 mb-2">Instructor</h4>
                                            <p className="text-gray-600">{course.instructor}</p>
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-gray-900 mb-2">Level</h4>
                                            <Badge className={getLevelColor(course.level)}>
                                                {course.level}
                                            </Badge>
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-gray-900 mb-2">Duration</h4>
                                            <p className="text-gray-600">{course.duration}</p>
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-gray-900 mb-2">Students</h4>
                                            <p className="text-gray-600">{course.students.toLocaleString()} enrolled</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
            </motion.div>

                        {/* What You'll Learn */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                        >
                            <Card>
                                <CardHeader>
                                    <CardTitle>What You'll Learn</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {[
                                            "Master the fundamentals and advanced concepts",
                                            "Build real-world projects and applications", 
                                            "Develop practical skills for your career",
                                            "Access to lifetime course materials",
                                            "Certificate of completion"
                                        ].map((item, index) => (
                                            <div key={index} className="flex items-start gap-3">
                                                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                                <span className="text-gray-700">{item}</span>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
            </motion.div>
          </div>

                    {/* Sidebar - Enrollment Card */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                            className="sticky top-8"
                        >
                            <Card className="border-2 border-purple-200">
                                <CardHeader className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
                                    <CardTitle className="text-xl">Enroll Now</CardTitle>
                                    <div className="text-3xl font-bold">
                                        {course.price.toLocaleString()} ETB
                                    </div>
                                </CardHeader>
                                <CardContent className="p-6 space-y-4">
                                    {isEnrolled ? (
                                        <div className="text-center space-y-4">
                                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                                                <CheckCircle className="w-8 h-8 text-green-600" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-green-700 mb-2">You're Enrolled!</h3>
                                                <p className="text-gray-600 text-sm">
                                                    You have access to this course content.
                                                </p>
                                            </div>
                                            <Button 
                                                className="w-full"
                                                onClick={() => navigate('/dashboard')}
                                            >
                                                <PlayCircle className="w-4 h-4 mr-2" />
                                                Continue Learning
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <div className="text-center">
                                                <p className="text-gray-600 mb-4">
                                                    Get lifetime access to this course
                                                </p>
                                            </div>
                                            
                                            <Button 
                                                onClick={handleEnroll}
                                                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                                                size="lg"
                                            >
                                                Enroll Now
                                            </Button>
                                            
                                            <div className="text-center text-sm text-gray-500">
                                                30-Day Money-Back Guarantee
                                            </div>
                                            
                                            <Separator />
                                            
                                            <div className="space-y-2 text-sm">
                                                <div className="flex items-center gap-2">
                                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                                    <span>Lifetime access</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                                    <span>Mobile & desktop access</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                                    <span>Certificate of completion</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}