import { Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import logo from "@/assets/logo.png";

export const AIInsightsPanel = () => {
  return (
    <div className="bg-card border border-border rounded-lg">
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src={logo} alt="Virtual Scrum Master" className="w-5 h-5 rounded" />
          <h3 className="text-sm font-semibold">Virtual Scrum Master</h3>
        </div>
        <Badge variant="secondary" className="text-2xs">AI-Powered</Badge>
      </div>
      <div className="p-4 space-y-3">
        <p className="text-sm text-muted-foreground">Use the AI chat widget to get personalized insights about your projects, tasks, and team performance.</p>
        <Button variant="outline" className="w-full h-9 text-xs gap-2">
          <Bot className="w-3.5 h-3.5" />
          Open AI Assistant
        </Button>
      </div>
    </div>
  );
};
