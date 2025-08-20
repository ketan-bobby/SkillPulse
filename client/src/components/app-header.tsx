import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { ChartLine, Bell, ChevronDown, User, Settings, LogOut, Brain } from "lucide-react";
import { Link, useLocation } from "wouter";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
// Logo will be handled with fallback styling
import { ROLES } from "@shared/roles";

export function AppHeader() {
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();

  const getNavigationForRole = (role: string) => {
    if (role === ROLES.SUPER_ADMIN) {
      return [
        { name: "Dashboard", href: "/super-admin", current: location === "/super-admin" },
        { name: "Users", href: "/super-admin/users", current: location === "/super-admin/users" },
        { name: "Tests", href: "/super-admin/tests", current: location === "/super-admin/tests" },
        { name: "Questions", href: "/super-admin/questions", current: location === "/super-admin/questions" },
        { name: "Results", href: "/super-admin/results", current: location === "/super-admin/results" },
        { name: "Analytics", href: "/super-admin/analytics", current: location === "/super-admin/analytics" },
        { name: "Smart Insights", href: "/super-admin/ai-insights", current: location === "/super-admin/ai-insights" },
        { name: "HR Systems", href: "/super-admin/hr-integration", current: location === "/super-admin/hr-integration" },
        { name: "Workflow", href: "/super-admin/workflow", current: location === "/super-admin/workflow" },
        { name: "Settings", href: "/super-admin/settings", current: location === "/super-admin/settings" },
        { name: "Export", href: "/super-admin/export", current: location === "/super-admin/export" },
        { name: "Email", href: "/super-admin/email", current: location === "/super-admin/email" },
        { name: "TERO Testing", href: "/super-admin/tero", current: location === "/super-admin/tero" },
      ];
    }

    if (role === ROLES.ADMIN) {
      return [
        { name: "Dashboard", href: "/admin", current: location === "/admin" },
        { name: "Users", href: "/admin/users", current: location === "/admin/users" },
        { name: "Tests", href: "/admin/tests", current: location === "/admin/tests" },
        { name: "Questions", href: "/admin/questions", current: location === "/admin/questions" },
        { name: "Results", href: "/admin/results", current: location === "/admin/results" },
        { name: "Analytics", href: "/admin/analytics", current: location === "/admin/analytics" },
        { name: "Smart Insights", href: "/admin/ai-insights", current: location === "/admin/ai-insights" },
        { name: "Settings", href: "/admin/settings", current: location === "/admin/settings" },
        { name: "TERO Testing", href: "/admin/tero", current: location === "/admin/tero" },
      ];
    }

    if (role === ROLES.HR_MANAGER) {
      return [
        { name: "Dashboard", href: "/hr-manager", current: location === "/hr-manager" },
        { name: "Integration", href: "/hr-manager/integration", current: location === "/hr-manager/integration" },
        { name: "Reports", href: "/hr-manager/reports", current: location === "/hr-manager/reports" },
        { name: "Analytics", href: "/hr-manager/analytics", current: location === "/hr-manager/analytics" },
      ];
    }

    if (role === ROLES.REVIEWER) {
      return [
        { name: "Dashboard", href: "/reviewer", current: location === "/reviewer" },
        { name: "Questions", href: "/reviewer/questions", current: location === "/reviewer/questions" },
        { name: "Smart Insights", href: "/reviewer/ai-insights", current: location === "/reviewer/ai-insights" },
      ];
    }

    if (role === ROLES.TEAM_LEAD) {
      return [
        { name: "Dashboard", href: "/team-lead", current: location === "/team-lead" },
        { name: "Assignments", href: "/team-lead/assignments", current: location === "/team-lead/assignments" },
        { name: "Results", href: "/team-lead/results", current: location === "/team-lead/results" },
        { name: "Reports", href: "/team-lead/reports", current: location === "/team-lead/reports" },
      ];
    }

    if (role === ROLES.EMPLOYEE) {
      return [
        { name: "Dashboard", href: "/employee", current: location === "/employee" },
        { name: "Assignments", href: "/employee/assignments", current: location === "/employee/assignments" },
        { name: "Results", href: "/employee/results", current: location === "/employee/results" },
        { name: "Profile", href: "/employee/profile", current: location === "/employee/profile" },
      ];
    }

    if (role === ROLES.CANDIDATE) {
      return [
        { name: "Dashboard", href: "/candidate", current: location === "/candidate" },
        { name: "Assignments", href: "/candidate/assignments", current: location === "/candidate/assignments" },
        { name: "Results", href: "/candidate/results", current: location === "/candidate/results" },
      ];
    }

    return [
      { name: "Dashboard", href: "/", current: location === "/" },
    ];
  };

  const navigation = getNavigationForRole(user?.role || "employee");

  return (
    <header className="glass-card border-none shadow-xl sticky top-0 z-50 animate-fade-in">
      <div className="container">
        <div className="flex justify-between items-center h-16 sm:h-20">
          {/* Logo Section */}
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-all duration-300">
              <div className="relative w-10 h-10 sm:w-12 sm:h-12">
                <div className="w-10 h-10 sm:w-12 sm:h-12 gradient-primary rounded-xl flex items-center justify-center text-white font-bold text-sm sm:text-lg shadow-lg">
                  LIQ
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-xl pointer-events-none"></div>
              </div>
              <div className="hidden md:block">
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">LinxIQ</h1>
                <p className="text-sm text-gray-600 font-medium">Engineer-Grade Assessments</p>
              </div>
            </Link>
          </div>

          {/* Primary Navigation - Only show most important items */}
          <nav className="hidden lg:flex items-center space-x-6">
            {navigation.slice(0, 5).map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  item.current
                    ? "bg-gray-800 text-white shadow-md"
                    : "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                {item.name}
              </Link>
            ))}
            
            {/* More Menu for additional items */}
            {navigation.length > 5 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div 
                    style={{ 
                      backgroundColor: '#f3f4f6',
                      border: '1px solid #d1d5db',
                      color: '#374151',
                      fontSize: '14px',
                      fontWeight: '500',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      transition: 'background-color 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e5e7eb'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                  >
                    More
                    <ChevronDown style={{ marginLeft: '4px', width: '16px', height: '16px' }} />
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  align="end" 
                  className="w-48"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(229, 231, 235, 0.8)',
                    borderRadius: '12px',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
                    padding: '8px'
                  }}
                >
                  {navigation.slice(5).map((item) => (
                    <DropdownMenuItem 
                      key={item.name} 
                      asChild
                      style={{
                        borderRadius: '8px',
                        padding: '8px 12px',
                        margin: '2px 0',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <Link 
                        href={item.href} 
                        className="w-full cursor-pointer block"
                        style={{ color: '#374151' }}
                      >
                        {item.name}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </nav>
          {/* Right Side - User Actions */}
          <div className="flex items-center space-x-3">

            {/* Notifications */}
            <Link href="/notifications">
              <button
                style={{
                  position: 'relative',
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
              >
                <Bell style={{ width: '20px', height: '20px', color: '#000000' }} />
                <span 
                  style={{
                    position: 'absolute',
                    top: '-2px',
                    right: '-2px',
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: '#ef4444',
                    fontSize: '10px',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold'
                  }}
                >
                  4
                </span>
              </button>
            </Link>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div 
                  style={{ 
                    backgroundColor: '#f3f4f6', 
                    border: '1px solid #d1d5db',
                    color: '#374151',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    transition: 'background-color 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e5e7eb'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                >
                  <div style={{ textAlign: 'right', display: 'none' }} className="sm:block">
                    <p style={{ fontSize: '14px', fontWeight: '500', color: '#111827', margin: '0' }}>{user?.name}</p>
                    <p style={{ fontSize: '12px', color: '#6b7280', margin: '0', textTransform: 'capitalize' }}>
                      {user?.role === ROLES.SUPER_ADMIN ? 'Super Admin' : 
                       user?.role === 'employee' ? 'Candidate' : user?.role}
                    </p>
                  </div>
                  <img 
                    style={{ 
                      width: '32px', 
                      height: '32px', 
                      borderRadius: '50%', 
                      border: '2px solid #d1d5db' 
                    }}
                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" 
                    alt="User avatar" 
                  />
                  <ChevronDown style={{ width: '16px', height: '16px', color: '#6b7280' }} />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end" 
                className="w-56 bg-white border border-gray-200 shadow-lg rounded-lg mt-2"
              >
                <DropdownMenuLabel className="px-4 py-3">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                    <p className="text-xs text-gray-500">{user?.username}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link 
                    href="/profile" 
                    className="flex items-center cursor-pointer px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <User className="mr-3 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                {(user?.role === ROLES.ADMIN || user?.role === ROLES.SUPER_ADMIN) && (
                  <DropdownMenuItem asChild>
                    <Link 
                      href="/settings" 
                      className="flex items-center cursor-pointer px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <Settings className="mr-3 h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => logoutMutation.mutate()}
                  disabled={logoutMutation.isPending}
                  className="text-red-600 focus:text-red-600 cursor-pointer px-4 py-2 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="mr-3 h-4 w-4" />
                  <span>{logoutMutation.isPending ? "Signing out..." : "Sign out"}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu Button */}
            <div className="lg:hidden">
              <Button 
                variant="ghost" 
                size="icon"
                className="h-10 w-10 rounded-lg hover:bg-gray-100"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
