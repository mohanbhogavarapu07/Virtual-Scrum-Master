import { DashboardLayout } from "@/components/layout/DashboardLayout";
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
import { Activity, CheckCircle2, FolderKanban, Loader2, Target } from "lucide-react";
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

function computeUserStats(
  tasks: ApiTask[],
  userId: number,
  fullName: string,
  email: string,
  projectCount: number
): UserStats {
  const userTasks = tasks.filter((t) => t.assigned_to_user_id === userId);
  const completed = userTasks.filter((t) => t.status === "DONE").length;
  const total = userTasks.length;
  return {
    user_id: userId,
    full_name: fullName,
    email,
    tasksAssigned: total,
    tasksCompleted: completed,
    completionRate: total ? Math.round((completed / total) * 100) : 0,
    projectsContributing: projectCount,
  };
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
  const { data: projectSprints = [] } = useProjectSprints(selectedProjectId);
  const { data: projectMembers = [], isLoading: membersLoading } =
    useProjectMembers(selectedProjectId);
  const sprintIds = useMemo(
    () => projectSprints.map((s) => s.sprint_id),
    [projectSprints]
  );
  const tasksInProject = useMemo(
    () => tasks.filter((t) => sprintIds.includes(t.sprint_id)),
    [tasks, sprintIds]
  );

  // My performance (current user) — derived from tasks assigned to me and projects I'm in
  const myStats = useMemo((): UserStats | null => {
    if (!user) return null;
    const projectCount = isAdmin
      ? (userProjectCounts[user.user_id] ?? 0)
      : projectsList.length;
    return computeUserStats(
      tasks,
      user.user_id,
      user.full_name ?? "",
      user.email ?? "",
      projectCount
    );
  }, [user, tasks, isAdmin, userProjectCounts, projectsList.length]);

  // By user (admin) — one row per user with task and project counts
  const byUserStats = useMemo((): UserStats[] => {
    if (!isAdmin || usersList.length === 0) return [];
    return usersList.map((u) =>
      computeUserStats(
        tasks,
        u.user_id,
        u.full_name,
        u.email,
        userProjectCounts[u.user_id] ?? 0
      )
    );
  }, [isAdmin, usersList, tasks, userProjectCounts]);

  // By project (admin) — for selected project, each member's task stats in this project
  const byProjectStats = useMemo((): UserStats[] => {
    if (!selectedProjectId || !projectMembers.length) return [];
    const members = projectMembers as ProjectMember[];
    return members.map((m) => {
      const userTasksInProject = tasksInProject.filter(
        (t) => t.assigned_to_user_id === m.user_id
      );
      const completed = userTasksInProject.filter((t) => t.status === "DONE").length;
      const total = userTasksInProject.length;
      return {
        user_id: m.user_id,
        full_name: m.full_name,
        email: m.email,
        tasksAssigned: total,
        tasksCompleted: completed,
        completionRate: total ? Math.round((completed / total) * 100) : 0,
        projectsContributing: 1,
      };
    });
  }, [selectedProjectId, projectMembers, tasksInProject]);

  const loading = tasksLoading || (isAdmin && countsLoading);

  const StatsCard = ({
    title,
    value,
    sub,
    icon: Icon,
  }: {
    title: string;
    value: number | string;
    sub?: string;
    icon: React.ElementType;
  }) => (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
        <Icon className="w-4 h-4" />
        {title}
      </div>
      <div className="text-2xl font-semibold">{value}</div>
      {sub != null && <div className="text-xs text-muted-foreground mt-1">{sub}</div>}
    </div>
  );

  const StatsTable = ({
    rows,
    loading: tableLoading,
    showProjects = true,
  }: {
    rows: UserStats[];
    loading: boolean;
    showProjects?: boolean;
  }) => {
    if (tableLoading)
      return (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      );
    if (!rows.length)
      return (
        <p className="text-sm text-muted-foreground py-4">No data to show.</p>
      );
    return (
      <div className="rounded-md border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-2 font-medium">User</th>
              <th className="text-left p-2 font-medium">Tasks assigned</th>
              <th className="text-left p-2 font-medium">Tasks completed</th>
              <th className="text-left p-2 font-medium">Completion %</th>
              {showProjects && (
                <th className="text-left p-2 font-medium">Projects contributing</th>
              )}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.user_id} className="border-t">
                <td className="p-2">
                  <div className="font-medium">{row.full_name}</div>
                  <div className="text-muted-foreground text-xs">{row.email}</div>
                </td>
                <td className="p-2">{row.tasksAssigned}</td>
                <td className="p-2">{row.tasksCompleted}</td>
                <td className="p-2">
                  <span className={row.completionRate >= 80 ? "text-green-600" : ""}>
                    {row.completionRate}%
                  </span>
                </td>
                {showProjects && <td className="p-2">{row.projectsContributing}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <Activity className="w-6 h-6" />
            Performance
          </h1>
        </div>
        <p className="text-muted-foreground text-sm">
          Performance is derived from actual work: tasks completed, projects you contribute to, and completion rate. No manual entries.
        </p>

        {loading && !myStats ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* My performance */}
            <section>
              <h2 className="text-lg font-medium mb-3 flex items-center gap-2">
                <Target className="w-5 h-5" />
                My performance
              </h2>
              {myStats ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <StatsCard
                    title="Tasks assigned"
                    value={myStats.tasksAssigned}
                    sub="Total tasks assigned to you"
                    icon={CheckCircle2}
                  />
                  <StatsCard
                    title="Tasks completed"
                    value={myStats.tasksCompleted}
                    sub="Marked as DONE"
                    icon={CheckCircle2}
                  />
                  <StatsCard
                    title="Completion rate"
                    value={`${myStats.completionRate}%`}
                    sub="Completed vs assigned"
                    icon={Target}
                  />
                  <StatsCard
                    title="Projects contributing"
                    value={myStats.projectsContributing}
                    sub="Projects you are a member of"
                    icon={FolderKanban}
                  />
                </div>
              ) : (
                <p className="text-muted-foreground text-sm py-4">No data yet.</p>
              )}
            </section>

            {isAdmin && (
              <>
                {/* Performance by user */}
                <section>
                  <h2 className="text-lg font-medium mb-3">Performance by user (admin)</h2>
                  <p className="text-muted-foreground text-sm mb-3">
                    How many tasks each user has performed and completion accuracy.
                  </p>
                  <StatsTable
                    rows={byUserStats}
                    loading={tasksLoading || countsLoading}
                    showProjects={true}
                  />
                </section>

                {/* Performance by project */}
                <section>
                  <h2 className="text-lg font-medium mb-3">Performance by project (admin)</h2>
                  <p className="text-muted-foreground text-sm mb-3">
                    Per-member task completion within the selected project.
                  </p>
                  <div className="flex gap-2 items-center mb-3">
                    <label className="text-sm text-muted-foreground">Project</label>
                    <select
                      className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm w-64"
                      value={selectedProjectId || ""}
                      onChange={(e) => setSelectedProjectId(Number(e.target.value))}
                    >
                      <option value="">Select project</option>
                      {projectsList.map((p) => (
                        <option key={p.project_id} value={p.project_id}>
                          {p.project_name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <StatsTable
                    rows={byProjectStats}
                    loading={membersLoading}
                    showProjects={false}
                  />
                </section>
              </>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Performance;
