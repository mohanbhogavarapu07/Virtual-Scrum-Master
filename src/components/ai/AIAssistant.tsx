import React, { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Bot, X, Send, Mic, MicOff, Volume2, Minimize2 } from "lucide-react";
import logoImg from "@/assets/logo.png";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/context/AuthContext";
import { ChatMessage } from "@/types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useSendChat } from "@/hooks/useApiHooks";
import { useLocation } from "react-router-dom";
import { useVoiceHandler } from "./VoiceHandler";
import { useActionHandler } from "./ActionHandler";
import "../../styles/ai-assistant.css";

export const AIAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: "1", content: "👋 Hi! I'm your Virtual Scrum Master. You can chat or speak to me!", role: "assistant", timestamp: new Date() },
  ]);

  const { user, isAuthenticated } = useAuth();
  const sendChat = useSendChat();
  const scrollRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const match = location.pathname.match(/\/project\/(\d+)/);
  const activeProjectId = match ? parseInt(match[1], 10) : 1;

  const { handleAction } = useActionHandler();

  // Handle hotkey Ctrl+K to open
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
        if (isMinimized) setIsMinimized(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMinimized]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  // Handle CSS UI reset natively when switching
  // (Removed speaking cancellation as voice output is disabled)

  // Handle voice result: Fill input AND auto-send
  const handleVoiceResult = useCallback((text: string) => {
    setInput(text);
    handleSend(text);
  }, []);

  const { isListening, startListening, stopListening, isSupported: voiceSupported } = useVoiceHandler(handleVoiceResult);

  const toggleVoice = () => {
    if (isListening) stopListening();
    else startListening();
  };

  const handleSend = (customInput?: string) => {
    const messageText = customInput || input;
    if (!messageText.trim()) return;

    const userMessage: ChatMessage = { id: `msg-${Date.now()}`, content: messageText, role: "user", timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    // Provide UI context to the backend (per user spec string)
    // Send to backend chat API
    sendChat.mutate({ project_id: activeProjectId, message: messageText }, {
      onSuccess: (response: any) => {
        // Assume API extended to return Action/Highlight variables inside response.ai_message or response directly
        const responseData = response.ai_message || response;
        
        let textContent = responseData.message || responseData.text || "I have processed your request.";
        let actionTarget = responseData.action;
        let navTarget = responseData.target;
        let hlTarget = responseData.highlight;

        // Try extracting json blocks if LLM outputs an action object physically in string
        try {
          if (typeof textContent === "string" && textContent.includes('"action":')) {
            const parsed = JSON.parse(textContent);
            if (parsed.text) textContent = parsed.text;
            if (parsed.action) actionTarget = parsed.action;
            if (parsed.target) navTarget = parsed.target;
            if (parsed.highlight) hlTarget = parsed.highlight;
          }
        } catch (e) {}
        
        const aiMessage: ChatMessage = {
          id: `msg-${Date.now() + 1}`,
          content: textContent,
          role: "assistant",
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, aiMessage]);
        setIsTyping(false);
        
        // Execute UI actions if present
        handleAction(actionTarget, navTarget, hlTarget);
      },
      onError: () => {
        const errMessage = "I'm having trouble connecting to the server. Please try again.";
        const aiMessage: ChatMessage = {
          id: `msg-${Date.now() + 1}`,
          content: errMessage,
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
      <button 
        onClick={() => setIsOpen(true)} 
        className={cn(
          "fixed bottom-6 right-6 h-14 w-14 flex items-center justify-center rounded-full shadow-lg transition-all duration-200 z-50 text-white hover:shadow-xl hover:-translate-y-1 cursor-pointer", 
          isListening ? "bg-red-500 animate-pulse" : "bg-indigo-600"
        )} 
      >
        {isListening ? <Mic className="w-5 h-5" /> : <Bot className="w-6 h-6" />}
      </button>
    );
  }

  return (
    <Card className={cn("fixed bottom-6 right-6 w-96 z-50 transition-all flex flex-col overflow-hidden bg-background border-border/80 shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-2xl", isMinimized ? 'h-14' : 'h-[600px]')}>
      
      {/* Enterprise Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/60 bg-muted/40">
        <div className="flex items-center gap-3">
          <div className={cn("h-8 w-8 rounded-full flex items-center justify-center bg-indigo-100 dark:bg-indigo-500/20", isListening ? "animate-pulse" : "")}>
            {isListening ? <Mic className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> : <Bot className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-foreground">Scrum Bot</span>
            <span className="text-[10px] text-muted-foreground font-medium flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Online
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Badge variant="secondary" className="text-[9px] h-5 rounded-md px-1.5 font-medium mr-1 border-0">Ctrl+K</Badge>
          <Button variant="ghost" size="icon" onClick={() => setIsMinimized(!isMinimized)} className="h-7 w-7 text-muted-foreground hover:bg-muted hover:text-foreground rounded-full transition-all"><Minimize2 className="w-3.5 h-3.5" /></Button>
          <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="h-7 w-7 text-muted-foreground hover:bg-destructive/10 hover:text-destructive rounded-full transition-all"><X className="w-3.5 h-3.5" /></Button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Scrollable Message Area */}
          <ScrollArea className="flex-1 p-4 overflow-y-auto" ref={scrollRef}>
            <div className="space-y-6 pb-2">
              {messages.map((message) => (
                <div key={message.id} className={cn("flex w-full animate-message", message.role === "user" ? "justify-end" : "justify-start")}>
                  <div className={cn("flex gap-2 max-w-[88%]", message.role === "user" ? "flex-row-reverse" : "flex-row")}>
                    
                    {/* Bot Avatar */}
                    {message.role === "assistant" && (
                      <div className="h-8 w-8 rounded-full bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center shrink-0 border border-indigo-100 dark:border-indigo-500/20 mt-1">
                        <Bot className="w-4 h-4 text-indigo-500" />
                      </div>
                    )}

                    <div className="flex flex-col gap-1.5">
                      <div className={cn(
                        "px-4 py-3 text-sm leading-relaxed", 
                        message.role === "user" 
                          ? "bg-indigo-600 text-white rounded-2xl rounded-tr-sm shadow-sm" 
                          : "bg-muted/60 text-foreground rounded-2xl rounded-tl-sm border border-border/50"
                      )}>
                        {/* Custom Structural Renderer for Dash Lists inline */}
                        {message.content.split('\n').map((line, i) => {
                          if (line.trim().startsWith('-')) {
                            return (
                              <div key={i} className="flex gap-2 mt-1.5 ml-1">
                                <span className={cn("font-bold mt-[1px]", message.role === "user" ? "text-indigo-200" : "text-indigo-500")}>•</span>
                                <span className="opacity-95">{line.substring(1).trim()}</span>
                              </div>
                            );
                          }
                          return <span key={i} className="block mt-1 first:mt-0 opacity-95">{line}</span>;
                        })}
                      </div>
                      <span className={cn("text-[10px] text-muted-foreground/60 font-medium px-1", message.role === "user" ? "text-right" : "text-left")}>
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex justify-start animate-message">
                  <div className="flex gap-2 max-w-[85%]">
                    <div className="h-8 w-8 rounded-full bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center shrink-0 border border-indigo-100 dark:border-indigo-500/20 mt-1">
                      <Bot className="w-4 h-4 text-indigo-400" />
                    </div>
                    <div className="bg-muted/60 rounded-2xl rounded-tl-sm border border-border/50 px-4 py-4 flex items-center h-[42px]">
                      <div className="flex gap-1.5">
                        <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full typing-dot" />
                        <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full typing-dot" />
                        <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full typing-dot" />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="p-3 bg-background border-t border-border/60">
            <div className="relative group flex items-center gap-2">
              <div className="relative flex-1">
                <Input 
                  value={input} 
                  onChange={(e) => setInput(e.target.value)} 
                  onKeyPress={(e) => e.key === "Enter" && handleSend()} 
                  placeholder={isListening ? "Listening natively..." : "Message Scrum Bot..."} 
                  className={cn(
                    "pr-10 bg-muted/40 border-border/60 transition-all duration-200 rounded-full h-11",
                    "hover:bg-muted/60 focus-visible:bg-background focus-visible:ring-1 focus-visible:ring-indigo-500 focus-visible:border-indigo-500", 
                    isListening ? "border-red-500/50 ring-1 ring-red-500/30 bg-red-50/50 dark:bg-red-500/10" : ""
                  )} 
                />
                
                {voiceSupported && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={toggleVoice}
                    className={cn(
                      "absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full transition-all duration-200", 
                      isListening ? "text-red-500 bg-red-100 dark:bg-red-500/20 animate-pulse" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </Button>
                )}
              </div>
              <Button 
                onClick={() => handleSend()} 
                size="icon" 
                className={cn(
                  "h-11 w-11 shrink-0 rounded-full shadow-sm transition-all duration-200",
                  input.trim() || isListening ? "bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-md hover:-translate-y-0.5" : "bg-muted text-muted-foreground opacity-50 cursor-not-allowed"
                )} 
                disabled={!input.trim() && !isListening}
              >
                <Send className="w-4 h-4 ml-0.5" />
              </Button>
            </div>
          </div>
        </>
      )}
    </Card>
  );
};
