import { useApp } from "@/context/AppContext";
import { cn } from "@/lib/utils";
import { Bot, Lightbulb, AlertTriangle, Info, Zap, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const AIInsightsPanel = () => {
  const { aiInsights } = useApp();

  const getInsightIcon = (type: string) => {
    switch (type) {
      case "warning":
        return <AlertTriangle className="w-3.5 h-3.5" />;
      case "recommendation":
        return <Lightbulb className="w-3.5 h-3.5" />;
      default:
        return <Info className="w-3.5 h-3.5" />;
    }
  };

  const getInsightStyle = (type: string) => {
    switch (type) {
      case "warning":
        return "bg-warning/10 text-warning border-warning/20";
      case "recommendation":
        return "bg-primary/10 text-primary border-primary/20";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg">
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Bot className="w-3 h-3 text-white" />
          </div>
          <h3 className="text-sm font-semibold">AI Scrum Master Insights</h3>
        </div>
        <Badge variant="secondary" className="text-2xs">
          {aiInsights.length} insights
        </Badge>
      </div>

      <div className="divide-y divide-border">
        {aiInsights.map((insight, index) => (
          <div 
            key={insight.id} 
            className={cn(
              "p-4 hover:bg-muted/30 transition-colors",
              index === 0 && "bg-muted/20"
            )}
          >
            <div className="flex items-start gap-3">
              <div className={cn(
                "w-6 h-6 rounded flex items-center justify-center flex-shrink-0 mt-0.5 border",
                getInsightStyle(insight.type)
              )}>
                {getInsightIcon(insight.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-medium">{insight.title}</p>
                  {index === 0 && (
                    <Badge className="text-2xs bg-primary/10 text-primary hover:bg-primary/20 border-0">
                      Priority
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mb-2">{insight.description}</p>
                
                {/* Impact */}
                <div className="flex items-center gap-1.5 mb-3">
                  <Zap className="w-3 h-3 text-warning" />
                  <span className="text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">Impact:</span> {insight.impact}
                  </span>
                </div>

                {/* Action Button */}
                {insight.action && (
                  <Button 
                    size="sm" 
                    variant={insight.type === "warning" ? "default" : "outline"}
                    className="h-7 text-xs gap-1"
                  >
                    {insight.action.label}
                    <ChevronRight className="w-3 h-3" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* AI Chat CTA */}
      <div className="p-4 border-t border-border bg-muted/30">
        <Button variant="outline" className="w-full h-9 text-xs gap-2">
          <Bot className="w-3.5 h-3.5" />
          Ask AI for more insights
        </Button>
      </div>
    </div>
  );
};
