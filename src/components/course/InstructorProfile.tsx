/**
 * Instructor Profile - Phase 6
 * Instructor card with avatar, bio, credentials, stats, and social links
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion } from "framer-motion";
import { 
  Star, 
  Users, 
  BookOpen, 
  Award, 
  Linkedin, 
  Twitter, 
  Globe, 
  Mail,
  Calendar,
  CheckCircle,
  TrendingUp
} from "lucide-react";

interface Instructor {
  id: string;
  name: string;
  title: string;
  avatar?: string;
  bio: string;
  credentials: string[];
  stats: {
    totalStudents: number;
    totalCourses: number;
    averageRating: number;
    totalReviews: number;
  };
  socialLinks: {
    linkedin?: string;
    twitter?: string;
    website?: string;
    email?: string;
  };
  joinDate: string;
  specialties: string[];
}

interface InstructorProfileProps {
  instructor: Instructor;
}

export function InstructorProfile({ instructor }: InstructorProfileProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(word => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long"
    });
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating 
                ? "text-yellow-400 fill-current" 
                : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Card className="overflow-hidden border-2 border-purple-200 shadow-lg hover:shadow-xl transition-shadow">
        <CardHeader className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16 border-4 border-white/20">
              <AvatarImage src={instructor.avatar} />
              <AvatarFallback className="bg-white/20 text-white text-lg font-semibold">
                {getInitials(instructor.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <CardTitle className="text-2xl text-white">{instructor.name}</CardTitle>
              <p className="text-purple-100 mt-1">{instructor.title}</p>
              <div className="flex items-center gap-2 mt-2 text-sm text-purple-100">
                <Calendar className="w-4 h-4" />
                <span>Joined {formatDate(instructor.joinDate)}</span>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* Bio */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">About the Instructor</h3>
            <p className="text-gray-700 leading-relaxed">{instructor.bio}</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{instructor.stats.totalStudents.toLocaleString()}</div>
              <div className="text-sm text-gray-600 flex items-center justify-center gap-1">
                <Users className="w-4 h-4" />
                Students
              </div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{instructor.stats.totalCourses}</div>
              <div className="text-sm text-gray-600 flex items-center justify-center gap-1">
                <BookOpen className="w-4 h-4" />
                Courses
              </div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{instructor.stats.averageRating}</div>
              <div className="text-sm text-gray-600 flex items-center justify-center gap-1">
                {renderStars(Math.round(instructor.stats.averageRating))}
              </div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{instructor.stats.totalReviews.toLocaleString()}</div>
              <div className="text-sm text-gray-600 flex items-center justify-center gap-1">
                <Star className="w-4 h-4" />
                Reviews
              </div>
            </div>
          </div>

          {/* Credentials */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Credentials & Certifications</h3>
            <div className="space-y-2">
              {instructor.credentials.map((credential, index) => (
                <div key={index} className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700">{credential}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Specialties */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Specialties</h3>
            <div className="flex flex-wrap gap-2">
              {instructor.specialties.map((specialty, index) => (
                <Badge 
                  key={index} 
                  variant="outline" 
                  className="bg-purple-100 text-purple-800 border-purple-200"
                >
                  {specialty}
                </Badge>
              ))}
            </div>
          </div>

          {/* Social Links */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Connect</h3>
            <div className="flex gap-3">
              {instructor.socialLinks.linkedin && (
                <Button variant="outline" size="sm" asChild>
                  <a href={instructor.socialLinks.linkedin} target="_blank" rel="noopener noreferrer">
                    <Linkedin className="w-4 h-4 mr-2" />
                    LinkedIn
                  </a>
                </Button>
              )}
              {instructor.socialLinks.twitter && (
                <Button variant="outline" size="sm" asChild>
                  <a href={instructor.socialLinks.twitter} target="_blank" rel="noopener noreferrer">
                    <Twitter className="w-4 h-4 mr-2" />
                    Twitter
                  </a>
                </Button>
              )}
              {instructor.socialLinks.website && (
                <Button variant="outline" size="sm" asChild>
                  <a href={instructor.socialLinks.website} target="_blank" rel="noopener noreferrer">
                    <Globe className="w-4 h-4 mr-2" />
                    Website
                  </a>
                </Button>
              )}
              {instructor.socialLinks.email && (
                <Button variant="outline" size="sm" asChild>
                  <a href={`mailto:${instructor.socialLinks.email}`}>
                    <Mail className="w-4 h-4 mr-2" />
                    Email
                  </a>
                </Button>
              )}
            </div>
          </div>

          {/* Performance Indicator */}
          <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <span className="font-semibold text-gray-900">Top Rated Instructor</span>
            </div>
            <p className="text-sm text-gray-600">
              Consistently rated 4.8+ stars with over {instructor.stats.totalReviews.toLocaleString()} reviews
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}