import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, MoreVertical } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { Task } from "@/types";
import { FadeIn } from "@/components/ui/fade-in";
import { motion } from "framer-motion";

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
      <div className="space-y-8">
        <FadeIn>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold tracking-tight mb-2">Sprint Board</h1>
              <p className="text-muted-foreground text-lg">{sprint.name} · {sprint.goal}</p>
            </div>
            <Button className="gap-2 rounded-xl shadow-sm hover:shadow-md">
              <Plus className="w-4 h-4" />
              Add Task
            </Button>
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {columns.map((column, colIndex) => (
            <FadeIn key={column.id} delay={colIndex * 0.1}>
              <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-2.5 h-2.5 rounded-full ${column.color}`} />
                    <h3 className="font-semibold text-sm">{column.title}</h3>
                    <Badge variant="secondary" className="text-xs rounded-lg px-2 bg-muted/50">
                      {groupedTasks[column.id]?.length || 0}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-3">
                  {groupedTasks[column.id]?.map((task, taskIndex) => (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: colIndex * 0.1 + taskIndex * 0.05 }}
                      whileHover={{ scale: 1.02 }}
                    >
                      <Card className="p-4 cursor-pointer border-none shadow-sm hover:shadow-md transition-all bg-card/50 backdrop-blur-sm">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm font-medium leading-tight text-foreground">{task.title}</p>
                            <Button variant="ghost" size="icon" className="h-7 w-7 -mr-2 -mt-1 rounded-lg hover:bg-muted">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </div>

                          <div className="flex items-center justify-between">
                            <Badge className={`${getPriorityColor(task.priority)} rounded-lg px-2.5 py-0.5 text-xs font-medium border-0`}>
                              {task.priority}
                            </Badge>
                            <span className="text-xs text-muted-foreground font-medium">{task.storyPoints} pts</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
                              {task.assignee}
                            </div>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}

                  <Button
                    variant="ghost"
                    className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl transition-all"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add task
                  </Button>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SprintBoard;
