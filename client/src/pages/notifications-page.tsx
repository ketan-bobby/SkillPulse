import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AppHeader } from "@/components/app-header";
import { RoleGuard } from "@/lib/role-guard";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { formatDistanceToNow } from "date-fns";
import {
  Bell,
  CheckCircle,
  AlertTriangle,
  Info,
  FileText,
  Users,
  Settings,
  Calendar,
  ArrowLeft,
  Check,
  Trash2
} from "lucide-react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";

interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  category: 'test' | 'user' | 'system' | 'approval' | 'report';
  isRead: boolean;
  createdAt: string;
  relatedId?: number;
  actionUrl?: string;
}

export default function NotificationsPage() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const { toast } = useToast();

  // Fetch notifications data
  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ["/api/notifications"],
    select: (data: Notification[]) => {
      // Sort by created date, unread first
      return data.sort((a, b) => {
        if (a.isRead !== b.isRead) {
          return a.isRead ? 1 : -1;
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
    }
  });

  // Mark notification as read
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: number) => {
      return await apiRequest("PATCH", `/api/notifications/${notificationId}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    }
  });

  // Mark all as read
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("PATCH", "/api/notifications/mark-all-read");
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "All notifications marked as read",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    }
  });

  // Delete notification
  const deleteNotificationMutation = useMutation({
    mutationFn: async (notificationId: number) => {
      return await apiRequest("DELETE", `/api/notifications/${notificationId}`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Notification deleted",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    }
  });

  const getNotificationIcon = (type: string, category: string) => {
    if (type === 'success') return <CheckCircle className="h-5 w-5 text-green-500" />;
    if (type === 'warning') return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    if (type === 'error') return <AlertTriangle className="h-5 w-5 text-red-500" />;
    
    switch (category) {
      case 'test': return <FileText className="h-5 w-5 text-blue-500" />;
      case 'user': return <Users className="h-5 w-5 text-purple-500" />;
      case 'system': return <Settings className="h-5 w-5 text-gray-500" />;
      case 'approval': return <CheckCircle className="h-5 w-5 text-orange-500" />;
      case 'report': return <Calendar className="h-5 w-5 text-indigo-500" />;
      default: return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getNotificationTypeColor = (type: string) => {
    switch (type) {
      case 'success': return 'bg-green-50 border-green-200';
      case 'warning': return 'bg-yellow-50 border-yellow-200';
      case 'error': return 'bg-red-50 border-red-200';
      default: return 'bg-blue-50 border-blue-200';
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.isRead;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="min-h-screen bg-white">
      <AppHeader />
      
      <div className="max-w-4xl mx-auto p-6">
        <RoleGuard allowedRoles={["super_admin", "admin", "hr_manager", "reviewer", "team_lead", "employee"]}>
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <button
                onClick={() => {
                  // Navigate to appropriate dashboard based on user role
                  if (user?.role === 'super_admin' || user?.role === 'admin') {
                    setLocation('/admin-dashboard');
                  } else if (user?.role === 'hr_manager') {
                    setLocation('/hr-dashboard');
                  } else if (user?.role === 'reviewer') {
                    setLocation('/reviewer-dashboard');
                  } else if (user?.role === 'team_lead') {
                    setLocation('/team-lead-dashboard');
                  } else if (user?.role === 'employee') {
                    setLocation('/employee-dashboard');
                  } else {
                    setLocation('/');
                  }
                }}
                style={{
                  backgroundColor: 'white',
                  color: '#374151',
                  fontWeight: '500',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s ease',
                  border: '1px solid #e5e7eb',
                  marginRight: '16px'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
              >
                <ArrowLeft style={{ width: '16px', height: '16px' }} />
                Back
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                  <Bell className="h-8 w-8" />
                  Notifications
                  {unreadCount > 0 && (
                    <Badge variant="destructive" className="ml-2">
                      {unreadCount} unread
                    </Badge>
                  )}
                </h1>
                <p className="text-gray-600 mt-2">Stay updated with the latest activities and alerts</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setFilter(filter === 'all' ? 'unread' : 'all')}
                className="bg-white border-gray-200"
              >
                {filter === 'all' ? 'Show Unread Only' : 'Show All'}
              </Button>
              {unreadCount > 0 && (
                <Button
                  onClick={() => markAllAsReadMutation.mutate()}
                  disabled={markAllAsReadMutation.isPending}
                  className="bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                  variant="outline"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Mark All Read
                </Button>
              )}
            </div>
          </div>

          {/* Notifications List */}
          <div className="space-y-4">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
                <p className="text-gray-600 mt-4">Loading notifications...</p>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <Card className="border-0 shadow-lg">
                <CardContent className="p-12 text-center">
                  <Bell className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {filter === 'unread' ? 'No unread notifications' : 'No notifications'}
                  </h3>
                  <p className="text-gray-600">
                    {filter === 'unread' 
                      ? 'All caught up! You have no unread notifications.'
                      : 'You have no notifications at this time.'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredNotifications.map((notification) => (
                <Card 
                  key={notification.id} 
                  className={`border-0 shadow-lg transition-all duration-200 hover:shadow-xl ${
                    !notification.isRead ? 'ring-2 ring-blue-100' : ''
                  } ${getNotificationTypeColor(notification.type)}`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <div className="mt-1">
                          {getNotificationIcon(notification.type, notification.category)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className={`text-lg font-semibold ${!notification.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                              {notification.title}
                            </h3>
                            <div className="flex items-center space-x-2">
                              {!notification.isRead && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              )}
                              <span className="text-sm text-gray-500">
                                {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                              </span>
                            </div>
                          </div>
                          <p className={`text-sm mb-3 ${!notification.isRead ? 'text-gray-700' : 'text-gray-600'}`}>
                            {notification.message}
                          </p>
                          <div className="flex items-center justify-between">
                            <Badge variant="secondary" className="text-xs">
                              {notification.category.charAt(0).toUpperCase() + notification.category.slice(1)}
                            </Badge>
                            <div className="flex items-center space-x-2">
                              {notification.actionUrl && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setLocation(notification.actionUrl!)}
                                  className="text-xs"
                                >
                                  View Details
                                </Button>
                              )}
                              {!notification.isRead && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => markAsReadMutation.mutate(notification.id)}
                                  disabled={markAsReadMutation.isPending}
                                  className="text-xs"
                                >
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Mark Read
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => deleteNotificationMutation.mutate(notification.id)}
                                disabled={deleteNotificationMutation.isPending}
                                className="text-xs text-red-600 hover:text-red-800"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </RoleGuard>
      </div>
    </div>
  );
}