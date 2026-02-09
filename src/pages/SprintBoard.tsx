import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, MoreHorizontal, Loader2 } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { useSprint, useSprintTasks, useUpdateTaskStatus } from "@/hooks/useApiHooks";
import { ApiTask, TaskStatus } from "@/types";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const columns: { id: TaskStatus; title: string; color: string }[] = [
  { id: "TODO", title: "To Do", color: "bg-muted-foreground" },
  { id: "IN_PROGRESS", title: "In Progress", color: "bg-primary" },
  { id: "DONE", title: "Done", color: "bg-success" },
];

const SprintBoard = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const sprintId = Number(id);
  const { data: sprint, isLoading: sprintLoading } = useSprint(sprintId);
  const { data: tasks = [], isLoading: tasksLoading } = useSprintTasks(sprintId);
  const updateStatus = useUpdateTaskStatus();

  if (sprintLoading || tasksLoading) {
    return <DashboardLayout><div className="flex items-center justify-center h-96"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div></DashboardLayout>;
  }
  if (!sprint) {
    return <DashboardLayout><div className="flex items-center justify-center h-96"><div className="text-center"><h2 className="text-xl font-semibold mb-2">Sprint Not Found</h2><Button onClick={() => navigate("/dashboard")}>Go to Dashboard</Button></div></div></DashboardLayout>;
  }

  const groupedTasks = columns.reduce((acc, col) => { acc[col.id] = tasks.filter(t => t.status === col.id); return acc; }, {} as Record<TaskStatus, ApiTask[]>);
  const completedCount = groupedTasks["DONE"]?.length ?? 0;
  const totalCount = tasks.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <DashboardLayout>
      <div className="space-y-4 h-full flex flex-col">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between flex-shrink-0">
          <div>
            <div className="flex items-center gap-3"><h1 className="text-xl font-semibold">{sprint.sprint_name}</h1><Badge className="text-2xs bg-primary/10 text-primary border-0 capitalize">{sprint.status}</Badge></div>
            <p className="text-sm text-muted-foreground">{new Date(sprint.start_date).toLocaleDateString()} — {new Date(sprint.end_date).toLocaleDateString()}</p>
          </div>
          <Button size="sm" className="gap-1.5"><Plus className="w-4 h-4" />Add Task</Button>
        </motion.div>

        <div className="bg-card border border-border rounded-lg p-3 flex-shrink-0">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Sprint Progress</span>
            <span className="text-xs text-muted-foreground">{completedCount}/{totalCount} tasks</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: `${progressPercent}%` }} transition={{ duration: 0.8 }} className="h-full bg-primary rounded-full" />
          </div>
        </div>

        <div className="flex-1 grid grid-cols-3 gap-4 min-h-0">
          {columns.map((column) => (
            <div key={column.id} className="flex flex-col bg-muted/30 rounded-lg overflow-hidden">
              <div className="px-3 py-2.5 border-b border-border bg-card flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={cn("w-2 h-2 rounded-full", column.color)} />
                  <span className="text-sm font-medium">{column.title}</span>
                  <Badge variant="secondary" className="text-2xs px-1.5">{groupedTasks[column.id]?.length || 0}</Badge>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-2 space-y-2">
                {groupedTasks[column.id]?.map((task) => (
                  <div key={task.task_id} className="bg-card border border-border rounded-md p-3 cursor-pointer hover:shadow-sm transition-all group">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <p className="text-sm font-medium leading-tight">{task.title}</p>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100"><MoreHorizontal className="w-3.5 h-3.5" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          {columns.filter(c => c.id !== column.id).map(c => (
                            <DropdownMenuItem key={c.id} className="text-xs" onClick={() => updateStatus.mutate({ taskId: task.task_id, status: c.id })}>Move to {c.title}</DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    {task.description && <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{task.description}</p>}
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-border">
                      <span className="text-2xs text-muted-foreground">{new Date(task.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
                <Button variant="ghost" className="w-full justify-start text-muted-foreground h-9 text-sm"><Plus className="w-4 h-4 mr-2" />Add task</Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SprintBoard;
