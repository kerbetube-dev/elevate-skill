import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { coursesService, Course } from "@/services/courses";
import { paymentService } from "@/services/payments";
import { useToast } from "@/hooks/use-toast";
import elevateSkillLogo from "@/assets/elevate-skill-logo.png";
import heroImage from "@/assets/hero-bg.jpg";
import { 
  ArrowRight, 
  Users, 
  Award, 
  TrendingUp, 
  Loader2, 
  BookOpen, 
  Star, 
  CheckCircle 
} from "lucide-react";

// Helper function for image URLs
const getImageUrl = (imageName: string) => {
  return `/src/assets/${imageName}`;
};

// Import new landing page sections
import { HeroSection } from "./landing/HeroSection";
import { FeaturesSection } from "./landing/FeaturesSection";
import { CoursesShowcase } from "./landing/CoursesShowcase";
import { CTASection } from "./landing/CTASection";

const LandingPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [enrolledCourses, setEnrolledCourses] = useState<Set<string>>(new Set());
  const [checkingEnrollment, setCheckingEnrollment] = useState<string | null>(null);
  const coursesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const coursesData = await coursesService.getAllCourses();
        setCourses(coursesData);

        // Check enrollment status for logged-in users
        const token = localStorage.getItem('access_token');
        if (token) {
          checkEnrollmentStatus(coursesData);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load courses');
        console.error('Error fetching courses:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const checkEnrollmentStatus = async (coursesToCheck: Course[]) => {
    const enrolled = new Set<string>();
    for (const course of coursesToCheck) {
      try {
        const isEnrolled = await paymentService.checkEnrollment(course.id);
        if (isEnrolled) {
          enrolled.add(course.id);
        }
      } catch (err) {
        console.error(`Error checking enrollment for course ${course.id}:`, err);
      }
    }
    setEnrolledCourses(enrolled);
  };

  const handleEnrollClick = async (course: Course) => {
    const token = localStorage.getItem('access_token');
    
    if (!token) {
      toast({
        title: 'Login Required',
        description: 'Please login or register to enroll in courses',
        variant: 'default',
      });
      navigate('/login');
      return;
    }

    // Check if already enrolled
    if (enrolledCourses.has(course.id)) {
      toast({
        title: 'Already Enrolled',
        description: 'You are already enrolled in this course. Check your dashboard!',
        variant: 'default',
      });
      navigate('/dashboard');
      return;
    }

    // Check enrollment status one more time before redirecting
    setCheckingEnrollment(course.id);
    try {
      const isEnrolled = await paymentService.checkEnrollment(course.id);
      if (isEnrolled) {
        toast({
          title: 'Already Enrolled',
          description: 'You are already enrolled in this course!',
        });
        navigate('/dashboard');
        return;
      }
    } catch (err) {
      console.error('Error checking enrollment:', err);
      // Continue with enrollment if check fails
    } finally {
      setCheckingEnrollment(null);
    }

    // Always redirect to payment page after enrollment check
    console.log('Redirecting to payment page for course:', course.id);
    navigate(`/payment?courseId=${course.id}`);
  };

  const scrollToSection = (ref: React.RefObject<HTMLDivElement>) => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-background"
    >
      {/* Header */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className="border-b glass backdrop-blur-xl sticky top-0 z-50 shadow-sm"
      >
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <img src={elevateSkillLogo} alt="Elevate Skill" className="h-8 w-8" />
            <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Elevate Skill
            </h1>
          </motion.div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/login')}>
              Login
            </Button>
            <Button variant="gradient" onClick={() => navigate('/register')} animated>
              Get Started
            </Button>
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-10"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background/50 to-accent/20" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-primary/10 text-primary border-primary/20">
              🚀 Transform Your Career Today
            </Badge>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent leading-tight">
              Elevate Your Skills,
              <br />
              Elevate Your Future
            </h1>
            
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              Master in-demand skills with our comprehensive online courses. 
              From digital marketing to app development, build expertise that opens doors.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button variant="hero" size="lg" onClick={() => navigate('/register')} className="group">
                Start Learning Today
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button variant="outline" size="lg">
                View All Courses
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">8K+</div>
                <div className="text-sm text-muted-foreground">Students</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">6</div>
                <div className="text-sm text-muted-foreground">Courses</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">98%</div>
                <div className="text-sm text-muted-foreground">Success Rate</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">4.8</div>
                <div className="text-sm text-muted-foreground">Rating</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Why Choose Elevate Skil?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              We provide industry-leading education with practical skills you can apply immediately
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center border-0 shadow-elegant hover:shadow-glow transition-all duration-500">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-primary-foreground" />
                </div>
                <CardTitle>Expert Instructors</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Learn from industry professionals with years of real-world experience
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center border-0 shadow-elegant hover:shadow-glow transition-all duration-500">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="w-8 h-8 text-primary-foreground" />
                </div>
                <CardTitle>Certified Courses</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Earn industry-recognized certificates upon successful completion
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center border-0 shadow-elegant hover:shadow-glow transition-all duration-500">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-8 h-8 text-primary-foreground" />
                </div>
                <CardTitle>Career Growth</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Advance your career with skills that are in high demand globally
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Courses Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Our Popular Courses</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Comprehensive programs designed to take you from beginner to professional
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Loading courses...</span>
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <p className="text-red-500 mb-4">Failed to load courses: {error}</p>
              <Button onClick={() => window.location.reload()}>Retry</Button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {courses.map((course) => (
              <Card key={course.id} className="overflow-hidden border-0 shadow-elegant hover:shadow-glow transition-all duration-500 group cursor-pointer" onClick={() => navigate(`/course/${course.id}`)}>
                <div className="relative overflow-hidden">
                  {course.image ? (
                    <img 
                      src={getImageUrl(course.image)} 
                      alt={course.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  <div className={`w-full h-48 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center ${course.image ? 'hidden' : ''}`}>
                    <div className="text-center text-white">
                      <BookOpen className="w-12 h-12 mx-auto mb-2 opacity-80" />
                      <p className="text-sm opacity-90">Course Preview</p>
                    </div>
                  </div>
                  <div className="absolute top-4 left-4">
                    <Badge variant="secondary" className="bg-background/90 backdrop-blur-sm">
                      {course.level}
                    </Badge>
                  </div>
                  <div className="absolute top-4 right-4">
                    <Badge variant="secondary" className="bg-background/90 backdrop-blur-sm">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400 mr-1" />
                      {course.rating}
                    </Badge>
                  </div>
                </div>

                <CardHeader>
                  <CardTitle className="text-xl">{course.title}</CardTitle>
                  <CardDescription className="text-sm">
                    {course.description}
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                    <span>{course.duration}</span>
                    <span>{course.students.toLocaleString()} students</span>
                  </div>
                  
                  {enrolledCourses.has(course.id) ? (
                    <Button 
                      variant="outline" 
                      className="w-full border-green-500 text-green-600 hover:bg-green-50"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate('/dashboard');
                      }}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Enrolled - Go to Dashboard
                    </Button>
                  ) : (
                    <Button 
                      variant="hero" 
                      className="w-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/course/${course.id}`);
                      }}
                    >
                      <BookOpen className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-accent text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Start Your Journey?</h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Join thousands of students who have transformed their careers with Elevate Skil
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              variant="secondary" 
              size="lg"
              onClick={() => navigate('/register')}
              className="bg-background text-primary hover:bg-background/90"
            >
              Get Started Today
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10"
            >
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <img src={elevateSkillLogo} alt="Elevate Skill" className="h-8 w-8" />
              <h3 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Elevate Skill
              </h3>
            </div>
            <p className="text-muted-foreground mb-6">
              Empowering learners worldwide with cutting-edge skills and knowledge
            </p>
            <div className="text-sm text-muted-foreground">
              © 2024 Elevate Skil. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </motion.div>
  );
};

export default LandingPage;