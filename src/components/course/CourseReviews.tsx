/**
 * Course Reviews - Phase 6
 * Student reviews section with star ratings, review cards, and overall rating breakdown
 */

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { Star, ThumbsUp, MessageCircle, Calendar, Award } from "lucide-react";

interface Review {
  id: string;
  studentName: string;
  studentAvatar?: string;
  rating: number;
  comment: string;
  date: string;
  helpful: number;
  isVerified: boolean;
  courseProgress: number;
}

interface CourseReviewsProps {
  reviews: Review[];
  averageRating: number;
  totalReviews: number;
  ratingBreakdown: { [key: number]: number };
}

export function CourseReviews({ 
  reviews: initialReviews, 
  averageRating = 4.8, 
  totalReviews = 1250,
  ratingBreakdown = { 5: 850, 4: 300, 3: 80, 2: 15, 1: 5 }
}: CourseReviewsProps) {
  const [reviews] = useState<Review[]>(initialReviews);
  const [showAllReviews, setShowAllReviews] = useState(false);

  const displayedReviews = showAllReviews ? reviews : reviews.slice(0, 3);

  const renderStars = (rating: number, size: "sm" | "md" | "lg" = "md") => {
    const sizeClass = size === "sm" ? "w-4 h-4" : size === "md" ? "w-5 h-5" : "w-6 h-6";
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClass} ${
              star <= rating 
                ? "text-yellow-400 fill-current" 
                : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

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
      month: "long",
      day: "numeric"
    });
  };

  return (
    <div className="space-y-8">
      {/* Reviews Header */}
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold text-gray-900">Student Reviews</h2>
        <div className="flex items-center justify-center gap-8">
          <div className="text-center">
            <div className="text-4xl font-bold text-gray-900">{averageRating}</div>
            <div className="flex items-center justify-center gap-1 mb-2">
              {renderStars(Math.round(averageRating), "lg")}
            </div>
            <p className="text-sm text-gray-600">{totalReviews} reviews</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Rating Breakdown */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Rating Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = ratingBreakdown[rating] || 0;
                const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                
                return (
                  <div key={rating} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{rating}</span>
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      </div>
                      <span className="text-sm text-gray-600">{count}</span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </motion.div>

        {/* Reviews List */}
        <div className="lg:col-span-2 space-y-6">
          {displayedReviews.map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Review Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={review.studentAvatar} />
                          <AvatarFallback className="bg-purple-100 text-purple-800">
                            {getInitials(review.studentName)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-gray-900">{review.studentName}</h4>
                            {review.isVerified && (
                              <Badge variant="outline" className="text-xs bg-green-100 text-green-800 border-green-200">
                                <Award className="w-3 h-3 mr-1" />
                                Verified
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            {renderStars(review.rating, "sm")}
                            <span>•</span>
                            <span>{formatDate(review.date)}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-sm text-gray-600">Progress</div>
                        <div className="text-lg font-semibold text-gray-900">{review.courseProgress}%</div>
                      </div>
                    </div>

                    {/* Review Comment */}
                    <p className="text-gray-700 leading-relaxed">{review.comment}</p>

                    {/* Review Actions */}
                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <ThumbsUp className="w-4 h-4" />
                          <span>{review.helpful} helpful</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageCircle className="w-4 h-4" />
                          <span>Reply</span>
                        </div>
                      </div>
                      
                      <Button variant="ghost" size="sm">
                        <ThumbsUp className="w-4 h-4 mr-1" />
                        Helpful
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}

          {/* Load More Reviews */}
          {reviews.length > 3 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-center"
            >
              <Button
                variant="outline"
                onClick={() => setShowAllReviews(!showAllReviews)}
                className="px-8"
              >
                {showAllReviews ? "Show Less" : `Show All ${reviews.length} Reviews`}
              </Button>
            </motion.div>
          )}
        </div>
      </div>

      {/* Write Review CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="text-center p-8 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border-2 border-purple-200"
      >
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Share Your Experience
        </h3>
        <p className="text-gray-600 mb-4">
          Help other students by sharing your thoughts about this course.
        </p>
        <Button variant="gradient" size="lg">
          <MessageCircle className="w-5 h-5 mr-2" />
          Write a Review
        </Button>
      </motion.div>
    </div>
  );
}