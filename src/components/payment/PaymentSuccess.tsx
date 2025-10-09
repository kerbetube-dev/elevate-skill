/**
 * Payment Success - Phase 6
 * Beautiful success animation with checkmark, sparkles, particles, and auto-redirect
 */

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle, 
  Sparkles, 
  Clock, 
  BookOpen, 
  ArrowRight,
  Home,
  Mail
} from "lucide-react";

interface PaymentSuccessProps {
  courseName: string;
}

export function PaymentSuccess({ courseName }: PaymentSuccessProps) {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          navigate('/dashboard');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  const sparkleVariants = {
    animate: {
      scale: [1, 1.2, 1],
      rotate: [0, 180, 360],
      opacity: [0.7, 1, 0.7],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const particleVariants = {
    animate: {
      y: [-20, -100],
      opacity: [1, 0],
      scale: [1, 0.5],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeOut"
      }
    }
  };

  const checkmarkVariants = {
    initial: { scale: 0, rotate: -180 },
    animate: { 
      scale: 1, 
      rotate: 0,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 15,
        delay: 0.5
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center p-4">
      {/* Background Particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            variants={particleVariants}
            animate="animate"
            className="absolute w-2 h-2 bg-green-400 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`
            }}
          />
        ))}
      </div>

      {/* Floating Sparkles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            variants={sparkleVariants}
            animate="animate"
            className="absolute text-yellow-400"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`
            }}
          >
            <Sparkles className="w-6 h-6" />
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 max-w-md w-full"
      >
        <Card className="overflow-hidden border-2 border-green-200 shadow-2xl">
          <CardContent className="p-8 text-center space-y-6">
            {/* Success Icon */}
            <motion.div
              variants={checkmarkVariants}
              initial="initial"
              animate="animate"
              className="mx-auto w-24 h-24 bg-green-500 rounded-full flex items-center justify-center shadow-lg"
            >
              <CheckCircle className="w-12 h-12 text-white" />
            </motion.div>

            {/* Success Message */}
            <div className="space-y-2">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="text-3xl font-bold text-gray-900"
              >
                Payment Submitted!
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                className="text-gray-600"
              >
                Your payment request has been successfully submitted for review.
              </motion.p>
            </div>

            {/* Course Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
              className="p-4 bg-green-50 rounded-lg border border-green-200"
            >
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="w-5 h-5 text-green-600" />
                <span className="font-semibold text-gray-900">Course Enrolled</span>
              </div>
              <p className="text-sm text-gray-700">{courseName}</p>
            </motion.div>

            {/* Status Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.4 }}
            >
              <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200 px-4 py-2">
                <Clock className="w-4 h-4 mr-2" />
                Pending Admin Approval
              </Badge>
            </motion.div>

            {/* Next Steps */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.6 }}
              className="space-y-3 text-left"
            >
              <h3 className="font-semibold text-gray-900 text-center">What happens next?</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                  <span>Admin will review your payment screenshot</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                  <span>You'll receive an email notification once approved</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                  <span>Course will appear in your dashboard</span>
                </div>
              </div>
            </motion.div>

            {/* Countdown */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.8 }}
              className="text-center"
            >
              <p className="text-sm text-gray-600 mb-2">
                Redirecting to dashboard in {countdown} seconds...
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <motion.div
                  initial={{ width: "100%" }}
                  animate={{ width: "0%" }}
                  transition={{ duration: 3, ease: "linear" }}
                  className="bg-green-500 h-2 rounded-full"
                />
              </div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2 }}
              className="flex gap-3"
            >
              <Button
                variant="outline"
                onClick={() => navigate('/')}
                className="flex-1"
              >
                <Home className="w-4 h-4 mr-2" />
                Home
              </Button>
              <Button
                onClick={() => navigate('/dashboard')}
                className="flex-1"
                variant="gradient"
              >
                <ArrowRight className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
            </motion.div>

            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.2 }}
              className="text-center"
            >
              <p className="text-xs text-gray-500">
                Questions? Contact us at{" "}
                <a href="mailto:support@elevateskill.com" className="text-green-600 hover:underline">
                  support@elevateskill.com
                </a>
              </p>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}