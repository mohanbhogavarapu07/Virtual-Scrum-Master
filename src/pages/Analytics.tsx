import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useApp } from "@/context/AppContext";
import { FadeIn } from "@/components/ui/fade-in";

const Analytics = () => {
  const { tasks } = useApp();
  
  const completedTasks = tasks.filter(t => t.status === "done").length;
  const inProgressTasks = tasks.filter(t => t.status === "inprogress").length;
  const todoTasks = tasks.filter(t => t.status === "todo").length;
  const reviewTasks = tasks.filter(t => t.status === "review").length;
  
  const taskDistribution = [
    { name: "Completed", value: completedTasks, color: "hsl(var(--primary))" },
    { name: "In Progress", value: inProgressTasks, color: "hsl(var(--accent))" },
    { name: "Review", value: reviewTasks, color: "hsl(142, 76%, 36%)" },
    { name: "To Do", value: todoTasks, color: "hsl(var(--muted-foreground))" },
  ];
  
  const assigneePerformance = Object.entries(
    tasks.reduce((acc, task) => {
      if (!acc[task.assignee]) {
        acc[task.assignee] = { completed: 0, inProgress: 0 };
      }
      if (task.status === "done") acc[task.assignee].completed++;
      if (task.status === "inprogress") acc[task.assignee].inProgress++;
      return acc;
    }, {} as Record<string, { completed: number; inProgress: number }>)
  ).map(([member, stats]) => ({
    member,
    completed: stats.completed,
    inProgress: stats.inProgress,
  }));
  
  const burndownData = [
    { day: "Day 1", ideal: 100, actual: 100 },
    { day: "Day 2", ideal: 85, actual: 92 },
    { day: "Day 3", ideal: 70, actual: 85 },
    { day: "Day 4", ideal: 55, actual: 70 },
    { day: "Day 5", ideal: 40, actual: 55 },
    { day: "Day 6", ideal: 25, actual: 40 },
    { day: "Day 7", ideal: 10, actual: 25 },
    { day: "Day 8", ideal: 0, actual: 12 },
  ];
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <FadeIn>
          <div>
            <h1 className="text-4xl font-bold tracking-tight mb-2">Analytics</h1>
            <p className="text-muted-foreground text-lg">Track team performance and project metrics</p>
          </div>
        </FadeIn>

        <div className="grid gap-6 md:grid-cols-2">
          <FadeIn delay={0.1}>
            <Card className="border-none shadow-sm bg-card/50 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl">Sprint Burndown</CardTitle>
                <CardDescription>Current sprint progress vs ideal burndown</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={burndownData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.05} stroke="hsl(var(--border))" />
                    <XAxis dataKey="day" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                    <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--popover))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "12px",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)"
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Line
                      type="monotone"
                      dataKey="ideal"
                      stroke="hsl(var(--muted-foreground))"
                      strokeDasharray="5 5"
                      strokeWidth={2}
                      name="Ideal"
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="actual"
                      stroke="hsl(var(--primary))"
                      strokeWidth={3}
                      name="Actual"
                      dot={{ fill: 'hsl(var(--primary))', r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </FadeIn>

          <FadeIn delay={0.2}>
            <Card className="border-none shadow-sm bg-card/50 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl">Task Distribution</CardTitle>
                <CardDescription>Overview of all tasks by status</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={taskDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {taskDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--popover))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "12px",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)"
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </FadeIn>

          <FadeIn delay={0.3} className="md:col-span-2">
            <Card className="border-none shadow-sm bg-card/50 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl">Team Performance</CardTitle>
                <CardDescription>Individual member contribution this sprint</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={assigneePerformance}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.05} stroke="hsl(var(--border))" />
                    <XAxis dataKey="member" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                    <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--popover))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "12px",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)"
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Bar dataKey="completed" fill="hsl(var(--primary))" name="Completed" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="inProgress" fill="hsl(var(--accent))" name="In Progress" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </FadeIn>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Analytics;
