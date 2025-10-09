/**
 * Call-to-Action Section
 * Encourages users to take action
 */

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { ArrowRight, Rocket, Star, Zap, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function CTASection() {
  const navigate = useNavigate();

  return (
    <section className="py-20 md:py-32 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-primary animated-gradient" />
      
      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            y: [0, -30, 0],
            rotate: [0, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute top-20 left-10 opacity-20"
        >
          <Star className="h-16 w-16 text-white" />
        </motion.div>
        <motion.div
          animate={{
            y: [0, 30, 0],
            rotate: [360, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute bottom-20 right-20 opacity-20"
        >
          <Rocket className="h-24 w-24 text-white" />
        </motion.div>
        <motion.div
          animate={{
            x: [0, 20, 0],
            y: [0, -20, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-1/2 right-10 opacity-20"
        >
          <Zap className="h-20 w-20 text-white" />
        </motion.div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto text-center text-white"
        >
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm mb-8"
          >
            <TrendingUp className="h-10 w-10" />
          </motion.div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            Ready to Transform Your Career?
          </h2>
          
          <p className="text-xl md:text-2xl mb-12 text-white/90 leading-relaxed">
            Join thousands of students who are already learning and growing with Elevate Skill.
            Start your journey today!
          </p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button
              variant="glass"
              size="xl"
              onClick={() => navigate("/register")}
              className="group shadow-2xl hover:bg-white/30"
            >
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              variant="outline"
              size="xl"
              className="bg-white text-primary hover:bg-white/90 border-white group"
              onClick={() => navigate("/courses")}
            >
              Browse Courses
            </Button>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            <Card variant="glass" className="p-6 backdrop-blur-xl border-white/20">
              <div className="text-4xl font-bold mb-2">100%</div>
              <div className="text-white/80">Money-Back Guarantee</div>
            </Card>
            <Card variant="glass" className="p-6 backdrop-blur-xl border-white/20">
              <div className="text-4xl font-bold mb-2">24/7</div>
              <div className="text-white/80">Student Support</div>
            </Card>
            <Card variant="glass" className="p-6 backdrop-blur-xl border-white/20">
              <div className="text-4xl font-bold mb-2">∞</div>
              <div className="text-white/80">Lifetime Access</div>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

