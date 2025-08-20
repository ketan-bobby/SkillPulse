import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Users, Edit, Edit3, Trash2, Building2, Search, Filter, UserPlus, X } from "lucide-react";
import { useLocation } from "wouter";
import { insertDepartmentSchema, type Department, type InsertDepartment, type Company, type User } from "@shared/schema";
import { apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { AppHeader } from "@/components/app-header";
import { useAuth } from "@/hooks/use-auth";
import { ROLES } from "@shared/roles";

export default function DepartmentManagement() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCompany, setSelectedCompany] = useState<string>("all");
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [isAssignEmployeesOpen, setIsAssignEmployeesOpen] = useState(false);
  const [selectedEmployees, setSelectedEmployees] = useState<number[]>([]);
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { user } = useAuth();

  const getRoleBasedPath = (path: string) => {
    if (user?.role === ROLES.SUPER_ADMIN) return `/super-admin${path}`;
    if (user?.role === ROLES.ADMIN) return `/admin${path}`;
    return path;
  };

  const { data: departments = [], isLoading } = useQuery<Department[]>({
    queryKey: ["/api/departments"],
  });

  const { data: companies = [] } = useQuery<Company[]>({
    queryKey: ["/api/companies"],
  });

  const { data: departmentEmployees = [] } = useQuery<User[]>({
    queryKey: ["/api/departments", selectedDepartment?.id, "employees"],
    enabled: !!selectedDepartment,
  });

  const { data: unassignedEmployees = [] } = useQuery<User[]>({
    queryKey: ["/api/departments/unassigned-employees"],
    enabled: isAssignEmployeesOpen,
  });

  const form = useForm({
    resolver: zodResolver(insertDepartmentSchema),
    defaultValues: {
      name: "",
      code: "",
      companyId: 0,
      description: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertDepartment) => {
      const res = await apiRequest("POST", "/api/departments", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/departments"] });
      setIsCreateDialogOpen(false);
      form.reset();
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

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: InsertDepartment }) => {
      const res = await apiRequest("PUT", `/api/departments/${id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/departments"] });
      setEditingDepartment(null);
      form.reset();
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

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/departments/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/departments"] });
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

  const assignEmployeesMutation = useMutation({
    mutationFn: async ({ departmentId, employeeIds }: { departmentId: number; employeeIds: number[] }) => {
      const res = await apiRequest("POST", `/api/departments/${departmentId}/assign-employees`, { employeeIds });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/departments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/departments", selectedDepartment?.id, "employees"] });
      queryClient.invalidateQueries({ queryKey: ["/api/departments/unassigned-employees"] });
      setIsAssignEmployeesOpen(false);
      setSelectedEmployees([]);
      toast({
        title: "Success",
        description: "Employees assigned successfully",
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

  const removeEmployeeMutation = useMutation({
    mutationFn: async (employeeId: number) => {
      const res = await apiRequest("DELETE", `/api/departments/employees/${employeeId}`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/departments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/departments", selectedDepartment?.id, "employees"] });
      toast({
        title: "Success",
        description: "Employee removed from department",
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

  const onSubmit = (data: any) => {
    const departmentData: InsertDepartment = {
      name: data.name,
      code: data.code,
      companyId: data.companyId,
      description: data.description
    };
    
    if (editingDepartment) {
      updateMutation.mutate({ id: editingDepartment.id, data: departmentData });
    } else {
      createMutation.mutate(departmentData);
    }
  };

  const handleEdit = (department: Department) => {
    setEditingDepartment(department);
    form.reset({
      name: department.name,
      code: department.code,
      companyId: department.companyId,
      description: department.description || "",
    });
  };

  const getCompanyName = (companyId: number) => {
    const company = companies.find((c: Company) => c.id === companyId);
    return company?.name || "Unknown Company";
  };

  const handleCloseDialog = () => {
    setIsCreateDialogOpen(false);
    setEditingDepartment(null);
    form.reset();
  };

  // Filter departments based on search term and selected company
  const filteredDepartments = useMemo(() => {
    return departments.filter((department: Department) => {
      const matchesSearch = searchTerm === "" || 
        department.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        department.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (department.description && department.description.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCompany = selectedCompany === "all" || 
        department.companyId.toString() === selectedCompany;
      
      return matchesSearch && matchesCompany;
    });
  }, [departments, searchTerm, selectedCompany]);

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
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Department Management</h1>
              <p className="text-gray-600 dark:text-gray-400">
                Manage departments within companies
              </p>
            </div>
            <Button 
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => setIsCreateDialogOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Department
            </Button>
            
            <Dialog open={isCreateDialogOpen || !!editingDepartment} onOpenChange={handleCloseDialog}>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>
                    {editingDepartment ? "Edit Department" : "Create New Department"}
                  </DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Department Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter department name" {...field} />
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
                          <FormLabel>Department Code</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter department code (e.g., ENG)" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="companyId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company</FormLabel>
                          <Select 
                            onValueChange={(value) => field.onChange(parseInt(value))} 
                            value={field.value?.toString()}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a company" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {companies.map((company: Company) => (
                                <SelectItem key={company.id} value={company.id.toString()}>
                                  {company.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter department description" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={handleCloseDialog}>
                        Cancel
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={createMutation.isPending || updateMutation.isPending}
                      >
                        {editingDepartment ? "Update" : "Create"} Department
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search departments by name, code, or description..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="w-full sm:w-48">
                  <Select value={selectedCompany} onValueChange={setSelectedCompany}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by company" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Companies</SelectItem>
                      {companies.map((company: Company) => (
                        <SelectItem key={company.id} value={company.id.toString()}>
                          {company.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {(searchTerm || selectedCompany !== "all") && (
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSearchTerm("");
                      setSelectedCompany("all");
                    }}
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card 
              className="cursor-pointer hover:shadow-lg transition-all hover:scale-105 border-2 hover:border-blue-300"
              onClick={() => {
                setSearchTerm("");
                setSelectedCompany("all");
                toast({
                  title: "Filters Cleared",
                  description: "Showing all departments",
                });
              }}
            >
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Departments</p>
                    <p className="text-2xl font-bold">{departments.length}</p>
                    {(searchTerm || selectedCompany !== "all") && (
                      <p className="text-xs text-blue-600">Click to show all</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card 
              className="cursor-pointer hover:shadow-lg transition-all hover:scale-105 border-2 hover:border-green-300"
              onClick={() => setLocation(getRoleBasedPath("/companies"))}
            >
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Companies</p>
                    <p className="text-2xl font-bold">{companies.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Departments Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Departments</span>
                <Badge variant="secondary">
                  {filteredDepartments.length} of {departments.length} departments
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Employees</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDepartments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        {searchTerm || selectedCompany !== "all" 
                          ? "No departments match the current filters" 
                          : "No departments found"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredDepartments.map((department: Department) => (
                    <TableRow 
                      key={department.id}
                      className="cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => handleEdit(department)}
                    >
                      <TableCell className="font-medium">{department.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{department.code}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{getCompanyName(department.companyId)}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700">
                          0 employees
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {department.description || "No description"}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedDepartment(department);
                              setIsAssignEmployeesOpen(true);
                            }}
                          >
                            <UserPlus className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(department);
                            }}
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteMutation.mutate(department.id);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Employee Assignment Dialog */}
          <Dialog open={isAssignEmployeesOpen} onOpenChange={setIsAssignEmployeesOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  Assign Employees to {selectedDepartment?.name}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {/* Current Employees */}
                {selectedDepartment && departmentEmployees.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium mb-2">Current Employees</h3>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {departmentEmployees.map((employee: User) => (
                        <div key={employee.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="text-sm">{employee.name} ({employee.username})</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeEmployeeMutation.mutate(employee.id)}
                            disabled={removeEmployeeMutation.isPending}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Available Employees */}
                <div>
                  <h3 className="text-sm font-medium mb-2">Available Employees</h3>
                  {unassignedEmployees.length === 0 ? (
                    <p className="text-sm text-gray-500">No unassigned employees available</p>
                  ) : (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {unassignedEmployees.map((employee: User) => (
                        <div key={employee.id} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`employee-${employee.id}`}
                            checked={selectedEmployees.includes(employee.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedEmployees([...selectedEmployees, employee.id]);
                              } else {
                                setSelectedEmployees(selectedEmployees.filter(id => id !== employee.id));
                              }
                            }}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <label htmlFor={`employee-${employee.id}`} className="text-sm">
                            {employee.name} ({employee.username})
                            {employee.position && (
                              <Badge variant="outline" className="ml-2 text-xs">
                                {employee.position}
                              </Badge>
                            )}
                          </label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsAssignEmployeesOpen(false);
                      setSelectedEmployees([]);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => {
                      if (selectedDepartment && selectedEmployees.length > 0) {
                        assignEmployeesMutation.mutate({
                          departmentId: selectedDepartment.id,
                          employeeIds: selectedEmployees
                        });
                      }
                    }}
                    disabled={selectedEmployees.length === 0 || assignEmployeesMutation.isPending}
                  >
                    {assignEmployeesMutation.isPending ? 'Assigning...' : `Assign ${selectedEmployees.length} Employee${selectedEmployees.length !== 1 ? 's' : ''}`}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}