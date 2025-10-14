import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, MoreVertical } from "lucide-react";

const columns = [
  { id: "todo", title: "To Do", color: "bg-slate-500" },
  { id: "inprogress", title: "In Progress", color: "bg-blue-500" },
  { id: "review", title: "Review", color: "bg-yellow-500" },
  { id: "done", title: "Done", color: "bg-green-500" },
];

const tasks = {
  todo: [
    {
      id: 1,
      title: "Implement user authentication",
      assignee: "SC",
      priority: "high",
      points: 8,
    },
    {
      id: 2,
      title: "Design payment flow wireframes",
      assignee: "MR",
      priority: "medium",
      points: 5,
    },
  ],
  inprogress: [
    {
      id: 3,
      title: "API endpoint development",
      assignee: "JW",
      priority: "high",
      points: 13,
    },
    {
      id: 4,
      title: "Database schema optimization",
      assignee: "DK",
      priority: "medium",
      points: 8,
    },
  ],
  review: [
    {
      id: 5,
      title: "Mobile responsive layouts",
      assignee: "SC",
      priority: "medium",
      points: 5,
    },
  ],
  done: [
    {
      id: 6,
      title: "Setup CI/CD pipeline",
      assignee: "MR",
      priority: "high",
      points: 8,
    },
    {
      id: 7,
      title: "Initial project documentation",
      assignee: "JW",
      priority: "low",
      points: 3,
    },
  ],
};

const SprintBoard = () => {
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
            <p className="text-muted-foreground mt-1">Sprint 5 - E-commerce Platform Redesign</p>
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
                    {tasks[column.id as keyof typeof tasks].length}
                  </Badge>
                </div>
              </div>

              <div className="space-y-3">
                {tasks[column.id as keyof typeof tasks].map((task) => (
                  <Card
                    key={task.id}
                    className="p-4 hover:shadow-md transition-all cursor-grab active:cursor-grabbing"
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
                        <span className="text-xs text-muted-foreground">{task.points} pts</span>
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
