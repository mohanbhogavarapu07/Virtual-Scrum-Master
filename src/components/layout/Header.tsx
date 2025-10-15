import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { RoleSelector } from "./RoleSelector";
import { useApp } from "@/context/AppContext";

export const Header = () => {
  const navigate = useNavigate();
  const { currentUser } = useApp();

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-background/80 backdrop-blur-sm px-8 sticky top-0 z-10">
      <div className="flex items-center gap-4">
        <div className="text-sm">
          <p className="font-semibold text-foreground">{currentUser.name}</p>
          <p className="text-xs text-muted-foreground">{currentUser.email}</p>
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="relative rounded-xl">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-primary rounded-full shadow-glow" />
        </Button>

        <RoleSelector />
      </div>
    </header>
  );
};
