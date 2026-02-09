import { useAuth } from "@/context/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Shield, Users } from "lucide-react";

export const RoleSelector = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";

  return (
    <Badge variant="outline" className="h-8 gap-1.5 text-xs px-3">
      {isAdmin ? <Shield className="w-3.5 h-3.5" /> : <Users className="w-3.5 h-3.5" />}
      <span className="capitalize">{user?.role?.toLowerCase() ?? "user"}</span>
    </Badge>
  );
};
