/**
 * Modern Authentication Layout
 * Split-screen design with gradient background
 */

import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { BookOpen, Sparkles, TrendingUp, Users, Award } from "lucide-react";
import elevateSkillLogo from "@/assets/elevate-skill-logo.png";
import { ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle: string;
  type: "login" | "register";
}

export function AuthLayout({ children, title, subtitle, type }: AuthLayoutProps) {
  const stats = [
    { icon: Users, label: "8,000+ Students", color: "text-blue-400" },
    { icon: Award, label: "6 Expert Courses", color: "text-purple-400" },
    { icon: TrendingUp, label: "98% Success Rate", color: "text-green-400" },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Brand & Visual */}
      <motion.div
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="hidden lg:flex lg:w-1/2 bg-gradient-primary relative overflow-hidden"
      >
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <motion.div
            animate={{
              y: [0, -30, 0],
              x: [0, 20, 0],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute top-20 left-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              y: [0, 30, 0],
              x: [0, -20, 0],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute bottom-20 right-20 w-80 h-80 bg-white/10 rounded-full blur-3xl"
          />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 text-white w-full">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <motion.img
              whileHover={{ scale: 1.1, rotate: 360 }}
              transition={{ duration: 0.5 }}
              src={elevateSkillLogo}
              alt="Elevate Skill"
              className="h-12 w-12"
            />
            <h1 className="text-3xl font-bold">Elevate Skill</h1>
          </Link>

          {/* Main Content */}
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h2 className="text-5xl font-bold mb-4 leading-tight">
                {type === "login" 
                  ? "Welcome Back!"
                  : "Start Your Learning Journey"}
              </h2>
              <p className="text-xl text-white/80 leading-relaxed">
                {type === "login"
                  ? "Continue your path to success. Your next skill awaits!"
                  : "Join thousands of students transforming their careers with expert-led courses."}
              </p>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="grid grid-cols-1 gap-4"
            >
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    className="flex items-center gap-4 glass backdrop-blur-xl p-4 rounded-xl"
                  >
                    <div className={`w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center ${stat.color}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-semibold text-lg">{stat.label}</p>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>

          {/* Footer Quote */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="space-y-4"
          >
            <div className="flex items-start gap-3">
              <Sparkles className="h-6 w-6 text-yellow-300 flex-shrink-0 mt-1" />
              <p className="text-lg italic">
                "Elevate Skill transformed my career. The courses are practical, 
                the instructors are top-notch, and the community is amazing!"
              </p>
            </div>
            <p className="text-white/70">— Sarah J., Digital Marketing Graduate</p>
          </motion.div>
        </div>
      </motion.div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background relative">
        {/* Mobile Logo */}
        <div className="absolute top-8 left-8 lg:hidden">
          <Link to="/" className="flex items-center gap-2">
            <img src={elevateSkillLogo} alt="Elevate Skill" className="h-8 w-8" />
            <h1 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Elevate Skill
            </h1>
          </Link>
        </div>

        {/* Form Container */}
        <motion.div
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md mt-16 lg:mt-0"
        >
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-3xl md:text-4xl font-bold mb-2">{title}</h2>
            <p className="text-muted-foreground text-lg">{subtitle}</p>
          </div>

          {/* Form Content */}
          {children}
        </motion.div>
      </div>
    </div>
  );
}

