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
import {
    ArrowLeft,
    Clock,
    Users,
    BookOpen,
    CheckCircle,
    PlayCircle,
    Award,
    Globe,
    Zap,
    Target,
    Shield,
    Download,
} from "lucide-react";
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
                const token = localStorage.getItem("access_token");
                if (token) {
                    setCheckingEnrollment(true);
                    try {
                        const enrolled = await paymentService.checkEnrollment(
                            courseId
                        );
                        setIsEnrolled(enrolled);
                    } catch (enrollmentError) {
                        console.warn(
                            "Failed to check enrollment:",
                            enrollmentError
                        );
                        setIsEnrolled(false);
                    } finally {
                        setCheckingEnrollment(false);
                    }
                }
            } catch (err) {
                setError(
                    err instanceof Error ? err.message : "Failed to load course"
                );
                console.error("Error fetching course:", err);
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
            const token = localStorage.getItem("access_token");
            if (!token) {
                navigate("/login");
                return;
            }

            // Navigate to payment page
            navigate(`/payment?courseId=${course.id}`);
        } catch (err) {
            toast({
                title: "Enrollment Failed",
                description:
                    err instanceof Error
                        ? err.message
                        : "Failed to enroll in course",
                variant: "destructive",
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
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">
                            Course Not Found
                        </h1>
                        <p className="text-gray-600 mb-4">
                            {error ||
                                "The course you're looking for doesn't exist."}
                        </p>
                        <div className="flex gap-2">
                            <Button onClick={handleBack} variant="outline">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Go Back
                            </Button>
                            <Button onClick={() => navigate("/")}>
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
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
            {/* Header with Back Button */}
            <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-10">
                <div className="container mx-auto px-4 py-4">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <Button
                            onClick={handleBack}
                            variant="ghost"
                            className="mb-4 hover:bg-purple-50 hover:text-purple-600 transition-all duration-200"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Courses
                        </Button>
                    </motion.div>
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
                            <Card className="overflow-hidden border-0 shadow-2xl bg-white/90 backdrop-blur-sm">
                                <div className="relative">
                                    <img
                                        src={getImageSrc()}
                                        alt={course.title}
                                        className="w-full h-80 object-cover"
                                        onError={(e) => {
                                            e.currentTarget.style.display =
                                                "none";
                                            e.currentTarget.nextElementSibling?.classList.add(
                                                "flex"
                                            );
                                        }}
                                    />
                                    <div className="hidden w-full h-80 bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 items-center justify-center">
                                        <div className="text-center text-white">
                                            <BookOpen className="w-20 h-20 mx-auto mb-4 opacity-90" />
                                            <p className="text-2xl font-bold">
                                                {course.title}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Gradient Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

                                    {/* Course Badges */}
                                    <div className="absolute top-6 left-6 flex gap-3">
                                        <Badge
                                            className={`${getLevelColor(
                                                course.level
                                            )} backdrop-blur-sm border-2 shadow-lg`}
                                        >
                                            <Zap className="w-3 h-3 mr-1" />
                                            {course.level}
                                        </Badge>
                                        {isEnrolled && (
                                            <Badge className="bg-green-500/90 text-white border-2 border-green-300 backdrop-blur-sm shadow-lg">
                                                <CheckCircle className="w-3 h-3 mr-1" />
                                                Enrolled
                                            </Badge>
                                        )}
                                    </div>

                                    {/* Floating Stats */}
                                    <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
                                        <div className="flex gap-4">
                                            <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2 border border-white/30">
                                                <div className="flex items-center gap-2 text-white">
                                                    <Users className="w-4 h-4" />
                                                    <span className="font-semibold">
                                                        {course.students.toLocaleString()}
                                                    </span>
                                                </div>
                                                <p className="text-white/80 text-xs">
                                                    Students
                                                </p>
                                            </div>
                                            <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2 border border-white/30">
                                                <div className="flex items-center gap-2 text-white">
                                                    <Clock className="w-4 h-4" />
                                                    <span className="font-semibold">
                                                        {course.duration}
                                                    </span>
                                                </div>
                                                <p className="text-white/80 text-xs">
                                                    Duration
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <CardHeader className="bg-gradient-to-r from-white to-gray-50">
                                    <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                                        {course.title}
                                    </CardTitle>
                                    <div className="flex items-center gap-6 text-sm text-gray-600 mt-2">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                                                <BookOpen className="w-4 h-4 text-purple-600" />
                                            </div>
                                            <span className="font-medium">
                                                Online Course
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                                <Globe className="w-4 h-4 text-blue-600" />
                                            </div>
                                            <span className="font-medium">
                                                Lifetime Access
                                            </span>
                                        </div>
                                    </div>
                                </CardHeader>

                                <CardContent className="p-8">
                                    <p className="text-gray-700 leading-relaxed text-lg">
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
                            <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
                                <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
                                    <CardTitle className="flex items-center gap-3 text-2xl">
                                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                                            <BookOpen className="w-5 h-5 text-white" />
                                        </div>
                                        Course Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-8">
                                    <div className="grid md:grid-cols-2 gap-8">
                                        <div className="space-y-6">
                                            <div className="flex items-start gap-4">
                                                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                                                    <Users className="w-6 h-6 text-white" />
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-gray-900 mb-1">
                                                        Instructor
                                                    </h4>
                                                    <p className="text-gray-600 text-lg">
                                                        {course.instructor}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-4">
                                                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                                                    <Target className="w-6 h-6 text-white" />
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-gray-900 mb-1">
                                                        Level
                                                    </h4>
                                                    <Badge
                                                        className={`${getLevelColor(
                                                            course.level
                                                        )} text-sm px-3 py-1`}
                                                    >
                                                        {course.level}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-6">
                                            <div className="flex items-start gap-4">
                                                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                                                    <Clock className="w-6 h-6 text-white" />
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-gray-900 mb-1">
                                                        Duration
                                                    </h4>
                                                    <p className="text-gray-600 text-lg">
                                                        {course.duration}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-4">
                                                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                                                    <Users className="w-6 h-6 text-white" />
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-gray-900 mb-1">
                                                        Students
                                                    </h4>
                                                    <p className="text-gray-600 text-lg">
                                                        {course.students.toLocaleString()}{" "}
                                                        enrolled
                                                    </p>
                                                </div>
                                            </div>
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
                            <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
                                <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
                                    <CardTitle className="flex items-center gap-3 text-2xl">
                                        <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                                            <Award className="w-5 h-5 text-white" />
                                        </div>
                                        What You'll Learn
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-8">
                                    <div className="grid md:grid-cols-2 gap-6">
                                        {[
                                            {
                                                icon: Target,
                                                text: "Master the fundamentals and advanced concepts",
                                            },
                                            {
                                                icon: Zap,
                                                text: "Build real-world projects and applications",
                                            },
                                            {
                                                icon: Award,
                                                text: "Develop practical skills for your career",
                                            },
                                            {
                                                icon: Download,
                                                text: "Access to lifetime course materials",
                                            },
                                            {
                                                icon: Shield,
                                                text: "Certificate of completion",
                                            },
                                            {
                                                icon: Globe,
                                                text: "Mobile & desktop access",
                                            },
                                        ].map((item, index) => (
                                            <motion.div
                                                key={index}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{
                                                    duration: 0.3,
                                                    delay: 0.1 * index,
                                                }}
                                                className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 hover:from-purple-50 hover:to-blue-50 transition-all duration-300"
                                            >
                                                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                                                    <item.icon className="w-5 h-5 text-white" />
                                                </div>
                                                <span className="text-gray-700 font-medium">
                                                    {item.text}
                                                </span>
                                            </motion.div>
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
                            className="sticky top-24"
                        >
                            <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur-sm overflow-hidden">
                                <CardHeader className="bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 text-white relative overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20"></div>
                                    <div className="relative z-10">
                                        <CardTitle className="text-2xl font-bold mb-2">
                                            Enroll Now
                                        </CardTitle>
                                        <div className="text-4xl font-bold mb-2">
                                            {course.price.toLocaleString()} ETB
                                        </div>
                                        <p className="text-purple-100 text-sm">
                                            One-time payment
                                        </p>
                                    </div>
                                    {/* Decorative elements */}
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
                                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
                                </CardHeader>
                                <CardContent className="p-8 space-y-6">
                                    {isEnrolled ? (
                                        <div className="text-center space-y-6">
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                transition={{
                                                    duration: 0.5,
                                                    delay: 0.2,
                                                }}
                                                className="w-20 h-20 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-lg"
                                            >
                                                <CheckCircle className="w-10 h-10 text-white" />
                                            </motion.div>
                                            <div>
                                                <h3 className="font-bold text-green-700 mb-2 text-xl">
                                                    You're Enrolled!
                                                </h3>
                                                <p className="text-gray-600">
                                                    You have access to this
                                                    course content.
                                                </p>
                                            </div>
                                            <Button
                                                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg"
                                                size="lg"
                                                onClick={() =>
                                                    navigate("/dashboard")
                                                }
                                            >
                                                <PlayCircle className="w-5 h-5 mr-2" />
                                                Continue Learning
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="space-y-6">
                                            <div className="text-center">
                                                <h3 className="font-bold text-gray-900 mb-2 text-lg">
                                                    Get Started Today
                                                </h3>
                                                <p className="text-gray-600">
                                                    Get lifetime access to this
                                                    course
                                                </p>
                                            </div>

                                            <Button
                                                onClick={handleEnroll}
                                                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg text-lg py-6"
                                                size="lg"
                                            >
                                                Enroll Now
                                            </Button>

                                            <div className="text-center">
                                                <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full text-sm font-medium">
                                                    <Shield className="w-4 h-4" />
                                                    30-Day Money-Back Guarantee
                                                </div>
                                            </div>

                                            <Separator className="my-6" />

                                            <div className="space-y-4">
                                                <h4 className="font-semibold text-gray-900 mb-3">
                                                    What's Included:
                                                </h4>
                                                <div className="space-y-3">
                                                    {[
                                                        "Lifetime access",
                                                        "Mobile & desktop access",
                                                        "Certificate of completion",
                                                        "Downloadable resources",
                                                        "Community support",
                                                    ].map((item, index) => (
                                                        <div
                                                            key={index}
                                                            className="flex items-center gap-3"
                                                        >
                                                            <div className="w-6 h-6 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
                                                                <CheckCircle className="w-4 h-4 text-white" />
                                                            </div>
                                                            <span className="text-gray-700 font-medium">
                                                                {item}
                                                            </span>
                                                        </div>
                                                    ))}
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
