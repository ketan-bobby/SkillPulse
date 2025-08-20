import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { UserPlus, LogIn, Lock, User, Mail } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { ROLES } from "@shared/roles";

export default function CandidateLogin() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    name: "",
    email: "",
    confirmPassword: ""
  });
  
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const loginMutation = useMutation({
    mutationFn: async (credentials: { username: string; password: string }) => {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        throw new Error("Invalid credentials");
      }

      return response.json();
    },
    onSuccess: (user) => {
      queryClient.setQueryData(["/api/user"], user);
      toast({
        title: "Login Successful",
        description: `Welcome back, ${user.name}!`,
      });
      
      // Redirect based on user role
      switch (user.role) {
        case ROLES.SUPER_ADMIN:
          setLocation("/super-admin");
          break;
        case ROLES.ADMIN:
          setLocation("/admin");
          break;
        case ROLES.HR_MANAGER:
          setLocation("/hr-manager");
          break;
        case ROLES.REVIEWER:
          setLocation("/reviewer");
          break;
        case ROLES.TEAM_LEAD:
          setLocation("/team-lead");
          break;
        case ROLES.EMPLOYEE:
          setLocation("/employee-dashboard");
          break;
        case ROLES.CANDIDATE:
          setLocation("/candidate");
          break;
        default:
          setLocation("/");
          break;
      }
    },
    onError: (error) => {
      toast({
        title: "Login Failed", 
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (userData: {
      username: string;
      password: string;
      name: string;
      email: string;
      role: string;
    }) => {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Registration failed");
      }

      return response.json();
    },
    onSuccess: (user) => {
      queryClient.setQueryData(["/api/user"], user);
      toast({
        title: "Registration Successful",
        description: `Welcome to LinxIQ, ${user.name}!`,
      });
      
      // Redirect based on user role after registration
      switch (user.role) {
        case ROLES.SUPER_ADMIN:
          setLocation("/super-admin");
          break;
        case ROLES.ADMIN:
          setLocation("/admin");
          break;
        case ROLES.HR_MANAGER:
          setLocation("/hr-manager");
          break;
        case ROLES.REVIEWER:
          setLocation("/reviewer");
          break;
        case ROLES.TEAM_LEAD:
          setLocation("/team-lead");
          break;
        case ROLES.EMPLOYEE:
          setLocation("/employee-dashboard");
          break;
        case ROLES.CANDIDATE:
          setLocation("/candidate");
          break;
        default:
          setLocation("/");
          break;
      }
    },
    onError: (error) => {
      toast({
        title: "Registration Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (mode === "login") {
      loginMutation.mutate({
        username: formData.username,
        password: formData.password,
      });
    } else {
      // Validation for registration
      if (formData.password !== formData.confirmPassword) {
        toast({
          title: "Password Mismatch",
          description: "Passwords do not match",
          variant: "destructive",
        });
        return;
      }
      
      if (formData.password.length < 6) {
        toast({
          title: "Password Too Short",
          description: "Password must be at least 6 characters",
          variant: "destructive",
        });
        return;
      }

      registerMutation.mutate({
        username: formData.username,
        password: formData.password,
        name: formData.name,
        email: formData.email,
        role: "candidate",
      });
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const switchMode = () => {
    setMode(mode === "login" ? "register" : "login");
    setFormData({
      username: "",
      password: "",
      name: "",
      email: "",
      confirmPassword: ""
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl">
              <span className="text-2xl font-bold text-white">L</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            LinxIQ
          </h1>
          <p className="text-gray-600 mt-2">
            {mode === "login" ? "Sign in to your candidate account" : "Create your candidate account"}
          </p>
        </div>

        {/* Login/Register Card */}
        <Card className="backdrop-blur-lg bg-white/70 border-0 shadow-2xl">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2">
              {mode === "login" ? (
                <>
                  <LogIn className="w-6 h-6 text-blue-600" />
                  Sign In
                </>
              ) : (
                <>
                  <UserPlus className="w-6 h-6 text-purple-600" />
                  Create Account
                </>
              )}
            </CardTitle>
            <CardDescription className="text-center text-gray-600">
              {mode === "login" 
                ? "Enter your credentials to access your tests" 
                : "Join LinxIQ as a candidate"}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name field for registration */}
              {mode === "register" && (
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    required
                    className="h-11 bg-white/50 border-gray-200 focus:border-blue-400 focus:ring-blue-400"
                  />
                </div>
              )}

              {/* Email field for registration */}
              {mode === "register" && (
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    required
                    className="h-11 bg-white/50 border-gray-200 focus:border-blue-400 focus:ring-blue-400"
                  />
                </div>
              )}

              {/* Username field */}
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-medium flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Username
                </Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={formData.username}
                  onChange={(e) => handleInputChange("username", e.target.value)}
                  required
                  className="h-11 bg-white/50 border-gray-200 focus:border-blue-400 focus:ring-blue-400"
                />
              </div>

              {/* Password field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  required
                  className="h-11 bg-white/50 border-gray-200 focus:border-blue-400 focus:ring-blue-400"
                />
              </div>

              {/* Confirm Password field for registration */}
              {mode === "register" && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Confirm Password
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    required
                    className="h-11 bg-white/50 border-gray-200 focus:border-blue-400 focus:ring-blue-400"
                  />
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg transition-all duration-200 hover:shadow-xl"
                disabled={loginMutation.isPending || registerMutation.isPending}
              >
                {loginMutation.isPending || registerMutation.isPending ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {mode === "login" ? "Signing in..." : "Creating account..."}
                  </div>
                ) : (
                  mode === "login" ? "Sign In" : "Create Account"
                )}
              </Button>
            </form>

            {/* Mode Switch */}
            <div className="text-center pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                {mode === "login" ? "Don't have an account?" : "Already have an account?"}
              </p>
              <Button
                variant="link"
                onClick={switchMode}
                className="text-blue-600 hover:text-blue-700 font-semibold p-0 h-auto"
              >
                {mode === "login" ? "Create Account" : "Sign In"}
              </Button>
            </div>

            {/* Candidate Info */}
            <Alert className="bg-blue-50 border-blue-200">
              <AlertDescription className="text-sm text-blue-800">
                <strong>For Candidates:</strong> Use this portal to access your assigned assessments. 
                Your test assignments will appear on your dashboard after login.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-500 text-sm">
          <p>© 2025 LinxIQ - Engineer-Grade Assessment Platform</p>
        </div>
      </div>
    </div>
  );
}