import { createContext, useContext, useState, ReactNode } from "react";
import { User, Project, Task, Sprint, Release, UserRole, Blocker, AIInsight, ActivityItem, SprintMetrics, TeamMemberStats } from "@/types";

interface AppContextType {
  currentUser: User;
  setCurrentUser: (user: User) => void;
  projects: Project[];
  tasks: Task[];
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  createTask: (task: Omit<Task, "id" | "createdAt" | "updatedAt">) => void;
  getSprint: (sprintId: string) => Sprint | undefined;
  getProject: (projectId: string) => Project | undefined;
  blockers: Blocker[];
  aiInsights: AIInsight[];
  activities: ActivityItem[];
  sprintMetrics: SprintMetrics;
  teamStats: TeamMemberStats[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Extended mock data for enterprise-grade dashboard
const mockUser: User = {
  id: "1",
  name: "John Doe",
  email: "john@company.com",
  role: "manager",
  team: "Platform Engineering",
};

const mockTasks: Task[] = [
  {
    id: "1",
    title: "Implement user authentication",
    description: "Add JWT-based auth system",
    status: "todo",
    priority: "high",
    assignee: "SC",
    storyPoints: 8,
    sprintId: "sprint-1",
    createdAt: new Date("2025-01-01"),
    updatedAt: new Date("2025-01-01"),
    tags: ["backend", "security"],
  },
  {
    id: "2",
    title: "Design payment flow wireframes",
    description: "Create wireframes for checkout process",
    status: "todo",
    priority: "medium",
    assignee: "MR",
    storyPoints: 5,
    sprintId: "sprint-1",
    createdAt: new Date("2025-01-02"),
    updatedAt: new Date("2025-01-02"),
    tags: ["design", "ux"],
  },
  {
    id: "3",
    title: "API endpoint development",
    description: "Build REST API endpoints",
    status: "inprogress",
    priority: "high",
    assignee: "JW",
    storyPoints: 13,
    sprintId: "sprint-1",
    createdAt: new Date("2025-01-03"),
    updatedAt: new Date("2025-01-10"),
    daysInProgress: 7,
    isBlocked: true,
    tags: ["backend", "api"],
  },
  {
    id: "4",
    title: "Database schema optimization",
    description: "Optimize queries and indexes",
    status: "inprogress",
    priority: "medium",
    assignee: "DK",
    storyPoints: 8,
    sprintId: "sprint-1",
    createdAt: new Date("2025-01-04"),
    updatedAt: new Date("2025-01-11"),
    daysInProgress: 5,
    tags: ["database", "performance"],
  },
  {
    id: "5",
    title: "Mobile responsive layouts",
    description: "Make all pages responsive",
    status: "review",
    priority: "medium",
    assignee: "SC",
    storyPoints: 5,
    sprintId: "sprint-1",
    createdAt: new Date("2025-01-05"),
    updatedAt: new Date("2025-01-12"),
    tags: ["frontend", "mobile"],
  },
  {
    id: "6",
    title: "Setup CI/CD pipeline",
    description: "Configure GitHub Actions",
    status: "done",
    priority: "high",
    assignee: "MR",
    storyPoints: 8,
    sprintId: "sprint-1",
    createdAt: new Date("2025-01-06"),
    updatedAt: new Date("2025-01-08"),
    tags: ["devops"],
  },
  {
    id: "7",
    title: "Unit test coverage",
    description: "Add unit tests for core modules",
    status: "done",
    priority: "medium",
    assignee: "AL",
    storyPoints: 5,
    sprintId: "sprint-1",
    createdAt: new Date("2025-01-07"),
    updatedAt: new Date("2025-01-09"),
    tags: ["testing"],
  },
  {
    id: "8",
    title: "Error handling middleware",
    description: "Global error handling for API",
    status: "done",
    priority: "high",
    assignee: "JW",
    storyPoints: 3,
    sprintId: "sprint-1",
    createdAt: new Date("2025-01-08"),
    updatedAt: new Date("2025-01-10"),
    tags: ["backend"],
  },
];

const mockSprints: Sprint[] = [
  {
    id: "sprint-1",
    name: "Sprint 5",
    projectId: "1",
    startDate: new Date("2025-01-06"),
    endDate: new Date("2025-01-20"),
    status: "active",
    goal: "Complete core platform features and payment integration",
    velocity: 55,
    tasks: [],
  },
];

const mockProjects: Project[] = [
  {
    id: "1",
    name: "E-commerce Platform Redesign",
    description: "Complete UI/UX overhaul of the customer portal with new payment system",
    status: "active",
    owner: "Sarah Chen",
    teamMembers: ["SC", "MR", "JW", "DK", "AL", "KP", "TM", "RJ"],
    sprints: mockSprints,
    releases: [
      {
        id: "r1",
        version: "2.0.0",
        projectId: "1",
        releaseDate: new Date("2025-02-15"),
        status: "in-progress",
        features: ["New checkout flow", "Mobile responsive design", "Payment integration"],
        notes: "Major redesign release",
      },
    ],
    createdAt: new Date("2024-12-01"),
    riskLevel: "medium",
    health: "at-risk",
  },
  {
    id: "2",
    name: "Mobile App v3.0",
    description: "Native mobile application with offline support and push notifications",
    status: "active",
    owner: "Mike Rodriguez",
    teamMembers: ["MR", "TM", "RJ", "KP"],
    sprints: [{
      id: "sprint-2",
      name: "Sprint 3",
      projectId: "2",
      startDate: new Date("2025-01-13"),
      endDate: new Date("2025-01-27"),
      status: "active",
      goal: "Offline sync and push notifications",
      velocity: 42,
      tasks: [],
    }],
    releases: [],
    createdAt: new Date("2024-11-15"),
    riskLevel: "low",
    health: "healthy",
  },
  {
    id: "3",
    name: "Data Analytics Dashboard",
    description: "Real-time analytics and reporting platform for business intelligence",
    status: "planning",
    owner: "Emily Watson",
    teamMembers: ["EW", "DK", "AL"],
    sprints: [],
    releases: [],
    createdAt: new Date("2025-01-10"),
    riskLevel: "low",
    health: "healthy",
  },
];

const mockBlockers: Blocker[] = [
  {
    id: "b1",
    taskId: "3",
    taskTitle: "API endpoint development",
    assignee: "JW",
    daysBlocked: 3,
    reason: "Waiting for third-party API credentials",
    severity: "high",
  },
  {
    id: "b2",
    taskId: "4",
    taskTitle: "Database schema optimization",
    assignee: "DK",
    daysBlocked: 2,
    reason: "Need DBA approval for schema changes",
    severity: "medium",
  },
];

const mockAIInsights: AIInsight[] = [
  {
    id: "ai1",
    type: "warning",
    title: "Sprint at risk of missing deadline",
    description: "Current velocity suggests 8 story points may not be completed by sprint end.",
    impact: "May delay v2.0.0 release by 3-5 days",
    priority: 1,
    action: { type: "rebalance", label: "Rebalance Sprint" },
  },
  {
    id: "ai2",
    type: "recommendation",
    title: "Reassign blocked task",
    description: "API endpoint task blocked for 3 days. Consider reassigning to unblock dependencies.",
    impact: "Could unblock 2 downstream tasks worth 13 points",
    priority: 2,
    action: { type: "assign_task", taskId: "3", label: "Reassign Task" },
  },
  {
    id: "ai3",
    type: "info",
    title: "Team velocity trending up",
    description: "Team velocity increased 18% over last 3 sprints. Consider increasing sprint commitment.",
    impact: "Potential to deliver 8-10 more points per sprint",
    priority: 3,
  },
];

const mockActivities: ActivityItem[] = [
  {
    id: "a1",
    type: "task_update",
    user: "Sarah Chen",
    action: "moved",
    target: "Mobile responsive layouts",
    timestamp: new Date(Date.now() - 1000 * 60 * 15),
    details: "To Review → Done",
  },
  {
    id: "a2",
    type: "standup",
    user: "James Wilson",
    action: "submitted standup",
    timestamp: new Date(Date.now() - 1000 * 60 * 45),
    details: "Working on API endpoints, blocked by credentials",
  },
  {
    id: "a3",
    type: "ai_action",
    user: "AI Scrum Master",
    action: "detected blocker",
    target: "Database schema optimization",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    details: "Task in progress for 5+ days",
  },
  {
    id: "a4",
    type: "sprint_change",
    user: "John Doe",
    action: "updated sprint goal",
    target: "Sprint 5",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4),
  },
  {
    id: "a5",
    type: "task_update",
    user: "Mike Rodriguez",
    action: "completed",
    target: "Setup CI/CD pipeline",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6),
  },
];

const mockSprintMetrics: SprintMetrics = {
  totalPoints: 55,
  completedPoints: 16,
  remainingPoints: 39,
  burndownIdeal: [55, 48, 41, 34, 27, 20, 13, 6, 0],
  burndownActual: [55, 52, 48, 45, 42, 39],
  velocity: 55,
  previousVelocity: 47,
  daysRemaining: 6,
  riskStatus: "at-risk",
};

const mockTeamStats: TeamMemberStats[] = [
  { name: "Sarah Chen", initials: "SC", completed: 2, inProgress: 1, totalPoints: 13, workload: "optimal" },
  { name: "Mike Rodriguez", initials: "MR", completed: 1, inProgress: 0, totalPoints: 13, workload: "light" },
  { name: "James Wilson", initials: "JW", completed: 1, inProgress: 1, totalPoints: 16, workload: "heavy" },
  { name: "David Kim", initials: "DK", completed: 0, inProgress: 1, totalPoints: 8, workload: "optimal" },
  { name: "Amy Lee", initials: "AL", completed: 1, inProgress: 0, totalPoints: 5, workload: "light" },
];

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User>(mockUser);
  const [projects] = useState<Project[]>(mockProjects);
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [blockers] = useState<Blocker[]>(mockBlockers);
  const [aiInsights] = useState<AIInsight[]>(mockAIInsights);
  const [activities] = useState<ActivityItem[]>(mockActivities);
  const [sprintMetrics] = useState<SprintMetrics>(mockSprintMetrics);
  const [teamStats] = useState<TeamMemberStats[]>(mockTeamStats);

  const updateTask = (taskId: string, updates: Partial<Task>) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId
          ? { ...task, ...updates, updatedAt: new Date() }
          : task
      )
    );
  };

  const createTask = (taskData: Omit<Task, "id" | "createdAt" | "updatedAt">) => {
    const newTask: Task = {
      ...taskData,
      id: `task-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setTasks((prevTasks) => [...prevTasks, newTask]);
  };

  const getSprint = (sprintId: string) => {
    for (const project of projects) {
      const sprint = project.sprints.find((s) => s.id === sprintId);
      if (sprint) return sprint;
    }
    return undefined;
  };

  const getProject = (projectId: string) => {
    return projects.find((p) => p.id === projectId);
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        projects,
        tasks,
        updateTask,
        createTask,
        getSprint,
        getProject,
        blockers,
        aiInsights,
        activities,
        sprintMetrics,
        teamStats,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within AppProvider");
  }
  return context;
};
