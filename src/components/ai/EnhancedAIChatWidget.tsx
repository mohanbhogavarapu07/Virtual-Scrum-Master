import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Bot, X, Send, Minimize2 } from "lucide-react";
import logoImg from "@/assets/logo.png";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/context/AuthContext";
import { ChatMessage, TaskAction } from "@/types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useSendChat } from "@/hooks/useApiHooks";
import { useLocation } from "react-router-dom";

const quickActions = [
  { label: "Sprint status", command: "show sprint progress" },
  { label: "Recommendations", command: "give me recommendations" },
  { label: "Team performance", command: "show team performance" },
];

export const EnhancedAIChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: "1", content: "👋 Hi! I'm your Virtual Scrum Master. Ask me about tasks, sprints, or team performance.", role: "assistant", timestamp: new Date() },
  ]);

  const { user, isAuthenticated } = useAuth();
  const sendChat = useSendChat();
  const scrollRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const match = location.pathname.match(/\/project\/(\d+)/);
  const activeProjectId = match ? parseInt(match[1], 10) : 1;

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleSend = (customInput?: string) => {
    const messageText = customInput || input;
    if (!messageText.trim()) return;

    const userMessage: ChatMessage = { id: `msg-${Date.now()}`, content: messageText, role: "user", timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    // Send to backend chat API
    sendChat.mutate({ project_id: activeProjectId, message: messageText }, {
      onSuccess: (response: any) => {
        const aiMessage: ChatMessage = {
          id: `msg-${Date.now() + 1}`,
          content: response.ai_message?.message ?? "I received your message. Let me process that.",
          role: "assistant",
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiMessage]);
        setIsTyping(false);
      },
      onError: () => {
        // Fallback local response
        const aiMessage: ChatMessage = {
          id: `msg-${Date.now() + 1}`,
          content: "I'm having trouble connecting to the server. Please try again.",
          role: "assistant",
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, aiMessage]);
        setIsTyping(false);
      },
    });
  };

  if (!isAuthenticated) return null;

  if (!isOpen) {
    return (
      <Button onClick={() => setIsOpen(true)} className="fixed bottom-4 right-4 h-12 w-12 rounded-full shadow-lg hover:shadow-xl transition-all z-50 bg-gradient-to-r from-primary to-accent" size="icon">
        <Bot className="w-5 h-5" />
      </Button>
    );
  }

  return (
    <Card className={cn("fixed bottom-4 right-4 w-96 shadow-xl z-50 transition-all flex flex-col border border-border", isMinimized ? 'h-14' : 'h-[500px]')}>
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-gradient-to-r from-primary to-accent rounded-t-lg">
        <div className="flex items-center gap-2">
          <img src={logoImg} alt="Virtual Scrum Master" className="w-5 h-5 rounded" />
          <span className="text-sm font-semibold text-white">Virtual Scrum Master</span>
          <Badge className="bg-white/20 text-white text-2xs border-0">Beta</Badge>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={() => setIsMinimized(!isMinimized)} className="h-7 w-7 text-white hover:bg-white/20"><Minimize2 className="w-3.5 h-3.5" /></Button>
          <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="h-7 w-7 text-white hover:bg-white/20"><X className="w-3.5 h-3.5" /></Button>
        </div>
      </div>

      {!isMinimized && (
        <>
          <ScrollArea className="flex-1 p-3" ref={scrollRef}>
            <div className="space-y-3">
              {messages.map((message) => (
                <div key={message.id} className={cn("flex", message.role === "user" ? "justify-end" : "justify-start")}>
                  <div className={cn("max-w-[85%] rounded-lg px-3 py-2", message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted")}>
                    <p className="text-sm whitespace-pre-line">{message.content}</p>
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

          <div className="px-3 py-2 border-t border-border">
            <div className="flex flex-wrap gap-1.5">
              {quickActions.map((action) => (
                <Button key={action.label} variant="outline" size="sm" className="h-6 text-2xs px-2" onClick={() => handleSend(action.command)}>{action.label}</Button>
              ))}
            </div>
          </div>

          <div className="p-3 border-t border-border">
            <div className="flex gap-2">
              <Input value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={(e) => e.key === "Enter" && handleSend()} placeholder="Ask AI..." className="flex-1 h-9 text-sm" />
              <Button onClick={() => handleSend()} size="icon" className="h-9 w-9"><Send className="w-4 h-4" /></Button>
            </div>
          </div>
        </>
      )}
    </Card>
  );
};
