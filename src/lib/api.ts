import type {
    AdminDashboard,
    ApiBacklogItem,
    ApiChatLog,
    ApiPerformanceLog,
    ApiProject,
    ApiSprint,
    ApiTask,
    ApiUser,
    AssignRequest,
    AuthResponse,
    ChatSendRequest,
    ChatSendResponse,
    EmployeeDashboard,
    LoginRequest,
    PerformanceLogCreate,
    ProjectMember,
    RegisterRequest,
    TaskStatus,
} from "@/types";

const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string) || "http://localhost:5000";

/** Frontend origin (this app's URL). Backend CORS_ORIGINS must include this. */
export const APP_ORIGIN =
  (import.meta.env.VITE_APP_ORIGIN as string) || "http://localhost:8080";

// ---- Token helpers ----
export const getToken = (): string | null => localStorage.getItem("token");
export const setToken = (token: string) => localStorage.setItem("token", token);
export const clearToken = () => localStorage.removeItem("token");

const DEBUG_API = import.meta.env.DEV;

// ---- Base request helper ----
async function request<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const fullUrl = `${API_BASE_URL}${url}`;
  if (DEBUG_API) {
    console.debug("[API]", options?.method ?? "GET", fullUrl, {
      API_BASE_URL,
      APP_ORIGIN,
      origin: typeof window !== "undefined" ? window.location.origin : "",
    });
  }

  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const res = await fetch(fullUrl, {
    ...options,
    headers: { ...headers, ...(options?.headers as Record<string, string>) },
  });

  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg =
      (body && typeof body.message === "string" && body.message) ||
      res.statusText ||
      "Request failed";
    throw new Error(msg);
  }

  // Handle 204 No Content
  if (res.status === 204) return undefined as T;

  // Backend wraps success responses as { success: true, data: T, message?: string }
  if (body && body.success === true && "data" in body) {
    return body.data as T;
  }
  return body as T;
}

// ==========================================
// Auth API
// ==========================================
export const authApi = {
  login: (data: LoginRequest) =>
    request<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  register: (data: RegisterRequest) =>
    request<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  me: () => request<ApiUser>("/auth/me"),

  /** Re-issue JWT with current role from DB. Call after app load so token matches DB (e.g. if role was changed in Supabase). */
  refresh: () =>
    request<{ user: ApiUser; token: string }>("/auth/refresh", { method: "POST" }),
};

// ==========================================
// Users API (Admin only)
// ==========================================
export const usersApi = {
  /** GET /users. Optional: role=EMPLOYEE|ADMIN, unassigned=true (only employees not in any project). */
  list: (params?: { role?: string; unassigned?: boolean }) => {
    const search = new URLSearchParams();
    if (params?.role) search.set("role", params.role);
    if (params?.unassigned) search.set("unassigned", "true");
    const qs = search.toString();
    return request<ApiUser[]>(qs ? `/users?${qs}` : "/users");
  },

  getById: (userId: number) => request<ApiUser>(`/users/${userId}`),

  update: (userId: number, data: Partial<ApiUser>) =>
    request<ApiUser>(`/users/${userId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (userId: number) =>
    request<void>(`/users/${userId}`, { method: "DELETE" }),
};

// ==========================================
// Projects API
// ==========================================
export const projectsApi = {
  list: () => request<ApiProject[]>("/projects"),

  getById: (projectId: number) =>
    request<ApiProject>(`/projects/${projectId}`),

  create: (data: Partial<ApiProject>) =>
    request<ApiProject>("/projects", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (projectId: number, data: Partial<ApiProject>) =>
    request<ApiProject>(`/projects/${projectId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (projectId: number) =>
    request<void>(`/projects/${projectId}`, { method: "DELETE" }),

  // Members / assignments
  assignMembers: (projectId: number, data: AssignRequest) =>
    request<any>(`/projects/${projectId}/assign`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  listMembers: (projectId: number) =>
    request<ProjectMember[]>(`/projects/${projectId}/members`),

  removeMember: (projectId: number, userId: number) =>
    request<void>(`/projects/${projectId}/members/${userId}`, {
      method: "DELETE",
    }),
};

// ==========================================
// Backlog API
// ==========================================
export const backlogApi = {
  listByProject: (projectId: number) =>
    request<ApiBacklogItem[]>(`/projects/${projectId}/backlog`),

  create: (projectId: number, data: Partial<ApiBacklogItem>) =>
    request<ApiBacklogItem>(`/projects/${projectId}/backlog`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (backlogItemId: number, data: Partial<ApiBacklogItem>) =>
    request<ApiBacklogItem>(`/backlog/${backlogItemId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (backlogItemId: number) =>
    request<void>(`/backlog/${backlogItemId}`, { method: "DELETE" }),
};

// ==========================================
// Sprints API
// ==========================================
export const sprintsApi = {
  listByProject: (projectId: number) =>
    request<ApiSprint[]>(`/projects/${projectId}/sprints`),

  getById: (sprintId: number) =>
    request<ApiSprint>(`/sprints/${sprintId}`),

  create: (projectId: number, data: Partial<ApiSprint>) =>
    request<ApiSprint>(`/projects/${projectId}/sprints`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (sprintId: number, data: Partial<ApiSprint>) =>
    request<ApiSprint>(`/sprints/${sprintId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (sprintId: number) =>
    request<void>(`/sprints/${sprintId}`, { method: "DELETE" }),
};

// ==========================================
// Tasks API
// ==========================================
export const tasksApi = {
  listBySprint: (sprintId: number) =>
    request<ApiTask[]>(`/sprints/${sprintId}/tasks`),

  listAll: () => request<ApiTask[]>("/tasks"),

  getById: (taskId: number) => request<ApiTask>(`/tasks/${taskId}`),

  create: (sprintId: number, data: Partial<ApiTask>) =>
    request<ApiTask>(`/sprints/${sprintId}/tasks`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (taskId: number, data: Partial<ApiTask>) =>
    request<ApiTask>(`/tasks/${taskId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  updateStatus: (taskId: number, status: TaskStatus) =>
    request<ApiTask>(`/tasks/${taskId}/status`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    }),

  delete: (taskId: number) =>
    request<void>(`/tasks/${taskId}`, { method: "DELETE" }),
};

// ==========================================
// Performance API
// ==========================================
export const performanceApi = {
  /** POST /performance/log */
  createLog: (data: PerformanceLogCreate) =>
    request<ApiPerformanceLog>("/performance/log", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  /** POST /performance/logs (alias for create) */
  createLogAlias: (data: PerformanceLogCreate) =>
    request<ApiPerformanceLog>("/performance/logs", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  /** GET /performance/me - my performance logs */
  myLogs: () =>
    request<{ performance_logs: ApiPerformanceLog[]; count: number }>("/performance/me"),

  /** GET /performance/project/:id - admin */
  byProject: (projectId: number) =>
    request<{ performance_logs: ApiPerformanceLog[]; count: number }>(
      `/performance/project/${projectId}`
    ),

  /** GET /performance/user/:id - admin */
  byUser: (userId: number) =>
    request<{ performance_logs: ApiPerformanceLog[]; count: number }>(
      `/performance/user/${userId}`
    ),
};

// ==========================================
// Chat API
// ==========================================
export const chatApi = {
  listByProject: (projectId: number) =>
    request<ApiChatLog[]>(`/chat/project/${projectId}`),

  send: (data: ChatSendRequest) =>
    request<ChatSendResponse>("/chat/send", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

// ==========================================
// Dashboard API
// ==========================================
export const dashboardApi = {
  /** Single role-based endpoint: backend returns admin or employee data. Use this to avoid 403. */
  get: () =>
    request<AdminDashboard | EmployeeDashboard>("/dashboard"),

  admin: () => request<AdminDashboard>("/dashboard/admin"),
  employee: () => request<EmployeeDashboard>("/dashboard/employee"),
};

// ==========================================
// Health API
// ==========================================
export const healthApi = {
  check: () => request<{ status: string }>("/health"),
};
