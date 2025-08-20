import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Building2, Edit, Edit3, Trash2, Users, Sparkles, Zap, Globe, TrendingUp, UserPlus, Network, ToggleLeft, ToggleRight, Search, Filter, X, RefreshCw, FileText, Shield, CreditCard, UserCheck, Calendar, MapPin } from "lucide-react";
import { insertCompanySchema, insertDepartmentSchema, type Company, type InsertCompany, type Department, type InsertDepartment } from "@shared/schema";
import { apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { AppHeader } from "@/components/app-header";

export default function CompanyManagement() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [isCreateDepartmentOpen, setIsCreateDepartmentOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [industryFilter, setIndustryFilter] = useState<string>('all');
  const [sizeFilter, setSizeFilter] = useState<string>('all');
  const [companyToDelete, setCompanyToDelete] = useState<Company | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [showCustomIndustry, setShowCustomIndustry] = useState(false);
  const [showCustomSize, setShowCustomSize] = useState(false);
  const [showCustomLocation, setShowCustomLocation] = useState(false);
  const [currentFormStep, setCurrentFormStep] = useState("basic");
  const { toast } = useToast();

  const { data: companies = [], isLoading } = useQuery<Company[]>({
    queryKey: ["/api/companies"],
  });

  const { data: departments = [] } = useQuery<any[]>({
    queryKey: ["/api/departments"],
  });

  const form = useForm<InsertCompany>({
    resolver: zodResolver(insertCompanySchema),
    defaultValues: {
      name: "",
      legalName: "",
      code: "",
      tradingAs: "",
      industry: "",
      businessType: "",
      size: "",
      yearEstablished: undefined,
      description: "",
      primaryPhone: "",
      primaryEmail: "",
      website: "",
      addressLine1: "",
      city: "",
      state: "",
      postalCode: "",
      country: "",
      taxId: "",
      registrationNumber: "",
      primaryContactName: "",
      primaryContactEmail: "",
      primaryContactPhone: "",
      serviceLevel: "",
      currency: "USD",
      onboardingStatus: "pending",
      isActive: true,
    },
  });

  const departmentForm = useForm<InsertDepartment>({
    resolver: zodResolver(insertDepartmentSchema),
    defaultValues: {
      companyId: undefined,
      name: "",
      code: "",
      description: "",
      isActive: true,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertCompany) => {
      const res = await apiRequest("POST", "/api/companies", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/companies"] });
      queryClient.invalidateQueries({ queryKey: ["/api/departments"] });
      setIsCreateDialogOpen(false);
      // Reset custom states
      setShowCustomIndustry(false);
      setShowCustomSize(false);
      setShowCustomLocation(false);
      form.reset();
      toast({
        title: "Success",
        description: "Company created successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: InsertCompany }) => {
      const res = await apiRequest("PUT", `/api/companies/${id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/companies"] });
      setEditingCompany(null);
      setIsCreateDialogOpen(false);
      // Reset custom states
      setShowCustomIndustry(false);
      setShowCustomSize(false);
      setShowCustomLocation(false);
      form.reset();
      toast({
        title: "Success",
        description: "Company updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/companies/${id}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }
    },
    onSuccess: async () => {
      // Force immediate refresh of both companies and departments
      await queryClient.invalidateQueries({ queryKey: ["/api/companies"] });
      await queryClient.invalidateQueries({ queryKey: ["/api/departments"] });
      // Force refetch to ensure latest data
      await queryClient.refetchQueries({ queryKey: ["/api/companies"] });
      await queryClient.refetchQueries({ queryKey: ["/api/departments"] });
      setCompanyToDelete(null);
      setDeleteConfirmText('');
      toast({
        title: "Success",
        description: "Company and all related data deleted successfully",
      });
    },
    onError: (error: Error) => {
      const errorMessage = error.message.includes('foreign key constraint') 
        ? "Cannot delete company: There are still related records that need to be removed first. Please contact support if this persists."
        : error.message;
      
      toast({
        title: "Delete Failed",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const toggleCompanyStatusMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      const res = await apiRequest("PATCH", `/api/companies/${id}/toggle-status`, { isActive });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/companies"] });
      queryClient.invalidateQueries({ queryKey: ["/api/departments"] });
      toast({
        title: "Success",
        description: "Company status updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Department mutations
  const createDepartmentMutation = useMutation({
    mutationFn: async (data: InsertDepartment) => {
      const res = await apiRequest("POST", "/api/departments", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/departments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/companies"] });
      setIsCreateDepartmentOpen(false);
      departmentForm.reset();
      toast({
        title: "Success",
        description: "Department created successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateDepartmentMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: InsertDepartment }) => {
      const res = await apiRequest("PUT", `/api/departments/${id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/departments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/companies"] });
      setEditingDepartment(null);
      departmentForm.reset();
      toast({
        title: "Success",
        description: "Department updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteDepartmentMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/departments/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/departments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/companies"] });
      toast({
        title: "Success",
        description: "Department deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertCompany) => {
    if (editingCompany) {
      updateMutation.mutate({ id: editingCompany.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (company: Company) => {
    setEditingCompany(company);
    // Reset custom states
    setShowCustomIndustry(false);
    setShowCustomSize(false);
    setShowCustomLocation(false);
    form.reset({
      name: company.name,
      code: company.code,
      legalName: company.legalName || "",
      tradingAs: company.tradingAs || "",
      description: company.description || "",
      industry: company.industry || "",
      businessType: company.businessType || "",
      size: company.size || "",
      yearEstablished: company.yearEstablished || undefined,
      website: company.website || "",
      addressLine1: company.addressLine1 || "",
      city: company.city || "",
      state: company.state || "",
      postalCode: company.postalCode || "",
      country: company.country || "",
      isActive: company.isActive,
    });
  };

  const getDepartmentCount = (companyId: number) => {
    return departments.filter((dept: any) => dept.companyId === companyId).length;
  };

  const handleCloseDialog = () => {
    setIsCreateDialogOpen(false);
    setEditingCompany(null);
    // Reset custom states
    setShowCustomIndustry(false);
    setShowCustomSize(false);
    setShowCustomLocation(false);
    form.reset();
  };

  const onDepartmentSubmit = (data: InsertDepartment) => {
    if (editingDepartment) {
      updateDepartmentMutation.mutate({ id: editingDepartment.id, data });
    } else {
      createDepartmentMutation.mutate(data);
    }
  };

  const handleEditDepartment = (department: Department) => {
    setEditingDepartment(department);
    departmentForm.reset({
      companyId: department.companyId,
      name: department.name,
      code: department.code,
      description: department.description || "",
      isActive: department.isActive,
    });
  };

  const handleCloseDepartmentDialog = () => {
    setIsCreateDepartmentOpen(false);
    setEditingDepartment(null);
    departmentForm.reset();
  };

  const handleEditCompany = (company: Company) => {
    setEditingCompany(company);
    setCurrentFormStep("basic");
    // Reset custom states
    setShowCustomIndustry(false);
    setShowCustomSize(false);
    setShowCustomLocation(false);
    form.reset({
      name: company.name,
      code: company.code,
      legalName: company.legalName || "",
      tradingAs: company.tradingAs || "",
      description: company.description || "",
      industry: company.industry || "",
      businessType: company.businessType || "",
      size: company.size || "",
      yearEstablished: company.yearEstablished || undefined,
      website: company.website || "",
      addressLine1: company.addressLine1 || "",
      city: company.city || "",
      state: company.state || "",
      postalCode: company.postalCode || "",
      country: company.country || "",
      primaryEmail: company.primaryEmail || "",
      primaryPhone: company.primaryPhone || "",
      primaryContactName: company.primaryContactName || "",
      primaryContactEmail: company.primaryContactEmail || "",
      primaryContactPhone: company.primaryContactPhone || "",
      taxId: company.taxId || "",
      registrationNumber: company.registrationNumber || "",
      isActive: company.isActive,
    });
  };

  const handleDeleteCompany = async (companyId: number) => {
    try {
      await deleteMutation.mutateAsync(companyId);
      setCompanyToDelete(null);
      setDeleteConfirmText('');
    } catch (error) {
      console.error('Error deleting company:', error);
    }
  };

  // Filter and search functions
  const filteredCompanies = companies.filter((company: Company) => {
    // Status filter
    if (activeFilter === 'active' && !company.isActive) return false;
    if (activeFilter === 'inactive' && company.isActive) return false;

    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      if (
        !company.name.toLowerCase().includes(searchLower) &&
        !company.code.toLowerCase().includes(searchLower) &&
        !(company.industry?.toLowerCase().includes(searchLower)) &&
        !(company.location?.toLowerCase().includes(searchLower))
      ) {
        return false;
      }
    }

    // Industry filter
    if (industryFilter !== 'all' && company.industry !== industryFilter) return false;

    // Size filter
    if (sizeFilter !== 'all' && company.size !== sizeFilter) return false;

    return true;
  });

  const uniqueIndustries = [...new Set(companies.map((c: Company) => c.industry).filter(Boolean))];
  const uniqueSizes = [...new Set(companies.map((c: Company) => c.size).filter(Boolean))];

  const clearFilters = () => {
    setSearchTerm('');
    setActiveFilter('all');
    setIndustryFilter('all');
    setSizeFilter('all');
  };

  const handleRefresh = async () => {
    await queryClient.refetchQueries({ queryKey: ["/api/companies"] });
    await queryClient.refetchQueries({ queryKey: ["/api/departments"] });
    toast({
      title: "Refreshed",
      description: "Data has been refreshed successfully",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AppHeader />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* AI-Powered Header with Animation */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full shadow-lg">
                <Sparkles className="h-8 w-8 text-white animate-pulse" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Smart Company Management
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-300 flex items-center justify-center space-x-2 mt-2">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  <span>Intelligent organizational structure optimization</span>
                </p>
              </div>
            </div>
          </div>
          
          {/* Action Section */}
          <div className="flex items-center justify-between bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Enterprise Setup</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Create and manage your intelligent organizational ecosystem
              </p>
            </div>
            <Button 
              className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white shadow-2xl hover:shadow-blue-500/25 transform hover:scale-105 transition-all duration-300 px-8 py-6 text-lg rounded-xl border border-white/20"
              onClick={() => {
                console.log('Create Company button clicked');
                setIsCreateDialogOpen(true);
              }}
            >
              <Sparkles className="h-5 w-5 mr-3 animate-pulse" />
              Create Company
              <Zap className="h-5 w-5 ml-3" />
            </Button>
            
            <Dialog open={isCreateDialogOpen || !!editingCompany} onOpenChange={handleCloseDialog}>
              <DialogContent className="sm:max-w-[1000px] max-h-[90vh] overflow-y-auto bg-gradient-to-br from-white to-blue-50 dark:from-slate-900 dark:to-blue-950/50 border border-blue-200/50 shadow-2xl" aria-describedby="dialog-description">
                <DialogHeader className="text-center pb-4">
                  <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white flex items-center justify-center gap-2">
                    <FileText className="h-6 w-6" />
                    {editingCompany ? "Update Client Information" : "Complete Client Onboarding"}
                  </DialogTitle>
                  <p id="dialog-description" className="text-gray-600 dark:text-gray-300">
                    Comprehensive client setup including legal, banking, and compliance documentation
                  </p>
                </DialogHeader>
                <Tabs value={currentFormStep} onValueChange={setCurrentFormStep} className="w-full">
                  <TabsList className="grid w-full grid-cols-6 mb-6">
                    <TabsTrigger value="basic" className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      Basic Info
                    </TabsTrigger>
                    <TabsTrigger value="contact" className="flex items-center gap-2">
                      <UserCheck className="h-4 w-4" />
                      Contact & Personnel
                    </TabsTrigger>
                    <TabsTrigger value="address" className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Address & Location
                    </TabsTrigger>
                    <TabsTrigger value="legal" className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Legal & Tax
                    </TabsTrigger>
                    <TabsTrigger value="banking" className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      Banking & Finance
                    </TabsTrigger>
                    <TabsTrigger value="documents" className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Documents
                    </TabsTrigger>
                  </TabsList>
                  
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      
                      {/* Basic Information */}
                      <TabsContent value="basic" className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="flex items-center gap-2">
                                  <span className="text-red-500">*</span>
                                  Trading Name
                                </FormLabel>
                                <FormControl>
                                  <Input placeholder="Company trading name" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="legalName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Legal Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="Full legal company name" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="code"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="flex items-center gap-2">
                                  <span className="text-red-500">*</span>
                                  Company Code
                                </FormLabel>
                                <FormControl>
                                  <Input placeholder="Enter company code (e.g., TECH)" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="businessType"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Business Type</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value || ""}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select business type" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="Corporation">Corporation</SelectItem>
                                    <SelectItem value="LLC">Limited Liability Company (LLC)</SelectItem>
                                    <SelectItem value="Partnership">Partnership</SelectItem>
                                    <SelectItem value="Sole Proprietorship">Sole Proprietorship</SelectItem>
                                    <SelectItem value="Non-profit">Non-profit Organization</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="yearEstablished"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Year Established</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    placeholder="e.g., 2020" 
                                    {...field}
                                    onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="industry"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Industry</FormLabel>
                                {!showCustomIndustry ? (
                                  <Select 
                                    onValueChange={(value) => {
                                      if (value === "Other") {
                                        setShowCustomIndustry(true);
                                        field.onChange("");
                                      } else {
                                        field.onChange(value);
                                      }
                                    }} 
                                    value={field.value || ""}
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select industry" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="Technology">Technology</SelectItem>
                                      <SelectItem value="Healthcare">Healthcare</SelectItem>
                                      <SelectItem value="Finance">Finance</SelectItem>
                                      <SelectItem value="Education">Education</SelectItem>
                                      <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                                      <SelectItem value="Retail">Retail</SelectItem>
                                      <SelectItem value="Consulting">Consulting</SelectItem>
                                      <SelectItem value="Other">Other</SelectItem>
                                    </SelectContent>
                                  </Select>
                                ) : (
                                  <div className="flex gap-2">
                                    <FormControl>
                                      <Input 
                                        placeholder="Enter custom industry" 
                                        value={field.value || ""}
                                        onChange={field.onChange}
                                      />
                                    </FormControl>
                                    <Button
                                      type="button"
                                      variant="outline"
                                      onClick={() => {
                                        setShowCustomIndustry(false);
                                        field.onChange("");
                                      }}
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </div>
                                )}
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="size"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Company Size</FormLabel>
                                {!showCustomSize ? (
                                  <Select 
                                    onValueChange={(value) => {
                                      if (value === "Other") {
                                        setShowCustomSize(true);
                                        field.onChange("");
                                      } else {
                                        field.onChange(value);
                                      }
                                    }} 
                                    value={field.value || ""}
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select company size" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="startup">Startup (1-10 employees)</SelectItem>
                                      <SelectItem value="small">Small (11-50 employees)</SelectItem>
                                      <SelectItem value="medium">Medium (51-200 employees)</SelectItem>
                                      <SelectItem value="large">Large (201-1000 employees)</SelectItem>
                                      <SelectItem value="enterprise">Enterprise (1000+ employees)</SelectItem>
                                      <SelectItem value="Other">Other</SelectItem>
                                    </SelectContent>
                                  </Select>
                                ) : (
                                  <div className="flex gap-2">
                                    <FormControl>
                                      <Input 
                                        placeholder="Enter custom company size" 
                                        value={field.value || ""}
                                        onChange={field.onChange}
                                      />
                                    </FormControl>
                                    <Button
                                      type="button"
                                      variant="outline"
                                      onClick={() => {
                                        setShowCustomSize(false);
                                        field.onChange("");
                                      }}
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </div>
                                )}
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <FormField
                          control={form.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Company Description</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Brief description of company's business and services" 
                                  rows={3}
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </TabsContent>
                      
                      {/* Contact & Personnel Tab */}
                      <TabsContent value="contact" className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="primaryContactName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="flex items-center gap-2">
                                  <span className="text-red-500">*</span>
                                  Primary Contact Name
                                </FormLabel>
                                <FormControl>
                                  <Input placeholder="Full name of primary contact" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="primaryContactEmail"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="flex items-center gap-2">
                                  <span className="text-red-500">*</span>
                                  Primary Contact Email
                                </FormLabel>
                                <FormControl>
                                  <Input type="email" placeholder="primary@company.com" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="primaryContactPhone"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="flex items-center gap-2">
                                  <span className="text-red-500">*</span>
                                  Primary Contact Phone
                                </FormLabel>
                                <FormControl>
                                  <Input placeholder="+1 (555) 123-4567" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="primaryEmail"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Company Email</FormLabel>
                                <FormControl>
                                  <Input type="email" placeholder="info@company.com" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="website"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Website</FormLabel>
                                <FormControl>
                                  <Input placeholder="https://www.company.com" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </TabsContent>
                      
                      {/* Address & Location Tab */}
                      <TabsContent value="address" className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="addressLine1"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="flex items-center gap-2">
                                  <span className="text-red-500">*</span>
                                  Address Line 1
                                </FormLabel>
                                <FormControl>
                                  <Input placeholder="Street address" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="city"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="flex items-center gap-2">
                                  <span className="text-red-500">*</span>
                                  City
                                </FormLabel>
                                <FormControl>
                                  <Input placeholder="City" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="state"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>State/Province</FormLabel>
                                <FormControl>
                                  <Input placeholder="State or Province" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="postalCode"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Postal Code</FormLabel>
                                <FormControl>
                                  <Input placeholder="ZIP/Postal Code" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="country"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="flex items-center gap-2">
                                  <span className="text-red-500">*</span>
                                  Country
                                </FormLabel>
                                <FormControl>
                                  <Input placeholder="Country" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </TabsContent>
                      
                      {/* Legal & Tax Tab */}
                      <TabsContent value="legal" className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="taxId"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Tax ID/EIN Number</FormLabel>
                                <FormControl>
                                  <Input placeholder="Tax identification number" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="registrationNumber"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Company Registration Number</FormLabel>
                                <FormControl>
                                  <Input placeholder="Official company registration number" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </TabsContent>
                      
                      {/* Form buttons */}
                      <div className="flex justify-between pt-6 border-t">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => handleCloseDialog()}
                        >
                          Cancel
                        </Button>
                        <Button type="submit" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                          {editingCompany ? "Update Client" : "Create Client"}
                        </Button>
                      </div>
                      
                    </form>
                  </Form>
                </Tabs>
              </DialogContent>
            </Dialog>
          </div>

          {/* Advanced Search and Filter System */}
          <div className="mb-8 space-y-4">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search companies by name, code, or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-10 bg-white/80 dark:bg-slate-800/80 border-gray-200 dark:border-slate-700"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Company Table */}
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-white/20">
            <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/50 dark:to-purple-900/50 border-b border-gray-200 dark:border-slate-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <Building2 className="h-6 w-6 text-blue-600" />
                Enterprise Directory
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Manage your organizational ecosystem
              </p>
            </div>
            
            {companies.isLoading ? (
              <div className="flex justify-center items-center py-8">
                <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : filteredCompanies.length === 0 ? (
              <div className="text-center py-12">
                <Building2 className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <p className="text-xl font-medium text-gray-600 dark:text-gray-400">
                  {searchTerm || industryFilter !== 'all' || sizeFilter !== 'all' 
                    ? "No companies match your filters" 
                    : "No companies found"}
                </p>
                <p className="text-gray-500 dark:text-gray-500 mt-2">
                  {searchTerm || industryFilter !== 'all' || sizeFilter !== 'all' 
                    ? "Try adjusting your search criteria" 
                    : "Create your first company to get started"}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50/80 dark:bg-slate-800/80">
                      <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Company</TableHead>
                      <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Industry</TableHead>
                      <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Size</TableHead>
                      <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Website</TableHead>
                      <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCompanies.map((company) => (
                      <TableRow key={company.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/50 transition-colors">
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-lg">
                              <Building2 className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 dark:text-white">{company.name}</p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">Code: {company.code}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700">
                            {company.industry || 'Not specified'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700">
                            {company.size || 'Not specified'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {company.website ? (
                            <a 
                              href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1 transition-colors"
                            >
                              <Globe className="h-4 w-4" />
                              Visit
                            </a>
                          ) : (
                            <span className="text-gray-400 dark:text-gray-500">No website</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditCompany(company)}
                              className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900/20"
                            >
                              <Edit3 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setCompanyToDelete(company)}
                              className="text-red-600 hover:text-red-800 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>

          {/* Delete Confirmation Dialog */}
          <AlertDialog open={!!companyToDelete} onOpenChange={() => setCompanyToDelete(null)}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Company</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete "{companyToDelete?.name}"? This action cannot be undone.
                  Type the company name to confirm deletion.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <Input
                placeholder={`Type "${companyToDelete?.name}" to confirm`}
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                className="mt-2"
              />
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => {
                  setCompanyToDelete(null);
                  setDeleteConfirmText('');
                }}>
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  disabled={deleteConfirmText !== companyToDelete?.name}
                  onClick={() => companyToDelete && handleDeleteCompany(companyToDelete.id)}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Delete Company
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
}
