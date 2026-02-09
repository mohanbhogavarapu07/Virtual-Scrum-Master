import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  projectsApi,
  sprintsApi,
  tasksApi,
  backlogApi,
  chatApi,
  performanceApi,
  dashboardApi,
  usersApi,
} from "@/lib/api";
import type { TaskStatus } from "@/types";

// ---- Projects ----
export const useProjects = () =>
  useQuery({ queryKey: ["projects"], queryFn: projectsApi.list });

export const useProject = (projectId: number) =>
  useQuery({
    queryKey: ["projects", projectId],
    queryFn: () => projectsApi.getById(projectId),
    enabled: !!projectId,
  });

export const useProjectMembers = (projectId: number) =>
  useQuery({
    queryKey: ["projects", projectId, "members"],
    queryFn: () => projectsApi.listMembers(projectId),
    enabled: !!projectId,
  });

export const useCreateProject = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof projectsApi.create>[0]) =>
      projectsApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["projects"] }),
  });
};

export const useDeleteProject = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (projectId: number) => projectsApi.delete(projectId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["projects"] }),
  });
};

export const useAssignMembers = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, employeeIds }: { projectId: number; employeeIds: number[] }) =>
      projectsApi.assignMembers(projectId, { employee_ids: employeeIds }),
    onSuccess: (_, { projectId }) =>
      qc.invalidateQueries({ queryKey: ["projects", projectId, "members"] }),
  });
};

export const useRemoveMember = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, userId }: { projectId: number; userId: number }) =>
      projectsApi.removeMember(projectId, userId),
    onSuccess: (_, { projectId }) =>
      qc.invalidateQueries({ queryKey: ["projects", projectId, "members"] }),
  });
};

// ---- Sprints ----
export const useProjectSprints = (projectId: number) =>
  useQuery({
    queryKey: ["sprints", "project", projectId],
    queryFn: () => sprintsApi.listByProject(projectId),
    enabled: !!projectId,
  });

export const useSprint = (sprintId: number) =>
  useQuery({
    queryKey: ["sprints", sprintId],
    queryFn: () => sprintsApi.getById(sprintId),
    enabled: !!sprintId,
  });

export const useCreateSprint = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, data }: { projectId: number; data: Parameters<typeof sprintsApi.create>[1] }) =>
      sprintsApi.create(projectId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["sprints"] }),
  });
};

export const useDeleteSprint = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (sprintId: number) => sprintsApi.delete(sprintId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["sprints"] }),
  });
};

// ---- Tasks ----
export const useSprintTasks = (sprintId: number) =>
  useQuery({
    queryKey: ["tasks", "sprint", sprintId],
    queryFn: () => tasksApi.listBySprint(sprintId),
    enabled: !!sprintId,
  });

export const useAllTasks = () =>
  useQuery({ queryKey: ["tasks"], queryFn: tasksApi.listAll });

export const useTask = (taskId: number) =>
  useQuery({
    queryKey: ["tasks", taskId],
    queryFn: () => tasksApi.getById(taskId),
    enabled: !!taskId,
  });

export const useCreateTask = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ sprintId, data }: { sprintId: number; data: Parameters<typeof tasksApi.create>[1] }) =>
      tasksApi.create(sprintId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });
};

export const useUpdateTask = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, data }: { taskId: number; data: Parameters<typeof tasksApi.update>[1] }) =>
      tasksApi.update(taskId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });
};

export const useUpdateTaskStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, status }: { taskId: number; status: TaskStatus }) =>
      tasksApi.updateStatus(taskId, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });
};

export const useDeleteTask = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (taskId: number) => tasksApi.delete(taskId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });
};

// ---- Backlog ----
export const useProjectBacklog = (projectId: number) =>
  useQuery({
    queryKey: ["backlog", projectId],
    queryFn: () => backlogApi.listByProject(projectId),
    enabled: !!projectId,
  });

export const useCreateBacklogItem = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, data }: { projectId: number; data: Parameters<typeof backlogApi.create>[1] }) =>
      backlogApi.create(projectId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["backlog"] }),
  });
};

export const useUpdateBacklogItem = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ itemId, data }: { itemId: number; data: Parameters<typeof backlogApi.update>[1] }) =>
      backlogApi.update(itemId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["backlog"] }),
  });
};

export const useDeleteBacklogItem = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (itemId: number) => backlogApi.delete(itemId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["backlog"] }),
  });
};

// ---- Chat ----
export const useProjectChat = (projectId: number) =>
  useQuery({
    queryKey: ["chat", projectId],
    queryFn: () => chatApi.listByProject(projectId),
    enabled: !!projectId,
  });

export const useSendChat = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: chatApi.send,
    onSuccess: (_, variables) =>
      qc.invalidateQueries({ queryKey: ["chat", variables.project_id] }),
  });
};

// ---- Performance ----
export const useMyPerformance = () =>
  useQuery({ queryKey: ["performance", "me"], queryFn: performanceApi.myLogs });

export const useProjectPerformance = (projectId: number) =>
  useQuery({
    queryKey: ["performance", "project", projectId],
    queryFn: () => performanceApi.byProject(projectId),
    enabled: !!projectId,
  });

export const useUserPerformance = (userId: number) =>
  useQuery({
    queryKey: ["performance", "user", userId],
    queryFn: () => performanceApi.byUser(userId),
    enabled: !!userId,
  });

export const useCreatePerformanceLog = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: performanceApi.createLog,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["performance"] }),
  });
};

// ---- Dashboard ----
export const useAdminDashboard = () =>
  useQuery({ queryKey: ["dashboard", "admin"], queryFn: dashboardApi.admin });

export const useEmployeeDashboard = () =>
  useQuery({ queryKey: ["dashboard", "employee"], queryFn: dashboardApi.employee });

// ---- Users (Admin) ----
export const useUsers = () =>
  useQuery({ queryKey: ["users"], queryFn: usersApi.list });

export const useDeleteUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: number) => usersApi.delete(userId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  });
};
