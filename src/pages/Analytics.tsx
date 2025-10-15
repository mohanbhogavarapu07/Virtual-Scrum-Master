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
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground mt-1">Track team performance and project metrics</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Sprint Burndown</CardTitle>
              <CardDescription>Current sprint progress vs ideal burndown</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={burndownData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="ideal"
                    stroke="hsl(var(--muted-foreground))"
                    strokeDasharray="5 5"
                    name="Ideal"
                  />
                  <Line
                    type="monotone"
                    dataKey="actual"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    name="Actual"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Task Distribution</CardTitle>
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
                      borderRadius: "8px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Team Performance</CardTitle>
              <CardDescription>Individual member contribution this sprint</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={assigneePerformance}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="member" />
                  <YAxis />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Bar dataKey="completed" fill="hsl(var(--primary))" name="Completed" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="inProgress" fill="hsl(var(--accent))" name="In Progress" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Analytics;
