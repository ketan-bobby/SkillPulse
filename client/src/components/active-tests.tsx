import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, HelpCircle, Shield, Server, Network, Code, Monitor, Settings, Smartphone, BarChart, Brain, Cloud, Database, HardDrive, Terminal, Layers } from "lucide-react";
import { Link } from "wouter";

export function ActiveTests() {
  const { data: assignments = [], isLoading } = useQuery({
    queryKey: ["/api/assignments"],
  });

  const getDomainIcon = (domain: string) => {
    switch (domain) {
      case "programming":
        return Code;
      case "frontend":
        return Monitor;
      case "backend":
        return Server;
      case "devops":
        return Settings;
      case "mobile":
        return Smartphone;
      case "data-science":
        return BarChart;
      case "ai-ml":
        return Brain;
      case "cloud":
        return Cloud;
      case "security":
        return Shield;
      case "databases":
        return Database;
      case "networking":
        return Network;
      case "vmware-virtualization":
        return HardDrive;
      case "redhat-administration":
        return Terminal;
      case "oracle-administration":
        return Database;
      case "network-routing-switching":
        return Layers;
      default:
        return HelpCircle;
    }
  };

  const getDomainColor = (domain: string) => {
    switch (domain) {
      case "programming":
        return "bg-purple-100 text-purple-800";
      case "frontend":
        return "bg-blue-100 text-blue-800";
      case "backend":
        return "bg-green-100 text-green-800";
      case "devops":
        return "bg-orange-100 text-orange-800";
      case "mobile":
        return "bg-pink-100 text-pink-800";
      case "data-science":
        return "bg-cyan-100 text-cyan-800";
      case "ai-ml":
        return "bg-violet-100 text-violet-800";
      case "cloud":
        return "bg-sky-100 text-sky-800";
      case "security":
        return "bg-red-100 text-red-800";
      case "databases":
        return "bg-yellow-100 text-yellow-800";
      case "networking":
        return "bg-indigo-100 text-indigo-800";
      case "vmware-virtualization":
        return "bg-slate-100 text-slate-800";
      case "redhat-administration":
        return "bg-red-100 text-red-800";
      case "oracle-administration":
        return "bg-amber-100 text-amber-800";
      case "network-routing-switching":
        return "bg-teal-100 text-teal-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusBadge = (assignment: any) => {
    const now = new Date();
    const dueDate = assignment.dueDate ? new Date(assignment.dueDate) : null;
    const scheduledAt = assignment.scheduledAt ? new Date(assignment.scheduledAt) : null;

    if (assignment.status === "completed") {
      return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
    }
    
    if (scheduledAt && scheduledAt > now) {
      return <Badge className="bg-gray-100 text-gray-800">Scheduled: {scheduledAt.toLocaleDateString()}</Badge>;
    }
    
    if (dueDate) {
      const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysUntilDue === 0) {
        return <Badge className="bg-red-100 text-red-800">Due today</Badge>;
      } else if (daysUntilDue > 0) {
        return <Badge className="bg-yellow-100 text-yellow-800">Due in {daysUntilDue} days</Badge>;
      } else {
        return <Badge className="bg-red-100 text-red-800">Overdue</Badge>;
      }
    }
    
    return <Badge className="bg-blue-100 text-blue-800">Available</Badge>;
  };

  const getActionButton = (assignment: any) => {
    const now = new Date();
    const scheduledAt = assignment.scheduledAt ? new Date(assignment.scheduledAt) : null;
    const dueDate = assignment.dueDate ? new Date(assignment.dueDate) : null;

    if (assignment.status === "completed") {
      return (
        <Button variant="outline" size="sm">
          View Results
        </Button>
      );
    }

    if (scheduledAt && scheduledAt > now) {
      return (
        <Button variant="outline" size="sm">
          Reschedule
        </Button>
      );
    }

    const isOverdue = dueDate && dueDate < now;
    
    return (
      <Button 
        asChild 
        size="sm" 
        className={isOverdue ? "bg-red-500 hover:bg-red-600" : ""}
      >
        <Link href={`/test/${assignment.test?.id}`}>
          {isOverdue ? "Start Now" : "Start Test"}
        </Link>
      </Button>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Active Assignments</CardTitle>
      </CardHeader>
      <CardContent>
        {assignments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No active assignments. Check back later for new tests.
          </div>
        ) : (
          <div className="space-y-4">
            {assignments.map((assignment: any) => {
              const DomainIcon = getDomainIcon(assignment.test?.domain);
              
              return (
                <div key={assignment.id} className="border border-border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">{assignment.test?.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{assignment.test?.description}</p>
                      <div className="flex items-center space-x-4 mt-3">
                        <Badge className={getDomainColor(assignment.test?.domain)}>
                          <DomainIcon className="h-3 w-3 mr-1" />
                          {assignment.test?.domain}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          <Clock className="h-3 w-3 mr-1 inline" />
                          {assignment.test?.duration} minutes
                        </span>
                        <span className="text-sm text-muted-foreground">
                          <HelpCircle className="h-3 w-3 mr-1 inline" />
                          {assignment.test?.totalQuestions} questions
                        </span>
                      </div>
                    </div>
                    <div className="ml-4 flex flex-col items-end space-y-2">
                      {getStatusBadge(assignment)}
                      {getActionButton(assignment)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
