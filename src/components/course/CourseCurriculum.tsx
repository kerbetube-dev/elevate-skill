/**
 * Course Curriculum - Phase 6
 * Accordion-style curriculum with expandable sections, lessons, durations, and lock icons
 */

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronDown, 
  ChevronRight, 
  Clock, 
  Lock, 
  Play, 
  CheckCircle, 
  BookOpen,
  Download,
  Eye
} from "lucide-react";

interface Lesson {
  id: string;
  title: string;
  duration: string;
  type: "video" | "reading" | "quiz" | "assignment";
  isFree: boolean;
  isCompleted?: boolean;
}

interface Section {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
  isExpanded?: boolean;
}

interface CourseCurriculumProps {
  sections: Section[];
  isEnrolled?: boolean;
}

export function CourseCurriculum({ sections: initialSections, isEnrolled = false }: CourseCurriculumProps) {
  const [sections, setSections] = useState<Section[]>(
    initialSections.map(section => ({ ...section, isExpanded: false }))
  );

  const toggleSection = (sectionId: string) => {
    setSections(prev => 
      prev.map(section => 
        section.id === sectionId 
          ? { ...section, isExpanded: !section.isExpanded }
          : section
      )
    );
  };

  const getLessonIcon = (type: Lesson["type"]) => {
    switch (type) {
      case "video":
        return <Play className="w-4 h-4 text-blue-500" />;
      case "reading":
        return <BookOpen className="w-4 h-4 text-green-500" />;
      case "quiz":
        return <CheckCircle className="w-4 h-4 text-purple-500" />;
      case "assignment":
        return <Download className="w-4 h-4 text-orange-500" />;
      default:
        return <BookOpen className="w-4 h-4 text-gray-500" />;
    }
  };

  const getLessonTypeColor = (type: Lesson["type"]) => {
    switch (type) {
      case "video":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "reading":
        return "bg-green-100 text-green-800 border-green-200";
      case "quiz":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "assignment":
        return "bg-orange-100 text-orange-800 border-orange-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Calculate total duration
  const totalDuration = sections.reduce((total, section) => 
    total + section.lessons.reduce((sectionTotal, lesson) => 
      sectionTotal + parseInt(lesson.duration.split(' ')[0]) || 0, 0
    ), 0
  );

  const totalLessons = sections.reduce((total, section) => total + section.lessons.length, 0);

  return (
    <div className="space-y-6">
      {/* Curriculum Header */}
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold text-gray-900">Course Curriculum</h2>
        <div className="flex items-center justify-center gap-8 text-gray-600">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            <span className="font-medium">{totalLessons} Lessons</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            <span className="font-medium">{totalDuration} hours</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">Certificate</span>
          </div>
        </div>
      </div>

      {/* Curriculum Sections */}
      <div className="space-y-4">
        {sections.map((section, sectionIndex) => (
          <motion.div
            key={section.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: sectionIndex * 0.1 }}
          >
            <Card className="overflow-hidden border-2 hover:border-purple-200 transition-colors">
              <CardHeader 
                className="cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => toggleSection(section.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <motion.div
                      animate={{ rotate: section.isExpanded ? 90 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      {section.isExpanded ? (
                        <ChevronDown className="w-5 h-5 text-gray-500" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-gray-500" />
                      )}
                    </motion.div>
                    <div>
                      <CardTitle className="text-lg">{section.title}</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">{section.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {section.lessons.length} lessons
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {section.lessons.reduce((total, lesson) => 
                        total + parseInt(lesson.duration.split(' ')[0]) || 0, 0
                      )}h
                    </Badge>
                  </div>
                </div>
              </CardHeader>

              <AnimatePresence>
                {section.isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <CardContent className="pt-0">
                      <div className="space-y-3">
                        {section.lessons.map((lesson, lessonIndex) => (
                          <motion.div
                            key={lesson.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: lessonIndex * 0.05 }}
                            className={`flex items-center gap-4 p-3 rounded-lg border transition-colors ${
                              lesson.isCompleted 
                                ? "bg-green-50 border-green-200" 
                                : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                            }`}
                          >
                            {/* Lesson Icon */}
                            <div className="flex-shrink-0">
                              {lesson.isCompleted ? (
                                <CheckCircle className="w-5 h-5 text-green-500" />
                              ) : (
                                getLessonIcon(lesson.type)
                              )}
                            </div>

                            {/* Lesson Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium text-gray-900 truncate">
                                  {lesson.title}
                                </h4>
                                {lesson.isFree && (
                                  <Badge variant="outline" className="text-xs bg-green-100 text-green-800 border-green-200">
                                    Free Preview
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                                <span>{lesson.duration}</span>
                                <Badge 
                                  variant="outline" 
                                  className={`text-xs ${getLessonTypeColor(lesson.type)}`}
                                >
                                  {lesson.type}
                                </Badge>
                              </div>
                            </div>

                            {/* Action Button */}
                            <div className="flex-shrink-0">
                              {!isEnrolled && !lesson.isFree ? (
                                <Button variant="ghost" size="sm" disabled>
                                  <Lock className="w-4 h-4" />
                                </Button>
                              ) : lesson.isCompleted ? (
                                <Button variant="ghost" size="sm" className="text-green-600">
                                  <CheckCircle className="w-4 h-4" />
                                </Button>
                              ) : (
                                <Button variant="ghost" size="sm">
                                  <Eye className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Enrollment CTA */}
      {!isEnrolled && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center p-6 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border-2 border-purple-200"
        >
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Ready to start learning?
          </h3>
          <p className="text-gray-600 mb-4">
            Enroll now to access all {totalLessons} lessons and get your certificate upon completion.
          </p>
          <Button variant="gradient" size="lg">
            <BookOpen className="w-5 h-5 mr-2" />
            Enroll Now
          </Button>
        </motion.div>
      )}
    </div>
  );
}