import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Home } from "lucide-react";
import { ROLES } from "@shared/roles";

export default function NotFound() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    // Automatically redirect to appropriate dashboard after 2 seconds
    const timer = setTimeout(() => {
      redirectToDashboard();
    }, 2000);

    return () => clearTimeout(timer);
  }, [user]);

  const redirectToDashboard = () => {
    if (!user) {
      setLocation("/auth");
      return;
    }

    // Redirect based on user role
    switch (user.role) {
      case ROLES.SUPER_ADMIN:
        setLocation("/super-admin/dashboard");
        break;
      case ROLES.ADMIN:
        setLocation("/admin/dashboard");
        break;
      case ROLES.HR_MANAGER:
        setLocation("/hr-manager/dashboard");
        break;
      case ROLES.REVIEWER:
        setLocation("/reviewer/dashboard");
        break;
      case ROLES.TEAM_LEAD:
        setLocation("/team-lead/dashboard");
        break;
      case ROLES.EMPLOYEE:
        setLocation("/employee/dashboard");
        break;
      case ROLES.CANDIDATE:
        setLocation("/candidate/dashboard");
        break;
      default:
        setLocation("/");
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900">
      <Card className="w-full max-w-md mx-4 bg-gray-800/90 border-gray-700">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center">
            <div className="p-4 bg-red-500/20 rounded-full mb-4">
              <AlertCircle className="h-12 w-12 text-red-400" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Page Not Found</h1>
            <p className="text-gray-400 mb-6">
              The page you're looking for doesn't exist or you don't have permission to access it.
            </p>
            
            <div className="space-y-2 w-full">
              <button
                onClick={redirectToDashboard}
                className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg flex items-center justify-center gap-2 transition-all duration-200"
              >
                <Home className="h-4 w-4" />
                Go to Dashboard
              </button>
              
              <p className="text-sm text-gray-500 mt-4">
                Redirecting automatically in 2 seconds...
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
