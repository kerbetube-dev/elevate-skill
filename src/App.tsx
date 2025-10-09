import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastProvider } from "./components/ui/Toast";
import LandingPage from "./components/LandingPage";
import RegisterForm from "./components/RegisterForm";
import LoginForm from "./components/LoginForm";
import Dashboard from "./components/Dashboard";
import EnhancedLoginForm from "./components/EnhancedLoginForm";
import EnhancedRegisterForm from "./components/EnhancedRegisterForm";
import EnhancedDashboard from "./components/EnhancedDashboard";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import UserCourseDetail from "./pages/UserCourseDetail";
import AdminCourseDetail from "./pages/AdminCourseDetail";
import PaymentPage from "./pages/PaymentPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ToastProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/register" element={<EnhancedRegisterForm />} />
            <Route path="/login" element={<EnhancedLoginForm />} />
            <Route path="/dashboard" element={<EnhancedDashboard />} />
            <Route path="/payment" element={<PaymentPage />} />
            <Route path="/course/:courseId" element={<UserCourseDetail />} />
            
            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/payments" element={<AdminDashboard />} />
            <Route path="/admin/payment-accounts" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminDashboard />} />
            <Route path="/admin/courses" element={<AdminDashboard />} />
            <Route path="/admin/courses/:courseId" element={<AdminCourseDetail />} />
            <Route path="/admin/withdrawals" element={<AdminDashboard />} />
            <Route path="/admin/analytics" element={<AdminDashboard />} />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
