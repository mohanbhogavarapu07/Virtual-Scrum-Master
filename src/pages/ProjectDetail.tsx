import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
    useAssignMembers,
    useCreateBacklogItem,
    useCreateSprint,
    useDeleteBacklogItem,
    useDeleteSprint,
    useProject,
    useProjectBacklog,
    useProjectMembers,
    useProjectSprints,
    useRemoveMember,
    useUpdateBacklogItem,
    useUpdateSprint,
    useUsers,
} from "@/hooks/useApiHooks";
import type { ApiBacklogItem, ApiSprint } from "@/types";
import { motion } from "framer-motion";
import { Calendar, Loader2, Package, Pencil, Plus, Trash2, TrendingUp, Users } from "lucide-react";
import React, { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const projectId = Number(id);

  const { data: project, isLoading: projLoading } = useProject(projectId);
  const { data: sprintsRaw = [], isLoading: sprintsLoading } = useProjectSprints(projectId);
  const sprints = Array.isArray(sprintsRaw) ? sprintsRaw : [];
  const { data: members = [] } = useProjectMembers(projectId);
  const { data: backlogRaw = [], isLoading: backlogLoading } = useProjectBacklog(projectId);
  const backlog = Array.isArray(backlogRaw) ? backlogRaw : [];
  const { data: usersRaw } = useUsers();
  const users = Array.isArray(usersRaw) ? usersRaw : [];
  const assignMembers = useAssignMembers();
  const removeMember = useRemoveMember();
  const { user } = useAuth();
  const { toast } = useToast();
  const isAdmin = user?.role === "ADMIN";
  const [assignOpen, setAssignOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const createBacklog = useCreateBacklogItem();
  const updateBacklog = useUpdateBacklogItem();
  const deleteBacklog = useDeleteBacklogItem();
  const [backlogCreateOpen, setBacklogCreateOpen] = useState(false);
  const [editBacklogItem, setEditBacklogItem] = useState<ApiBacklogItem | null>(null);
  const [deleteBacklogId, setDeleteBacklogId] = useState<number | null>(null);
  const [backlogForm, setBacklogForm] = useState({ title: "", description: "", priority: 1 });

  const createSprint = useCreateSprint();
  const updateSprint = useUpdateSprint();
  const deleteSprint = useDeleteSprint();
  const [sprintCreateOpen, setSprintCreateOpen] = useState(false);
  const [editSprintItem, setEditSprintItem] = useState<ApiSprint | null>(null);
  const [deleteSprintId, setDeleteSprintId] = useState<number | null>(null);
  const [sprintForm, setSprintForm] = useState({
    sprint_name: "",
    start_date: "",
    end_date: "",
    status: "PLANNED" as "PLANNED" | "ACTIVE" | "COMPLETED",
  });

  const openCreateSprint = () => {
    setSprintForm({ sprint_name: "", start_date: "", end_date: "", status: "PLANNED" });
    setSprintCreateOpen(true);
  };
  const openEditSprint = (sprint: ApiSprint) => {
    setSprintForm({
      sprint_name: sprint.sprint_name ?? "",
      start_date: sprint.start_date ? sprint.start_date.slice(0, 10) : "",
      end_date: sprint.end_date ? sprint.end_date.slice(0, 10) : "",
      status: (sprint.status === "ACTIVE" || sprint.status === "COMPLETED" ? sprint.status : "PLANNED") as "PLANNED" | "ACTIVE" | "COMPLETED",
    });
    setEditSprintItem(sprint);
  };
  const openDeleteSprint = (sprintId: number) => {
    setDeleteSprintId(sprintId);
  };

  const handleCreateSprint = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = sprintForm.sprint_name.trim();
    if (!name) {
      toast({ title: "Sprint name is required", variant: "destructive" });
      return;
    }
    if (!projectId) return;
    try {
      await createSprint.mutateAsync({
        projectId,
        data: {
          sprint_name: name,
          start_date: sprintForm.start_date || undefined,
          end_date: sprintForm.end_date || undefined,
          status: sprintForm.status,
        },
      });
      toast({ title: "Sprint created" });
      setSprintCreateOpen(false);
      setSprintForm({ sprint_name: "", start_date: "", end_date: "", status: "PLANNED" });
    } catch (err) {
      toast({
        title: "Failed to create sprint",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  const handleUpdateSprint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editSprintItem) return;
    const name = sprintForm.sprint_name.trim();
    if (!name) {
      toast({ title: "Sprint name is required", variant: "destructive" });
      return;
    }
    try {
      await updateSprint.mutateAsync({
        sprintId: editSprintItem.sprint_id,
        data: {
          sprint_name: name,
          start_date: sprintForm.start_date || undefined,
          end_date: sprintForm.end_date || undefined,
          status: sprintForm.status,
        },
      });
      toast({ title: "Sprint updated" });
      setEditSprintItem(null);
      setSprintForm({ sprint_name: "", start_date: "", end_date: "", status: "PLANNED" });
    } catch (err) {
      toast({
        title: "Failed to update sprint",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  const handleDeleteSprintConfirm = async () => {
    if (deleteSprintId == null) return;
    try {
      await deleteSprint.mutateAsync(deleteSprintId);
      toast({ title: "Sprint deleted" });
      setDeleteSprintId(null);
    } catch (err) {
      toast({
        title: "Failed to delete sprint",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  const openCreateBacklog = () => {
    setBacklogForm({ title: "", description: "", priority: 1 });
    setBacklogCreateOpen(true);
  };
  const openEditBacklog = (item: ApiBacklogItem) => {
    setBacklogForm({
      title: item.title ?? "",
      description: item.description ?? "",
      priority: typeof item.priority === "number" ? item.priority : 1,
    });
    setEditBacklogItem(item);
  };
  const openDeleteBacklog = (itemId: number) => {
    setDeleteBacklogId(itemId);
  };

  const handleCreateBacklog = async (e: React.FormEvent) => {
    e.preventDefault();
    const title = backlogForm.title.trim();
    if (!title) {
      toast({ title: "Title is required", variant: "destructive" });
      return;
    }
    if (!projectId) return;
    try {
      await createBacklog.mutateAsync({
        projectId,
        data: {
          title,
          description: backlogForm.description.trim() || undefined,
          priority: backlogForm.priority,
        },
      });
      toast({ title: "Backlog item created" });
      setBacklogCreateOpen(false);
      setBacklogForm({ title: "", description: "", priority: 1 });
    } catch (err) {
      toast({
        title: "Failed to create backlog item",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  const handleUpdateBacklog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editBacklogItem) return;
    const title = backlogForm.title.trim();
    if (!title) {
      toast({ title: "Title is required", variant: "destructive" });
      return;
    }
    try {
      await updateBacklog.mutateAsync({
        itemId: editBacklogItem.backlog_item_id,
        data: {
          title,
          description: backlogForm.description.trim() || undefined,
          priority: backlogForm.priority,
        },
      });
      toast({ title: "Backlog item updated" });
      setEditBacklogItem(null);
      setBacklogForm({ title: "", description: "", priority: 1 });
    } catch (err) {
      toast({
        title: "Failed to update backlog item",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  const handleDeleteBacklogConfirm = async () => {
    if (deleteBacklogId == null) return;
    try {
      await deleteBacklog.mutateAsync(deleteBacklogId);
      toast({ title: "Backlog item deleted" });
      setDeleteBacklogId(null);
    } catch (err) {
      toast({
        title: "Failed to delete backlog item",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  const availableEmployees = useMemo(
    () =>
      isAdmin
        ? users.filter(
            (u) =>
              u.role === "EMPLOYEE" &&
              !members.some((m) => m.user_id === u.user_id),
          )
        : [],
    [isAdmin, users, members],
  );

  const toggleSelect = (userId: number) => {
    setSelectedIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId],
    );
  };

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId || selectedIds.length === 0) {
      toast({
        title: "Select at least one employee",
        variant: "destructive",
      });
      return;
    }
    try {
      await assignMembers.mutateAsync({ projectId, employeeIds: selectedIds });
      toast({ title: "Members assigned" });
      setAssignOpen(false);
      setSelectedIds([]);
    } catch (err) {
      toast({
        title: "Failed to assign members",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  const handleRemoveMember = async (memberId: number) => {
    if (!projectId) return;
    try {
      await removeMember.mutateAsync({ projectId, userId: memberId });
      toast({ title: "Member removed" });
    } catch (err) {
      toast({
        title: "Failed to remove member",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  if (projLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!project) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Project Not Found</h2>
            <Button onClick={() => navigate("/projects")}>Back to Projects</Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start justify-between"
        >
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{project.project_name}</h1>
            <p className="text-muted-foreground mt-1">{project.description}</p>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Team Members</CardTitle>
              <Users className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{members.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Sprints</CardTitle>
              <Calendar className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{sprints.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Backlog Items</CardTitle>
              <Package className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{backlog.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Duration</CardTitle>
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-sm font-medium">
                {project.start_date ? new Date(project.start_date).toLocaleDateString() : "—"} →{" "}
                {project.end_date ? new Date(project.end_date).toLocaleDateString() : "—"}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="sprints" className="space-y-4">
          <TabsList>
            <TabsTrigger value="sprints">Sprints</TabsTrigger>
            <TabsTrigger value="backlog">Backlog</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
          </TabsList>

          <TabsContent value="sprints" className="space-y-4">
            {/* Create sprint dialog */}
            <Dialog open={sprintCreateOpen} onOpenChange={setSprintCreateOpen}>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>New Sprint</DialogTitle>
                  <DialogDescription>Create a new sprint for this project.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateSprint} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="sprint-name">Sprint name *</Label>
                    <Input
                      id="sprint-name"
                      value={sprintForm.sprint_name}
                      onChange={(e) => setSprintForm((f) => ({ ...f, sprint_name: e.target.value }))}
                      placeholder="e.g. Sprint 1"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="sprint-start">Start date</Label>
                      <Input
                        id="sprint-start"
                        type="date"
                        value={sprintForm.start_date}
                        onChange={(e) => setSprintForm((f) => ({ ...f, start_date: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sprint-end">End date</Label>
                      <Input
                        id="sprint-end"
                        type="date"
                        value={sprintForm.end_date}
                        onChange={(e) => setSprintForm((f) => ({ ...f, end_date: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sprint-status">Status</Label>
                    <select
                      id="sprint-status"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={sprintForm.status}
                      onChange={(e) =>
                        setSprintForm((f) => ({ ...f, status: e.target.value as "PLANNED" | "ACTIVE" | "COMPLETED" }))
                      }
                    >
                      <option value="PLANNED">PLANNED</option>
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="COMPLETED">COMPLETED</option>
                    </select>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setSprintCreateOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createSprint.isPending}>
                      {createSprint.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            {/* Edit sprint dialog */}
            <Dialog open={!!editSprintItem} onOpenChange={(open) => !open && setEditSprintItem(null)}>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Edit Sprint</DialogTitle>
                  <DialogDescription>Update sprint name, dates, or status.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleUpdateSprint} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="sprint-edit-name">Sprint name *</Label>
                    <Input
                      id="sprint-edit-name"
                      value={sprintForm.sprint_name}
                      onChange={(e) => setSprintForm((f) => ({ ...f, sprint_name: e.target.value }))}
                      placeholder="e.g. Sprint 1"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="sprint-edit-start">Start date</Label>
                      <Input
                        id="sprint-edit-start"
                        type="date"
                        value={sprintForm.start_date}
                        onChange={(e) => setSprintForm((f) => ({ ...f, start_date: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sprint-edit-end">End date</Label>
                      <Input
                        id="sprint-edit-end"
                        type="date"
                        value={sprintForm.end_date}
                        onChange={(e) => setSprintForm((f) => ({ ...f, end_date: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sprint-edit-status">Status</Label>
                    <select
                      id="sprint-edit-status"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={sprintForm.status}
                      onChange={(e) =>
                        setSprintForm((f) => ({ ...f, status: e.target.value as "PLANNED" | "ACTIVE" | "COMPLETED" }))
                      }
                    >
                      <option value="PLANNED">PLANNED</option>
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="COMPLETED">COMPLETED</option>
                    </select>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setEditSprintItem(null)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={updateSprint.isPending}>
                      {updateSprint.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            {/* Delete sprint confirmation */}
            <AlertDialog open={deleteSprintId != null} onOpenChange={(open) => !open && setDeleteSprintId(null)}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete sprint?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This sprint and its tasks will be removed. This cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteSprintConfirm}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {deleteSprint.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Delete"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Sprint List</h3>
              {isAdmin && (
                <Button className="gap-2" onClick={openCreateSprint}>
                  <Plus className="w-4 h-4" />
                  New Sprint
                </Button>
              )}
            </div>
            {sprintsLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : sprints.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No sprints yet. Create your first sprint to get started.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {sprints.map((sprint) => (
                  <Card
                    key={sprint.sprint_id}
                    className="cursor-pointer hover:shadow-md transition-all"
                    onClick={() => navigate(`/sprint/${sprint.sprint_id}`)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <CardTitle className="text-lg">{sprint.sprint_name}</CardTitle>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                          {isAdmin && (
                            <>
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditSprint(sprint)}>
                                <Pencil className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive"
                                onClick={() => openDeleteSprint(sprint.sprint_id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                          <Badge className="bg-primary/10 text-primary capitalize">{sprint.status}</Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">Start Date</p>
                          <p className="font-medium">{new Date(sprint.start_date).toLocaleDateString()}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">End Date</p>
                          <p className="font-medium">{new Date(sprint.end_date).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="backlog" className="space-y-4">
            {/* Create backlog dialog */}
            <Dialog open={backlogCreateOpen} onOpenChange={setBacklogCreateOpen}>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Add backlog item</DialogTitle>
                  <DialogDescription>Create a new item in the project backlog.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateBacklog} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="bl-title">Title *</Label>
                    <Input
                      id="bl-title"
                      value={backlogForm.title}
                      onChange={(e) => setBacklogForm((f) => ({ ...f, title: e.target.value }))}
                      placeholder="Item title"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bl-desc">Description</Label>
                    <Textarea
                      id="bl-desc"
                      value={backlogForm.description}
                      onChange={(e) => setBacklogForm((f) => ({ ...f, description: e.target.value }))}
                      placeholder="Optional description"
                      rows={2}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bl-priority">Priority (number)</Label>
                    <Input
                      id="bl-priority"
                      type="number"
                      min={0}
                      value={backlogForm.priority}
                      onChange={(e) =>
                        setBacklogForm((f) => ({ ...f, priority: parseInt(e.target.value, 10) || 0 }))
                      }
                    />
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setBacklogCreateOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createBacklog.isPending}>
                      {createBacklog.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            {/* Edit backlog dialog */}
            <Dialog open={!!editBacklogItem} onOpenChange={(open) => !open && setEditBacklogItem(null)}>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Edit backlog item</DialogTitle>
                  <DialogDescription>Update title, description, or priority.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleUpdateBacklog} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="bl-edit-title">Title *</Label>
                    <Input
                      id="bl-edit-title"
                      value={backlogForm.title}
                      onChange={(e) => setBacklogForm((f) => ({ ...f, title: e.target.value }))}
                      placeholder="Item title"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bl-edit-desc">Description</Label>
                    <Textarea
                      id="bl-edit-desc"
                      value={backlogForm.description}
                      onChange={(e) => setBacklogForm((f) => ({ ...f, description: e.target.value }))}
                      placeholder="Optional description"
                      rows={2}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bl-edit-priority">Priority (number)</Label>
                    <Input
                      id="bl-edit-priority"
                      type="number"
                      min={0}
                      value={backlogForm.priority}
                      onChange={(e) =>
                        setBacklogForm((f) => ({ ...f, priority: parseInt(e.target.value, 10) || 0 }))
                      }
                    />
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setEditBacklogItem(null)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={updateBacklog.isPending}>
                      {updateBacklog.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            {/* Delete backlog confirmation */}
            <AlertDialog open={deleteBacklogId != null} onOpenChange={(open) => !open && setDeleteBacklogId(null)}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete backlog item?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This item will be removed from the backlog. This cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteBacklogConfirm}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {deleteBacklog.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Delete"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Backlog</h3>
              <Button className="gap-2" onClick={openCreateBacklog}>
                <Plus className="w-4 h-4" />
                Add Item
              </Button>
            </div>
            {backlogLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : backlog.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>Backlog is empty. Add items to plan future work.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {[...backlog]
                  .sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0))
                  .map((item) => (
                    <Card key={item.backlog_item_id}>
                      <CardContent className="py-3">
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-sm">{item.title}</p>
                            {item.description && (
                              <p className="text-xs text-muted-foreground truncate">{item.description}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <Badge variant="outline" className="text-2xs">
                              P{item.priority}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => openEditBacklog(item)}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => openDeleteBacklog(item.backlog_item_id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="team" className="space-y-4">
            <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Team Members</h3>
                {isAdmin && (
                  <Button
                    className="gap-2"
                    onClick={() => {
                      setSelectedIds([]);
                      setAssignOpen(true);
                    }}
                  >
                    <Plus className="w-4 h-4" />
                    Add Member
                  </Button>
                )}
              </div>

              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Assign employees</DialogTitle>
                  <DialogDescription>
                    Select employees who are not currently assigned to this project.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAssign} className="space-y-4">
                  {availableEmployees.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No available employees to assign.
                    </p>
                  ) : (
                    <div className="max-h-64 overflow-y-auto space-y-2">
                      {availableEmployees.map((emp) => (
                        <label
                          key={emp.user_id}
                          className="flex items-center justify-between gap-3 rounded-md border px-3 py-2 text-sm"
                        >
                          <div className="flex flex-col">
                            <span className="font-medium">{emp.full_name}</span>
                            <span className="text-xs text-muted-foreground">
                              {emp.email}
                            </span>
                          </div>
                          <Checkbox
                            checked={selectedIds.includes(emp.user_id)}
                            onCheckedChange={() => toggleSelect(emp.user_id)}
                          />
                        </label>
                      ))}
                    </div>
                  )}
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setAssignOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={assignMembers.isPending || selectedIds.length === 0}
                    >
                      {assignMembers.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        "Assign"
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            {members.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No team members assigned yet.</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {members.map((member) => (
                  <Card key={member.user_id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-lg font-medium text-primary">
                            {(member.full_name ?? "")
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase() || "?"}
                          </div>
                          <div>
                            <p className="font-medium">{member.full_name ?? "—"}</p>
                            <p className="text-sm text-muted-foreground">
                              {member.email ?? "—"}
                            </p>
                            <Badge
                              variant="outline"
                              className="text-2xs capitalize mt-1"
                            >
                              {member.role ?? "—"}
                            </Badge>
                          </div>
                        </div>
                        {isAdmin && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => handleRemoveMember(member.user_id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default ProjectDetail;
