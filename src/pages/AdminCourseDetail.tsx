import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Loader2, 
  ArrowLeft,
  Clock,
  Users,
  Star,
  DollarSign,
  BookOpen,
  CheckCircle,
  Calendar,
  User,
  TrendingUp,
  Target,
  GraduationCap,
  PlayCircle,
  Download,
  Share2,
  Heart,
  Award,
  Globe,
  Zap,
  Shield,
  Sparkles,
  ChevronRight,
  ExternalLink,
  Bookmark,
  Eye,
  ThumbsUp
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { adminService, Course as AdminCourse, getImageUrl } from '@/services/admin';
import { coursesService, Course } from '@/services/courses';

const AdminCourseDetail: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (courseId) {
      fetchCourseDetails();
    }
    
  }, [courseId]);

  const fetchCourseDetails = async () => {
    try {
      setLoading(true);
      
      // Check if user is admin or regular user based on current path
      const isAdmin = window.location.pathname.startsWith('/admin/courses/');
      
      if (isAdmin) {
        // Use admin service for admin users
        const response = await adminService.getCourseDetails(courseId!);
        setCourse(response.course);
      } else {
        // Use regular course service for regular users
        const courseData = await coursesService.getCourseById(courseId!);
        setCourse(courseData);
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to fetch course details');
      toast({
        title: "Error",
        description: "Failed to fetch course details.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-ET', {
      style: 'currency',
      currency: 'ETB'
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Loader2 className="w-8 h-8 animate-spin text-white" />
          </div>
          <p className="text-lg text-gray-600 font-medium">Loading course details...</p>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Alert className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Course Not Found</h2>
          <p className="text-gray-600 mb-6">{error || 'The course you are looking for does not exist.'}</p>
          <Button onClick={() => {
            // Check if user is admin or regular user based on current path
            const currentPath = window.location.pathname;
            const isAdmin = currentPath.startsWith('/admin/courses/');
            
            
            navigate('/admin/courses');
          }} variant="outline" className="hover:bg-gray-50">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Courses  
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Modern Header with Glass Effect */}
      <div className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-white/20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/admin/courses')}
                className="text-gray-600 hover:text-gray-900 hover:bg-gray-100/50 transition-all duration-200"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Courses
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
                <h1 className="text-xl font-semibold text-gray-900">{course.title}</h1>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" className="hover:bg-blue-50 hover:border-blue-200 transition-all duration-200">
                <Bookmark className="w-4 h-4 mr-2" />
                Save
              </Button>
              <Button variant="outline" size="sm" className="hover:bg-green-50 hover:border-green-200 transition-all duration-200">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Hero Section with Modern Design */}
            <Card className="overflow-hidden border-0 shadow-2xl bg-gradient-to-br from-white to-blue-50/30">
              <div className="relative">
                {course.image ? (
                  <img
                    src={getImageUrl(course.image)}
                    alt={course.title}
                    className="w-full h-80 object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                ) : null}
                <div className={`w-full h-80 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 flex items-center justify-center ${course.image ? 'hidden' : ''}`}>
                  <div className="text-center text-white">
                    <BookOpen className="w-20 h-20 mx-auto mb-4 opacity-80" />
                    <p className="text-lg opacity-90">Course Preview</p>
                  </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 text-white">
                  <div className="flex items-center space-x-3 mb-3">
                    <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/30 hover:bg-white/30">
                      <Sparkles className="w-3 h-3 mr-1" />
                      {course.level}
                    </Badge>
                    <Badge className="bg-green-500/20 backdrop-blur-sm text-green-100 border-green-400/30">
                      <Award className="w-3 h-3 mr-1" />
                      Premium
                    </Badge>
                  </div>
                  <h1 className="text-4xl font-bold mb-2">{course.title}</h1>
                  <p className="text-lg opacity-90 max-w-2xl">{course.description}</p>
                </div>
              </div>
            </Card>

            {/* Enhanced Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100/50 hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-1">{course.students.toLocaleString()}</div>
                  <div className="text-sm text-gray-600 font-medium">Students Enrolled</div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-lg bg-gradient-to-br from-yellow-50 to-yellow-100/50 hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Star className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-1">{course.rating}</div>
                  <div className="text-sm text-gray-600 font-medium">Average Rating</div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100/50 hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-1">{course.duration}</div>
                  <div className="text-sm text-gray-600 font-medium">Course Duration</div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100/50 hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <DollarSign className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-1">{formatPrice(course.price)}</div>
                  <div className="text-sm text-gray-600 font-medium">Course Price</div>
                </CardContent>
              </Card>
            </div>

            {/* Enhanced Course Description */}
            <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center text-2xl">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mr-3">
                    <BookOpen className="w-4 h-4 text-white" />
                  </div>
                  About This Course
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed text-lg">{course.description}</p>
                <div className="mt-6 flex flex-wrap gap-2">
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    <Globe className="w-3 h-3 mr-1" />
                    Online Learning
                  </Badge>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    <Shield className="w-3 h-3 mr-1" />
                    Lifetime Access
                  </Badge>
                  <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                    <Zap className="w-3 h-3 mr-1" />
                    Self-Paced
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Learning Outcomes */}
            <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center text-2xl">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mr-3">
                    <Target className="w-4 h-4 text-white" />
                  </div>
                  What You'll Learn
                </CardTitle>
                <CardDescription className="text-lg">
                  Master these key skills and knowledge areas
                </CardDescription>
              </CardHeader>
              <CardContent>
                {course.outcomes && course.outcomes.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {course.outcomes.map((outcome: any, index: number) => (
                      <div key={index} className="group flex items-start space-x-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200/50 hover:shadow-md transition-all duration-200">
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-200">
                          <CheckCircle className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-gray-700 font-medium">{outcome}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Target className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-lg">No learning outcomes specified for this course.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Enhanced Course Curriculum */}
            <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center text-2xl">
                  <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center mr-3">
                    <GraduationCap className="w-4 h-4 text-white" />
                  </div>
                  Course Curriculum
                </CardTitle>
                <CardDescription className="text-lg">
                  Step-by-step learning journey
                </CardDescription>
              </CardHeader>
              <CardContent>
                {course.curriculum && course.curriculum.length > 0 ? (
                  <div className="space-y-3">
                    {course.curriculum.map((item: any, index: number) => (
                      <div key={index} className="group flex items-center space-x-4 p-5 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-200/50 hover:shadow-md hover:border-indigo-300/50 transition-all duration-200">
                        <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl flex items-center justify-center text-lg font-bold group-hover:scale-105 transition-transform duration-200">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 text-lg">{item}</h4>
                          <div className="flex items-center mt-2 text-sm text-gray-600">
                            <Clock className="w-4 h-4 mr-1" />
                            <span>~45 minutes</span>
                            <span className="mx-2">•</span>
                            <Eye className="w-4 h-4 mr-1" />
                            <span>Video + Reading</span>
                          </div>
                        </div>
                        <div className="flex-shrink-0">
                          <Button variant="ghost" size="sm" className="group-hover:bg-indigo-100 transition-colors duration-200">
                            <PlayCircle className="w-5 h-5 text-indigo-600" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <GraduationCap className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-lg">No curriculum specified for this course.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Sidebar */}
          <div className="space-y-6">
            {/* Course Info Card */}
            <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center text-xl">
                  <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mr-2">
                    <User className="w-3 h-3 text-white" />
                  </div>
                  Course Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <User className="w-4 h-4 text-gray-600 mr-2" />
                    <span className="text-sm text-gray-600">Instructor</span>
                  </div>
                  <span className="font-semibold text-gray-900">{course.instructor}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 text-gray-600 mr-2" />
                    <span className="text-sm text-gray-600">Duration</span>
                  </div>
                  <span className="font-semibold text-gray-900">{course.duration}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <TrendingUp className="w-4 h-4 text-gray-600 mr-2" />
                    <span className="text-sm text-gray-600">Level</span>
                  </div>
                  <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">{course.level}</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 text-gray-600 mr-2" />
                    <span className="text-sm text-gray-600">Created</span>
                  </div>
                  <span className="font-semibold text-gray-900">{formatDate(course.created_at || new Date().toISOString())}</span>
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Action Buttons */}
            {/* <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-purple-600 text-white">
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold mb-2">Ready to Start Learning?</h3>
                  <p className="text-blue-100 text-sm">Join thousands of students already enrolled</p>
                </div>
                
                <div className="mt-6 pt-4 border-t border-white/20">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-blue-100">30-day money-back guarantee</span>
                    <ThumbsUp className="w-4 h-4 text-green-300" />
                  </div>
                </div>
              </CardContent>
            </Card> */}

            {/* Course Progress Card */}
            {/* <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center text-lg">
                  <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mr-2">
                    <TrendingUp className="w-3 h-3 text-white" />
                  </div>
                  Course Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Overall Progress</span>
                    <span className="font-semibold text-gray-900">0%</span>
                  </div>
                  <Progress value={0} className="h-2" />
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="text-lg font-bold text-gray-900">0</div>
                      <div className="text-xs text-gray-600">Lessons</div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="text-lg font-bold text-gray-900">0h</div>
                      <div className="text-xs text-gray-600">Completed</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card> */}
          </div>
        </div>
        
        {/* Enroll Button for Regular Users */}
        {!window.location.pathname.startsWith('/admin/courses/') && (
          <div className="fixed bottom-6 right-6 z-50">
            {/* <Button 
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
              onClick={() => navigate(`/payment?courseId=${courseId}`)}
            >
              <BookOpen className="w-5 h-5 mr-2" />
              Enroll Now - {formatPrice(course.price)}
            </Button> */}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCourseDetail;