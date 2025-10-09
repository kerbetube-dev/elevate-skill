/**
 * Testimonials Section with Carousel
 * Student success stories and reviews
 */

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Star, Quote, ChevronLeft, ChevronRight, Users } from "lucide-react";

const testimonials = [
  {
    id: 1,
    name: "Sarah Johnson",
    role: "Digital Marketing Specialist",
    company: "TechCorp Inc.",
    image: "SJ",
    rating: 5,
    text: "Elevate Skill transformed my career! The Digital Marketing course was comprehensive and practical. I landed my dream job within 3 months of completion.",
    course: "Digital Marketing",
  },
  {
    id: 2,
    name: "Michael Chen",
    role: "Full-Stack Developer",
    company: "Startup Labs",
    image: "MC",
    rating: 5,
    text: "The Web Development course exceeded my expectations. The instructors are knowledgeable, and the hands-on projects gave me real-world experience.",
    course: "Web Development",
  },
  {
    id: 3,
    name: "Aisha Mohammed",
    role: "Graphic Designer",
    company: "Creative Studio",
    image: "AM",
    rating: 5,
    text: "I had zero design experience before this course. Now I'm working as a professional graphic designer. The step-by-step approach was perfect for beginners!",
    course: "Graphics Design",
  },
  {
    id: 4,
    name: "David Rodriguez",
    role: "Video Content Creator",
    company: "Media Productions",
    image: "DR",
    rating: 5,
    text: "The Video Editing course taught me industry-standard techniques. The quality of instruction and support from the community was outstanding.",
    course: "Video Editing",
  },
  {
    id: 5,
    name: "Emma Thompson",
    role: "English Teacher",
    company: "International School",
    image: "ET",
    rating: 5,
    text: "This English Communication course helped me improve my teaching skills dramatically. Highly recommended for anyone looking to enhance their communication.",
    course: "English Communication",
  },
];

export function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
    }),
  };

  const swipeConfidenceThreshold = 10000;
  const swipePower = (offset: number, velocity: number) => {
    return Math.abs(offset) * velocity;
  };

  const paginate = (newDirection: number) => {
    setDirection(newDirection);
    setCurrentIndex((prevIndex) => {
      let nextIndex = prevIndex + newDirection;
      if (nextIndex >= testimonials.length) nextIndex = 0;
      if (nextIndex < 0) nextIndex = testimonials.length - 1;
      return nextIndex;
    });
  };

  // Auto-advance carousel
  useEffect(() => {
    const interval = setInterval(() => {
      paginate(1);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const currentTestimonial = testimonials[currentIndex];

  return (
    <section className="py-20 md:py-32 bg-gradient-mesh relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <Badge className="mb-4 bg-gradient-forest text-white border-0 px-4 py-2">
            <Users className="mr-2 h-4 w-4" />
            Student Success Stories
          </Badge>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            What Our{" "}
            <span className="bg-gradient-forest bg-clip-text text-transparent">
              Students Say
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Join thousands of successful students who transformed their careers with Elevate Skill.
          </p>
        </motion.div>

        {/* Testimonial Carousel */}
        <div className="max-w-5xl mx-auto relative">
          <div className="relative h-[500px] md:h-[400px] flex items-center">
            <AnimatePresence initial={false} custom={direction} mode="wait">
              <motion.div
                key={currentIndex}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: "spring", stiffness: 300, damping: 30 },
                  opacity: { duration: 0.2 },
                }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={1}
                onDragEnd={(e, { offset, velocity }) => {
                  const swipe = swipePower(offset.x, velocity.x);

                  if (swipe < -swipeConfidenceThreshold) {
                    paginate(1);
                  } else if (swipe > swipeConfidenceThreshold) {
                    paginate(-1);
                  }
                }}
                className="absolute w-full"
              >
                <Card variant="glass" className="p-8 md:p-12 text-center backdrop-blur-xl">
                  {/* Quote Icon */}
                  <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center">
                      <Quote className="h-8 w-8 text-white" />
                    </div>
                  </div>

                  {/* Rating Stars */}
                  <div className="flex justify-center gap-1 mb-6">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-6 w-6 ${
                          i < currentTestimonial.rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>

                  {/* Testimonial Text */}
                  <CardContent>
                    <p className="text-xl md:text-2xl text-foreground mb-8 italic leading-relaxed">
                      "{currentTestimonial.text}"
                    </p>

                    {/* Student Info */}
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-gradient-ocean flex items-center justify-center text-white text-2xl font-bold">
                        {currentTestimonial.image}
                      </div>
                      <div>
                        <h4 className="text-xl font-bold">{currentTestimonial.name}</h4>
                        <p className="text-muted-foreground">
                          {currentTestimonial.role} at {currentTestimonial.company}
                        </p>
                        <Badge className="mt-2" variant="outline">
                          {currentTestimonial.course}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-center gap-4 mt-8">
            <Button
              variant="outline"
              size="icon-lg"
              onClick={() => paginate(-1)}
              className="rounded-full hover:bg-gradient-primary hover:text-white hover:border-primary transition-all"
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <Button
              variant="outline"
              size="icon-lg"
              onClick={() => paginate(1)}
              className="rounded-full hover:bg-gradient-primary hover:text-white hover:border-primary transition-all"
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </div>

          {/* Pagination Dots */}
          <div className="flex justify-center gap-2 mt-6">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setDirection(index > currentIndex ? 1 : -1);
                  setCurrentIndex(index);
                }}
                className={`h-3 w-3 rounded-full transition-all ${
                  index === currentIndex
                    ? "bg-gradient-primary w-8"
                    : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

