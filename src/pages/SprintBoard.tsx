import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, MoreVertical } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { Task } from "@/types";

const columns = [
  { id: "todo", title: "To Do", color: "bg-slate-500" },
  { id: "inprogress", title: "In Progress", color: "bg-blue-500" },
  { id: "review", title: "Review", color: "bg-yellow-500" },
  { id: "done", title: "Done", color: "bg-green-500" },
];

const SprintBoard = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getSprint, tasks, updateTask } = useApp();
  
  const sprint = getSprint(id || "sprint-1");
  const sprintTasks = tasks.filter(t => t.sprintId === (id || "sprint-1"));
  
  if (!sprint) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Sprint Not Found</h2>
            <p className="text-muted-foreground mb-4">The sprint you're looking for doesn't exist.</p>
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
  
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500/10 text-red-500 hover:bg-red-500/20";
      case "medium":
        return "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20";
      case "low":
        return "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Sprint Board</h1>
            <p className="text-muted-foreground mt-1">{sprint.name} - {sprint.goal}</p>
          </div>
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Add Task
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {columns.map((column) => (
            <div key={column.id} className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${column.color}`} />
                  <h3 className="font-semibold">{column.title}</h3>
                  <Badge variant="secondary" className="text-xs">
                    {groupedTasks[column.id]?.length || 0}
                  </Badge>
                </div>
              </div>

              <div className="space-y-3">
                {groupedTasks[column.id]?.map((task) => (
                  <Card
                    key={task.id}
                    className="p-4 hover:shadow-md transition-all cursor-pointer"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium leading-tight">{task.title}</p>
                        <Button variant="ghost" size="icon" className="h-6 w-6 -mr-2 -mt-1">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="flex items-center justify-between">
                        <Badge className={getPriorityColor(task.priority)}>
                          {task.priority}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{task.storyPoints} pts</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                          {task.assignee}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}

                <Button
                  variant="ghost"
                  className="w-full justify-start text-muted-foreground hover:text-foreground"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add task
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SprintBoard;
