import { useApp } from "@/context/AppContext";
import { UserRole } from "@/types";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Shield, Users, Code, TestTube, UserCog } from "lucide-react";
import { cn } from "@/lib/utils";

const roles: { value: UserRole; label: string; icon: React.ElementType }[] = [
  { value: "admin", label: "Admin", icon: Shield },
  { value: "manager", label: "Manager", icon: UserCog },
  { value: "scrum_master", label: "Scrum Master", icon: Users },
  { value: "developer", label: "Developer", icon: Code },
  { value: "tester", label: "Tester", icon: TestTube },
];

export const RoleSelector = () => {
  const { currentUser, setCurrentUser } = useApp();

  const currentRole = roles.find(r => r.value === currentUser.role);
  const CurrentIcon = currentRole?.icon || Users;

  const handleRoleChange = (role: UserRole) => {
    setCurrentUser({ ...currentUser, role });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
          <CurrentIcon className="w-3.5 h-3.5" />
          <span className="capitalize">{currentRole?.label}</span>
          <ChevronDown className="w-3 h-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuLabel className="text-xs">Switch Role</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {roles.map((role) => (
          <DropdownMenuItem
            key={role.value}
            onClick={() => handleRoleChange(role.value)}
            className={cn(
              "text-xs gap-2",
              currentUser.role === role.value && "bg-primary/10 text-primary"
            )}
          >
            <role.icon className="w-3.5 h-3.5" />
            {role.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
