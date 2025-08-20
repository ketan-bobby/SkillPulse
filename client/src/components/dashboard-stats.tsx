import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { ClipboardList, CheckCircle, BarChart, Clock } from "lucide-react";
import { useLocation } from "wouter";

export function DashboardStats() {
  const [, setLocation] = useLocation();
  const { data: stats } = useQuery({
    queryKey: ["/api/dashboard/stats"],
  });

  const statCards = [
    {
      title: "Assigned Tests",
      value: stats?.assignedTests || 0,
      subtitle: `${stats?.pendingTests || 0} pending, ${stats?.scheduledTests || 0} scheduled`,
      icon: ClipboardList,
      bgColor: "bg-primary/10",
      iconColor: "text-primary",
      onClick: () => setLocation("/assignments"),
    },
    {
      title: "Completed",
      value: stats?.completedTests || 0,
      subtitle: `+${stats?.completedThisWeek || 0} this week`,
      icon: CheckCircle,
      bgColor: "bg-green-50",
      iconColor: "text-green-600",
      onClick: () => setLocation("/results"),
    },
    {
      title: "Average Score",
      value: `${stats?.averageScore || 0}%`,
      subtitle: "Across all domains",
      icon: BarChart,
      bgColor: "bg-yellow-50",
      iconColor: "text-yellow-600",
      onClick: () => setLocation("/reports"),
    },
    {
      title: "Time Saved",
      value: `${stats?.timeSaved?.toFixed(1) || "0.0"}h`,
      subtitle: "vs manual assessment",
      icon: Clock,
      bgColor: "bg-primary/10",
      iconColor: "text-primary",
      onClick: () => setLocation("/analytics"),
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat) => (
        <Card 
          key={stat.title} 
          className="cursor-pointer hover:shadow-md transition-shadow duration-200"
          onClick={stat.onClick}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                <stat.icon className={`${stat.iconColor} h-6 w-6`} />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-sm text-muted-foreground">{stat.subtitle}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
