/**
 * Enhanced Login Form with improved UX and error handling
 * Uses the new Form component with real-time validation
 */

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToastNotifications } from "./ui/Toast";
import { useErrorHandler } from "../utils/errorHandler";
import { Form, FormField, createLoginForm } from "./ui/Form";
import { Eye, EyeOff, BookOpen, ArrowRight } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { authService } from "@/services/auth";

const EnhancedLoginForm = () => {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { showSuccess, showError } = useToastNotifications();
  const { handleError } = useErrorHandler();
  const navigate = useNavigate();

  // Create form fields with enhanced validation
  const formFields: FormField[] = [
    {
      name: 'email',
      label: 'Email Address',
      type: 'email',
      placeholder: 'Enter your email',
      required: true,
      validation: {
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        custom: (value) => {
          if (!value.includes('@')) {
            return 'Please enter a valid email address';
          }
          return null;
        }
      }
    },
    {
      name: 'password',
      label: 'Password',
      type: 'password',
      placeholder: 'Enter your password',
      required: true,
      validation: {
        minLength: 6,
        custom: (value) => {
          if (value.length < 6) {
            return 'Password must be at least 6 characters long';
          }
          return null;
        }
      }
    }
  ];

  const handleSubmit = async (data: Record<string, string>) => {
    try {
      setLoading(true);
      
      // Call the authentication service
      const response = await authService.login({
        email: data.email,
        password: data.password
      });

      showSuccess(
        "Welcome Back!",
        `Hello ${response.user.fullName}, you have successfully logged in.`
      );
      
      // Navigate to dashboard after a brief delay to show the success message
      setTimeout(() => {
        console.log('Navigating to dashboard...');
        window.location.href = '/dashboard';
      }, 800);
      
      // Don't set loading to false here - we're navigating away
      
    } catch (error) {
      const errorMessage = handleError(error);
      showError("Login Failed", errorMessage);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Elevate Skil
            </h1>
          </Link>
          <h2 className="text-2xl font-bold text-foreground mb-2">Welcome Back</h2>
          <p className="text-muted-foreground">Sign in to continue your learning journey</p>
        </div>

        <Card className="border-0 shadow-elegant">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-center text-xl">Sign In</CardTitle>
            <CardDescription className="text-center">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <Form
              fields={formFields}
              onSubmit={handleSubmit}
              submitText="Sign In"
              loading={loading}
              validateOnChange={true}
            />

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link 
                  to="/register" 
                  className="text-primary hover:text-primary/80 font-medium transition-colors"
                >
                  Create one here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <Link 
            to="/" 
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EnhancedLoginForm;
