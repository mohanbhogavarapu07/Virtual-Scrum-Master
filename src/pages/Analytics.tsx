import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useApp } from "@/context/AppContext";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
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
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  AlertTriangle,
  Download,
  Calendar
} from "lucide-react";

const Analytics = () => {
  const { tasks, sprintMetrics, teamStats } = useApp();
  
  const completedTasks = tasks.filter(t => t.status === "done").length;
  const inProgressTasks = tasks.filter(t => t.status === "inprogress").length;
  const todoTasks = tasks.filter(t => t.status === "todo").length;
  const reviewTasks = tasks.filter(t => t.status === "review").length;
  
  const taskDistribution = [
    { name: "Done", value: completedTasks, color: "hsl(var(--success))" },
    { name: "In Progress", value: inProgressTasks, color: "hsl(var(--primary))" },
    { name: "Review", value: reviewTasks, color: "hsl(var(--warning))" },
    { name: "To Do", value: todoTasks, color: "hsl(var(--muted-foreground))" },
  ];

  const velocityTrend = [
    { sprint: "Sprint 1", velocity: 38, target: 40 },
    { sprint: "Sprint 2", velocity: 42, target: 40 },
    { sprint: "Sprint 3", velocity: 45, target: 45 },
    { sprint: "Sprint 4", velocity: 47, target: 45 },
    { sprint: "Sprint 5", velocity: 55, target: 50 },
  ];

  const burndownData = sprintMetrics.burndownIdeal.map((ideal, i) => ({
    day: `Day ${i + 1}`,
    ideal,
    actual: sprintMetrics.burndownActual[i] ?? null,
  }));

  const workloadData = teamStats.map(member => ({
    name: member.initials,
    completed: member.completed * 3,
    inProgress: member.inProgress * 3,
    capacity: 20,
  }));

  const bottleneckData = [
    { stage: "Development", avgDays: 2.5, tasks: 4 },
    { stage: "Code Review", avgDays: 3.2, tasks: 2 },
    { stage: "Testing", avgDays: 1.8, tasks: 3 },
    { stage: "Deployment", avgDays: 0.5, tasks: 1 },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-4">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-xl font-semibold">Analytics</h1>
            <p className="text-sm text-muted-foreground">Performance metrics and insights</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-1.5">
              <Calendar className="w-4 h-4" />
              Last 30 days
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5">
              <Download className="w-4 h-4" />
              Export
            </Button>
          </div>
        </motion.div>

        {/* Key Metrics */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3"
        >
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground">Avg Velocity</span>
              <TrendingUp className="w-4 h-4 text-success" />
            </div>
            <p className="text-2xl font-semibold">45.4</p>
            <p className="text-xs text-success flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3" /> +18% vs last quarter
            </p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground">Cycle Time</span>
              <Target className="w-4 h-4 text-primary" />
            </div>
            <p className="text-2xl font-semibold">4.2d</p>
            <p className="text-xs text-muted-foreground mt-1">Avg task completion</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground">Sprint Success</span>
              <Target className="w-4 h-4 text-success" />
            </div>
            <p className="text-2xl font-semibold">82%</p>
            <p className="text-xs text-muted-foreground mt-1">Goals achieved</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground">Blockers</span>
              <AlertTriangle className="w-4 h-4 text-warning" />
            </div>
            <p className="text-2xl font-semibold">2</p>
            <p className="text-xs text-warning flex items-center gap-1 mt-1">
              <TrendingDown className="w-3 h-3" /> -40% vs avg
            </p>
          </div>
        </motion.div>

        {/* Charts Grid */}
        <div className="grid grid-cols-12 gap-4">
          {/* Velocity Trend */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="col-span-12 lg:col-span-8 bg-card border border-border rounded-lg"
          >
            <div className="px-4 py-3 border-b border-border flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold">Velocity Trend</h3>
                <p className="text-xs text-muted-foreground">Story points completed per sprint</p>
              </div>
              <Badge variant="outline" className="text-2xs">Last 5 sprints</Badge>
            </div>
            <div className="p-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={velocityTrend}>
                  <defs>
                    <linearGradient id="velocityGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="sprint" 
                    tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                    axisLine={{ stroke: 'hsl(var(--border))' }}
                  />
                  <YAxis 
                    tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--popover))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px',
                      fontSize: '12px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Line 
                    type="monotone" 
                    dataKey="target" 
                    stroke="hsl(var(--muted-foreground))" 
                    strokeDasharray="4 4"
                    strokeWidth={1.5}
                    dot={false}
                    name="Target"
                  />
                  <Area
                    type="monotone"
                    dataKey="velocity"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    fill="url(#velocityGradient)"
                    name="Actual"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Task Distribution */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="col-span-12 lg:col-span-4 bg-card border border-border rounded-lg"
          >
            <div className="px-4 py-3 border-b border-border">
              <h3 className="text-sm font-semibold">Task Distribution</h3>
              <p className="text-xs text-muted-foreground">Current sprint status</p>
            </div>
            <div className="p-4 h-64 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={taskDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {taskDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--popover))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="px-4 pb-4 grid grid-cols-2 gap-2">
              {taskDistribution.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-xs text-muted-foreground">{item.name}</span>
                  <span className="text-xs font-medium ml-auto">{item.value}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Burndown Chart */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="col-span-12 lg:col-span-6 bg-card border border-border rounded-lg"
          >
            <div className="px-4 py-3 border-b border-border flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold">Sprint Burndown</h3>
                <p className="text-xs text-muted-foreground">Ideal vs actual progress</p>
              </div>
              <Badge className="text-2xs bg-warning/10 text-warning border-0">Behind by 13pts</Badge>
            </div>
            <div className="p-4 h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={burndownData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="day" 
                    tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                    axisLine={{ stroke: 'hsl(var(--border))' }}
                  />
                  <YAxis 
                    tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--popover))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px',
                      fontSize: '12px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  <Line 
                    type="monotone" 
                    dataKey="ideal" 
                    stroke="hsl(var(--muted-foreground))" 
                    strokeDasharray="4 4"
                    strokeWidth={1.5}
                    dot={false}
                    name="Ideal"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="actual" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--primary))', r: 3 }}
                    name="Actual"
                    connectNulls={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Team Workload */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="col-span-12 lg:col-span-6 bg-card border border-border rounded-lg"
          >
            <div className="px-4 py-3 border-b border-border">
              <h3 className="text-sm font-semibold">Team Workload Distribution</h3>
              <p className="text-xs text-muted-foreground">Points per team member</p>
            </div>
            <div className="p-4 h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={workloadData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                  <XAxis 
                    type="number"
                    tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                    axisLine={{ stroke: 'hsl(var(--border))' }}
                  />
                  <YAxis 
                    type="category"
                    dataKey="name"
                    tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                    axisLine={false}
                    tickLine={false}
                    width={30}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--popover))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px',
                      fontSize: '12px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  <Bar dataKey="completed" stackId="a" fill="hsl(var(--success))" name="Completed" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="inProgress" stackId="a" fill="hsl(var(--primary))" name="In Progress" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Bottleneck Analysis */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="col-span-12 bg-card border border-border rounded-lg"
          >
            <div className="px-4 py-3 border-b border-border flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold">Bottleneck Analysis</h3>
                <p className="text-xs text-muted-foreground">Average time spent in each stage</p>
              </div>
              <Badge className="text-2xs bg-warning/10 text-warning border-0">Code Review needs attention</Badge>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-4 gap-4">
                {bottleneckData.map((stage, index) => (
                  <div key={stage.stage} className="text-center">
                    <div className="mb-2">
                      <div 
                        className={cn(
                          "h-24 rounded-lg flex items-end justify-center",
                          stage.avgDays > 3 ? "bg-warning/10" : "bg-primary/10"
                        )}
                      >
                        <div 
                          className={cn(
                            "w-full rounded-lg",
                            stage.avgDays > 3 ? "bg-warning" : "bg-primary"
                          )}
                          style={{ height: `${(stage.avgDays / 4) * 100}%` }}
                        />
                      </div>
                    </div>
                    <p className="text-sm font-semibold">{stage.avgDays}d</p>
                    <p className="text-xs text-muted-foreground">{stage.stage}</p>
                    <p className="text-2xs text-muted-foreground">{stage.tasks} tasks</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Analytics;
