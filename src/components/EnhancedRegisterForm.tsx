/**
 * Enhanced Registration Form with improved UX and error handling
 * Uses the new Form component with real-time validation
 */

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToastNotifications } from "./ui/Toast";
import { useErrorHandler } from "../utils/errorHandler";
import { Form, FormField, createRegistrationForm } from "./ui/Form";
import { BookOpen, ArrowRight, Eye, EyeOff } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { authService } from "@/services/auth";

const EnhancedRegisterForm = () => {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { showSuccess, showError } = useToastNotifications();
  const { handleError } = useErrorHandler();
  const navigate = useNavigate();

  // Create form fields with enhanced validation
  const formFields: FormField[] = createRegistrationForm();

  const handleSubmit = async (data: Record<string, string>) => {
    try {
      setLoading(true);
      
      // Call the authentication service
      const response = await authService.register({
        fullName: data.fullName,
        email: data.email,
        password: data.password,
        phone: data.phone || undefined,
        referralCode: data.referralCode || undefined
      });

      showSuccess(
        "Account Created!",
        `Welcome ${response.user.fullName}! Your account has been created successfully.`
      );
      
      // Navigate to dashboard after a brief delay to show the success message
      setTimeout(() => {
        console.log('Navigating to dashboard...');
        window.location.href = '/dashboard';
      }, 800);
      
      // Don't set loading to false here - we're navigating away
      
    } catch (error) {
      const errorMessage = handleError(error);
      showError("Registration Failed", errorMessage);
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
          <h2 className="text-2xl font-bold text-foreground mb-2">Join Elevate Skil</h2>
          <p className="text-muted-foreground">Start your learning journey today</p>
        </div>

        <Card className="border-0 shadow-elegant">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-center text-xl">Create Account</CardTitle>
            <CardDescription className="text-center">
              Fill in your details to get started
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <Form
              fields={formFields}
              onSubmit={handleSubmit}
              submitText="Create Account"
              loading={loading}
              validateOnChange={true}
            />

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link 
                  to="/login" 
                  className="text-primary hover:text-primary/80 font-medium transition-colors"
                >
                  Sign in here
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

export default EnhancedRegisterForm;
