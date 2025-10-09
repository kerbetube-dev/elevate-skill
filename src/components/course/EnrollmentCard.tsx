/**
 * Enrollment Card - Phase 6
 * Sticky card for course pricing and enrollment with key features
 */

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Star, Clock, Users, Award, CheckCircle, Shield, Headphones, GraduationCap } from "lucide-react";
import { Course } from "@/services/courses";

interface EnrollmentCardProps {
  course: Course;
  onEnroll: () => void;
  isEnrolled?: boolean;
  isLoading?: boolean;
}

export function EnrollmentCard({ course, onEnroll, isEnrolled = false, isLoading = false }: EnrollmentCardProps) {
  const features = [
    {
      icon: <Award className="w-5 h-5" />,
      text: "Certificate of Completion",
      color: "text-yellow-500"
    },
    {
      icon: <Shield className="w-5 h-5" />,
      text: "30-Day Money Back Guarantee",
      color: "text-green-500"
    },
    {
      icon: <Headphones className="w-5 h-5" />,
      text: "24/7 Student Support",
      color: "text-blue-500"
    },
    {
      icon: <Clock className="w-5 h-5" />,
      text: "Lifetime Access",
      color: "text-purple-500"
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="sticky top-6"
    >
      <Card className="overflow-hidden border-2 border-purple-200 shadow-xl hover:shadow-2xl transition-all duration-300">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-2xl font-bold">Enroll Now</h3>
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
              Best Value
            </Badge>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold">{course.price}</span>
              <span className="text-lg opacity-90">ETB</span>
            </div>
            <p className="text-sm opacity-90">One-time payment</p>
          </div>
        </div>

        <CardContent className="p-6 space-y-6">
          {/* Course Stats */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="space-y-1">
              <div className="flex items-center justify-center gap-1">
                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                <span className="font-semibold text-gray-900">{course.rating || 4.8}</span>
              </div>
              <p className="text-xs text-gray-600">Rating</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-center gap-1">
                <Users className="w-4 h-4 text-blue-500" />
                <span className="font-semibold text-gray-900">{course.enrollmentCount || 1250}</span>
              </div>
              <p className="text-xs text-gray-600">Students</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-center gap-1">
                <Clock className="w-4 h-4 text-green-500" />
                <span className="font-semibold text-gray-900">{course.duration || "8 weeks"}</span>
              </div>
              <p className="text-xs text-gray-600">Duration</p>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900">What's included:</h4>
            <div className="space-y-2">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className={`${feature.color} flex-shrink-0`}>
                    {feature.icon}
                  </div>
                  <span className="text-sm text-gray-700">{feature.text}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Enrollment Button */}
          <div className="pt-4">
            {isEnrolled ? (
              <Button 
                size="lg" 
                variant="success" 
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-lg font-semibold"
                disabled
              >
                <CheckCircle className="w-5 h-5 mr-2" />
                Already Enrolled
              </Button>
            ) : (
              <Button 
                size="lg" 
                variant="gradient"
                onClick={onEnroll}
                disabled={isLoading}
                className="w-full py-3 text-lg font-semibold"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Award className="w-5 h-5 mr-2" />
                    Enroll Now
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Trust Indicators */}
          <div className="pt-4 border-t border-gray-200">
            <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <Shield className="w-3 h-3" />
                <span>Secure Payment</span>
              </div>
              <div className="flex items-center gap-1">
                <GraduationCap className="w-3 h-3" />
                <span>Certified Course</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}