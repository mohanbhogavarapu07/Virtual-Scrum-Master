import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { useAuth } from "@/context/AuthContext";
import { useAdminDashboard, useEmployeeDashboard, useProjects, useAllTasks } from "@/hooks/useApiHooks";
import { FolderKanban, Zap, AlertTriangle, Target, TrendingUp, Users, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

const Dashboard = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";
  const { data: adminDash, isLoading: adminLoading } = useAdminDashboard();
  const { data: empDash, isLoading: empLoading } = useEmployeeDashboard();
  const { data: projects = [] } = useProjects();
  const { data: tasks = [] } = useAllTasks();

  const isLoading = isAdmin ? adminLoading : empLoading;
  const totalProjects = isAdmin ? (adminDash?.total_projects ?? projects.length) : (empDash?.my_projects?.length ?? 0);
  const totalTasks = isAdmin ? (adminDash?.total_tasks ?? tasks.length) : (empDash?.my_tasks?.length ?? 0);
  const totalUsers = adminDash?.total_users ?? 0;
  const tasksByStatus = adminDash?.tasks_by_status ?? {};
  const doneTasks = tasksByStatus["DONE"] ?? tasks.filter(t => t.status === "DONE").length;
  const inProgressTasks = tasksByStatus["IN_PROGRESS"] ?? tasks.filter(t => t.status === "IN_PROGRESS").length;
  const todoTasks = tasksByStatus["TODO"] ?? tasks.filter(t => t.status === "TODO").length;

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">Dashboard</h1>
            <p className="text-sm text-muted-foreground">{isAdmin ? "Admin Overview" : `Welcome, ${user?.full_name}`}</p>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <MetricCard title="Projects" value={totalProjects} icon={FolderKanban} iconColor="text-primary" />
          {isAdmin && <MetricCard title="Total Users" value={totalUsers} icon={Users} iconColor="text-accent" />}
          <MetricCard title="To Do" value={todoTasks} subtitle="Tasks pending" icon={AlertTriangle} iconColor="text-warning" />
          <MetricCard title="In Progress" value={inProgressTasks} icon={Target} iconColor="text-primary" />
          <MetricCard title="Completed" value={doneTasks} change={totalTasks > 0 ? { value: `${Math.round((doneTasks / totalTasks) * 100)}%`, trend: "up", period: "completion" } : undefined} icon={TrendingUp} iconColor="text-success" />
          <MetricCard title="Total Tasks" value={totalTasks} icon={Zap} iconColor="text-accent" />
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
