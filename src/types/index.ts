export type UserRole = "admin" | "manager" | "scrum_master" | "developer" | "tester";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  team?: string;
}

export interface Organization {
  id: string;
  name: string;
  logo?: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: "active" | "planning" | "completed" | "on-hold";
  owner: string;
  teamMembers: string[];
  sprints: Sprint[];
  releases: Release[];
  createdAt: Date;
  riskLevel?: "low" | "medium" | "high";
  health?: "healthy" | "at-risk" | "critical";
}

export interface Sprint {
  id: string;
  name: string;
  projectId: string;
  startDate: Date;
  endDate: Date;
  status: "planning" | "active" | "completed";
  goal: string;
  velocity: number;
  tasks: Task[];
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: "todo" | "inprogress" | "review" | "done";
  priority: "low" | "medium" | "high" | "critical";
  assignee: string;
  storyPoints: number;
  sprintId: string;
  createdAt: Date;
  updatedAt: Date;
  blockedBy?: string[];
  isBlocked?: boolean;
  daysInProgress?: number;
  tags?: string[];
}

export interface Release {
  id: string;
  version: string;
  projectId: string;
  releaseDate: Date;
  status: "planned" | "in-progress" | "released";
  features: string[];
  notes: string;
}

export interface ChatMessage {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
  action?: TaskAction;
  confidence?: number;
  reasoning?: string;
}

export interface TaskAction {
  type: "update_task" | "create_task" | "assign_task" | "sprint_update" | "mark_blocker" | "rebalance";
  taskId?: string;
  updates?: Partial<Task>;
  label?: string;
}

export interface Blocker {
  id: string;
  taskId: string;
  taskTitle: string;
  assignee: string;
  daysBlocked: number;
  reason?: string;
  severity: "low" | "medium" | "high";
}

export interface AIInsight {
  id: string;
  type: "recommendation" | "warning" | "info";
  title: string;
  description: string;
  impact: string;
  action?: TaskAction;
  priority: number;
}

export interface ActivityItem {
  id: string;
  type: "task_update" | "standup" | "ai_action" | "sprint_change" | "blocker";
  user: string;
  action: string;
  target?: string;
  timestamp: Date;
  details?: string;
}

export interface SprintMetrics {
  totalPoints: number;
  completedPoints: number;
  remainingPoints: number;
  burndownIdeal: number[];
  burndownActual: number[];
  velocity: number;
  previousVelocity: number;
  daysRemaining: number;
  riskStatus: "on-track" | "at-risk" | "behind";
}

export interface TeamMemberStats {
  name: string;
  initials: string;
  completed: number;
  inProgress: number;
  totalPoints: number;
  workload: "light" | "optimal" | "heavy";
}
