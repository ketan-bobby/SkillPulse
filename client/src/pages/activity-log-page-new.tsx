import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AppHeader } from "@/components/app-header";
import { RoleGuard } from "@/lib/role-guard";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { formatDistanceToNow, format } from "date-fns";
import {
  Activity,
  User,
  FileText,
  Settings,
  Shield,
  Eye,
  Download,
  Filter,
  Calendar,
  Clock,
  ArrowLeft,
  Search,
  Trash2,
  AlertCircle,
  CheckCircle,
  Info,
  UserPlus,
  Edit3,
  LogOut,
  LogIn,
  Database,
  Server,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Users,
  FileCode
} from "lucide-react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";

interface ActivityLog {
  id: number;
  userId: number;
  userName: string;
  userRole: string;
  action: string;
  resourceType: string;
  resourceId?: number;
  resourceName?: string;
  details: string;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'auth' | 'user' | 'test' | 'question' | 'system' | 'data';
}

const activityIcons = {
  auth: LogIn,
  user: Users,
  test: FileText,
  question: FileCode,
  system: Server,
  data: Database
};

const severityConfig = {
  low: {
    color: 'from-green-600 to-emerald-600',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/30',
    textColor: 'text-green-400',
    icon: CheckCircle2,
    label: 'Low'
  },
  medium: {
    color: 'from-blue-600 to-cyan-600',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
    textColor: 'text-blue-400',
    icon: Info,
    label: 'Medium'
  },
  high: {
    color: 'from-orange-600 to-amber-600',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/30',
    textColor: 'text-orange-400',
    icon: AlertTriangle,
    label: 'High'
  },
  critical: {
    color: 'from-red-600 to-rose-600',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/30',
    textColor: 'text-red-400',
    icon: XCircle,
    label: 'Critical'
  }
};

const categoryConfig = {
  auth: {
    label: 'Authentication',
    color: 'from-purple-600 to-pink-600',
    bgColor: 'bg-purple-500/10',
    textColor: 'text-purple-400'
  },
  user: {
    label: 'User Management',
    color: 'from-blue-600 to-indigo-600',
    bgColor: 'bg-blue-500/10',
    textColor: 'text-blue-400'
  },
  test: {
    label: 'Test Management',
    color: 'from-green-600 to-teal-600',
    bgColor: 'bg-green-500/10',
    textColor: 'text-green-400'
  },
  question: {
    label: 'Questions',
    color: 'from-yellow-600 to-orange-600',
    bgColor: 'bg-yellow-500/10',
    textColor: 'text-yellow-400'
  },
  system: {
    label: 'System',
    color: 'from-gray-600 to-slate-600',
    bgColor: 'bg-gray-500/10',
    textColor: 'text-gray-400'
  },
  data: {
    label: 'Data Operations',
    color: 'from-cyan-600 to-blue-600',
    bgColor: 'bg-cyan-500/10',
    textColor: 'text-cyan-400'
  }
};

export default function ActivityLogPage() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedSeverity, setSelectedSeverity] = useState<string>("all");
  const [selectedUser, setSelectedUser] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const { toast } = useToast();

  const getDashboardPath = () => {
    if (user?.role === 'super_admin') {
      return '/super-admin/dashboard';
    } else if (user?.role === 'admin') {
      return '/admin/dashboard';
    }
    return '/admin/dashboard';
  };

  // Fetch activity logs data
  const { data: activityLogs = [], isLoading } = useQuery({
    queryKey: ["/api/activity-logs"],
    enabled: true
  });

  // Fetch users for filter dropdown
  const { data: users = [] } = useQuery({
    queryKey: ["/api/users"],
    enabled: true
  });

  // Clear all logs mutation
  const clearLogsMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/activity-logs/clear", { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to clear logs");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/activity-logs"] });
      toast({
        title: "Success",
        description: "Activity logs cleared successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to clear activity logs",
        variant: "destructive",
      });
    },
  });

  // Export logs mutation
  const exportLogsMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/activity-logs/export", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      if (!response.ok) {
        throw new Error("Failed to export logs");
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `activity-logs-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Activity logs exported successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to export logs",
        variant: "destructive",
      });
    },
  });

  // Filter logs based on criteria
  const filteredLogs = ((activityLogs as ActivityLog[]) || []).filter((log: ActivityLog) => {
    const matchesSearch = searchTerm === "" || 
      log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === "all" || log.category === selectedCategory;
    const matchesSeverity = selectedSeverity === "all" || log.severity === selectedSeverity;
    const matchesUser = selectedUser === "all" || log.userId.toString() === selectedUser;
    
    let matchesDate = true;
    if (dateFilter !== "all") {
      const logDate = new Date(log.timestamp);
      const now = new Date();
      
      switch (dateFilter) {
        case "today":
          matchesDate = logDate.toDateString() === now.toDateString();
          break;
        case "week":
          matchesDate = (now.getTime() - logDate.getTime()) <= 7 * 24 * 60 * 60 * 1000;
          break;
        case "month":
          matchesDate = (now.getTime() - logDate.getTime()) <= 30 * 24 * 60 * 60 * 1000;
          break;
      }
    }

    return matchesSearch && matchesCategory && matchesSeverity && matchesUser && matchesDate;
  });

  // Get statistics
  const stats = {
    total: filteredLogs.length,
    critical: filteredLogs.filter((log: ActivityLog) => log.severity === 'critical').length,
    high: filteredLogs.filter((log: ActivityLog) => log.severity === 'high').length,
    medium: filteredLogs.filter((log: ActivityLog) => log.severity === 'medium').length,
    low: filteredLogs.filter((log: ActivityLog) => log.severity === 'low').length
  };

  return (
    <RoleGuard allowedRoles={["super_admin", "admin"]}>
      <div className="min-h-screen bg-white">
        <AppHeader />
        
        {/* Removed animated background for clean white theme */}

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          {/* Header Section */}
          <div className="bg-gray-50 rounded-2xl p-8 border border-gray-200 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <Button
                  variant="ghost"
                  onClick={() => setLocation(getDashboardPath())}
                  className="hover:bg-gray-100 text-gray-700 hover:text-gray-900 transition-all"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
                
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl shadow-lg">
                    <Activity className="h-10 w-10 text-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold text-gray-900">
                      Activity Logs
                    </h1>
                    <p className="text-gray-600 mt-1">Real-time monitoring and audit trail</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {user?.role === 'super_admin' && (
                  <Button
                    variant="outline"
                    onClick={() => clearLogsMutation.mutate()}
                    disabled={clearLogsMutation.isPending}
                    className="border-red-500 hover:bg-red-50 text-red-600"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear Logs
                  </Button>
                )}
                <Button
                  onClick={() => exportLogsMutation.mutate()}
                  disabled={exportLogsMutation.isPending}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </div>
            </div>

            {/* Statistics Bar */}
            <div className="grid grid-cols-5 gap-4 mt-8">
              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Total Logs</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-purple-600" />
                </div>
              </div>
              <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-red-600 text-sm">Critical</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stats.critical}</p>
                  </div>
                  <XCircle className="h-8 w-8 text-red-600" />
                </div>
              </div>
              <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-600 text-sm">High</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stats.high}</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-orange-600" />
                </div>
              </div>
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-600 text-sm">Medium</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stats.medium}</p>
                  </div>
                  <Info className="h-8 w-8 text-blue-600" />
                </div>
              </div>
              <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-600 text-sm">Low</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stats.low}</p>
                  </div>
                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Filters Section */}
          <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200 shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <Filter className="h-5 w-5 text-purple-600" />
              <h2 className="text-xl font-semibold text-gray-900">Filters & Search</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
              <div className="lg:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search logs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-white border-gray-300 text-gray-900 placeholder-gray-400"
                  />
                </div>
              </div>

              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="bg-white border-gray-300 text-gray-900 hover:bg-gray-50 focus:ring-2 focus:ring-purple-500">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-300 text-gray-900">
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="auth">Authentication</SelectItem>
                  <SelectItem value="user">User Management</SelectItem>
                  <SelectItem value="test">Test Management</SelectItem>
                  <SelectItem value="question">Questions</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                  <SelectItem value="data">Data Operations</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedSeverity} onValueChange={setSelectedSeverity}>
                <SelectTrigger className="bg-white border-gray-300 text-gray-900 hover:bg-gray-50 focus:ring-2 focus:ring-purple-500">
                  <SelectValue placeholder="Severity" />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-300 text-gray-900">
                  <SelectItem value="all">All Severities</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedUser} onValueChange={setSelectedUser}>
                <SelectTrigger className="bg-white border-gray-300 text-gray-900 hover:bg-gray-50 focus:ring-2 focus:ring-purple-500">
                  <SelectValue placeholder="User" />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-300 text-gray-900">
                  <SelectItem value="all">All Users</SelectItem>
                  {(users as any[]).map((user: any) => (
                    <SelectItem key={user.id} value={user.id.toString()}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="bg-white border-gray-300 text-gray-900 hover:bg-gray-50 focus:ring-2 focus:ring-purple-500">
                  <SelectValue placeholder="Date Range" />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-300 text-gray-900">
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">Last 7 Days</SelectItem>
                  <SelectItem value="month">Last 30 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Logs List */}
          <div className="space-y-3">
            {isLoading ? (
              <div className="bg-gray-50 rounded-xl p-8 border border-gray-200 text-center">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-300 rounded w-1/4 mx-auto mb-4"></div>
                  <div className="h-4 bg-gray-300 rounded w-1/2 mx-auto"></div>
                </div>
              </div>
            ) : filteredLogs.length === 0 ? (
              <div className="bg-gray-50 rounded-xl p-8 border border-gray-200 text-center">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">No activity logs found matching your filters.</p>
              </div>
            ) : (
              filteredLogs.map((log: ActivityLog) => {
                const CategoryIcon = activityIcons[log.category] || Activity;
                const SeverityIcon = severityConfig[log.severity].icon;
                const categoryInfo = categoryConfig[log.category];
                const severityInfo = severityConfig[log.severity];

                return (
                  <div
                    key={log.id}
                    className="bg-white rounded-xl p-5 border border-gray-200 hover:border-purple-400 transition-all duration-300 hover:shadow-lg"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        {/* Category Icon */}
                        <div className={`p-3 ${categoryInfo.bgColor} rounded-xl`}>
                          <CategoryIcon className={`h-6 w-6 ${categoryInfo.textColor}`} />
                        </div>

                        {/* Main Content */}
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-3">
                            <h3 className="text-lg font-semibold text-gray-900">{log.action}</h3>
                            <Badge className={`${severityInfo.bgColor} ${severityInfo.borderColor} ${severityInfo.textColor}`}>
                              <SeverityIcon className="h-3 w-3 mr-1" />
                              {severityInfo.label}
                            </Badge>
                            <Badge className={`${categoryInfo.bgColor} ${categoryInfo.textColor} border-gray-700`}>
                              {categoryInfo.label}
                            </Badge>
                          </div>

                          <p className="text-gray-700">{log.details}</p>

                          <div className="flex items-center gap-6 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4" />
                              <span className="text-purple-600 font-medium">{log.userName}</span>
                              <Badge variant="outline" className="text-xs border-gray-300">
                                {log.userRole}
                              </Badge>
                            </div>
                            {log.resourceName && (
                              <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4" />
                                <span>{log.resourceName}</span>
                              </div>
                            )}
                            {log.ipAddress && (
                              <div className="flex items-center gap-2">
                                <Shield className="h-4 w-4" />
                                <span>{log.ipAddress}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Timestamp */}
                      <div className="text-right">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Clock className="h-4 w-4" />
                          <span className="text-sm">{formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {format(new Date(log.timestamp), 'MMM dd, yyyy HH:mm:ss')}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}