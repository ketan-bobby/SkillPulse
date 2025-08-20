import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff, Building2, Users, Award, TrendingUp, Shield, Code } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const EMPLOYEE_FEATURES = [
  { icon: <Award className="h-5 w-5" />, title: "Skill Assessments", description: "Take targeted assessments to evaluate and showcase your technical skills" },
  { icon: <TrendingUp className="h-5 w-5" />, title: "Career Development", description: "Track your progress and identify areas for professional growth" },
  { icon: <Users className="h-5 w-5" />, title: "Team Collaboration", description: "Participate in team assessments and knowledge sharing" },
  { icon: <Shield className="h-5 w-5" />, title: "Performance Reviews", description: "Complete assessments for annual reviews and promotions" },
];

export default function EmployeeLogin() {
  const { user, loginMutation } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loginData, setLoginData] = useState({ username: "", password: "" });

  // Redirect if already logged in
  if (user) {
    return <Redirect to="/" />;
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate(loginData as any);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-8 items-center">
        {/* Left side - Login form */}
        <div className="w-full max-w-md mx-auto lg:mx-0">
          {/* Logo and branding */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-2 mb-6">
              <div className="h-12 w-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <Code className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  LinxIQ
                </h1>
                <p className="text-sm text-gray-600">Employee Portal</p>
              </div>
            </div>
          </div>

          {/* Login card */}
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl font-bold text-gray-900">Welcome Back</CardTitle>
              <CardDescription className="text-gray-600">
                Sign in to access your assessments and development tools
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loginMutation.error && (
                <Alert variant="destructive" className="mb-6">
                  <AlertDescription>
                    {loginMutation.error.message || "Invalid username or password"}
                  </AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-sm font-medium text-gray-700">
                    Employee ID / Username
                  </Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter your employee ID or username"
                    value={loginData.username}
                    onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                    required
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      required
                      className="h-11 pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </Button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium"
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Signing in...</span>
                    </div>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Forgot your password?{" "}
                  <button className="text-blue-600 hover:text-blue-500 font-medium">
                    Contact IT Support
                  </button>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right side - Features and info */}
        <div className="hidden lg:block">
          <div className="space-y-8">
            {/* Header */}
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Advance Your Career with LinxIQ
              </h2>
              <p className="text-lg text-gray-600 max-w-lg mx-auto">
                Showcase your skills, track your growth, and unlock new opportunities through our comprehensive assessment platform.
              </p>
            </div>

            {/* Features grid */}
            <div className="grid grid-cols-2 gap-6">
              {EMPLOYEE_FEATURES.map((feature, index) => (
                <div
                  key={index}
                  className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50 hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg text-white">
                      {feature.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                      <p className="text-sm text-gray-600">{feature.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Company stats */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white">
              <div className="flex items-center space-x-4 mb-4">
                <Building2 className="h-8 w-8" />
                <div>
                  <h3 className="text-xl font-bold">Trusted by Leading Companies</h3>
                  <p className="text-blue-100">Join thousands of professionals advancing their careers</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold">50+</div>
                  <div className="text-blue-100 text-sm">Assessments Available</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">15+</div>
                  <div className="text-blue-100 text-sm">Technical Domains</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">24/7</div>
                  <div className="text-blue-100 text-sm">Platform Access</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}