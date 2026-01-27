import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Plus, 
  MoreHorizontal, 
  Clock, 
  AlertTriangle,
  GripVertical,
  Filter,
  Users
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { Task } from "@/types";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const columns = [
  { id: "todo", title: "To Do", color: "bg-muted-foreground" },
  { id: "inprogress", title: "In Progress", color: "bg-primary" },
  { id: "review", title: "Review", color: "bg-warning" },
  { id: "done", title: "Done", color: "bg-success" },
];

const SprintBoard = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getSprint, tasks, updateTask, sprintMetrics } = useApp();
  
  const sprint = getSprint(id || "sprint-1");
  const sprintTasks = tasks.filter(t => t.sprintId === (id || "sprint-1"));
  
  if (!sprint) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Sprint Not Found</h2>
            <p className="text-sm text-muted-foreground mb-4">The sprint you're looking for doesn't exist.</p>
            <Button onClick={() => navigate("/dashboard")}>Go to Dashboard</Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const groupedTasks = columns.reduce((acc, col) => {
    acc[col.id] = sprintTasks.filter(task => task.status === col.id);
    return acc;
  }, {} as Record<string, Task[]>);

  const getColumnPoints = (columnId: string) => {
    return groupedTasks[columnId]?.reduce((sum, t) => sum + t.storyPoints, 0) || 0;
  };
  
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "critical":
        return <Badge className="text-2xs bg-destructive/10 text-destructive border-0 px-1.5">Critical</Badge>;
      case "high":
        return <Badge className="text-2xs bg-orange-500/10 text-orange-600 border-0 px-1.5">High</Badge>;
      case "medium":
        return <Badge className="text-2xs bg-warning/10 text-warning border-0 px-1.5">Medium</Badge>;
      case "low":
        return <Badge variant="outline" className="text-2xs px-1.5">Low</Badge>;
      default:
        return null;
    }
  };

  const progressPercent = Math.round((sprintMetrics.completedPoints / sprintMetrics.totalPoints) * 100);

  return (
    <DashboardLayout>
      <div className="space-y-4 h-full flex flex-col">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between flex-shrink-0"
        >
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-semibold">{sprint.name}</h1>
              <Badge className="text-2xs bg-primary/10 text-primary border-0">Active</Badge>
            </div>
            <p className="text-sm text-muted-foreground">{sprint.goal}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-1.5">
              <Filter className="w-4 h-4" />
              Filter
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5">
              <Users className="w-4 h-4" />
              Team
            </Button>
            <Button size="sm" className="gap-1.5">
              <Plus className="w-4 h-4" />
              Add Task
            </Button>
          </div>
        </motion.div>

        {/* Sprint Progress Bar */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card border border-border rounded-lg p-3 flex-shrink-0"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">Sprint Progress</span>
              <span className="text-xs text-muted-foreground">
                {sprintMetrics.completedPoints} / {sprintMetrics.totalPoints} pts completed
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>{sprintMetrics.daysRemaining} days remaining</span>
              <Badge 
                className={cn(
                  "text-2xs border-0",
                  sprintMetrics.riskStatus === "on-track" ? "bg-success/10 text-success" :
                  sprintMetrics.riskStatus === "at-risk" ? "bg-warning/10 text-warning" : 
                  "bg-destructive/10 text-destructive"
                )}
              >
                {sprintMetrics.riskStatus.replace("-", " ")}
              </Badge>
            </div>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="h-full bg-primary rounded-full"
            />
          </div>
        </motion.div>

        {/* Kanban Board */}
        <div className="flex-1 grid grid-cols-4 gap-4 min-h-0">
          {columns.map((column, colIndex) => (
            <motion.div 
              key={column.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + colIndex * 0.05 }}
              className="flex flex-col bg-muted/30 rounded-lg overflow-hidden"
            >
              {/* Column Header */}
              <div className="px-3 py-2.5 border-b border-border bg-card flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={cn("w-2 h-2 rounded-full", column.color)} />
                  <span className="text-sm font-medium">{column.title}</span>
                  <Badge variant="secondary" className="text-2xs px-1.5">
                    {groupedTasks[column.id]?.length || 0}
                  </Badge>
                </div>
                <span className="text-xs text-muted-foreground">{getColumnPoints(column.id)} pts</span>
              </div>

              {/* Tasks */}
              <div className="flex-1 overflow-y-auto p-2 space-y-2">
                {groupedTasks[column.id]?.map((task, taskIndex) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 + colIndex * 0.05 + taskIndex * 0.03 }}
                    whileHover={{ y: -1 }}
                    className="bg-card border border-border rounded-md p-3 cursor-pointer hover:shadow-sm transition-all group"
                  >
                    {/* Task Header */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <p className="text-sm font-medium leading-tight">{task.title}</p>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <MoreHorizontal className="w-3.5 h-3.5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem className="text-xs">Edit Task</DropdownMenuItem>
                          <DropdownMenuItem className="text-xs">Assign To</DropdownMenuItem>
                          <DropdownMenuItem className="text-xs">Add Label</DropdownMenuItem>
                          <DropdownMenuItem className="text-xs text-destructive">Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Task Tags */}
                    {task.tags && task.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {task.tags.slice(0, 2).map(tag => (
                          <Badge key={tag} variant="outline" className="text-2xs px-1.5 py-0">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Task Indicators */}
                    {(task.isBlocked || (task.daysInProgress && task.daysInProgress > 5)) && (
                      <div className="flex items-center gap-2 mb-2">
                        {task.isBlocked && (
                          <span className="inline-flex items-center gap-1 text-2xs text-destructive">
                            <AlertTriangle className="w-3 h-3" /> Blocked
                          </span>
                        )}
                        {task.daysInProgress && task.daysInProgress > 5 && (
                          <span className="inline-flex items-center gap-1 text-2xs text-warning">
                            <Clock className="w-3 h-3" /> {task.daysInProgress}d
                          </span>
                        )}
                      </div>
                    )}

                    {/* Task Footer */}
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-border">
                      <div className="flex items-center gap-2">
                        {getPriorityBadge(task.priority)}
                        <span className="text-2xs text-muted-foreground">{task.storyPoints} pts</span>
                      </div>
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary/60 to-accent/60 flex items-center justify-center text-2xs font-semibold text-white">
                        {task.assignee}
                      </div>
                    </div>
                  </motion.div>
                ))}

                {/* Add Task Button */}
                <Button
                  variant="ghost"
                  className="w-full justify-start text-muted-foreground hover:text-foreground h-9 text-sm"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add task
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SprintBoard;
