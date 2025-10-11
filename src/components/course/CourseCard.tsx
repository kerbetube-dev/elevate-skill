/**
 * Course Card Component
 * Reusable course card with proper linking and enrollment status
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Users,
    Clock,
    BookOpen,
    CheckCircle,
    ArrowRight,
    Zap,
} from "lucide-react";
import { Course } from "@/services/courses";
import { getImageUrl } from "@/services/admin";

interface CourseCardProps {
    course: Course;
    isEnrolled?: boolean;
    onEnrollClick?: (course: Course) => void;
    className?: string;
}

export function CourseCard({
    course,
    isEnrolled = false,
    onEnrollClick,
    className = "",
}: CourseCardProps) {
    const navigate = useNavigate();
    const [imageError, setImageError] = useState(false);

    const getImageSrc = () => {
        if (imageError) return null;
        if (course.image?.startsWith("/uploads/")) {
            return getImageUrl(course.image);
        }
        return course.image || null;
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

    const handleCardClick = () => {
        navigate(`/course/${course.id}`);
    };

    const handleEnrollClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        navigate(`/course/${course.id}`);
    };

    return (
        <motion.div
            whileHover={{ y: -8, scale: 1.02 }}
            transition={{ duration: 0.3 }}
            className={className}
        >
            <Card
                className="overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-500 group cursor-pointer h-full bg-white/90 backdrop-blur-sm"
                onClick={handleCardClick}
            >
                <div className="relative overflow-hidden">
                    {getImageSrc() ? (
                        <img
                            src={getImageSrc()!}
                            alt={course.title}
                            className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-700"
                            onError={() => setImageError(true)}
                        />
                    ) : (
                        <div className="w-full h-56 bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 flex items-center justify-center">
                            <div className="text-center text-white">
                                <BookOpen className="w-16 h-16 mx-auto mb-3 opacity-90" />
                                <p className="text-sm opacity-90 font-medium">
                                    Course Preview
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* Course Badges */}
                    <div className="absolute top-4 left-4 flex gap-2">
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
                </div>

                <CardHeader className="pb-3">
                    <CardTitle className="text-xl line-clamp-2 group-hover:text-purple-600 transition-colors font-bold">
                        {course.title}
                    </CardTitle>
                    <div className="flex items-center gap-6 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
                                <Users className="w-3 h-3 text-purple-600" />
                            </div>
                            <span className="font-medium">
                                {course.students.toLocaleString()}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                                <Clock className="w-3 h-3 text-blue-600" />
                            </div>
                            <span className="font-medium">
                                {course.duration}
                            </span>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="pt-0">
                    <p className="text-gray-600 text-sm line-clamp-3 mb-6 leading-relaxed">
                        {course.description}
                    </p>

                    <div className="flex items-center justify-between">
                        <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                            {course.price.toLocaleString()} ETB
                        </div>

                        <Button
                            size="sm"
                            onClick={handleEnrollClick}
                            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg"
                        >
                            {isEnrolled ? (
                                <>
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Enrolled
                                </>
                            ) : (
                                <>
                                    View Details
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </>
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}
