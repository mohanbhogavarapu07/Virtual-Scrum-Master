import { User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useApp } from "@/context/AppContext";
import { UserRole } from "@/types";

const roleLabels: Record<UserRole, string> = {
  admin: "Admin",
  manager: "Manager",
  employee: "Employee",
};

const roleColors: Record<UserRole, string> = {
  admin: "bg-red-500/10 text-red-500",
  manager: "bg-blue-500/10 text-blue-500",
  employee: "bg-green-500/10 text-green-500",
};

export const RoleSelector = () => {
  const { currentUser, setCurrentUser } = useApp();

  const handleRoleChange = (role: UserRole) => {
    setCurrentUser({ ...currentUser, role });
  };

  return (
    <div className="flex items-center gap-2">
      <Badge className={roleColors[currentUser.role]}>
        {roleLabels[currentUser.role]}
      </Badge>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <User className="w-5 h-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 bg-popover">
          <DropdownMenuLabel>Switch Role (Demo)</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => handleRoleChange("admin")}>
            <span className="flex items-center gap-2">
              <Badge className={roleColors.admin}>Admin</Badge>
              Full access & control
            </span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleRoleChange("manager")}>
            <span className="flex items-center gap-2">
              <Badge className={roleColors.manager}>Manager</Badge>
              Manage projects & teams
            </span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleRoleChange("employee")}>
            <span className="flex items-center gap-2">
              <Badge className={roleColors.employee}>Employee</Badge>
              View & update tasks
            </span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
