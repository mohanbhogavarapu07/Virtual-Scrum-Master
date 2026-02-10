// ==========================================
// Types aligned with backend API schema
// ==========================================

// --- Auth & Users ---
export type UserRole = "ADMIN" | "EMPLOYEE";

export interface ApiUser {
  user_id: number;
  full_name: string;
  email: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

/** Backend returns { user, token } for login and register (after envelope unwrap). */
export interface AuthResponse {
  user: ApiUser;
  token: string;
}

export interface RegisterRequest {
  full_name: string;
  email: string;
  password: string;
  role: UserRole; // Backend requires ADMIN or EMPLOYEE
}

// --- Projects ---
export interface ApiProject {
  project_id: number;
  project_name: string;
  description: string;
  created_by_admin_id: number;
  start_date: string;
  end_date: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectMember {
  user_id: number;
  full_name: string;
  email: string;
  role: UserRole;
  assigned_at?: string;
}

export interface AssignRequest {
  employee_ids: number[];
}

// --- Sprints ---
export interface ApiSprint {
  sprint_id: number;
  project_id: number;
  sprint_name: string;
  start_date: string;
  end_date: string;
  status: string;
  created_at: string;
  updated_at: string;
}

// --- Tasks ---
export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";

export interface ApiTask {
  task_id: number;
  sprint_id: number;
  assigned_to_user_id: number;
  title: string;
  description: string;
  status: TaskStatus;
  created_at: string;
  updated_at: string;
}

export interface TaskStatusUpdate {
  status: TaskStatus;
}

// --- Backlog ---
export interface ApiBacklogItem {
  backlog_item_id: number;
  project_id: number;
  title: string;
  description: string;
  priority: number;
  created_at: string;
  updated_at: string;
}

// --- Chat ---
export interface ApiChatLog {
  chat_log_id: number;
  user_id: number;
  project_id: number;
  sender_type: "USER" | "AI_BOT";
  message: string;
  created_at: string;
}

export interface ChatSendRequest {
  project_id: number;
  message: string;
}

export interface ChatSendResponse {
  user_message: ApiChatLog;
  ai_response: ApiChatLog;
}

// --- Performance ---
export interface ApiPerformanceLog {
  performance_log_id: number;
  user_id: number;
  task_id: number;
  accuracy_score: number;
  progress_percent: number;
  log_date: string;
  created_at: string;
  updated_at: string;
}

export interface PerformanceLogCreate {
  user_id: number;
  task_id: number;
  accuracy_score: number;
  progress_percent: number;
  log_date: string;
}

// --- Dashboard ---
export interface AdminDashboard {
  total_projects: number;
  total_users: number;
  total_sprints: number;
  total_tasks: number;
  tasks_by_status: Record<string, number>;
  sprints_by_status: Record<string, number>;
  bottlenecks: Array<{
    task_id: number;
    title: string;
    assigned_to_user_id: number;
    status: string;
    days_in_progress?: number;
  }>;
  performance: ApiPerformanceLog[];
}

export interface EmployeeDashboard {
  my_projects: ApiProject[];
  my_tasks: ApiTask[];
  performance: ApiPerformanceLog[];
}

// --- Legacy types kept for UI compatibility ---
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
  updates?: Partial<ApiTask>;
  label?: string;
}
