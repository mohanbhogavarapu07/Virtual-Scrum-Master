import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { SprintHealthPanel } from "@/components/dashboard/SprintHealthPanel";
import { BlockersPanel } from "@/components/dashboard/BlockersPanel";
import { AIInsightsPanel } from "@/components/dashboard/AIInsightsPanel";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { TeamWorkloadPanel } from "@/components/dashboard/TeamWorkloadPanel";
import { useApp } from "@/context/AppContext";
import { 
  FolderKanban, 
  Zap, 
  AlertTriangle, 
  Target,
  TrendingUp,
  Clock
} from "lucide-react";
import { motion } from "framer-motion";

const Dashboard = () => {
  const { projects, tasks, blockers, sprintMetrics } = useApp();
  
  const activeProjects = projects.filter(p => p.status === "active").length;
  const activeSprints = projects.reduce((count, p) => count + p.sprints.filter(s => s.status === "active").length, 0);
  const completedTasks = tasks.filter(t => t.status === "done").length;
  const totalPoints = tasks.reduce((sum, t) => sum + t.storyPoints, 0);
  const velocityChange = Math.round(((sprintMetrics.velocity - sprintMetrics.previousVelocity) / sprintMetrics.previousVelocity) * 100);

  return (
    <DashboardLayout>
      <div className="space-y-4">
        {/* Page Header */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-xl font-semibold">Dashboard</h1>
            <p className="text-sm text-muted-foreground">Sprint 5 · E-commerce Platform Redesign</p>
          </div>
        </motion.div>

        {/* Executive Overview - Metrics Row */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3"
        >
          <MetricCard
            title="Active Projects"
            value={activeProjects}
            subtitle={`${projects.length} total`}
            icon={FolderKanban}
            iconColor="text-primary"
          />
          <MetricCard
            title="Active Sprints"
            value={activeSprints}
            subtitle="Across all projects"
            icon={Zap}
            iconColor="text-accent"
          />
          <MetricCard
            title="Open Blockers"
            value={blockers.length}
            change={blockers.length > 0 ? { value: `${blockers.length} require action`, trend: "down" } : undefined}
            subtitle={blockers.length === 0 ? "All clear" : undefined}
            icon={AlertTriangle}
            iconColor="text-warning"
          />
          <MetricCard
            title="Sprint Progress"
            value={`${Math.round((sprintMetrics.completedPoints / sprintMetrics.totalPoints) * 100)}%`}
            change={{ 
              value: `${sprintMetrics.completedPoints}/${sprintMetrics.totalPoints} pts`, 
              trend: "neutral"
            }}
            icon={Target}
            iconColor="text-success"
          />
          <MetricCard
            title="Team Velocity"
            value={sprintMetrics.velocity}
            change={{ 
              value: `${velocityChange > 0 ? '+' : ''}${velocityChange}%`, 
              trend: velocityChange >= 0 ? "up" : "down",
              period: "vs last sprint"
            }}
            icon={TrendingUp}
            iconColor="text-primary"
          />
          <MetricCard
            title="Days Remaining"
            value={sprintMetrics.daysRemaining}
            subtitle="Sprint ends Jan 20"
            icon={Clock}
            iconColor="text-muted-foreground"
          />
        </motion.div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-12 gap-4">
          {/* Left Column - Sprint Health & Blockers */}
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="col-span-12 lg:col-span-4 space-y-4"
          >
            <SprintHealthPanel />
            <BlockersPanel />
          </motion.div>

          {/* Center Column - AI Insights */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="col-span-12 lg:col-span-4"
          >
            <AIInsightsPanel />
          </motion.div>

          {/* Right Column - Activity & Team */}
          <motion.div 
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="col-span-12 lg:col-span-4 space-y-4"
          >
            <ActivityFeed />
            <TeamWorkloadPanel />
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
