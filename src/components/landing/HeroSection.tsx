/**
 * Modern Hero Section with Animations
 * Features: Animated gradient background, typewriter effect, floating elements
 */

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Zap, Target } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/animations";
import { TypeAnimation } from "react-type-animation";
import CountUp from "react-countup";

interface HeroSectionProps {
  onViewCourses?: () => void;
  stats?: {
    totalStudents: number;
    totalCourses: number;
    successRate: number;
    averageRating: number;
  };
}

export function HeroSection({ onViewCourses, stats }: HeroSectionProps) {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-gradient-mesh">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating Orbs */}
        <motion.div
          animate={{
            y: [0, -20, 0],
            x: [0, 10, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            y: [0, 20, 0],
            x: [0, -10, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute bottom-20 right-10 w-96 h-96 bg-accent/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            y: [0, -15, 0],
            x: [0, -15, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-1/2 left-1/2 w-64 h-64 bg-success-500/20 rounded-full blur-3xl"
        />
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="max-w-5xl mx-auto text-center"
        >
          {/* Badge */}
          <motion.div variants={staggerItem} className="mb-6 flex justify-center">
            <Badge className="bg-gradient-primary text-white border-0 px-6 py-2 text-sm shadow-glow">
              <Sparkles className="mr-2 h-4 w-4 animate-pulse" />
              Transform Your Career Today
            </Badge>
          </motion.div>

          {/* Main Heading with Gradient */}
          <motion.h1
            variants={staggerItem}
            className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
          >
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Elevate Your Skills,
            </span>
            <br />
            <span className="inline-block mt-2">
              <TypeAnimation
                sequence={[
                  "Elevate Your Future",
                  3000,
                  "Transform Your Career",
                  3000,
                  "Achieve Your Dreams",
                  3000,
                  "Unlock Your Potential",
                  3000,
                ]}
                wrapper="span"
                speed={50}
                repeat={Infinity}
                className="bg-gradient-sunset bg-clip-text text-transparent"
              />
            </span>
          </motion.h1>

          {/* Description */}
          <motion.p
            variants={staggerItem}
            className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed"
          >
            Master in-demand skills with our comprehensive online courses.
            From digital marketing to app development,{" "}
            <span className="text-foreground font-semibold">
              build expertise that opens doors
            </span>
            .
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            variants={staggerItem}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
          >
            <Button
              variant="gradient"
              size="xl"
              onClick={() => navigate("/register")}
              className="group shadow-glow hover:shadow-glow-lg"
            >
              <Zap className="mr-2 h-5 w-5" />
              Start Learning Today
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              variant="glass"
              size="xl"
              onClick={onViewCourses}
              className="group"
            >
              <Target className="mr-2 h-5 w-5" />
              Explore Courses
            </Button>
          </motion.div>

          {/* Animated Stats */}
          <motion.div
            variants={staggerItem}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto"
          >
            {[
              { value: stats?.totalStudents || 8000, suffix: "+", label: "Active Students", color: "text-primary" },
              { value: stats?.totalCourses || 6, suffix: "", label: "Expert Courses", color: "text-accent" },
              { value: stats?.successRate || 98, suffix: "%", label: "Success Rate", color: "text-success-600" },
              { value: stats?.averageRating || 4.8, suffix: "⭐", label: "Average Rating", color: "text-warning-600", decimals: 1 },
            ].map((stat, index) => (
              <motion.div
                key={index}
                variants={staggerItem}
                className="glass p-6 rounded-2xl hover-lift"
                whileHover={{ scale: 1.05 }}
              >
                <div className={`text-4xl md:text-5xl font-bold ${stat.color} mb-2`}>
                  <CountUp
                    end={stat.value}
                    duration={2.5}
                    delay={index * 0.2}
                    decimals={stat.decimals || 0}
                    suffix={stat.suffix}
                  />
                </div>
                <div className="text-sm md:text-base text-muted-foreground font-medium">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <span className="text-sm">Scroll to explore</span>
          <div className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center p-2">
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1.5 h-1.5 bg-muted-foreground rounded-full"
            />
          </div>
        </div>
      </motion.div>
    </section>
  );
}

