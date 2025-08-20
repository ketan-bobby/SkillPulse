import { useState, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { AppHeader } from "@/components/app-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { User, Mail, Calendar, Shield, Users, CheckCircle, Edit2, Save, X, MapPin, Briefcase, Clock, Trophy, Settings, Key, Palette, Bell, Eye, EyeOff, Camera, Upload } from "lucide-react";
import { ROLES } from "@shared/roles";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export default function ProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    newPassword: "",
    confirmPassword: ""
  });
  const [editData, setEditData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    department: user?.department || "",
    jobTitle: user?.jobTitle || "",
    location: user?.location || "",
  });

  // Profile photo state and ref
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  // Password change mutation
  const changePasswordMutation = useMutation({
    mutationFn: async (data: { newPassword: string }) => {
      const response = await apiRequest("POST", "/api/user/change-password", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Password updated successfully",
      });
      setIsPasswordDialogOpen(false);
      setPasswordData({ newPassword: "", confirmPassword: "" });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update password",
        variant: "destructive",
      });
    },
  });

  // Profile photo upload mutation
  const uploadPhotoMutation = useMutation({
    mutationFn: async (photoFile: File) => {
      const formData = new FormData();
      formData.append('photo', photoFile);
      const response = await apiRequest("POST", "/api/user/upload-photo", formData);
      return response.json();
    },
    onSuccess: (data) => {
      setProfilePhoto(data.photoUrl);
      toast({
        title: "Success",
        description: "Profile photo updated successfully",
      });
      setIsUploadingPhoto(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error", 
        description: error.message || "Failed to upload profile photo",
        variant: "destructive",
      });
      setIsUploadingPhoto(false);
    },
  });

  const handleSave = () => {
    // TODO: Implement profile update API call
    console.log("Saving profile:", editData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData({
      name: user?.name || "",
      email: user?.email || "",
      department: user?.department || "",
      jobTitle: user?.jobTitle || "",
      location: user?.location || "",
    });
    setIsEditing(false);
  };

  const handlePasswordChange = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast({
        title: "Error", 
        description: "Password must be at least 8 characters long",
        variant: "destructive",
      });
      return;
    }

    changePasswordMutation.mutate({
      newPassword: passwordData.newPassword,
    });
  };

  // Photo upload handlers
  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image smaller than 5MB",
          variant: "destructive",
        });
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Please select an image file",
          variant: "destructive",
        });
        return;
      }

      setIsUploadingPhoto(true);
      uploadPhotoMutation.mutate(file);
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case ROLES.SUPER_ADMIN: return 'Super Admin';
      case ROLES.ADMIN: return 'Admin';
      case ROLES.HR_MANAGER: return 'HR Manager';
      case ROLES.REVIEWER: return 'Technical Reviewer';
      case ROLES.TEAM_LEAD: return 'Team Lead';
      case ROLES.EMPLOYEE: return 'Employee';
      case ROLES.CANDIDATE: return 'Candidate';
      default: return role;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case ROLES.SUPER_ADMIN: return 'bg-gradient-to-r from-purple-600 to-pink-600';
      case ROLES.ADMIN: return 'bg-gradient-to-r from-blue-600 to-indigo-600';
      case ROLES.HR_MANAGER: return 'bg-gradient-to-r from-green-600 to-emerald-600';
      case ROLES.REVIEWER: return 'bg-gradient-to-r from-orange-600 to-red-600';
      case ROLES.TEAM_LEAD: return 'bg-gradient-to-r from-cyan-600 to-blue-600';
      case ROLES.EMPLOYEE: return 'bg-gradient-to-r from-gray-600 to-slate-600';
      case ROLES.CANDIDATE: return 'bg-gradient-to-r from-teal-600 to-green-600';
      default: return 'bg-gradient-to-r from-gray-600 to-slate-600';
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />
      <div className="container py-6 sm:py-12">
        <div className="animate-fade-in">
          {/* Page Header */}
          <div className="text-center mb-8">
            <h1 className="text-responsive-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 bg-clip-text text-transparent mb-4">
              User Profile
            </h1>
            <p className="text-responsive-base text-gray-600 max-w-2xl mx-auto">
              Manage your account settings, view your profile information, and customize your experience
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Profile Summary */}
            <div className="lg:col-span-1">
              <Card className="glass-card border-none shadow-xl">
                <CardHeader className="text-center pb-4">
                  <div className="relative mx-auto mb-4">
                    <Avatar className="w-24 h-24 sm:w-28 sm:h-28 mx-auto border-4 border-white shadow-lg">
                      <AvatarImage src={profilePhoto || ""} />
                      <AvatarFallback className="text-xl font-bold bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                        {user?.name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-green-500 rounded-full border-2 border-white"></div>
                    
                    {/* Photo Upload Button - VERY VISIBLE */}
                    <Button
                      onClick={handlePhotoClick}
                      disabled={isUploadingPhoto}
                      className="absolute w-12 h-12 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-2xl transition-all duration-200 p-0 z-50 flex items-center justify-center animate-pulse"
                      title="Click here to change your profile photo!"
                      style={{ 
                        backgroundColor: '#ef4444', 
                        borderColor: '#ffffff',
                        borderWidth: '4px',
                        borderStyle: 'solid',
                        top: '-10px',
                        right: '-10px',
                        boxShadow: '0 0 20px rgba(239, 68, 68, 0.6)'
                      }}
                    >
                      {isUploadingPhoto ? (
                        <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Camera className="w-6 h-6" />
                      )}
                    </Button>
                    
                    {/* Hidden file input */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                  </div>
                  <CardTitle className="text-responsive-xl font-bold text-gray-800">{user?.name}</CardTitle>
                  <CardDescription className="text-responsive-sm text-gray-600 mb-3">{user?.email}</CardDescription>
                  <Badge className={`${getRoleBadgeColor(user?.role || '')} text-white border-none shadow-lg px-3 py-1`}>
                    <Shield className="w-3 h-3 mr-1" />
                    {getRoleDisplayName(user?.role || '')}
                  </Badge>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center p-2 rounded-lg bg-blue-50">
                      <Calendar className="w-4 h-4 mr-3 text-blue-600" />
                      <span className="text-gray-700">Member since 2024</span>
                    </div>
                    <div className="flex items-center p-2 rounded-lg bg-green-50">
                      <CheckCircle className="w-4 h-4 mr-3 text-green-600" />
                      <span className="text-gray-700">Active status</span>
                    </div>
                    {user?.department && (
                      <div className="flex items-center p-2 rounded-lg bg-purple-50">
                        <Briefcase className="w-4 h-4 mr-3 text-purple-600" />
                        <span className="text-gray-700">{user.department}</span>
                      </div>
                    )}
                    {user?.location && (
                      <div className="flex items-center p-2 rounded-lg bg-orange-50">
                        <MapPin className="w-4 h-4 mr-3 text-orange-600" />
                        <span className="text-gray-700">{user.location}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card className="glass-card border-none shadow-xl mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center text-responsive-lg">
                    <Trophy className="w-5 h-5 mr-2 text-yellow-600" />
                    Quick Stats
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100">
                      <div className="text-2xl font-bold text-blue-600">12</div>
                      <div className="text-sm text-gray-600">Tests Taken</div>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-gradient-to-br from-green-50 to-green-100">
                      <div className="text-2xl font-bold text-green-600">85%</div>
                      <div className="text-sm text-gray-600">Avg Score</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Profile Details */}
            <div className="lg:col-span-2">
              <Tabs defaultValue="general" className="space-y-6">
                <TabsList className="grid w-full grid-cols-4 glass-card border-none shadow-lg">
                  <TabsTrigger 
                    value="general" 
                    className="text-gray-600 hover:text-gray-900 data-[state=active]:bg-blue-600 data-[state=active]:text-white font-medium transition-colors"
                    style={{ color: '#6b7280' }}
                  >
                    <User className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">General</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="security" 
                    className="text-gray-600 hover:text-gray-900 data-[state=active]:bg-blue-600 data-[state=active]:text-white font-medium transition-colors"
                    style={{ color: '#6b7280' }}
                  >
                    <Key className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Security</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="preferences" 
                    className="text-gray-600 hover:text-gray-900 data-[state=active]:bg-blue-600 data-[state=active]:text-white font-medium transition-colors"
                    style={{ color: '#6b7280' }}
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Preferences</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="notifications" 
                    className="text-gray-600 hover:text-gray-900 data-[state=active]:bg-blue-600 data-[state=active]:text-white font-medium transition-colors"
                    style={{ color: '#6b7280' }}
                  >
                    <Bell className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Notifications</span>
                  </TabsTrigger>
                </TabsList>

                {/* General Tab */}
                <TabsContent value="general">
                  <Card className="glass-card border-none shadow-xl">
                    <CardHeader className="flex flex-row items-center justify-between">
                      <div>
                        <CardTitle className="text-responsive-lg">Personal Information</CardTitle>
                        <CardDescription>Update your personal details and contact information</CardDescription>
                      </div>
                      {!isEditing ? (
                        <Button 
                          onClick={() => setIsEditing(true)} 
                          className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-lg font-medium transition-colors"
                          style={{ backgroundColor: '#3b82f6', color: 'white', border: '1px solid #3b82f6' }}
                        >
                          <Edit2 className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                      ) : (
                        <div className="flex space-x-2">
                          <Button 
                            onClick={handleSave} 
                            className="bg-green-600 text-white hover:bg-green-700 px-4 py-2 rounded-lg font-medium transition-colors"
                            style={{ backgroundColor: '#16a34a', color: 'white', border: '1px solid #16a34a' }}
                          >
                            <Save className="w-4 h-4 mr-2" />
                            Save
                          </Button>
                          <Button 
                            onClick={handleCancel} 
                            variant="outline"
                            className="bg-gray-100 text-gray-700 hover:bg-gray-200 px-4 py-2 rounded-lg font-medium transition-colors border border-gray-300"
                            style={{ backgroundColor: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db' }}
                          >
                            <X className="w-4 h-4 mr-2" />
                            Cancel
                          </Button>
                        </div>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="name">Full Name</Label>
                          {isEditing ? (
                            <Input
                              id="name"
                              value={editData.name}
                              onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                              className="glass-card border-none"
                            />
                          ) : (
                            <div className="p-3 bg-gray-50 rounded-lg text-gray-700">{user?.name || 'Not set'}</div>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email Address</Label>
                          {isEditing ? (
                            <Input
                              id="email"
                              type="email"
                              value={editData.email}
                              onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                              className="glass-card border-none"
                            />
                          ) : (
                            <div className="p-3 bg-gray-50 rounded-lg text-gray-700">{user?.email || 'Not set'}</div>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="department">Department</Label>
                          {isEditing ? (
                            <Input
                              id="department"
                              value={editData.department}
                              onChange={(e) => setEditData({ ...editData, department: e.target.value })}
                              className="glass-card border-none"
                            />
                          ) : (
                            <div className="p-3 bg-gray-50 rounded-lg text-gray-700">{user?.department || 'Not set'}</div>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="jobTitle">Job Title</Label>
                          {isEditing ? (
                            <Input
                              id="jobTitle"
                              value={editData.jobTitle}
                              onChange={(e) => setEditData({ ...editData, jobTitle: e.target.value })}
                              className="glass-card border-none"
                            />
                          ) : (
                            <div className="p-3 bg-gray-50 rounded-lg text-gray-700">{user?.jobTitle || 'Not set'}</div>
                          )}
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="location">Location</Label>
                          {isEditing ? (
                            <Input
                              id="location"
                              value={editData.location}
                              onChange={(e) => setEditData({ ...editData, location: e.target.value })}
                              className="glass-card border-none"
                            />
                          ) : (
                            <div className="p-3 bg-gray-50 rounded-lg text-gray-700">{user?.location || 'Not set'}</div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Security Tab */}
                <TabsContent value="security">
                  <Card className="glass-card border-none shadow-xl">
                    <CardHeader>
                      <CardTitle className="text-responsive-lg">Security Settings</CardTitle>
                      <CardDescription>Manage your password and security preferences</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-4">
                        <div className="p-4 border rounded-lg bg-blue-50 border-blue-200">
                          <h3 className="font-semibold text-blue-800 mb-2">Password</h3>
                          <p className="text-sm text-blue-600 mb-3">Last changed 30 days ago</p>
                          <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
                            <DialogTrigger asChild>
                              <Button 
                                className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-lg font-medium transition-colors"
                                style={{ backgroundColor: '#3b82f6', color: 'white', border: '1px solid #3b82f6' }}
                              >
                                Change Password
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md">
                              <DialogHeader>
                                <DialogTitle>Change Password</DialogTitle>
                                <DialogDescription>
                                  Choose a new password for your account.
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="space-y-2">
                                  <Label htmlFor="new-password">New Password</Label>
                                  <div className="relative">
                                    <Input
                                      id="new-password"
                                      type={showNewPassword ? "text" : "password"}
                                      value={passwordData.newPassword}
                                      onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                                      placeholder="Enter new password"
                                    />
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                      onClick={() => setShowNewPassword(!showNewPassword)}
                                    >
                                      {showNewPassword ? (
                                        <EyeOff className="h-4 w-4" />
                                      ) : (
                                        <Eye className="h-4 w-4" />
                                      )}
                                    </Button>
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                                  <div className="relative">
                                    <Input
                                      id="confirm-password"
                                      type={showConfirmPassword ? "text" : "password"}
                                      value={passwordData.confirmPassword}
                                      onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                      placeholder="Confirm new password"
                                    />
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    >
                                      {showConfirmPassword ? (
                                        <EyeOff className="h-4 w-4" />
                                      ) : (
                                        <Eye className="h-4 w-4" />
                                      )}
                                    </Button>
                                  </div>
                                </div>
                                <div className="flex justify-end space-x-2 pt-4">
                                  <Button
                                    variant="outline"
                                    onClick={() => {
                                      setIsPasswordDialogOpen(false);
                                      setPasswordData({ newPassword: "", confirmPassword: "" });
                                    }}
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    onClick={handlePasswordChange}
                                    disabled={changePasswordMutation.isPending}
                                    className="bg-blue-600 hover:bg-blue-700"
                                  >
                                    {changePasswordMutation.isPending ? "Updating..." : "Update Password"}
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                        <div className="p-4 border rounded-lg bg-green-50 border-green-200">
                          <h3 className="font-semibold text-green-800 mb-2">Two-Factor Authentication</h3>
                          <p className="text-sm text-green-600 mb-3">Add an extra layer of security to your account</p>
                          <Button 
                            variant="outline" 
                            className="bg-green-50 text-green-700 hover:bg-green-100 px-4 py-2 rounded-lg font-medium transition-colors border border-green-300"
                            style={{ backgroundColor: '#f0fdf4', color: '#166534', border: '1px solid #86efac' }}
                          >
                            Enable 2FA
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Preferences Tab */}
                <TabsContent value="preferences">
                  <Card className="glass-card border-none shadow-xl">
                    <CardHeader>
                      <CardTitle className="text-responsive-lg">Preferences</CardTitle>
                      <CardDescription>Customize your experience and interface settings</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-4">
                        <div className="p-4 border rounded-lg">
                          <h3 className="font-semibold mb-2">Theme Preference</h3>
                          <p className="text-sm text-gray-600 mb-3">Choose your preferred interface theme</p>
                          <div className="flex space-x-3">
                            <Button 
                              variant="outline" 
                              className="flex-1 bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 px-3 py-2 rounded-lg font-medium transition-colors"
                              style={{ backgroundColor: 'white', color: '#374151', border: '1px solid #d1d5db' }}
                            >
                              Light
                            </Button>
                            <Button 
                              variant="outline" 
                              className="flex-1 bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 px-3 py-2 rounded-lg font-medium transition-colors"
                              style={{ backgroundColor: 'white', color: '#374151', border: '1px solid #d1d5db' }}
                            >
                              Dark
                            </Button>
                            <Button 
                              variant="outline" 
                              className="flex-1 bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 px-3 py-2 rounded-lg font-medium transition-colors"
                              style={{ backgroundColor: 'white', color: '#374151', border: '1px solid #d1d5db' }}
                            >
                              Auto
                            </Button>
                          </div>
                        </div>
                        <div className="p-4 border rounded-lg">
                          <h3 className="font-semibold mb-2">Language</h3>
                          <p className="text-sm text-gray-600 mb-3">Select your preferred language</p>
                          <Button 
                            variant="outline" 
                            className="w-full justify-start bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 px-3 py-2 rounded-lg font-medium transition-colors"
                            style={{ backgroundColor: 'white', color: '#374151', border: '1px solid #d1d5db' }}
                          >
                            English (US)
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Notifications Tab */}
                <TabsContent value="notifications">
                  <Card className="glass-card border-none shadow-xl">
                    <CardHeader>
                      <CardTitle className="text-responsive-lg">Notification Settings</CardTitle>
                      <CardDescription>Control what notifications you receive and how</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <h3 className="font-semibold">Test Assignments</h3>
                            <p className="text-sm text-gray-600">Get notified when new tests are assigned to you</p>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-300 px-3 py-1 rounded-lg font-medium transition-colors"
                            style={{ backgroundColor: '#eff6ff', color: '#1d4ed8', border: '1px solid #93c5fd' }}
                          >
                            Enable
                          </Button>
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <h3 className="font-semibold">Results Available</h3>
                            <p className="text-sm text-gray-600">Receive notifications when test results are ready</p>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-300 px-3 py-1 rounded-lg font-medium transition-colors"
                            style={{ backgroundColor: '#eff6ff', color: '#1d4ed8', border: '1px solid #93c5fd' }}
                          >
                            Enable
                          </Button>
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <h3 className="font-semibold">System Updates</h3>
                            <p className="text-sm text-gray-600">Stay informed about platform updates and features</p>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-300 px-3 py-1 rounded-lg font-medium transition-colors"
                            style={{ backgroundColor: '#eff6ff', color: '#1d4ed8', border: '1px solid #93c5fd' }}
                          >
                            Enable
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}