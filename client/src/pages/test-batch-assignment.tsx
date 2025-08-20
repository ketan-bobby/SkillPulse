import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Users, FileText, Calendar, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function TestBatchAssignment() {
  const [setupComplete, setSetupComplete] = useState(false);
  const [assignmentData, setAssignmentData] = useState<any>(null);
  const { toast } = useToast();

  const setupBatchMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("/api/setup-batch-assignments", "POST");
    },
    onSuccess: (data) => {
      setSetupComplete(true);
      setAssignmentData(data);
      toast({
        title: "Success!",
        description: "Batch assignment system created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Setup Failed",
        description: `Failed to create batch assignments: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-indigo-950 dark:via-gray-900 dark:to-cyan-950">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-20 h-20 bg-blue-200/30 rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-purple-200/30 rounded-full animate-bounce"></div>
        <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-green-200/30 rounded-full animate-pulse"></div>
        <div className="absolute bottom-40 right-1/3 w-14 h-14 bg-yellow-200/30 rounded-full animate-bounce"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Test Batch Assignment System
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            Demonstrate the proper batch assignment workflow: Company → Project → Employee Groups → Group Assignments → Individual Assignments
          </p>
        </div>

        {!setupComplete ? (
          /* Setup Card */
          <Card className="backdrop-blur-sm bg-white/90 dark:bg-gray-800/90 border-white/20 shadow-xl mb-8">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl mb-2">Setup Batch Assignment Demo</CardTitle>
              <CardDescription className="text-lg">
                This will create a complete example following the correct structure:
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Process Steps */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                <div className="flex items-start space-x-3 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                  <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-sm">1</div>
                  <div>
                    <h4 className="font-semibold text-blue-700 dark:text-blue-300">Create Company & Project</h4>
                    <p className="text-sm text-blue-600 dark:text-blue-400">Establish organizational structure</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                  <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold text-sm">2</div>
                  <div>
                    <h4 className="font-semibold text-purple-700 dark:text-purple-300">Create Employee Group (Batch)</h4>
                    <p className="text-sm text-purple-600 dark:text-purple-400">Frontend Development Team</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 p-4 rounded-lg bg-green-50 dark:bg-green-900/20">
                  <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold text-sm">3</div>
                  <div>
                    <h4 className="font-semibold text-green-700 dark:text-green-300">Create Tests</h4>
                    <p className="text-sm text-green-600 dark:text-green-400">JavaScript & React assessments</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 p-4 rounded-lg bg-orange-50 dark:bg-orange-900/20">
                  <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold text-sm">4</div>
                  <div>
                    <h4 className="font-semibold text-orange-700 dark:text-orange-300">Add Employees to Batch</h4>
                    <p className="text-sm text-orange-600 dark:text-orange-400">john.smith, sarah.dev</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 p-4 rounded-lg bg-red-50 dark:bg-red-900/20">
                  <div className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center font-bold text-sm">5</div>
                  <div>
                    <h4 className="font-semibold text-red-700 dark:text-red-300">Group Test Assignments</h4>
                    <p className="text-sm text-red-600 dark:text-red-400">Assign tests to entire batch</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 p-4 rounded-lg bg-indigo-50 dark:bg-indigo-900/20">
                  <div className="w-8 h-8 bg-indigo-500 text-white rounded-full flex items-center justify-center font-bold text-sm">6</div>
                  <div>
                    <h4 className="font-semibold text-indigo-700 dark:text-indigo-300">Individual Assignments</h4>
                    <p className="text-sm text-indigo-600 dark:text-indigo-400">Create assignments for each employee</p>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <Button
                  onClick={() => setupBatchMutation.mutate()}
                  disabled={setupBatchMutation.isPending}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 text-lg font-semibold"
                >
                  {setupBatchMutation.isPending ? "Creating Batch System..." : "Create Batch Assignment Demo"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          /* Success Results */
          <div className="space-y-6">
            <Card className="backdrop-blur-sm bg-green-50/90 dark:bg-green-900/20 border-green-200/50 shadow-xl">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                  <div>
                    <CardTitle className="text-green-800 dark:text-green-200">Batch Assignment System Created Successfully!</CardTitle>
                    <CardDescription className="text-green-600 dark:text-green-300">
                      All components of the batch system are now in place and ready for testing
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              {assignmentData?.summary && (
                <CardContent>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="flex items-center space-x-3 p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                      <Users className="w-6 h-6 text-blue-600" />
                      <div>
                        <p className="font-semibold">Company</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{assignmentData.summary.company}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3 p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                      <FileText className="w-6 h-6 text-purple-600" />
                      <div>
                        <p className="font-semibold">Project</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{assignmentData.summary.project}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3 p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                      <Users className="w-6 h-6 text-green-600" />
                      <div>
                        <p className="font-semibold">Batch</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{assignmentData.summary.batch}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3 p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                      <FileText className="w-6 h-6 text-orange-600" />
                      <div>
                        <p className="font-semibold">Tests Created</p>
                        <div className="space-y-1">
                          {assignmentData.summary.tests.map((test: string, index: number) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {test}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3 p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                      <Users className="w-6 h-6 text-red-600" />
                      <div>
                        <p className="font-semibold">Employees in Batch</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{assignmentData.summary.employeesInBatch} employees</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3 p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                      <Calendar className="w-6 h-6 text-indigo-600" />
                      <div>
                        <p className="font-semibold">Individual Assignments</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{assignmentData.summary.individualAssignments} assignments</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>

            {/* Next Steps */}
            <Card className="backdrop-blur-sm bg-blue-50/90 dark:bg-blue-900/20 border-blue-200/50 shadow-xl">
              <CardHeader>
                <CardTitle className="text-blue-800 dark:text-blue-200 flex items-center space-x-2">
                  <AlertCircle className="w-6 h-6" />
                  <span>Next Steps - Test the System</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                    <h4 className="font-semibold mb-2">1. Login as Employee</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Go to <code className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">/employee-login</code> and use:
                    </p>
                    <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-300 mt-2 space-y-1">
                      <li><strong>Username:</strong> john.smith, <strong>Password:</strong> password123</li>
                      <li><strong>Username:</strong> sarah.dev, <strong>Password:</strong> password123</li>
                    </ul>
                  </div>
                  
                  <div className="p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                    <h4 className="font-semibold mb-2">2. View Assignments</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Check the employee dashboard to see the assigned tests from the batch system
                    </p>
                  </div>
                  
                  <div className="p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                    <h4 className="font-semibold mb-2">3. Verify Batch Structure</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Each assignment should be linked to the group assignment and show proper inheritance of settings like time limits and due dates
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}