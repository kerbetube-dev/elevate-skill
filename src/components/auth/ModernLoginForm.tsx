/**
 * Modern Login Form with Animations
 * Beautiful, user-friendly login experience
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { motion } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { authService } from "@/services/auth";
import { useToast } from "@/hooks/use-toast";
import { AuthLayout } from "./AuthLayout";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/animations";

export function ModernLoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Real-time validation
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  
  const emailValid = email.length > 0 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const passwordValid = password.length >= 6;
  const formValid = emailValid && passwordValid;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formValid) {
      setError("Please fill in all fields correctly");
      return;
    }

    try {
      setLoading(true);
      const response = await authService.login({ email, password });

      toast({
        title: "Welcome Back!",
        description: `Hello ${response.user.fullName}, you have successfully logged in.`,
      });

      // Success animation then redirect
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 800);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Invalid email or password");
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Enter your credentials to access your account"
      type="login"
    >
      <motion.form
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        {/* Email Field */}
        <motion.div variants={staggerItem} className="space-y-2">
          <Label htmlFor="email" className="text-base">
            Email Address
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => setEmailTouched(true)}
              className={`pl-10 h-12 text-base ${
                emailTouched && !emailValid ? "border-destructive" : ""
              }`}
              disabled={loading}
            />
            {emailTouched && emailValid && (
              <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-success-600" />
            )}
          </div>
          {emailTouched && !emailValid && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-destructive flex items-center gap-1"
            >
              <AlertCircle className="h-4 w-4" />
              Please enter a valid email address
            </motion.p>
          )}
        </motion.div>

        {/* Password Field */}
        <motion.div variants={staggerItem} className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-base">
              Password
            </Label>
            <Link
              to="/forgot-password"
              className="text-sm text-primary hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => setPasswordTouched(true)}
              className={`pl-10 pr-10 h-12 text-base ${
                passwordTouched && !passwordValid ? "border-destructive" : ""
              }`}
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              disabled={loading}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
          {passwordTouched && !passwordValid && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-destructive flex items-center gap-1"
            >
              <AlertCircle className="h-4 w-4" />
              Password must be at least 6 characters
            </motion.p>
          )}
        </motion.div>

        {/* Error Alert */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            variants={staggerItem}
          >
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </motion.div>
        )}

        {/* Submit Button */}
        <motion.div variants={staggerItem}>
          <Button
            type="submit"
            variant="gradient"
            size="lg"
            className="w-full h-12 text-base"
            disabled={loading || !formValid}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </Button>
        </motion.div>

        {/* Divider */}
        <motion.div variants={staggerItem} className="relative">
          <Separator />
          <span className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-background px-4 text-sm text-muted-foreground">
            Or continue with
          </span>
        </motion.div>

        {/* Social Login */}
        <motion.div variants={staggerItem} className="grid grid-cols-2 gap-4">
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="h-12"
            disabled={loading}
          >
            <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Google
          </Button>
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="h-12"
            disabled={loading}
          >
            <svg className="mr-2 h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z" />
            </svg>
            Facebook
          </Button>
        </motion.div>

        {/* Register Link */}
        <motion.div variants={staggerItem} className="text-center">
          <p className="text-muted-foreground">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-primary font-semibold hover:underline"
            >
              Sign up for free
            </Link>
          </p>
        </motion.div>
      </motion.form>
    </AuthLayout>
  );
}

