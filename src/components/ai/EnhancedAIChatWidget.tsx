import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Bot, X, Send, Minimize2, Sparkles, Zap, AlertTriangle, CheckCircle2, RefreshCw } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useApp } from "@/context/AppContext";
import { ChatMessage, TaskAction } from "@/types";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const quickActions = [
  { label: "Sprint status", command: "show sprint progress" },
  { label: "Blockers", command: "what are the blockers?" },
  { label: "Recommendations", command: "give me recommendations" },
  { label: "Team performance", command: "show team performance" },
];

export const EnhancedAIChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      content: "👋 Hi! I'm your AI Scrum Master. I can help you manage tasks, analyze sprint progress, and provide actionable recommendations.\n\nTry asking me about sprint status, blockers, or team performance.",
      role: "assistant",
      timestamp: new Date(),
      confidence: 0.95,
    },
  ]);
  
  const { tasks, updateTask, createTask, currentUser, sprintMetrics, blockers } = useApp();
  const { toast } = useToast();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = (customInput?: string) => {
    const messageText = customInput || input;
    if (!messageText.trim()) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      content: messageText,
      role: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const { response, action, confidence, reasoning } = processAICommand(messageText);
      
      const aiMessage: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        content: response,
        role: "assistant",
        timestamp: new Date(),
        action,
        confidence,
        reasoning,
      };
      
      setMessages((prev) => [...prev, aiMessage]);
      setIsTyping(false);

      if (action) {
        executeAction(action);
      }
    }, 1000);
  };

  const processAICommand = (query: string): { response: string; action?: TaskAction; confidence?: number; reasoning?: string } => {
    const lowerQuery = query.toLowerCase();

    // Update task status
    const updateMatch = lowerQuery.match(/update task (.+?) to (todo|in progress|review|done)/);
    if (updateMatch) {
      const taskName = updateMatch[1];
      const newStatus = updateMatch[2].replace(" ", "") as "todo" | "inprogress" | "review" | "done";
      const task = tasks.find((t) => t.title.toLowerCase().includes(taskName));
      
      if (task) {
        return {
          response: `✅ Updated "${task.title}" to ${newStatus}.\n\nThis change has been reflected in the sprint board.`,
          action: {
            type: "update_task",
            taskId: task.id,
            updates: { status: newStatus },
            label: `Move to ${newStatus}`,
          },
          confidence: 0.95,
          reasoning: "Direct task update request with clear target and status.",
        };
      } else {
        return {
          response: `❌ Couldn't find a task matching "${taskName}". Available tasks:\n\n${tasks.slice(0, 3).map(t => `• ${t.title}`).join('\n')}`,
          confidence: 0.7,
        };
      }
    }

    // Mark blocker
    if (lowerQuery.includes("mark") && lowerQuery.includes("blocker")) {
      return {
        response: "🚫 I can help you mark a task as blocked. Which task would you like to mark?\n\nCurrent in-progress tasks:\n" + 
          tasks.filter(t => t.status === "inprogress").map(t => `• ${t.title} (${t.assignee})`).join('\n'),
        action: { type: "mark_blocker", label: "Mark as Blocked" },
        confidence: 0.85,
      };
    }

    // Sprint progress
    if (lowerQuery.includes("sprint") && (lowerQuery.includes("progress") || lowerQuery.includes("status"))) {
      const percentComplete = Math.round((sprintMetrics.completedPoints / sprintMetrics.totalPoints) * 100);
      const riskEmoji = sprintMetrics.riskStatus === "on-track" ? "✅" : sprintMetrics.riskStatus === "at-risk" ? "⚠️" : "🔴";

      return {
        response: `📊 **Sprint 5 Status Report**\n\n**Progress:** ${percentComplete}% complete\n• Completed: ${sprintMetrics.completedPoints} pts\n• Remaining: ${sprintMetrics.remainingPoints} pts\n• Days left: ${sprintMetrics.daysRemaining}\n\n**Status:** ${riskEmoji} ${sprintMetrics.riskStatus.replace("-", " ").toUpperCase()}\n\n**Velocity:** ${sprintMetrics.velocity} pts (↑${Math.round(((sprintMetrics.velocity - sprintMetrics.previousVelocity) / sprintMetrics.previousVelocity) * 100)}% vs last sprint)\n\n${sprintMetrics.riskStatus !== "on-track" ? "**⚠️ Recommendation:** Consider rebalancing tasks or addressing blockers to get back on track." : "**✅ Great job!** The team is on track to meet sprint goals."}`,
        confidence: 0.98,
        reasoning: "Comprehensive sprint analysis based on current metrics.",
      };
    }

    // Show blockers
    if (lowerQuery.includes("blocker") || lowerQuery.includes("stuck") || lowerQuery.includes("issue")) {
      if (blockers.length === 0) {
        return { 
          response: "✅ **No blockers detected!**\n\nAll tasks are flowing smoothly through the sprint. Great teamwork!",
          confidence: 0.95,
        };
      }
      
      const blockerList = blockers.map((b) => 
        `• **${b.taskTitle}** (${b.assignee})\n  └ ${b.reason}\n  └ Blocked for ${b.daysBlocked} days | Severity: ${b.severity}`
      ).join("\n\n");
      
      return {
        response: `⚠️ **${blockers.length} Active Blocker${blockers.length > 1 ? 's' : ''}:**\n\n${blockerList}\n\n**Suggested Actions:**\n• Schedule a sync meeting with affected team members\n• Consider reassigning tasks to unblock dependencies\n• Escalate high-severity blockers to management`,
        action: { type: "rebalance", label: "Rebalance Sprint" },
        confidence: 0.92,
        reasoning: "Blockers detected that may impact sprint completion.",
      };
    }

    // Team performance
    if (lowerQuery.includes("team") || lowerQuery.includes("performance") || lowerQuery.includes("member")) {
      const assigneeStats = tasks.reduce((acc, task) => {
        if (!acc[task.assignee]) {
          acc[task.assignee] = { done: 0, total: 0, points: 0 };
        }
        acc[task.assignee].total++;
        acc[task.assignee].points += task.storyPoints;
        if (task.status === "done") acc[task.assignee].done++;
        return acc;
      }, {} as Record<string, { done: number; total: number; points: number }>);

      const stats = Object.entries(assigneeStats)
        .map(([name, { done, total, points }]) => 
          `• **${name}**: ${done}/${total} tasks (${points} pts) ${done === total ? '✅' : ''}`
        )
        .join("\n");

      return {
        response: `👥 **Team Performance - Sprint 5**\n\n${stats}\n\n**Summary:**\n• Team is working collaboratively\n• ${Object.values(assigneeStats).filter(s => s.done === s.total).length} members have completed all assigned tasks\n• Consider load balancing for next sprint`,
        confidence: 0.9,
      };
    }

    // Recommendations
    if (lowerQuery.includes("recommend") || lowerQuery.includes("suggest") || lowerQuery.includes("advice")) {
      return {
        response: `💡 **AI Recommendations for Sprint 5:**\n\n**1. Address Blockers (Priority: High)**\nTwo tasks are currently blocked. Resolving these could unblock 13 story points.\n\n**2. Sprint Velocity Opportunity**\nVelocity increased 18% - consider increasing story point commitment next sprint by 5-8 points.\n\n**3. Workload Rebalancing**\nJW has heavy workload (16 pts). Consider redistributing to MR or AL who have capacity.\n\n**4. Code Review Bottleneck**\nAverage time in review is 3.2 days. Add more reviewers or schedule daily review sessions.`,
        action: { type: "rebalance", label: "Apply Recommendations" },
        confidence: 0.88,
        reasoning: "Based on current sprint metrics, blockers, and team performance data.",
      };
    }

    // Create task
    const createMatch = lowerQuery.match(/create (?:a )?task (?:for )?(.+)/);
    if (createMatch) {
      const taskTitle = createMatch[1].trim();
      return {
        response: `✅ Created new task: "${taskTitle}"\n\n• Added to backlog\n• Priority: Medium\n• Story Points: 3\n\nWould you like me to assign it to someone or adjust the priority?`,
        action: { type: "create_task", label: "Create Task" },
        confidence: 0.9,
      };
    }

    // Default response
    return {
      response: `I can help you with:\n\n• **Sprint Management**: "Show sprint progress", "What's our velocity?"\n• **Blockers**: "What are the blockers?", "Mark task as blocker"\n• **Team Insights**: "Show team performance", "Who has capacity?"\n• **Recommendations**: "Give me recommendations", "How can we improve?"\n• **Task Actions**: "Update task X to done", "Create task for Y"\n\nWhat would you like to know?`,
      confidence: 0.6,
    };
  };

  const executeAction = (action: TaskAction) => {
    if (action.type === "update_task" && action.taskId && action.updates) {
      updateTask(action.taskId, action.updates);
      toast({
        title: "Task Updated",
        description: "Task status updated by AI Scrum Master.",
      });
    } else if (action.type === "create_task") {
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
        description: "New task added to the backlog.",
      });
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 h-12 w-12 rounded-full shadow-lg hover:shadow-xl transition-all z-50 bg-gradient-to-r from-primary to-accent"
        size="icon"
      >
        <Bot className="w-5 h-5" />
        {blockers.length > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive rounded-full text-2xs font-bold flex items-center justify-center text-white">
            {blockers.length}
          </span>
        )}
      </Button>
    );
  }

  return (
    <Card className={cn(
      "fixed bottom-4 right-4 w-96 shadow-xl z-50 transition-all flex flex-col border border-border",
      isMinimized ? 'h-14' : 'h-[500px]'
    )}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-gradient-to-r from-primary to-accent rounded-t-lg">
        <div className="flex items-center gap-2">
          <Bot className="w-4 h-4 text-white" />
          <span className="text-sm font-semibold text-white">AI Scrum Master</span>
          <Badge className="bg-white/20 text-white text-2xs border-0">Beta</Badge>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMinimized(!isMinimized)}
            className="h-7 w-7 text-white hover:bg-white/20"
          >
            <Minimize2 className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
            className="h-7 w-7 text-white hover:bg-white/20"
          >
            <X className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <ScrollArea className="flex-1 p-3" ref={scrollRef}>
            <div className="space-y-3">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn("flex", message.role === "user" ? "justify-end" : "justify-start")}
                >
                  <div
                    className={cn(
                      "max-w-[85%] rounded-lg px-3 py-2",
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    )}
                  >
                    <p className="text-sm whitespace-pre-line">{message.content}</p>
                    {message.action && (
                      <Button 
                        size="sm" 
                        variant={message.role === "user" ? "secondary" : "outline"}
                        className="mt-2 h-7 text-xs gap-1"
                      >
                        <Zap className="w-3 h-3" />
                        {message.action.label}
                      </Button>
                    )}
                    {message.confidence && message.role === "assistant" && (
                      <div className="flex items-center gap-1 mt-2 text-2xs text-muted-foreground">
                        <span>Confidence: {Math.round(message.confidence * 100)}%</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-lg px-3 py-2">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                      <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Quick Actions */}
          <div className="px-3 py-2 border-t border-border">
            <div className="flex flex-wrap gap-1.5">
              {quickActions.map((action) => (
                <Button
                  key={action.label}
                  variant="outline"
                  size="sm"
                  className="h-6 text-2xs px-2"
                  onClick={() => handleSend(action.command)}
                >
                  {action.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Input */}
          <div className="p-3 border-t border-border">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSend()}
                placeholder="Ask AI or give a command..."
                className="flex-1 h-9 text-sm"
              />
              <Button onClick={() => handleSend()} size="icon" className="h-9 w-9">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </>
      )}
    </Card>
  );
};
