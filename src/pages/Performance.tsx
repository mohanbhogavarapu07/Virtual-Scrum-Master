import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageLoading } from "@/components/ui/page-loading";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/context/AuthContext";
import {
  useAllTasks,
  useProjectMembers,
  useProjectSprints,
  useProjects,
  useUserProjectCounts,
  useUsers,
} from "@/hooks/useApiHooks";
import type { ApiTask, ProjectMember } from "@/types";
import { motion } from "framer-motion";
import { Activity, CheckCircle2, FolderKanban, Loader2, Target, TrendingUp } from "lucide-react";
import { useMemo, useState } from "react";

type UserStats = {
  user_id: number;
  full_name: string;
  email: string;
  tasksAssigned: number;
  tasksCompleted: number;
  completionRate: number;
  projectsContributing: number;
};

function computeUserStats(tasks: ApiTask[], userId: number, fullName: string, email: string, projectCount: number): UserStats {
  const userTasks = tasks.filter((t) => t.assigned_to_user_id === userId);
  const completed = userTasks.filter((t) => t.status === "DONE").length;
  const total = userTasks.length;
  return { user_id: userId, full_name: fullName, email, tasksAssigned: total, tasksCompleted: completed, completionRate: total ? Math.round((completed / total) * 100) : 0, projectsContributing: projectCount };
}

const Performance = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";
  const { data: tasksRaw = [], isLoading: tasksLoading } = useAllTasks();
  const tasks = Array.isArray(tasksRaw) ? tasksRaw : [];
  const { data: projects = [] } = useProjects();
  const projectsList = Array.isArray(projects) ? projects : [];
  const { data: users = [] } = useUsers();
  const usersList = Array.isArray(users) ? users : [];
  const { data: userProjectCounts = {}, isLoading: countsLoading } = useUserProjectCounts();
  const [selectedProjectId, setSelectedProjectId] = useState<number>(0);
  const [selectedUserId, setSelectedUserId] = useState<number>(0);
  const { data: projectSprints = [] } = useProjectSprints(selectedProjectId);
  const { data: projectMembers = [], isLoading: membersLoading } = useProjectMembers(selectedProjectId);
  const sprintIds = useMemo(() => projectSprints.map((s) => s.sprint_id), [projectSprints]);
  const tasksInProject = useMemo(() => tasks.filter((t) => sprintIds.includes(t.sprint_id)), [tasks, sprintIds]);

  const myStats = useMemo((): UserStats | null => {
    if (!user) return null;
    const projectCount = isAdmin ? (userProjectCounts[user.user_id] ?? 0) : projectsList.length;
    return computeUserStats(tasks, user.user_id, user.full_name ?? "", user.email ?? "", projectCount);
  }, [user, tasks, isAdmin, userProjectCounts, projectsList.length]);

  const selectedUserStats = useMemo((): UserStats[] => {
    if (!isAdmin || !selectedUserId) return [];
    const u = usersList.find((x) => x.user_id === selectedUserId);
    if (!u) return [];
    return [computeUserStats(tasks, u.user_id, u.full_name, u.email, userProjectCounts[u.user_id] ?? 0)];
  }, [isAdmin, selectedUserId, usersList, tasks, userProjectCounts]);

  const byProjectStats = useMemo((): UserStats[] => {
    if (!selectedProjectId || !projectMembers.length) return [];
    return (projectMembers as ProjectMember[]).map((m) => {
      const ut = tasksInProject.filter((t) => t.assigned_to_user_id === m.user_id);
      const completed = ut.filter((t) => t.status === "DONE").length;
      return { user_id: m.user_id, full_name: m.full_name, email: m.email, tasksAssigned: ut.length, tasksCompleted: completed, completionRate: ut.length ? Math.round((completed / ut.length) * 100) : 0, projectsContributing: 1 };
    });
  }, [selectedProjectId, projectMembers, tasksInProject]);

  const loading = tasksLoading || (isAdmin && countsLoading);
  if (loading && !myStats) return <PageLoading />;

  const StatCard = ({ title, value, sub, icon: Icon, color, bg }: { title: string; value: number | string; sub?: string; icon: React.ElementType; color: string; bg: string }) => (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-semibold mt-1">{value}</p>
          {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
        </div>
        <div className={`p-2 rounded-lg ${bg}`}><Icon className={`w-4 h-4 ${color}`} /></div>
      </div>
    </div>
  );

  const StatsTable = ({ rows, tableLoading, showProjects = true }: { rows: UserStats[]; tableLoading: boolean; showProjects?: boolean }) => {
    if (tableLoading) return <div className="flex items-center justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-[hsl(var(--primary))]" /></div>;
    if (!rows.length) return <p className="text-sm text-muted-foreground py-6 text-center">Select an option above to view performance data.</p>;
    return (
      <div className="rounded-lg border border-border overflow-x-auto">
        <table className="w-full text-sm data-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Tasks</th>
              <th>Completed</th>
              <th>Rate</th>
              {showProjects && <th>Projects</th>}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.user_id}>
                <td>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[hsl(var(--primary)/0.1)] flex items-center justify-center text-xs font-medium text-[hsl(var(--primary))]">
                      {row.full_name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                    </div>
                    <div>
                      <p className="font-medium">{row.full_name}</p>
                      <p className="text-xs text-muted-foreground">{row.email}</p>
                    </div>
                  </div>
                </td>
                <td className="font-medium">{row.tasksAssigned}</td>
                <td className="font-medium">{row.tasksCompleted}</td>
                <td>
                  <div className="flex items-center gap-2">
                    <Progress value={row.completionRate} className="h-1.5 w-16" />
                    <span className={`text-xs font-medium ${row.completionRate >= 80 ? "text-[hsl(var(--success))]" : row.completionRate >= 50 ? "text-[hsl(var(--primary))]" : "text-muted-foreground"}`}>
                      {row.completionRate}%
                    </span>
                  </div>
                </td>
                {showProjects && <td className="font-medium">{row.projectsContributing}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title="Performance"
          description="Task completion and team productivity metrics"
          breadcrumbs={[{ label: "Performance" }]}
        />

        {/* My Performance */}
        {myStats && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
              <Target className="w-4 h-4" /> My Performance
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <StatCard title="Tasks Assigned" value={myStats.tasksAssigned} sub="Total tasks assigned" icon={Activity} color="text-[hsl(var(--primary))]" bg="bg-[hsl(var(--primary)/0.1)]" />
              <StatCard title="Tasks Completed" value={myStats.tasksCompleted} sub="Marked as done" icon={CheckCircle2} color="text-[hsl(var(--success))]" bg="bg-[hsl(var(--success)/0.1)]" />
              <StatCard title="Completion Rate" value={`${myStats.completionRate}%`} sub="Completed vs assigned" icon={TrendingUp} color="text-[hsl(var(--primary))]" bg="bg-[hsl(var(--primary)/0.1)]" />
              <StatCard title="Projects" value={myStats.projectsContributing} sub="Contributing to" icon={FolderKanban} color="text-[hsl(var(--accent))]" bg="bg-[hsl(var(--accent)/0.1)]" />
            </div>
          </motion.div>
        )}

        {isAdmin && (
          <>
            {/* By User */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="bg-card border border-border rounded-lg"
            >
              <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                <h3 className="text-sm font-semibold">Performance by User</h3>
                <select
                  className="h-8 rounded-md border border-input bg-background px-3 text-xs w-56"
                  value={selectedUserId || ""}
                  onChange={(e) => setSelectedUserId(Number(e.target.value))}
                >
                  <option value="">Select user...</option>
                  {usersList.map((u) => <option key={u.user_id} value={u.user_id}>{u.full_name}</option>)}
                </select>
              </div>
              <div className="p-4">
                <StatsTable rows={selectedUserStats} tableLoading={tasksLoading || countsLoading} showProjects />
              </div>
            </motion.div>

            {/* By Project */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
              className="bg-card border border-border rounded-lg"
            >
              <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                <h3 className="text-sm font-semibold">Performance by Project</h3>
                <select
                  className="h-8 rounded-md border border-input bg-background px-3 text-xs w-56"
                  value={selectedProjectId || ""}
                  onChange={(e) => setSelectedProjectId(Number(e.target.value))}
                >
                  <option value="">Select project...</option>
                  {projectsList.map((p) => <option key={p.project_id} value={p.project_id}>{p.project_name}</option>)}
                </select>
              </div>
              <div className="p-4">
                <StatsTable rows={byProjectStats} tableLoading={membersLoading} showProjects={false} />
              </div>
            </motion.div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Performance;
