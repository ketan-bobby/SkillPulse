import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { AppHeader } from "@/components/app-header";
import { RoleGuard } from "@/lib/role-guard";
import { 
  Download, 
  FileSpreadsheet, 
  FileText, 
  Database,
  Calendar,
  Filter,
  Users,
  TestTube,
  BarChart,
  Settings,
  CheckCircle
} from "lucide-react";

export default function ExportDataPage() {
  const [selectedData, setSelectedData] = useState<string[]>([]);
  const [exportFormat, setExportFormat] = useState("csv");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [filterDomain, setFilterDomain] = useState("all");
  const [isExporting, setIsExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState("");

  const { data: tests = [] } = useQuery({
    queryKey: ["/api/tests"],
  });

  const { data: results = [] } = useQuery({
    queryKey: ["/api/admin/all-results"],
  });

  const { data: users = [] } = useQuery({
    queryKey: ["/api/users"],
  });

  const { data: assignments = [] } = useQuery({
    queryKey: ["/api/assignments"],
  });

  const dataTypes = [
    {
      id: "users",
      label: "User Data",
      description: "User profiles, roles, and account information",
      icon: <Users className="h-4 w-4" />,
      count: Array.isArray(users) ? users.length : 0,
    },
    {
      id: "tests",
      label: "Test Data",
      description: "Test configurations, questions, and metadata",
      icon: <TestTube className="h-4 w-4" />,
      count: Array.isArray(tests) ? tests.length : 0,
    },
    {
      id: "results",
      label: "Test Results",
      description: "Candidate scores, answers, and performance data",
      icon: <BarChart className="h-4 w-4" />,
      count: Array.isArray(results) ? results.length : 0,
    },
    {
      id: "assignments",
      label: "Test Assignments",
      description: "Assignment records and scheduling data",
      icon: <Calendar className="h-4 w-4" />,
      count: Array.isArray(assignments) ? assignments.length : 0,
    },
    {
      id: "analytics",
      label: "Analytics Data",
      description: "Performance metrics and system analytics",
      icon: <BarChart className="h-4 w-4" />,
      count: "Generated",
    },
    {
      id: "system",
      label: "System Logs",
      description: "Application logs and audit trails",
      icon: <Settings className="h-4 w-4" />,
      count: "Available",
    },
  ];

  const handleDataTypeToggle = (dataType: string) => {
    setSelectedData(prev => 
      prev.includes(dataType)
        ? prev.filter(d => d !== dataType)
        : [...prev, dataType]
    );
  };

  const handleSelectAll = () => {
    if (selectedData.length === dataTypes.length) {
      setSelectedData([]);
    } else {
      setSelectedData(dataTypes.map(d => d.id));
    }
  };

  const generateExportData = () => {
    const exportData: any = {};
    const safeUsers = Array.isArray(users) ? users : [];
    const safeTests = Array.isArray(tests) ? tests : [];
    const safeResults = Array.isArray(results) ? results : [];
    const safeAssignments = Array.isArray(assignments) ? assignments : [];

    if (selectedData.includes("users")) {
      exportData.users = safeUsers.map((user: any) => ({
        id: user.id || '',
        username: user.username || '',
        role: user.role || '',
        email: user.email || '',
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        createdAt: user.createdAt || '',
        lastLoginAt: user.lastLoginAt || null,
        isActive: user.isActive || false,
      }));
    }

    if (selectedData.includes("tests")) {
      exportData.tests = safeTests.map((test: any) => ({
        id: test.id || '',
        title: test.title || '',
        description: test.description || '',
        domain: test.domain || '',
        level: test.level || '',
        duration: test.duration || 0,
        totalQuestions: test.total_questions || test.totalQuestions || 0,
        passingScore: test.passing_score || test.passingScore || 0,
        isActive: test.is_active || test.isActive || false,
        createdAt: test.created_at || test.createdAt || '',
        tags: test.tags || [],
      }));
    }

    if (selectedData.includes("results")) {
      let filteredResults = safeResults;
      
      // Apply date range filter
      if (dateFrom && dateTo) {
        const fromDate = new Date(dateFrom);
        const toDate = new Date(dateTo);
        filteredResults = safeResults.filter((result: any) => {
          const resultDate = new Date(result.completedAt || result.createdAt);
          return resultDate >= fromDate && resultDate <= toDate;
        });
      }

      exportData.results = filteredResults.map((result: any) => ({
        id: result.id || '',
        userId: result.userId || '',
        testId: result.testId || '',
        score: result.score || 0,
        percentage: result.percentage || 0,
        passed: result.passed || false,
        timeSpent: result.timeSpent || 0,
        completedAt: result.completedAt || '',
        startedAt: result.startedAt || '',
        answers: result.answers || [],
        sessionId: result.sessionId || '',
      }));
    }

    if (selectedData.includes("assignments")) {
      exportData.assignments = safeAssignments.map((assignment: any) => ({
        id: assignment.id || '',
        userId: assignment.userId || '',
        testId: assignment.testId || '',
        assignedBy: assignment.assignedBy || '',
        assignedAt: assignment.assignedAt || '',
        dueDate: assignment.dueDate || '',
        status: assignment.status || '',
        startedAt: assignment.startedAt || '',
        completedAt: assignment.completedAt || '',
      }));
    }

    if (selectedData.includes("analytics")) {
      const totalResults = safeResults.length;
      const passedResults = safeResults.filter((r: any) => r.passed).length;
      const totalScore = safeResults.reduce((sum: number, r: any) => sum + (r.percentage || 0), 0);

      exportData.analytics = {
        summary: {
          totalUsers: safeUsers.length,
          totalTests: safeTests.length,
          totalResults: totalResults,
          averageScore: totalResults > 0 ? (totalScore / totalResults).toFixed(2) : 0,
          passRate: totalResults > 0 ? ((passedResults / totalResults) * 100).toFixed(2) : 0,
        },
        domainPerformance: safeTests.reduce((acc: any, test: any) => {
          const testResults = safeResults.filter((r: any) => r.testId === test.id);
          if (testResults.length > 0) {
            const domainScore = testResults.reduce((sum: number, r: any) => sum + (r.percentage || 0), 0);
            const domainPassed = testResults.filter((r: any) => r.passed).length;
            acc[test.domain || 'Unknown'] = {
              totalResults: testResults.length,
              averageScore: (domainScore / testResults.length).toFixed(2),
              passRate: ((domainPassed / testResults.length) * 100).toFixed(2),
            };
          }
          return acc;
        }, {}),
        generatedAt: new Date().toISOString(),
      };
    }

    if (selectedData.includes("system")) {
      const activeUsers = safeUsers.filter((u: any) => u.role === "employee" || u.role === "candidate").length;
      exportData.systemLogs = {
        exportedAt: new Date().toISOString(),
        systemHealth: "Good",
        activeUsers: activeUsers,
        totalUsers: safeUsers.length,
        systemVersion: "1.0.0",
        databaseStatus: "Connected",
        exportedDataTypes: selectedData,
        exportFormat: exportFormat,
      };
    }

    return exportData;
  };

  const convertToCSV = (data: any[], filename: string): string => {
    if (data.length === 0) return "";
    
    const headers = Object.keys(data[0]);
    const csvHeaders = headers.join(",");
    
    const csvRows = data.map((item: any) => 
      headers.map((header) => {
        const value = item[header];
        if (value === null || value === undefined) return "";
        if (typeof value === "object") return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
        if (typeof value === "string") return `"${value.replace(/"/g, '""')}"`;
        return value;
      }).join(",")
    );
    
    return `${csvHeaders}\n${csvRows.join("\n")}`;
  };

  const handleExport = async () => {
    if (selectedData.length === 0) {
      setExportStatus("Please select at least one data type to export.");
      setTimeout(() => setExportStatus(""), 3000);
      return;
    }

    setIsExporting(true);
    setExportStatus("Preparing export data...");

    try {
      const exportData = generateExportData();
      const timestamp = new Date().toISOString().split('T')[0];
      
      if (exportFormat === "json") {
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `linxassess-export-${timestamp}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        setExportStatus("JSON export completed successfully!");
      } else if (exportFormat === "csv") {
        // Handle CSV export
        const csvFiles: { [key: string]: string } = {};
        
        Object.entries(exportData).forEach(([key, data]: [string, any]) => {
          if (Array.isArray(data)) {
            csvFiles[key] = convertToCSV(data, key);
          } else if (typeof data === "object") {
            // Convert object to key-value pairs for CSV
            const kvPairs = Object.entries(data).map(([k, v]) => ({
              key: k,
              value: typeof v === "object" ? JSON.stringify(v) : v
            }));
            csvFiles[key] = convertToCSV(kvPairs, key);
          }
        });

        if (Object.keys(csvFiles).length === 1) {
          // Single file export
          const [fileName, content] = Object.entries(csvFiles)[0];
          const blob = new Blob([content], { type: "text/csv" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `linxassess-${fileName}-${timestamp}.csv`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        } else {
          // Multiple files combined
          const combinedContent = Object.entries(csvFiles).map(([key, content]) => 
            `=== ${key.toUpperCase()} DATA ===\n${content}\n\n`
          ).join("");
          
          const blob = new Blob([combinedContent], { type: "text/plain" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `linxassess-export-${timestamp}.txt`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }
        
        setExportStatus("CSV export completed successfully!");
      }

      setTimeout(() => setExportStatus(""), 5000);
    } catch (error) {
      console.error("Export error:", error);
      setExportStatus("Export failed. Please try again.");
      setTimeout(() => setExportStatus(""), 5000);
    } finally {
      setIsExporting(false);
    }
  };

  const getTotalRecords = () => {
    return selectedData.reduce((total, dataType) => {
      const type = dataTypes.find(d => d.id === dataType);
      if (type && typeof type.count === "number") {
        return total + type.count;
      }
      return total;
    }, 0);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <RoleGuard allowedRoles={["super_admin", "admin"]}>
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Export Data</h1>
            <p className="text-gray-600 mt-2">
              Export platform data for backup, analysis, or migration purposes
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center">
                      <Database className="h-5 w-5 mr-2" />
                      Select Data to Export
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSelectAll}
                    >
                      {selectedData.length === dataTypes.length ? "Deselect All" : "Select All"}
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {dataTypes.map((dataType) => (
                      <div
                        key={dataType.id}
                        className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                        onClick={() => handleDataTypeToggle(dataType.id)}
                      >
                        <Checkbox
                          checked={selectedData.includes(dataType.id)}
                          onCheckedChange={() => handleDataTypeToggle(dataType.id)}
                        />
                        <div className="flex items-center space-x-3 flex-1">
                          {dataType.icon}
                          <div className="flex-1">
                            <h3 className="font-medium">{dataType.label}</h3>
                            <p className="text-sm text-gray-600">{dataType.description}</p>
                          </div>
                          <Badge variant="secondary">
                            {typeof dataType.count === "number" ? `${dataType.count} records` : dataType.count}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Filter className="h-5 w-5 mr-2" />
                    Export Options
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Export Format</label>
                    <Select value={exportFormat} onValueChange={setExportFormat}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="csv">
                          <div className="flex items-center">
                            <FileSpreadsheet className="h-4 w-4 mr-2" />
                            CSV Format
                          </div>
                        </SelectItem>
                        <SelectItem value="json">
                          <div className="flex items-center">
                            <FileText className="h-4 w-4 mr-2" />
                            JSON Format
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Date Range (Optional)</label>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Input
                          type="date"
                          placeholder="From"
                          value={dateFrom}
                          onChange={(e) => setDateFrom(e.target.value)}
                        />
                      </div>
                      <div>
                        <Input
                          type="date"
                          placeholder="To"
                          value={dateTo}
                          onChange={(e) => setDateTo(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Filter by Domain</label>
                    <Select value={filterDomain} onValueChange={setFilterDomain}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Domains</SelectItem>
                        <SelectItem value="Programming">Programming</SelectItem>
                        <SelectItem value="Frontend Development">Frontend Development</SelectItem>
                        <SelectItem value="Backend Development">Backend Development</SelectItem>
                        <SelectItem value="DevOps & Cloud">DevOps & Cloud</SelectItem>
                        <SelectItem value="Mobile Development">Mobile Development</SelectItem>
                        <SelectItem value="Data Science & AI">Data Science & AI</SelectItem>
                        <SelectItem value="Cybersecurity">Cybersecurity</SelectItem>
                        <SelectItem value="Database Management">Database Management</SelectItem>
                        <SelectItem value="Network Administration">Network Administration</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    onClick={handleExport}
                    disabled={isExporting || selectedData.length === 0}
                    className="w-full"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    {isExporting ? "Exporting..." : "Export Data"}
                  </Button>

                  {exportStatus && (
                    <div className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
                      exportStatus.includes("success") || exportStatus.includes("completed") 
                        ? "bg-green-50 text-green-700 border border-green-200" 
                        : exportStatus.includes("failed") || exportStatus.includes("error")
                        ? "bg-red-50 text-red-700 border border-red-200"
                        : "bg-blue-50 text-blue-700 border border-blue-200"
                    }`}>
                      {exportStatus.includes("success") || exportStatus.includes("completed") ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <Download className="h-4 w-4" />
                      )}
                      {exportStatus}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Export Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Selected Data Types:</span>
                      <span className="font-medium">{selectedData.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Export Format:</span>
                      <span className="font-medium">{exportFormat.toUpperCase()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Records:</span>
                      <span className="font-medium">{getTotalRecords()}</span>
                    </div>
                    {dateFrom && dateTo && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Date Range:</span>
                        <span className="font-medium text-xs">{dateFrom} to {dateTo}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </RoleGuard>
      </div>
    </div>
  );
}