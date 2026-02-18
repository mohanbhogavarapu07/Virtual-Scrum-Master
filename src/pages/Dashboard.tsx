import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatusBadge } from "@/components/ui/status-badge";
import { useAuth } from "@/context/AuthContext";
import { useAllTasks, useDashboard, useProjects } from "@/hooks/useApiHooks";
import { motion } from "framer-motion";
import {
  AlertTriangle, CheckCircle2, Clock, FolderKanban, Loader2, ListTodo,
  Target, TrendingUp, Users, Zap, ArrowRight,
} from "lucide-react";
import { useMemo } from "react";
import { Link } from "react-router-dom";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Progress } from "@/components/ui/progress";
import { PageLoading } from "@/components/ui/page-loading";

const Dashboard = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";
  const { data: dash, isLoading } = useDashboard();
  const { data: projects = [] } = useProjects();
  const { data: tasks = [] } = useAllTasks();

  const adminDash = dash && "total_projects" in dash ? dash : null;
  const empDash = dash && "my_projects" in dash ? dash : null;
  const totalProjects = isAdmin ? (adminDash?.total_projects ?? projects.length) : (empDash?.my_projects?.length ?? 0);
  const totalTasks = isAdmin ? (adminDash?.total_tasks ?? tasks.length) : (empDash?.my_tasks?.length ?? 0);
  const totalUsers = adminDash?.total_users ?? 0;
  const tasksByStatus = adminDash?.tasks_by_status ?? {};
  const doneTasks = tasksByStatus["DONE"] ?? tasks.filter((t) => t.status === "DONE").length;
  const inProgressTasks = tasksByStatus["IN_PROGRESS"] ?? tasks.filter((t) => t.status === "IN_PROGRESS").length;
  const todoTasks = tasksByStatus["TODO"] ?? tasks.filter((t) => t.status === "TODO").length;
  const bottlenecks = adminDash?.bottlenecks ?? [];
  const sprintsByStatus = adminDash?.sprints_by_status ?? {};
  const completionRate = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  const taskDistribution = useMemo(() => [
    { name: "Done", value: doneTasks, color: "hsl(var(--success))" },
    { name: "In Progress", value: inProgressTasks, color: "hsl(var(--primary))" },
    { name: "To Do", value: todoTasks, color: "hsl(var(--muted-foreground))" },
  ], [doneTasks, inProgressTasks, todoTasks]);

  const recentTasks = useMemo(() => {
    const allTasks = isAdmin ? tasks : (empDash?.my_tasks ?? tasks);
    return [...allTasks].sort((a, b) => new Date(b.updated_at ?? b.created_at).getTime() - new Date(a.updated_at ?? a.created_at).getTime()).slice(0, 6);
  }, [tasks, empDash, isAdmin]);

  const myProjects = useMemo(() => {
    if (isAdmin) return (Array.isArray(projects) ? projects : []).slice(0, 5);
    return empDash?.my_projects?.slice(0, 5) ?? [];
  }, [isAdmin, projects, empDash]);

  if (isLoading) return <PageLoading />;

  const metrics = [
    { title: "Projects", value: totalProjects, icon: FolderKanban, color: "text-[hsl(var(--primary))]", bg: "bg-[hsl(var(--primary)/0.1)]" },
    ...(isAdmin ? [{ title: "Team Members", value: totalUsers, icon: Users, color: "text-[hsl(var(--accent))]", bg: "bg-[hsl(var(--accent)/0.1)]" }] : []),
    { title: "To Do", value: todoTasks, icon: Clock, color: "text-[hsl(var(--warning))]", bg: "bg-[hsl(var(--warning)/0.1)]" },
    { title: "In Progress", value: inProgressTasks, icon: Target, color: "text-[hsl(var(--primary))]", bg: "bg-[hsl(var(--primary)/0.1)]" },
    { title: "Completed", value: doneTasks, icon: CheckCircle2, color: "text-[hsl(var(--success))]", bg: "bg-[hsl(var(--success)/0.1)]" },
    { title: "Total Tasks", value: totalTasks, icon: Zap, color: "text-[hsl(var(--accent))]", bg: "bg-[hsl(var(--accent)/0.1)]" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <PageHeader
          title="Dashboard"
          description={isAdmin ? "Admin Overview — Organization-wide metrics" : `Welcome back, ${user?.full_name}`}
          breadcrumbs={[{ label: "Dashboard" }]}
        />

        {/* Metric Cards */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3"
        >
          {metrics.map((m, i) => (
            <motion.div
              key={m.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * (i + 1) }}
              className="bg-card border border-border rounded-lg p-4 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs font-medium text-muted-foreground mb-1">{m.title}</p>
                  <p className="text-2xl font-semibold tracking-tight">{m.value}</p>
                </div>
                <div className={`p-2 rounded-lg ${m.bg}`}>
                  <m.icon className={`w-4 h-4 ${m.color}`} />
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Main panels */}
        <div className="grid grid-cols-12 gap-4">
          {/* Task Distribution */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="col-span-12 lg:col-span-4 bg-card border border-border rounded-lg"
          >
            <div className="px-4 py-3 border-b border-border flex items-center justify-between">
              <h3 className="text-sm font-semibold">Task Distribution</h3>
              <span className="text-xs text-muted-foreground">{completionRate}% done</span>
            </div>
            <div className="p-4">
              {totalTasks > 0 ? (
                <div className="flex items-center gap-4">
                  <div className="w-32 h-32 flex-shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={taskDistribution} cx="50%" cy="50%" innerRadius={30} outerRadius={55} paddingAngle={2} dataKey="value" strokeWidth={0}>
                          {taskDistribution.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex-1 space-y-3">
                    {taskDistribution.map(item => (
                      <div key={item.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                          <span className="text-xs text-muted-foreground">{item.name}</span>
                        </div>
                        <span className="text-sm font-semibold">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">No tasks yet</p>
              )}
            </div>
          </motion.div>

          {/* Completion Progress & Sprint Status */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="col-span-12 lg:col-span-4 space-y-4"
          >
            {/* Completion Rate */}
            <div className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold">Overall Completion</h3>
                <span className="text-lg font-bold text-[hsl(var(--primary))]">{completionRate}%</span>
              </div>
              <Progress value={completionRate} className="h-2.5" />
              <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                <span>{doneTasks} completed</span>
                <span>{totalTasks - doneTasks} remaining</span>
              </div>
            </div>

            {/* Sprint Status (Admin only) */}
            {isAdmin && Object.keys(sprintsByStatus).length > 0 && (
              <div className="bg-card border border-border rounded-lg">
                <div className="px-4 py-3 border-b border-border">
                  <h3 className="text-sm font-semibold">Sprint Status</h3>
                </div>
                <div className="p-4 space-y-2.5">
                  {Object.entries(sprintsByStatus).map(([status, count]) => (
                    <div key={status} className="flex items-center justify-between">
                      <StatusBadge status={status} />
                      <span className="text-sm font-semibold">{count as number}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>

          {/* Blockers & Alerts (Admin) or Recent Activity */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
            className="col-span-12 lg:col-span-4 bg-card border border-border rounded-lg"
          >
            <div className="px-4 py-3 border-b border-border flex items-center justify-between">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                {isAdmin && bottlenecks.length > 0 ? (
                  <><AlertTriangle className="w-4 h-4 text-[hsl(var(--warning))]" /> Bottlenecks</>
                ) : (
                  <><ListTodo className="w-4 h-4 text-muted-foreground" /> Recent Activity</>
                )}
              </h3>
              {isAdmin && bottlenecks.length > 0 && (
                <span className="text-xs font-medium text-[hsl(var(--warning))] bg-[hsl(var(--warning)/0.1)] px-2 py-0.5 rounded-full">{bottlenecks.length}</span>
              )}
            </div>
            <div className="divide-y divide-border max-h-64 overflow-y-auto">
              {isAdmin && bottlenecks.length > 0 ? (
                bottlenecks.slice(0, 6).map((b: { task_id?: number; title?: string; status?: string; days_in_progress?: number }) => (
                  <div key={b.task_id} className="px-4 py-3 hover:bg-muted/30 transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{b.title ?? "Task"}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <StatusBadge status={b.status ?? "TODO"} />
                          {b.days_in_progress != null && (
                            <span className="text-xs text-muted-foreground">{b.days_in_progress}d stuck</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : recentTasks.length > 0 ? (
                recentTasks.map((t) => (
                  <Link key={t.task_id} to={`/sprint/${t.sprint_id}`} className="block px-4 py-3 hover:bg-muted/30 transition-colors">
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{t.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{new Date(t.updated_at ?? t.created_at).toLocaleDateString()}</p>
                      </div>
                      <StatusBadge status={t.status} showDot={false} />
                    </div>
                  </Link>
                ))
              ) : (
                <p className="px-4 py-6 text-sm text-muted-foreground text-center">No recent activity</p>
              )}
            </div>
          </motion.div>
        </div>

        {/* Projects List */}
        {myProjects.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="bg-card border border-border rounded-lg"
          >
            <div className="px-4 py-3 border-b border-border flex items-center justify-between">
              <h3 className="text-sm font-semibold">{isAdmin ? "All Projects" : "My Projects"}</h3>
              <Link to="/projects" className="text-xs text-[hsl(var(--primary))] hover:underline flex items-center gap-1">
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="divide-y divide-border">
              {myProjects.map((p) => (
                <Link key={p.project_id} to={`/project/${p.project_id}`} className="flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{p.project_name}</p>
                    {p.description && <p className="text-xs text-muted-foreground truncate mt-0.5">{p.description}</p>}
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-xs text-muted-foreground">
                      {p.start_date ? new Date(p.start_date).toLocaleDateString() : "—"}
                    </span>
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
