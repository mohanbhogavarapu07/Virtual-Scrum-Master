import { createContext, useContext, useState, ReactNode } from "react";
import { User, Project, Task, Sprint, Release, UserRole } from "@/types";

interface AppContextType {
  currentUser: User;
  setCurrentUser: (user: User) => void;
  projects: Project[];
  tasks: Task[];
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  createTask: (task: Omit<Task, "id" | "createdAt" | "updatedAt">) => void;
  getSprint: (sprintId: string) => Sprint | undefined;
  getProject: (projectId: string) => Project | undefined;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Mock data
const mockUser: User = {
  id: "1",
  name: "John Doe",
  email: "john@company.com",
  role: "manager",
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
    goal: "Complete E-commerce Platform Redesign core features",
    velocity: 50,
    tasks: [],
  },
];

const mockProjects: Project[] = [
  {
    id: "1",
    name: "E-commerce Platform Redesign",
    description: "Complete UI/UX overhaul of the customer portal",
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
  },
];

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User>(mockUser);
  const [projects] = useState<Project[]>(mockProjects);
  const [tasks, setTasks] = useState<Task[]>(mockTasks);

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
