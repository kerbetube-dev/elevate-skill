import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Clock, Users, Star, CheckCircle } from "lucide-react";

interface CourseDetailsProps {
  course: {
    id: string;
    title: string;
    description: string;
    image: string;
    price: number;
    duration: string;
    students: number;
    rating: number;
    level: string;
  };
  onBack: () => void;
  onEnroll: () => void;
}

export function CourseDetails({ course, onBack, onEnroll }: CourseDetailsProps) {
  const features = [
    "Lifetime access to course materials",
    "Certificate of completion",
    "Direct instructor support",
    "Project-based learning",
    "Regular updates and new content",
    "Community access"
  ];

  const curriculum = [
    "Introduction and Fundamentals",
    "Core Concepts and Theory",
    "Practical Applications",
    "Advanced Techniques",
    "Real-world Projects",
    "Final Assessment"
  ];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Button 
        variant="ghost" 
        onClick={onBack}
        className="mb-6 hover:bg-muted"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Courses
      </Button>
      
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <img 
            src={course.image} 
            alt={course.title}
            className="w-full h-64 object-cover rounded-lg shadow-lg"
          />
          
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Course Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{course.duration}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{course.students.toLocaleString()} students enrolled</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-500 fill-current" />
                <span className="text-sm">{course.rating}/5 rating</span>
              </div>
              <Badge variant="secondary">{course.level}</Badge>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <h1 className="text-3xl font-bold mb-4">{course.title}</h1>
          <p className="text-muted-foreground mb-6 leading-relaxed">
            {course.description}
          </p>
          
          <div className="bg-gradient-to-r from-primary to-accent text-white p-6 rounded-lg mb-6">
            <div className="text-center">
              <p className="text-sm opacity-90">Course Price</p>
              <p className="text-3xl font-bold">{course.price} Birr</p>
              <Button 
                size="lg" 
                className="mt-4 bg-white text-primary hover:bg-gray-100"
                onClick={onEnroll}
              >
                Enroll Now
              </Button>
            </div>
          </div>
          
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>What You'll Learn</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Course Curriculum</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {curriculum.map((item, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <span className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
                      {index + 1}
                    </span>
                    <span className="text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}