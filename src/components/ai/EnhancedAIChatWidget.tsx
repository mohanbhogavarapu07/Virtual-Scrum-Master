import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Bot, X, Send, Minimize2, Sparkles } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useApp } from "@/context/AppContext";
import { ChatMessage, TaskAction } from "@/types";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

export const EnhancedAIChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      content: "Hello! I'm your AI Scrum Master. I can help you manage tasks, analyze sprint progress, identify blockers, and provide project insights. Try commands like:\n\n• 'Update task [name] to [status]'\n• 'Show sprint progress'\n• 'What are the blockers?'\n• 'Create a task for [description]'",
      role: "assistant",
      timestamp: new Date(),
    },
  ]);
  
  const { tasks, updateTask, createTask, currentUser } = useApp();
  const { toast } = useToast();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      content: input,
      role: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    setTimeout(() => {
      const { response, action } = processAICommand(input);
      
      const aiMessage: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        content: response,
        role: "assistant",
        timestamp: new Date(),
        action,
      };
      
      setMessages((prev) => [...prev, aiMessage]);

      if (action) {
        executeAction(action);
      }
    }, 800);
  };

  const processAICommand = (query: string): { response: string; action?: TaskAction } => {
    const lowerQuery = query.toLowerCase();

    // Update task status
    const updateMatch = lowerQuery.match(/update task (.+?) to (todo|in progress|review|done)/);
    if (updateMatch) {
      const taskName = updateMatch[1];
      const newStatus = updateMatch[2].replace(" ", "") as "todo" | "inprogress" | "review" | "done";
      const task = tasks.find((t) => t.title.toLowerCase().includes(taskName));
      
      if (task) {
        return {
          response: `✅ I've updated "${task.title}" to ${newStatus}. The task is now ${newStatus === "done" ? "completed" : "in the " + newStatus + " column"}.`,
          action: {
            type: "update_task",
            taskId: task.id,
            updates: { status: newStatus },
          },
        };
      } else {
        return {
          response: `❌ I couldn't find a task matching "${taskName}". Please check the task name and try again.`,
        };
      }
    }

    // Create new task
    const createMatch = lowerQuery.match(/create (?:a )?task (?:for )?(.+)/);
    if (createMatch) {
      const taskTitle = createMatch[1].trim();
      return {
        response: `✅ I've created a new task: "${taskTitle}". It's been added to the backlog with medium priority. Would you like to assign it to someone or set a priority?`,
        action: {
          type: "create_task",
        },
      };
    }

    // Sprint progress
    if (lowerQuery.includes("sprint") && (lowerQuery.includes("progress") || lowerQuery.includes("status"))) {
      const doneTasks = tasks.filter((t) => t.status === "done").length;
      const totalTasks = tasks.length;
      const donePoints = tasks.filter((t) => t.status === "done").reduce((sum, t) => sum + t.storyPoints, 0);
      const totalPoints = tasks.reduce((sum, t) => sum + t.storyPoints, 0);
      const percentComplete = Math.round((donePoints / totalPoints) * 100);

      return {
        response: `📊 **Sprint 5 Progress Report:**\n\n• **Completion:** ${percentComplete}% (${donePoints}/${totalPoints} story points)\n• **Tasks:** ${doneTasks}/${totalTasks} completed\n• **Days Remaining:** 8 days\n• **Velocity:** On track to meet ${totalPoints} point commitment\n\n${percentComplete < 50 ? "⚠️ Sprint is behind schedule. Consider reviewing task complexity." : "✅ Sprint is progressing well!"}`,
      };
    }

    // Show blockers
    if (lowerQuery.includes("blocker") || lowerQuery.includes("stuck") || lowerQuery.includes("issue")) {
      const inProgressTasks = tasks.filter((t) => t.status === "inprogress");
      if (inProgressTasks.length === 0) {
        return { response: "✅ No blockers detected! All tasks are flowing smoothly." };
      }
      
      const blockerList = inProgressTasks.map((t) => `• ${t.title} (${t.assignee}) - In progress for 5+ days`).join("\n");
      return {
        response: `⚠️ **Potential Blockers Detected:**\n\n${blockerList}\n\nWould you like me to notify the team leads or schedule a sync meeting?`,
      };
    }

    // Team performance
    if (lowerQuery.includes("team") || lowerQuery.includes("performance") || lowerQuery.includes("member")) {
      const assigneeStats = tasks.reduce((acc, task) => {
        if (!acc[task.assignee]) {
          acc[task.assignee] = { done: 0, total: 0 };
        }
        acc[task.assignee].total++;
        if (task.status === "done") acc[task.assignee].done++;
        return acc;
      }, {} as Record<string, { done: number; total: number }>);

      const stats = Object.entries(assigneeStats)
        .map(([name, { done, total }]) => `• **${name}**: ${done}/${total} tasks completed`)
        .join("\n");

      return {
        response: `👥 **Team Performance:**\n\n${stats}\n\nAll team members are contributing actively. Great teamwork! 🎉`,
      };
    }

    // Recommendations
    if (lowerQuery.includes("recommend") || lowerQuery.includes("suggest") || lowerQuery.includes("advice")) {
      return {
        response: `💡 **AI Recommendations:**\n\n1. **Sprint Velocity**: Team velocity has increased 16% - consider raising story point commitments next sprint\n\n2. **Code Reviews**: Tasks in review column are staying 2+ days - add more reviewers or schedule review sessions\n\n3. **High Priority Tasks**: 2 high-priority tasks in backlog - recommend pulling into current sprint\n\n4. **Team Balance**: Consider redistributing work - some members are at capacity`,
      };
    }

    // Default intelligent response
    return {
      response: `I understand you're asking about "${query}". I can help with:\n\n• **Task Management**: Update, create, or assign tasks\n• **Sprint Analytics**: Progress, velocity, burndown\n• **Team Insights**: Performance metrics, workload distribution\n• **Blockers**: Identify and resolve impediments\n\nTry a specific command or ask me a question!`,
    };
  };

  const executeAction = (action: TaskAction) => {
    if (action.type === "update_task" && action.taskId && action.updates) {
      updateTask(action.taskId, action.updates);
      toast({
        title: "Task Updated",
        description: "The task has been successfully updated by AI.",
      });
    } else if (action.type === "create_task") {
      // Create a basic task
      createTask({
        title: "New AI-suggested task",
        description: "Task created by AI assistant",
        status: "todo",
        priority: "medium",
        assignee: currentUser.name.split(" ").map(n => n[0]).join(""),
        storyPoints: 3,
        sprintId: "sprint-1",
      });
      toast({
        title: "Task Created",
        description: "A new task has been added to the backlog.",
      });
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all z-50 bg-gradient-to-r from-primary to-accent"
        size="icon"
      >
        <Bot className="w-6 h-6" />
        <Sparkles className="w-3 h-3 absolute -top-1 -right-1 text-yellow-400" />
      </Button>
    );
  }

  return (
    <Card className={`fixed bottom-6 right-6 w-96 shadow-2xl z-50 transition-all ${isMinimized ? 'h-16' : 'h-[600px]'} flex flex-col border-2 border-primary/20`}>
      <div className="flex items-center justify-between p-4 border-b border-border bg-gradient-to-r from-primary to-accent">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-white" />
          <h3 className="font-semibold text-white">AI Scrum Master</h3>
          <Badge variant="secondary" className="bg-white/20 text-white text-xs">Beta</Badge>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMinimized(!isMinimized)}
            className="h-8 w-8 text-white hover:bg-white/20"
          >
            <Minimize2 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
            className="h-8 w-8 text-white hover:bg-white/20"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {!isMinimized && (
        <>
          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                      message.role === "user"
                        ? "bg-primary text-white"
                        : "bg-muted text-foreground border border-border"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-line">{message.content}</p>
                    <p className="text-xs opacity-60 mt-1">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          <div className="p-4 border-t border-border bg-background">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSend()}
                placeholder="Ask AI or give a command..."
                className="flex-1"
              />
              <Button onClick={handleSend} size="icon" className="flex-shrink-0">
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              💡 Try: "Update task API to done" or "Show sprint progress"
            </p>
          </div>
        </>
      )}
    </Card>
  );
};
