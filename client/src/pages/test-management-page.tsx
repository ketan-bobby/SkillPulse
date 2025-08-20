import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { 
  CalendarDays, 
  Clock, 
  Users, 
  Settings, 
  Play, 
  Pause, 
  Eye,
  CheckCircle,
  CheckCircle2,
  XCircle,
  BarChart
} from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { useToast } from "@/hooks/use-toast";
import { NTTReviewInterface } from "@/components/ntt-review-interface";
import { ServerPerformanceMonitor } from "@/components/server-performance-monitor";
import { useQuery } from "@tanstack/react-query";

export default function TestManagementPage() {
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [activeTab, setActiveTab] = useState("schedule");
  const { toast } = useToast();

  // Fetch scheduled tests from database
  const { data: scheduledTests = [] } = useQuery({
    queryKey: ["/api/tests/scheduled"],
  });

  const publishTest = (testId: number) => {
    toast({
      title: "Test Published",
      description: "Test has been published and is now available to assigned engineers.",
    });
  };

  const pauseTest = (testId: number) => {
    toast({
      title: "Test Paused",
      description: "Test has been paused. Engineers cannot start new sessions.",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />
      
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Test Management</h1>
          <p className="text-muted-foreground mt-2">
            Schedule, publish, and monitor engineering assessments across multiple domains
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="schedule">
              <CalendarDays className="h-4 w-4 mr-2" />
              Schedule Tests
            </TabsTrigger>
            <TabsTrigger value="published">
              <Play className="h-4 w-4 mr-2" />
              Published Tests
            </TabsTrigger>
            <TabsTrigger value="ntt-review">
              <Eye className="h-4 w-4 mr-2" />
              NTT Review
            </TabsTrigger>
            <TabsTrigger value="performance">
              <BarChart className="h-4 w-4 mr-2" />
              Performance
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="schedule" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Test Scheduling Form */}
              <Card>
                <CardHeader>
                  <CardTitle>Schedule New Test</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="testTitle">Test Title</Label>
                    <Input id="testTitle" placeholder="Enter test title" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="domain">Domain</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select domain" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="programming">Programming</SelectItem>
                          <SelectItem value="frontend">Frontend</SelectItem>
                          <SelectItem value="backend">Backend</SelectItem>
                          <SelectItem value="devops">DevOps</SelectItem>
                          <SelectItem value="cloud">Cloud</SelectItem>
                          <SelectItem value="mobile">Mobile</SelectItem>
                          <SelectItem value="data-science">Data Science</SelectItem>
                          <SelectItem value="ai-ml">AI/ML</SelectItem>
                          <SelectItem value="security">Security</SelectItem>
                          <SelectItem value="databases">Databases</SelectItem>
                          <SelectItem value="networking">Networking</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="level">Level</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="junior">Junior</SelectItem>
                          <SelectItem value="mid">Mid-Level</SelectItem>
                          <SelectItem value="senior">Senior</SelectItem>
                          <SelectItem value="lead">Lead</SelectItem>
                          <SelectItem value="principal">Principal</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label>Scheduled Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                          <CalendarDays className="mr-2 h-4 w-4" />
                          {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={setSelectedDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="startTime">Start Time</Label>
                      <Input id="startTime" type="time" />
                    </div>
                    <div>
                      <Label htmlFor="duration">Duration (minutes)</Label>
                      <Input id="duration" type="number" placeholder="120" />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea 
                      id="description" 
                      placeholder="Test description and requirements"
                      className="min-h-20"
                    />
                  </div>

                  <Button className="w-full">
                    <CalendarDays className="h-4 w-4 mr-2" />
                    Schedule Test
                  </Button>
                </CardContent>
              </Card>

              {/* Scheduled Tests Calendar */}
              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Tests</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {scheduledTests.map((test) => (
                      <div key={test.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{test.title}</h4>
                          <Badge variant={test.status === "published" ? "default" : "secondary"}>
                            {test.status}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <div className="flex items-center">
                            <CalendarDays className="h-4 w-4 mr-2" />
                            {format(test.scheduledDate, "PPP")} at {test.startTime}
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-2" />
                            {test.duration} minutes
                          </div>
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-2" />
                            {test.assignedEngineers} engineers assigned
                          </div>
                        </div>
                        <div className="flex space-x-2 mt-3">
                          <Button 
                            size="sm" 
                            onClick={() => publishTest(test.id)}
                            disabled={test.status === "published"}
                          >
                            <Play className="h-4 w-4 mr-1" />
                            Publish
                          </Button>
                          <div className="px-3 py-1 rounded cursor-pointer bg-gray-100 hover:bg-gray-200 border border-gray-400 flex items-center text-sm">
                            <Eye style={{ width: '16px', height: '16px', color: '#1f2937' }} className="mr-1" />
                            Preview
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="published" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Active Tests</p>
                      <p className="text-2xl font-bold">12</p>
                    </div>
                    <Play className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Active Sessions</p>
                      <p className="text-2xl font-bold">47</p>
                    </div>
                    <Users className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Completed Today</p>
                      <p className="text-2xl font-bold">89</p>
                    </div>
                    <CheckCircle2 className="h-8 w-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Published Test Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {scheduledTests.filter(t => t.status === "published").map((test) => (
                    <div key={test.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{test.title}</h4>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                            <span>Active Sessions: 12</span>
                            <span>Completed: 23</span>
                            <span>Remaining: {test.assignedEngineers - 23}</span>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <div className="px-3 py-1 rounded cursor-pointer bg-gray-100 hover:bg-gray-200 border border-gray-400 flex items-center text-sm">
                            <Eye style={{ width: '16px', height: '16px', color: '#1f2937' }} className="mr-1" />
                            Monitor
                          </div>
                          <div 
                            className="px-3 py-1 rounded cursor-pointer bg-gray-100 hover:bg-gray-200 border border-gray-400 flex items-center text-sm"
                            onClick={() => pauseTest(test.id)}
                          >
                            <Pause style={{ width: '16px', height: '16px', color: '#1f2937' }} className="mr-1" />
                            Pause
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ntt-review">
            <NTTReviewInterface 
              questions={[
                {
                  id: 1,
                  type: "mcq",
                  question: "Which React hook is used for managing state in functional components?",
                  options: ["useState", "useEffect", "useContext", "useReducer"],
                  correctAnswer: "useState",
                  difficulty: "medium"
                },
                {
                  id: 2,
                  type: "coding",
                  question: "Implement a function that finds the maximum element in an array",
                  codeTemplate: "function findMax(arr) {\n  // Your code here\n}",
                  testCases: [
                    { input: "[1, 3, 2]", output: "3" },
                    { input: "[-1, -5, -2]", output: "-1" }
                  ],
                  difficulty: "easy"
                },
                {
                  id: 3,
                  type: "scenario",
                  scenario: "Your application is experiencing slow database queries during peak hours.",
                  question: "What strategies would you implement to optimize database performance?",
                  sampleAnswer: "",
                  difficulty: "senior"
                }
              ]}
              onReviewComplete={(reviews) => {
                toast({
                  title: "Review Submitted",
                  description: "NTT review has been completed and submitted successfully.",
                });
              }}
            />
          </TabsContent>

          <TabsContent value="performance">
            <ServerPerformanceMonitor />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Test Settings & Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-medium mb-4">Default Test Parameters</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="defaultDuration">Default Duration (minutes)</Label>
                      <Input id="defaultDuration" type="number" defaultValue="120" />
                    </div>
                    <div>
                      <Label htmlFor="maxConcurrent">Max Concurrent Tests</Label>
                      <Input id="maxConcurrent" type="number" defaultValue="150" />
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-4">Security Settings</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="tabSwitchLimit">Tab Switch Limit</Label>
                      <Input id="tabSwitchLimit" type="number" defaultValue="3" className="w-20" />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="penaltyThreshold">Penalty Threshold</Label>
                      <Input id="penaltyThreshold" type="number" defaultValue="50" className="w-20" />
                    </div>
                  </div>
                </div>

                <Button>
                  <Settings className="h-4 w-4 mr-2" />
                  Save Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}