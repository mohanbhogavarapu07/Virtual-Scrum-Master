import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Bot, X, Send, Minimize2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Message {
  id: number;
  content: string;
  role: "user" | "assistant";
}

export const AIChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      content: "Hello! I'm your AI Scrum Assistant. I can help you with sprint planning, task management, and team insights. What would you like to know?",
      role: "assistant",
    },
  ]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: messages.length + 1,
      content: input,
      role: "user",
    };

    setMessages([...messages, userMessage]);
    setInput("");

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: Message = {
        id: messages.length + 2,
        content: getAIResponse(input),
        role: "assistant",
      };
      setMessages((prev) => [...prev, aiMessage]);
    }, 1000);
  };

  const getAIResponse = (query: string): string => {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes("sprint") && lowerQuery.includes("progress")) {
      return "Your current sprint (Sprint 5) is 65% complete with 8 days remaining. You've completed 32 story points out of 50. The team is slightly behind schedule, but velocity has been increasing over the last 3 sprints.";
    }
    
    if (lowerQuery.includes("task") || lowerQuery.includes("update")) {
      return "I can help you update tasks. Please specify which task you'd like to update and the new status. For example: 'Update task API endpoint development to done'";
    }
    
    if (lowerQuery.includes("team") || lowerQuery.includes("member")) {
      return "Your team consists of 8 members across 5 active projects. Sarah has the highest completion rate this month with 52 tasks. Would you like me to show individual member performance?";
    }
    
    if (lowerQuery.includes("blocker") || lowerQuery.includes("stuck")) {
      return "I've detected 3 tasks that have been in 'In Progress' for over 5 days: API endpoint development, Database schema optimization, and Mobile responsive layouts. Would you like me to notify the team leads?";
    }
    
    return "I understand you're asking about " + query + ". I can help with sprint planning, task updates, team performance, and project insights. Could you please be more specific?";
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all z-50"
        size="icon"
      >
        <Bot className="w-6 h-6" />
      </Button>
    );
  }

  return (
    <Card className={`fixed bottom-6 right-6 w-96 shadow-2xl z-50 transition-all ${isMinimized ? 'h-16' : 'h-[600px]'} flex flex-col`}>
      <div className="flex items-center justify-between p-4 border-b border-border bg-gradient-to-r from-primary to-accent">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-white" />
          <h3 className="font-semibold text-white">AI Assistant</h3>
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
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                      message.role === "user"
                        ? "bg-primary text-white"
                        : "bg-muted text-foreground"
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          <div className="p-4 border-t border-border">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSend()}
                placeholder="Ask me anything..."
                className="flex-1"
              />
              <Button onClick={handleSend} size="icon">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </>
      )}
    </Card>
  );
};
