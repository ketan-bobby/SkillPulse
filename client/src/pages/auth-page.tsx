import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, EyeOff, Brain, Zap, Bot, Target, Shield, Users, Sparkles, CheckCircle2, Code } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const AI_FEATURES = [
  { icon: <Brain className="h-4 w-4" />, text: "AI-powered question generation across 11 technical domains" },
  { icon: <Zap className="h-4 w-4" />, text: "Intelligent anti-cheating detection with behavioral analysis" },
  { icon: <Bot className="h-4 w-4" />, text: "Smart performance analytics and skill gap identification" },
  { icon: <Target className="h-4 w-4" />, text: "Adaptive difficulty adjustment based on candidate responses" },
];

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loginData, setLoginData] = useState({ username: "", password: "" });
  const [registerData, setRegisterData] = useState({
    username: "",
    password: "",
    name: "",
    role: "employee",
    email: "",
  });
  const [currentAIFeature] = useState(() => AI_FEATURES[Math.floor(Math.random() * AI_FEATURES.length)]);

  // Early return after all hooks are called
  if (user) {
    return <Redirect to="/" />;
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate(loginData);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    registerMutation.mutate(registerData);
  };

  const getRoleDescription = (role: string) => {
    switch (role) {
      case "admin":
        return "Full system access: Manage users, create tests, configure platform settings";
      case "reviewer":
        return "Assessment oversight: Review questions, approve content, manage test quality";
      case "employee":
        return "Assessment participant: Take assigned tests, view results, track progress";
      default:
        return "";
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Auth forms */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="h-12 w-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <Code className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  LinxIQ
                </h1>
              </div>
            </div>
            <p className="text-muted-foreground">Engineer-Grade Assessments. Linx-Level Accuracy</p>
            
            {/* AI Feature Highlight */}
            <div className="mt-4 p-3 bg-white/60 backdrop-blur-sm rounded-lg border">
              <div className="flex items-center space-x-2 text-sm">
                <div className="text-blue-600">{currentAIFeature.icon}</div>
                <span className="text-gray-700">{currentAIFeature.text}</span>
              </div>
            </div>
          </div>

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Sign In</TabsTrigger>
              <TabsTrigger value="register">Create Account</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">Welcome back</CardTitle>
                  <CardDescription>
                    Access your assessment dashboard
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-username">Username</Label>
                      <Input
                        id="login-username"
                        type="text"
                        placeholder="Enter your username"
                        value={loginData.username}
                        onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                        required
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="login-password">Password</Label>
                      <div className="relative">
                        <Input
                          id="login-password"
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
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                      disabled={loginMutation.isPending}
                    >
                      {loginMutation.isPending ? (
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Signing in...</span>
                        </div>
                      ) : (
                        "Sign In"
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="register">
              <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">Create Account</CardTitle>
                  <CardDescription>
                    Join the LinxIQ platform
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="register-name">Full Name</Label>
                      <Input
                        id="register-name"
                        type="text"
                        placeholder="Enter your full name"
                        value={registerData.name}
                        onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                        required
                        className="h-11"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="register-email">Email</Label>
                      <Input
                        id="register-email"
                        type="email"
                        placeholder="Enter your email address"
                        value={registerData.email}
                        onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                        required
                        className="h-11"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="register-username">Username</Label>
                      <Input
                        id="register-username"
                        type="text"
                        placeholder="Choose a username"
                        value={registerData.username}
                        onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
                        required
                        className="h-11"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="register-password">Password</Label>
                      <div className="relative">
                        <Input
                          id="register-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Create a secure password"
                          value={registerData.password}
                          onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
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
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="register-role">Account Type</Label>
                      <Select
                        value={registerData.role}
                        onValueChange={(value) => setRegisterData({ ...registerData, role: value })}
                      >
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="Select your role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="employee">
                            <div className="flex items-center space-x-2">
                              <Users className="h-4 w-4" />
                              <span>Candidate</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="reviewer">
                            <div className="flex items-center space-x-2">
                              <CheckCircle2 className="h-4 w-4" />
                              <span>Reviewer</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="admin">
                            <div className="flex items-center space-x-2">
                              <Shield className="h-4 w-4" />
                              <span>Administrator</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      
                      {/* Role Description */}
                      <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-sm text-blue-800">
                          {getRoleDescription(registerData.role)}
                        </p>
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                      disabled={registerMutation.isPending}
                    >
                      {registerMutation.isPending ? (
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Creating account...</span>
                        </div>
                      ) : (
                        "Create Account"
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Right side - Hero section */}
      <div className="flex-1 bg-gradient-to-br from-gray-900 to-gray-800 p-8 text-white relative overflow-hidden">
        <div className="relative z-10 h-full flex flex-col justify-center">
          <div className="max-w-lg">
            <div className="flex items-center space-x-2 mb-6">
              <Badge variant="secondary" className="bg-blue-600/20 text-blue-300 border-blue-500/30">
                <Sparkles className="h-3 w-3 mr-1" />
                AI-Powered Platform
              </Badge>
            </div>
            
            <h2 className="text-4xl font-bold mb-6 leading-tight">
              The Future of
              <br />
              <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                Technical Assessment
              </span>
            </h2>
            
            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              LinxIQ leverages advanced AI to deliver engineer-grade assessments with unprecedented accuracy and insight.
            </p>

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="h-2 w-2 bg-blue-400 rounded-full"></div>
                <span className="text-gray-300">AI-generated questions across 11 technical domains</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="h-2 w-2 bg-indigo-400 rounded-full"></div>
                <span className="text-gray-300">Advanced anti-cheating with behavioral analysis</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="h-2 w-2 bg-purple-400 rounded-full"></div>
                <span className="text-gray-300">Real-time performance analytics and insights</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="h-2 w-2 bg-pink-400 rounded-full"></div>
                <span className="text-gray-300">Multi-device accessibility (laptop, mobile, app)</span>
              </div>
            </div>

            <div className="mt-12 p-6 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
              <div className="flex items-center space-x-3 mb-3">
                <Brain className="h-6 w-6 text-blue-400" />
                <h3 className="text-lg font-semibold">AI Intelligence</h3>
              </div>
              <p className="text-gray-300 text-sm">
                Our AI continuously learns from assessment patterns to provide more accurate evaluations 
                and personalized feedback for every candidate.
              </p>
            </div>
          </div>
        </div>

        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-20 h-32 w-32 bg-blue-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-20 h-40 w-40 bg-indigo-500 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 right-1/3 h-24 w-24 bg-purple-500 rounded-full blur-2xl"></div>
        </div>
      </div>
    </div>
  );
}