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
  XCircle
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
  user: UserPlus,
  test: FileText,
  question: Edit3,
  system: Settings,
  data: Download
};

const severityColors = {
  low: 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-300 border-green-500/30',
  medium: 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-300 border-blue-500/30',
  high: 'bg-gradient-to-r from-orange-500/20 to-amber-500/20 text-orange-300 border-orange-500/30',
  critical: 'bg-gradient-to-r from-red-500/20 to-rose-500/20 text-red-300 border-red-500/30'
};

const severityIcons = {
  low: CheckCircle2,
  medium: Info,
  high: AlertTriangle,
  critical: XCircle
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
    if (user?.role === 'super_admin' || user?.role === 'admin') {
      return '/admin-dashboard';
    } else if (user?.role === 'hr_manager') {
      return '/hr-dashboard';
    } else if (user?.role === 'reviewer') {
      return '/reviewer-dashboard';
    } else if (user?.role === 'team_lead') {
      return '/team-lead-dashboard';
    } else if (user?.role === 'employee') {
      return '/employee-dashboard';
    }
    return '/admin-dashboard'; // Default fallback
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

  // Clear all logs mutation (super admin only)
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

  // Filter logs based on search and filters
  const filteredLogs = (activityLogs as ActivityLog[]).filter((log: ActivityLog) => {
    const matchesSearch = searchTerm === "" || 
      log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.resourceName && log.resourceName.toLowerCase().includes(searchTerm.toLowerCase()));

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

  return (
    <RoleGuard allowedRoles={["admin", "super_admin"]}>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700">
        <AppHeader />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          {/* Header */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setLocation(getDashboardPath())}
                  className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-200 border border-white/20"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
                <div>
                  <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                    <Activity className="h-8 w-8 text-blue-400" />
                    Activity Logs
                    <Badge className="ml-3 bg-blue-500/20 text-blue-300 border-blue-400/30">
                      {filteredLogs.length} records
                    </Badge>
                  </h1>
                  <p className="text-gray-300 mt-2">Monitor and track all system activities across all user roles</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <RoleGuard allowedRoles={["super_admin"]}>
                  <button
                    onClick={() => clearLogsMutation.mutate()}
                    disabled={clearLogsMutation.isPending}
                    className="bg-red-500/20 hover:bg-red-500/30 text-red-300 px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-200 border border-red-400/30 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Trash2 className="w-4 h-4" />
                    {clearLogsMutation.isPending ? 'Clearing...' : 'Clear All Logs'}
                  </button>
                </RoleGuard>
                <button
                  onClick={() => exportLogsMutation.mutate()}
                  disabled={exportLogsMutation.isPending}
                  className="bg-green-500/20 hover:bg-green-500/30 text-green-300 px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-200 border border-green-400/30 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Download className="w-4 h-4" />
                  {exportLogsMutation.isPending ? 'Exporting...' : 'Export Logs'}
                </button>
              </div>
            </div>
          </div>

          {/* Filters */}
          <Card className="border-0 shadow-xl bg-white/10 backdrop-blur-lg border border-white/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Filter className="h-5 w-5 text-blue-400" />
                Filter & Search
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                {/* Search */}
                <div className="lg:col-span-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search by user, action, or details..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Category Filter */}
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="auth">Authentication</SelectItem>
                    <SelectItem value="user">User Management</SelectItem>
                    <SelectItem value="test">Test Management</SelectItem>
                    <SelectItem value="question">Question Management</SelectItem>
                    <SelectItem value="system">System Settings</SelectItem>
                    <SelectItem value="data">Data Operations</SelectItem>
                  </SelectContent>
                </Select>

                {/* Severity Filter */}
                <Select value={selectedSeverity} onValueChange={setSelectedSeverity}>
                  <SelectTrigger>
                    <SelectValue placeholder="Severity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Severities</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>

                {/* User Filter */}
                <Select value={selectedUser} onValueChange={setSelectedUser}>
                  <SelectTrigger>
                    <SelectValue placeholder="User" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    {(users as any[]).map((user: any) => (
                      <SelectItem key={user.id} value={user.id.toString()}>
                        {user.name} ({user.role})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Date Filter */}
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Date Range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">Last Week</SelectItem>
                    <SelectItem value="month">Last Month</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Activity Logs List */}
          <div className="space-y-4">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto"></div>
                <p className="text-gray-300 mt-4">Loading activity logs...</p>
              </div>
            ) : filteredLogs.length === 0 ? (
              <Card className="border-0 shadow-xl bg-white/10 backdrop-blur-lg border border-white/20">
                <CardContent className="p-12 text-center">
                  <Activity className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">No activity logs found</h3>
                  <p className="text-gray-300">
                    No activities match your current filter criteria.
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredLogs.map((log: ActivityLog) => {
                const IconComponent = activityIcons[log.category] || Activity;
                return (
                  <Card key={log.id} className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 bg-white/10 backdrop-blur-lg border border-white/20 hover:bg-white/15">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="p-2 rounded-lg bg-blue-500/20 flex-shrink-0">
                            <IconComponent className="h-5 w-5 text-blue-400" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-white">{log.action}</h3>
                              <Badge className={`text-xs ${severityColors[log.severity]} border`}>
                                {log.severity.charAt(0).toUpperCase() + log.severity.slice(1)}
                              </Badge>
                              <Badge className="text-xs bg-blue-500/20 text-blue-300 border-blue-400/30">
                                {log.category}
                              </Badge>
                            </div>
                            
                            <p className="text-gray-300 mb-3">{log.details}</p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-300">
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-blue-400" />
                                <span className="font-medium text-white">{log.userName}</span>
                                <Badge className="text-xs bg-purple-500/20 text-purple-300 border-purple-400/30">
                                  {log.userRole}
                                </Badge>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-green-400" />
                                <span>{format(new Date(log.timestamp), 'MMM dd, yyyy HH:mm:ss')}</span>
                              </div>
                              
                              {log.resourceName && (
                                <div className="flex items-center gap-2">
                                  <FileText className="h-4 w-4 text-yellow-400" />
                                  <span>{log.resourceType}: {log.resourceName}</span>
                                </div>
                              )}
                            </div>
                            
                            {(log.ipAddress || log.userAgent) && (
                              <div className="mt-3 pt-3 border-t border-white/20">
                                <div className="text-xs text-gray-400 space-y-1">
                                  {log.ipAddress && (
                                    <div>IP Address: {log.ipAddress}</div>
                                  )}
                                  {log.userAgent && (
                                    <div>User Agent: {log.userAgent.substring(0, 80)}...</div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="text-right text-sm text-gray-400 flex-shrink-0 ml-4">
                          <div>{formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>

          {/* Summary Statistics */}
          {!isLoading && filteredLogs.length > 0 && (
            <Card className="border-0 shadow-xl bg-white/10 backdrop-blur-lg border border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Activity Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {['low', 'medium', 'high', 'critical'].map((severity) => {
                    const count = filteredLogs.filter((log: ActivityLog) => log.severity === severity).length;
                    return (
                      <div key={severity} className="text-center p-4 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20">
                        <div className={`text-2xl font-bold ${severityColors[severity as keyof typeof severityColors].split(' ')[1]}`}>
                          {count}
                        </div>
                        <div className="text-sm text-gray-300 capitalize">{severity} Severity</div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </RoleGuard>
  );
}