import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAllTasks, useProjects } from "@/hooks/useApiHooks";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, Target, AlertTriangle, Download, Loader2 } from "lucide-react";

const Analytics = () => {
  const { data: tasks = [], isLoading } = useAllTasks();
  const { data: projects = [] } = useProjects();

  const todoTasks = tasks.filter(t => t.status === "TODO").length;
  const inProgressTasks = tasks.filter(t => t.status === "IN_PROGRESS").length;
  const doneTasks = tasks.filter(t => t.status === "DONE").length;
  const totalTasks = tasks.length;

  const taskDistribution = [
    { name: "Done", value: doneTasks, color: "hsl(var(--success))" },
    { name: "In Progress", value: inProgressTasks, color: "hsl(var(--primary))" },
    { name: "To Do", value: todoTasks, color: "hsl(var(--muted-foreground))" },
  ];

  if (isLoading) {
    return <DashboardLayout><div className="flex items-center justify-center h-96"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div></DashboardLayout>;
  }

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
          <div><h1 className="text-xl font-semibold">Analytics</h1><p className="text-sm text-muted-foreground">Performance metrics</p></div>
          <Button variant="outline" size="sm" className="gap-1.5"><Download className="w-4 h-4" />Export</Button>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-card border border-border rounded-lg p-4">
            <span className="text-xs font-medium text-muted-foreground">Total Tasks</span>
            <p className="text-2xl font-semibold mt-1">{totalTasks}</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <span className="text-xs font-medium text-muted-foreground">Completed</span>
            <p className="text-2xl font-semibold mt-1">{doneTasks}</p>
            <p className="text-xs text-success mt-1">{totalTasks > 0 ? `${Math.round((doneTasks / totalTasks) * 100)}%` : "0%"}</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <span className="text-xs font-medium text-muted-foreground">In Progress</span>
            <p className="text-2xl font-semibold mt-1">{inProgressTasks}</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <span className="text-xs font-medium text-muted-foreground">Projects</span>
            <p className="text-2xl font-semibold mt-1">{projects.length}</p>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 lg:col-span-5 bg-card border border-border rounded-lg">
            <div className="px-4 py-3 border-b border-border"><h3 className="text-sm font-semibold">Task Distribution</h3></div>
            <div className="p-4 h-64 flex items-center justify-center">
              {totalTasks > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart><Pie data={taskDistribution} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2} dataKey="value">
                    {taskDistribution.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie><Tooltip contentStyle={{ backgroundColor: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: '6px', fontSize: '12px' }} /></PieChart>
                </ResponsiveContainer>
              ) : <p className="text-sm text-muted-foreground">No data</p>}
            </div>
            <div className="px-4 pb-4 grid grid-cols-3 gap-2">
              {taskDistribution.map(item => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-xs text-muted-foreground">{item.name}</span>
                  <span className="text-xs font-medium ml-auto">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="col-span-12 lg:col-span-7 bg-card border border-border rounded-lg">
            <div className="px-4 py-3 border-b border-border"><h3 className="text-sm font-semibold">Tasks by Status</h3></div>
            <div className="p-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[{ status: "To Do", count: todoTasks }, { status: "In Progress", count: inProgressTasks }, { status: "Done", count: doneTasks }]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="status" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: '6px', fontSize: '12px' }} />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Analytics;
