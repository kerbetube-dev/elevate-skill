/**
 * Features Section with Icon Animations
 * Showcases why users should choose Elevate Skill
 */

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { staggerContainer, staggerItem } from "@/lib/animations";
import {
  BookOpen,
  Users,
  Award,
  TrendingUp,
  Video,
  Clock,
  MessageSquare,
  Shield,
  Zap,
  Globe,
  Star,
  Target,
} from "lucide-react";

const features = [
  {
    icon: BookOpen,
    title: "Expert-Led Courses",
    description: "Learn from industry professionals with years of real-world experience.",
    color: "text-blue-600",
    bgColor: "bg-blue-100",
  },
  {
    icon: Video,
    title: "High-Quality Content",
    description: "HD video lessons, downloadable resources, and interactive projects.",
    color: "text-purple-600",
    bgColor: "bg-purple-100",
  },
  {
    icon: Clock,
    title: "Learn at Your Pace",
    description: "Lifetime access to course materials. Study whenever and wherever you want.",
    color: "text-green-600",
    bgColor: "bg-green-100",
  },
  {
    icon: Award,
    title: "Certificates",
    description: "Earn recognized certificates upon course completion to boost your resume.",
    color: "text-yellow-600",
    bgColor: "bg-yellow-100",
  },
  {
    icon: Users,
    title: "Community Support",
    description: "Join thousands of learners, share knowledge, and grow together.",
    color: "text-pink-600",
    bgColor: "bg-pink-100",
  },
  {
    icon: TrendingUp,
    title: "Career Growth",
    description: "Develop skills that employers are actively seeking in the market.",
    color: "text-indigo-600",
    bgColor: "bg-indigo-100",
  },
  {
    icon: MessageSquare,
    title: "Expert Mentorship",
    description: "Get guidance and answers from experienced instructors.",
    color: "text-orange-600",
    bgColor: "bg-orange-100",
  },
  {
    icon: Shield,
    title: "Trusted Platform",
    description: "Secure payments, verified instructors, and quality-assured content.",
    color: "text-teal-600",
    bgColor: "bg-teal-100",
  },
];

export function FeaturesSection() {
  return (
    <section className="py-20 md:py-32 bg-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10" />

      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Why Choose{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Elevate Skill
            </span>
            ?
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            We're committed to providing the best learning experience with features
            designed for your success.
          </p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div key={index} variants={staggerItem}>
                <Card
                  variant="elevated"
                  hover="lift"
                  className="h-full group cursor-pointer border-2 hover:border-primary/20"
                >
                  <CardHeader>
                    <motion.div
                      whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
                      transition={{ duration: 0.5 }}
                      className={`w-14 h-14 rounded-xl ${feature.bgColor} ${feature.color} flex items-center justify-center mb-4 group-hover:shadow-lg transition-shadow`}
                    >
                      <Icon className="h-7 w-7" />
                    </motion.div>
                    <CardTitle className="text-xl group-hover:text-primary transition-colors">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Additional Features Highlight */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          <div className="text-center p-8 rounded-2xl glass">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 360 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-primary text-white mb-4"
            >
              <Zap className="h-8 w-8" />
            </motion.div>
            <h3 className="text-2xl font-bold mb-2">Fast Learning</h3>
            <p className="text-muted-foreground">
              Accelerated learning paths designed to get you job-ready quickly.
            </p>
          </div>

          <div className="text-center p-8 rounded-2xl glass">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 360 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-forest text-white mb-4"
            >
              <Globe className="h-8 w-8" />
            </motion.div>
            <h3 className="text-2xl font-bold mb-2">Global Access</h3>
            <p className="text-muted-foreground">
              Learn from anywhere in the world with our cloud-based platform.
            </p>
          </div>

          <div className="text-center p-8 rounded-2xl glass">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 360 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-sunset text-white mb-4"
            >
              <Target className="h-8 w-8" />
            </motion.div>
            <h3 className="text-2xl font-bold mb-2">Goal-Oriented</h3>
            <p className="text-muted-foreground">
              Structured curriculum designed to help you achieve your career goals.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

