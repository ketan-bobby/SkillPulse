import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Server, 
  Users, 
  Activity, 
  Wifi, 
  Database, 
  AlertTriangle, 
  CheckCircle,
  TrendingUp,
  Clock,
  Zap
} from "lucide-react";

interface PerformanceMetrics {
  activeUsers: number;
  concurrentTests: number;
  serverLoad: number;
  networkLatency: number;
  databaseResponseTime: number;
  memoryUsage: number;
  errorRate: number;
  throughput: number;
}

export function ServerPerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    activeUsers: 0,
    concurrentTests: 0,
    serverLoad: 0,
    networkLatency: 0,
    databaseResponseTime: 0,
    memoryUsage: 0,
    errorRate: 0,
    throughput: 0
  });

  const [alerts, setAlerts] = useState<Array<{
    id: string;
    type: "warning" | "error" | "info";
    message: string;
    timestamp: Date;
  }>>([]);

  // Simulate real-time metrics
  useEffect(() => {
    const interval = setInterval(() => {
      const newMetrics: PerformanceMetrics = {
        activeUsers: Math.floor(Math.random() * 500) + 50,
        concurrentTests: Math.floor(Math.random() * 100) + 10,
        serverLoad: Math.random() * 100,
        networkLatency: Math.random() * 200 + 50,
        databaseResponseTime: Math.random() * 100 + 20,
        memoryUsage: Math.random() * 90 + 10,
        errorRate: Math.random() * 5,
        throughput: Math.random() * 1000 + 200
      };

      setMetrics(newMetrics);

      // Generate alerts based on thresholds
      const newAlerts = [];
      if (newMetrics.serverLoad > 85) {
        newAlerts.push({
          id: Date.now().toString(),
          type: "error" as const,
          message: `High server load detected: ${newMetrics.serverLoad.toFixed(1)}%`,
          timestamp: new Date()
        });
      }

      if (newMetrics.concurrentTests > 80) {
        newAlerts.push({
          id: (Date.now() + 1).toString(),
          type: "warning" as const,
          message: `High concurrent test load: ${newMetrics.concurrentTests} active tests`,
          timestamp: new Date()
        });
      }

      if (newMetrics.networkLatency > 150) {
        newAlerts.push({
          id: (Date.now() + 2).toString(),
          type: "warning" as const,
          message: `Network latency is high: ${newMetrics.networkLatency.toFixed(0)}ms`,
          timestamp: new Date()
        });
      }

      if (newAlerts.length > 0) {
        setAlerts(prev => [...newAlerts, ...prev].slice(0, 10));
      }
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (value: number, thresholds: { warning: number; error: number }) => {
    if (value >= thresholds.error) return "text-red-600";
    if (value >= thresholds.warning) return "text-yellow-600";
    return "text-green-600";
  };

  const getProgressColor = (value: number, thresholds: { warning: number; error: number }) => {
    if (value >= thresholds.error) return "bg-red-500";
    if (value >= thresholds.warning) return "bg-yellow-500";
    return "bg-green-500";
  };

  return (
    <div className="space-y-6">
      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Users</p>
                <p className="text-2xl font-bold">{metrics.activeUsers}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Concurrent Tests</p>
                <p className="text-2xl font-bold">{metrics.concurrentTests}</p>
              </div>
              <Activity className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Server Load</p>
                <p className={`text-2xl font-bold ${getStatusColor(metrics.serverLoad, { warning: 70, error: 85 })}`}>
                  {metrics.serverLoad.toFixed(1)}%
                </p>
              </div>
              <Server className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Network Latency</p>
                <p className={`text-2xl font-bold ${getStatusColor(metrics.networkLatency, { warning: 100, error: 150 })}`}>
                  {metrics.networkLatency.toFixed(0)}ms
                </p>
              </div>
              <Wifi className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Server className="h-5 w-5 mr-2" />
              System Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>CPU Usage</span>
                <span className={getStatusColor(metrics.serverLoad, { warning: 70, error: 85 })}>
                  {metrics.serverLoad.toFixed(1)}%
                </span>
              </div>
              <Progress 
                value={metrics.serverLoad} 
                className="h-2"
              />
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Memory Usage</span>
                <span className={getStatusColor(metrics.memoryUsage, { warning: 75, error: 90 })}>
                  {metrics.memoryUsage.toFixed(1)}%
                </span>
              </div>
              <Progress 
                value={metrics.memoryUsage} 
                className="h-2"
              />
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Database Response Time</span>
                <span className={getStatusColor(metrics.databaseResponseTime, { warning: 50, error: 80 })}>
                  {metrics.databaseResponseTime.toFixed(0)}ms
                </span>
              </div>
              <Progress 
                value={(metrics.databaseResponseTime / 100) * 100} 
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Performance Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Zap className="h-4 w-4 mr-2 text-blue-500" />
                <span className="text-sm">Throughput</span>
              </div>
              <span className="text-sm font-medium">{metrics.throughput.toFixed(0)} req/min</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <AlertTriangle className="h-4 w-4 mr-2 text-red-500" />
                <span className="text-sm">Error Rate</span>
              </div>
              <span className={`text-sm font-medium ${getStatusColor(metrics.errorRate, { warning: 2, error: 5 })}`}>
                {metrics.errorRate.toFixed(2)}%
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Database className="h-4 w-4 mr-2 text-green-500" />
                <span className="text-sm">DB Connections</span>
              </div>
              <span className="text-sm font-medium">47/100</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2 text-purple-500" />
                <span className="text-sm">Avg Response Time</span>
              </div>
              <span className="text-sm font-medium">85ms</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Test Load Management */}
      <Card>
        <CardHeader>
          <CardTitle>Test Load Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="text-center p-4 bg-muted rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{metrics.concurrentTests}</p>
              <p className="text-sm text-muted-foreground">Active Tests</p>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <p className="text-2xl font-bold text-green-600">150</p>
              <p className="text-sm text-muted-foreground">Max Capacity</p>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <p className="text-2xl font-bold text-purple-600">
                {((metrics.concurrentTests / 150) * 100).toFixed(0)}%
              </p>
              <p className="text-sm text-muted-foreground">Capacity Used</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Test Load Capacity</span>
              <span>{metrics.concurrentTests}/150 tests</span>
            </div>
            <Progress 
              value={(metrics.concurrentTests / 150) * 100} 
              className="h-3"
            />
          </div>

          {metrics.concurrentTests > 120 && (
            <Alert className="mt-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                High test load detected. Consider implementing queue management for new test requests.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Alerts */}
      {alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              System Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts.map((alert) => (
                <Alert key={alert.id} className={
                  alert.type === "error" ? "border-red-200 bg-red-50" :
                  alert.type === "warning" ? "border-yellow-200 bg-yellow-50" :
                  "border-blue-200 bg-blue-50"
                }>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="flex items-center justify-between">
                    <span>{alert.message}</span>
                    <span className="text-xs text-muted-foreground">
                      {alert.timestamp.toLocaleTimeString()}
                    </span>
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" size="sm">
              <Activity className="h-4 w-4 mr-2" />
              Scale Servers
            </Button>
            <Button variant="outline" size="sm">
              <Database className="h-4 w-4 mr-2" />
              Optimize Database
            </Button>
            <Button variant="outline" size="sm">
              <Users className="h-4 w-4 mr-2" />
              Manage Queue
            </Button>
            <Button variant="outline" size="sm">
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Clear Cache
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}