import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Clock, CheckCircle2, TrendingUp, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useApp } from "@/context/AppContext";

const Dashboard = () => {
  const { projects, tasks } = useApp();
  
  const completedTasks = tasks.filter(t => t.status === "done").length;
  const activeSprints = projects.reduce((count, p) => count + p.sprints.filter(s => s.status === "active").length, 0);
  const totalPoints = tasks.reduce((sum, t) => sum + t.storyPoints, 0);
  
  const velocityData = [
    { sprint: "Sprint 1", velocity: 32 },
    { sprint: "Sprint 2", velocity: 38 },
    { sprint: "Sprint 3", velocity: 45 },
    { sprint: "Sprint 4", velocity: 42 },
    { sprint: "Sprint 5", velocity: 50 },
  ];

  const stats = [
    {
      title: "Total Projects",
      value: projects.length.toString(),
      change: `${projects.filter(p => p.status === "active").length} active`,
      icon: Users,
      color: "text-primary",
    },
    {
      title: "Active Sprints",
      value: activeSprints.toString(),
      change: "Across all projects",
      icon: Clock,
      color: "text-accent",
    },
    {
      title: "Completed Tasks",
      value: completedTasks.toString(),
      change: `${tasks.length - completedTasks} in progress`,
      icon: CheckCircle2,
      color: "text-green-500",
    },
    {
      title: "Team Velocity",
      value: totalPoints.toString(),
      change: "Total story points",
      icon: TrendingUp,
      color: "text-blue-500",
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground mt-1">Welcome back! Here's your project overview.</p>
          </div>
          <Button className="gap-2">
            <Bot className="w-4 h-4" />
            Ask AI Assistant
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Sprint Velocity Trend</CardTitle>
              <CardDescription>Story points completed per sprint</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={velocityData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="sprint" />
                  <YAxis />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--popover))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="velocity" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>AI Insights</CardTitle>
              <CardDescription>Recent recommendations from your AI assistant</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3 p-3 rounded-lg bg-muted/50">
                <Bot className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-medium">Sprint velocity is increasing</p>
                  <p className="text-xs text-muted-foreground">
                    Your team's velocity has improved by 16% over the last 3 sprints. Consider increasing story point commitments.
                  </p>
                </div>
              </div>
              <div className="flex gap-3 p-3 rounded-lg bg-muted/50">
                <Bot className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-medium">Potential blocker detected</p>
                  <p className="text-xs text-muted-foreground">
                    3 tasks in "In Progress" for over 5 days. Consider reviewing with the team.
                  </p>
                </div>
              </div>
              <div className="flex gap-3 p-3 rounded-lg bg-muted/50">
                <Bot className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-medium">Sprint planning reminder</p>
                  <p className="text-xs text-muted-foreground">
                    Sprint 6 planning is scheduled for tomorrow at 10:00 AM.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
