import { Users } from "lucide-react";
import { useUsers } from "@/hooks/useApiHooks";
import { useAuth } from "@/context/AuthContext";

export const TeamWorkloadPanel = () => {
  const { user } = useAuth();
  const { data: users = [] } = useUsers();
  const isAdmin = user?.role === "ADMIN";

  return (
    <div className="bg-card border border-border rounded-lg">
      <div className="px-4 py-3 border-b border-border">
        <h3 className="text-sm font-semibold">Team Members</h3>
      </div>
      <div className="p-4 space-y-3">
        {isAdmin && users.length > 0 ? (
          users.slice(0, 5).map((member) => (
            <div key={member.user_id} className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary/60 to-accent/60 flex items-center justify-center text-2xs font-semibold text-white">
                {member.full_name.split(" ").map(n => n[0]).join("").toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium truncate block">{member.full_name}</span>
              </div>
              <span className="text-2xs text-muted-foreground capitalize">{member.role.toLowerCase()}</span>
            </div>
          ))
        ) : (
          <div className="text-center">
            <Users className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Team data available for admins</p>
          </div>
        )}
      </div>
    </div>
  );
};
