import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Clock, CheckCircle2, TrendingUp, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useApp } from "@/context/AppContext";
import { FadeIn } from "@/components/ui/fade-in";
import { motion } from "framer-motion";

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
      <div className="space-y-8">
        <FadeIn>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold tracking-tight mb-2">Dashboard</h1>
              <p className="text-muted-foreground text-lg">Welcome back! Here's your project overview.</p>
            </div>
            <Button className="gap-2 rounded-xl shadow-sm hover:shadow-md">
              <Bot className="w-4 h-4" />
              Ask AI Assistant
            </Button>
          </div>
        </FadeIn>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <FadeIn key={stat.title} delay={index * 0.1}>
              <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
                <Card className="border-none shadow-sm bg-card/50 backdrop-blur-sm">
                  <CardHeader className="flex flex-row items-center justify-between pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                    <div className={`p-2.5 rounded-xl bg-muted ${stat.color}`}>
                      <stat.icon className="w-5 h-5" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold tracking-tight mb-1">{stat.value}</div>
                    <p className="text-sm text-muted-foreground">{stat.change}</p>
                  </CardContent>
                </Card>
              </motion.div>
            </FadeIn>
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <FadeIn delay={0.4}>
            <Card className="border-none shadow-sm bg-card/50 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl">Sprint Velocity Trend</CardTitle>
                <CardDescription>Story points completed per sprint</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={velocityData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.05} stroke="hsl(var(--border))" />
                    <XAxis dataKey="sprint" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                    <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--popover))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '12px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                      }}
                    />
                    <Bar dataKey="velocity" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </FadeIn>

          <FadeIn delay={0.5}>
            <Card className="border-none shadow-sm bg-card/50 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl">AI Insights</CardTitle>
                <CardDescription>Recent recommendations from your AI assistant</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  {
                    title: "Sprint velocity is increasing",
                    description: "Your team's velocity has improved by 16% over the last 3 sprints. Consider increasing story point commitments."
                  },
                  {
                    title: "Potential blocker detected",
                    description: "3 tasks in 'In Progress' for over 5 days. Consider reviewing with the team."
                  },
                  {
                    title: "Sprint planning reminder",
                    description: "Sprint 6 planning is scheduled for tomorrow at 10:00 AM."
                  }
                ].map((insight, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className="flex gap-3 p-4 rounded-xl bg-muted/40 hover:bg-muted/60 transition-colors"
                  >
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Bot className="w-4 h-4 text-primary flex-shrink-0" />
                    </div>
                    <div className="space-y-1 flex-1">
                      <p className="text-sm font-semibold text-foreground">{insight.title}</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {insight.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </FadeIn>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
