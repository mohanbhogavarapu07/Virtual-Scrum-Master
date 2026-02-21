import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageLoading } from "@/components/ui/page-loading";
import { StatusBadge } from "@/components/ui/status-badge";
import { useAllTasks, useDashboard, useProjects } from "@/hooks/useApiHooks";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";
import { CheckCircle2, Clock, FolderKanban, Target, TrendingUp, Zap, Calendar, AlertCircle } from "lucide-react";
import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import { useProject, useProjectSprints } from "@/hooks/useApiHooks";

const Analytics = () => {
  const { id: projectIdParam } = useParams();
  const projectId = projectIdParam ? Number(projectIdParam) : null;
  const { data: tasksRaw = [], isLoading } = useAllTasks();
  const allTasks = Array.isArray(tasksRaw) ? tasksRaw : [];
  const { data: project } = useProject(projectId ?? 0);
  const { data: projectSprintsRaw = [] } = useProjectSprints(projectId ?? 0);
  const projectSprints = Array.isArray(projectSprintsRaw) ? projectSprintsRaw : [];
  const projectSprintIds = useMemo(() => projectSprints.map((s) => s.sprint_id), [projectSprints]);
  const tasks = useMemo(() => {
    if (projectId != null) return allTasks.filter((t) => projectSprintIds.includes(t.sprint_id));
    return allTasks;
  }, [allTasks, projectId, projectSprintIds]);
  const { data: projects = [] } = useProjects();
  const { data: dash } = useDashboard();
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";
  const adminDash = dash && "total_projects" in dash ? dash : null;
  const isProjectScoped = isAdmin && projectId != null;

  const todoTasks = tasks.filter(t => t.status === "TODO").length;
  const inProgressTasks = tasks.filter(t => t.status === "IN_PROGRESS").length;
  const doneTasks = tasks.filter(t => t.status === "DONE").length;
  const totalTasks = tasks.length;
  const completionRate = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  const taskDistribution = [
    { name: "Done", value: doneTasks, color: "hsl(var(--success))" },
    { name: "In Progress", value: inProgressTasks, color: "hsl(var(--primary))" },
    { name: "To Do", value: todoTasks, color: "hsl(var(--muted-foreground))" },
  ];

  const barData = [
    { status: "To Do", count: todoTasks, fill: "hsl(var(--muted-foreground))" },
    { status: "In Progress", count: inProgressTasks, fill: "hsl(var(--primary))" },
    { status: "Done", count: doneTasks, fill: "hsl(var(--success))" },
  ];

  const _sprintStatus = (s: { status?: string }, status: string) => (s.status ?? "").toUpperCase() === status.toUpperCase();
  const sprintsByStatus = isProjectScoped
    ? { ACTIVE: projectSprints.filter((s) => _sprintStatus(s, "ACTIVE")).length, COMPLETED: projectSprints.filter((s) => _sprintStatus(s, "COMPLETED")).length, PLANNED: projectSprints.filter((s) => _sprintStatus(s, "PLANNED")).length }
    : (adminDash?.sprints_by_status ?? {});
  const sprintData = useMemo(() =>
    Object.entries(sprintsByStatus).map(([status, count]) => ({
      name: status, value: count as number,
      color: status.toUpperCase() === "ACTIVE" ? "hsl(var(--primary))" : status.toUpperCase() === "COMPLETED" ? "hsl(var(--success))" : "hsl(var(--muted-foreground))",
    })), [sprintsByStatus]);

  const activeSprint = useMemo(() => {
    const active = projectSprints.find((s) => _sprintStatus(s, "ACTIVE"));
    if (active) return active;
    const sorted = [...projectSprints].sort((a, b) => new Date(b.end_date).getTime() - new Date(a.end_date).getTime());
    return sorted[0] ?? null;
  }, [projectSprints]);

  const forecastMessage = useMemo(() => {
    if (!activeSprint || totalTasks === 0) return null;
    const endDate = new Date(activeSprint.end_date);
    const now = new Date();
    const daysTotal = Math.max(1, Math.ceil((endDate.getTime() - new Date(activeSprint.start_date).getTime()) / (24 * 60 * 60 * 1000)));
    const daysRemaining = Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)));
    const remainingTasks = todoTasks + inProgressTasks;
    const pctTimeElapsed = Math.min(100, Math.round(((daysTotal - daysRemaining) / daysTotal) * 100));
    const onTrack = completionRate >= pctTimeElapsed - 15;
    if (daysRemaining <= 0) return { text: "Sprint period ended.", variant: "muted" as const };
    if (remainingTasks === 0) return { text: `All tasks complete. Sprint ends ${endDate.toLocaleDateString()}.`, variant: "success" as const };
    if (onTrack) return { text: `On track: ${remainingTasks} task(s) left, ${daysRemaining} day(s) to ${endDate.toLocaleDateString()}.`, variant: "success" as const };
    return { text: `At risk: ${remainingTasks} task(s) remaining with ${daysRemaining} day(s) left. Consider reprioritizing.`, variant: "warning" as const };
  }, [activeSprint, totalTasks, todoTasks, inProgressTasks, completionRate]);

  if (isLoading) return <PageLoading />;

  const metrics = [
    { title: "Total Tasks", value: totalTasks, icon: Zap, color: "text-[hsl(var(--accent))]", bg: "bg-[hsl(var(--accent)/0.1)]" },
    { title: "Completed", value: doneTasks, icon: CheckCircle2, color: "text-[hsl(var(--success))]", bg: "bg-[hsl(var(--success)/0.1)]" },
    { title: "In Progress", value: inProgressTasks, icon: Target, color: "text-[hsl(var(--primary))]", bg: "bg-[hsl(var(--primary)/0.1)]" },
    { title: "Projects", value: isProjectScoped ? 1 : (Array.isArray(projects) ? projects : []).length, icon: FolderKanban, color: "text-[hsl(var(--primary))]", bg: "bg-[hsl(var(--primary)/0.1)]" },
  ];

  const tooltipStyle = { backgroundColor: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' };

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <PageHeader
          title="Analytics"
          description={isProjectScoped && project ? `${project.project_name} — Metrics` : "Performance metrics and insights"}
          breadcrumbs={isProjectScoped && project ? [{ label: "Projects", href: "/projects" }, { label: project.project_name, href: `/project/${projectId}` }, { label: "Analytics" }] : [{ label: "Analytics" }]}
        />

        {/* Metric cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {metrics.map((m, i) => (
            <motion.div key={m.title} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * (i + 1) }}
              className="bg-card border border-border rounded-lg p-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">{m.title}</p>
                  <p className="text-2xl font-semibold mt-1">{m.value}</p>
                </div>
                <div className={`p-2 rounded-lg ${m.bg}`}><m.icon className={`w-4 h-4 ${m.color}`} /></div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Completion progress */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="bg-card border border-border rounded-lg p-4"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[hsl(var(--primary))]" />
              <h3 className="text-sm font-semibold">Overall Completion Rate</h3>
            </div>
            <span className="text-lg font-bold text-[hsl(var(--primary))]">{completionRate}%</span>
          </div>
          <Progress value={completionRate} className="h-3" />
          <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
            <span>{doneTasks} of {totalTasks} tasks completed</span>
            <span>{todoTasks} pending · {inProgressTasks} active</span>
          </div>
        </motion.div>

        {/* Sprint forecast / outlook (project-scoped when we have sprint dates) */}
        {isProjectScoped && (activeSprint || forecastMessage) && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}
            className="bg-card border border-border rounded-lg p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-[hsl(var(--primary))]" />
              <h3 className="text-sm font-semibold">Sprint forecast</h3>
            </div>
            {activeSprint && (
              <p className="text-xs text-muted-foreground mb-2">
                {activeSprint.sprint_name} · {new Date(activeSprint.start_date).toLocaleDateString()} – {new Date(activeSprint.end_date).toLocaleDateString()}
              </p>
            )}
            {forecastMessage && (
              <div className={forecastMessage.variant === "success" ? "text-[hsl(var(--success))]" : forecastMessage.variant === "warning" ? "text-[hsl(var(--warning))] flex items-center gap-2" : "text-muted-foreground"}>
                {forecastMessage.variant === "warning" && <AlertCircle className="w-4 h-4 flex-shrink-0" />}
                <span className="text-sm">{forecastMessage.text}</span>
              </div>
            )}
            {!forecastMessage && activeSprint && totalTasks > 0 && (
              <p className="text-sm text-muted-foreground">{completionRate}% complete · Sprint ends {new Date(activeSprint.end_date).toLocaleDateString()}</p>
            )}
          </motion.div>
        )}

        {/* Charts */}
        <div className="grid grid-cols-12 gap-4">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="col-span-12 lg:col-span-5 bg-card border border-border rounded-lg"
          >
            <div className="px-4 py-3 border-b border-border"><h3 className="text-sm font-semibold">Task Distribution</h3></div>
            <div className="p-4 h-64 flex items-center justify-center">
              {totalTasks > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={taskDistribution} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2} dataKey="value" strokeWidth={0}>
                      {taskDistribution.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
              ) : <p className="text-sm text-muted-foreground">No data</p>}
            </div>
            <div className="px-4 pb-4 grid grid-cols-3 gap-2">
              {taskDistribution.map(item => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-xs text-muted-foreground">{item.name}</span>
                  <span className="text-xs font-semibold ml-auto">{item.value}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
            className="col-span-12 lg:col-span-7 bg-card border border-border rounded-lg"
          >
            <div className="px-4 py-3 border-b border-border"><h3 className="text-sm font-semibold">Tasks by Status</h3></div>
            <div className="p-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="status" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {barData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* Sprint breakdown (admin) */}
        {isAdmin && sprintData.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="bg-card border border-border rounded-lg"
          >
            <div className="px-4 py-3 border-b border-border"><h3 className="text-sm font-semibold">Sprints by Status</h3></div>
            <div className="p-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {sprintData.map(s => (
                  <div key={s.name} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <StatusBadge status={s.name} />
                    <span className="text-lg font-bold">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Analytics;
