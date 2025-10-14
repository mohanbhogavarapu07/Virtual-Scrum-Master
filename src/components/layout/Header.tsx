import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { RoleSelector } from "./RoleSelector";
import { useApp } from "@/context/AppContext";

export const Header = () => {
  const navigate = useNavigate();
  const { currentUser } = useApp();

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-background px-6">
      <div className="flex items-center gap-3">
        <div className="text-sm">
          <p className="font-medium">{currentUser.name}</p>
          <p className="text-xs text-muted-foreground">{currentUser.email}</p>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full" />
        </Button>

        <RoleSelector />
      </div>
    </header>
  );
};
