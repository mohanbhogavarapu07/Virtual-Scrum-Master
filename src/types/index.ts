export type UserRole = "admin" | "manager" | "employee";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
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
  priority: "low" | "medium" | "high";
  assignee: string;
  storyPoints: number;
  sprintId: string;
  createdAt: Date;
  updatedAt: Date;
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
}

export interface TaskAction {
  type: "update_task" | "create_task" | "assign_task" | "sprint_update";
  taskId?: string;
  updates?: Partial<Task>;
}
