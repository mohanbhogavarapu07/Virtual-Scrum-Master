import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { User, Bell, Shield, Palette, Zap, Building, ChevronRight, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

const settingSections = [
  { id: "profile", label: "Profile", icon: User },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "security", label: "Security", icon: Shield },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "integrations", label: "Integrations", icon: Zap },
  { id: "organization", label: "Organization", icon: Building },
];

const Settings = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => { logout(); navigate("/login"); };

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-xl font-semibold">Settings</h1>
          <p className="text-sm text-muted-foreground">Manage your account</p>
        </motion.div>
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 lg:col-span-3">
            <div className="bg-card border border-border rounded-lg p-2">
              {settingSections.map((section, i) => (
                <button key={section.id} className={cn("w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors text-left", i === 0 ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted")}>
                  <section.icon className="w-4 h-4" />{section.label}<ChevronRight className="w-4 h-4 ml-auto" />
                </button>
              ))}
            </div>
          </div>
          <div className="col-span-12 lg:col-span-9 space-y-4">
            <div className="bg-card border border-border rounded-lg">
              <div className="px-4 py-3 border-b border-border"><h2 className="text-sm font-semibold">Profile</h2></div>
              <div className="p-4 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-xl font-bold text-white">
                    {user?.full_name?.split(" ").map(n => n[0]).join("").toUpperCase() ?? "?"}
                  </div>
                  <div>
                    <p className="font-medium">{user?.full_name ?? "—"}</p>
                    <p className="text-sm text-muted-foreground">{user?.email ?? "—"}</p>
                    <Badge variant="outline" className="text-2xs capitalize mt-1">{user?.role ?? "—"}</Badge>
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2"><Label className="text-xs">Full Name</Label><Input defaultValue={user?.full_name ?? ""} className="h-9" /></div>
                  <div className="space-y-2"><Label className="text-xs">Email</Label><Input defaultValue={user?.email ?? ""} className="h-9" /></div>
                </div>
                <Button size="sm">Save Changes</Button>
              </div>
            </div>
            <div className="bg-card border border-border rounded-lg">
              <div className="px-4 py-3 border-b border-border"><h2 className="text-sm font-semibold">Notifications</h2></div>
              <div className="divide-y divide-border">
                {[{ title: "Email Notifications", desc: "Receive email updates", on: true }, { title: "AI Alerts", desc: "Get AI recommendations", on: true }, { title: "Task Assignments", desc: "When tasks are assigned", on: false }].map((p, i) => (
                  <div key={i} className="flex items-center justify-between px-4 py-3">
                    <div><p className="text-sm font-medium">{p.title}</p><p className="text-xs text-muted-foreground">{p.desc}</p></div>
                    <Switch defaultChecked={p.on} />
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-card border border-destructive/30 rounded-lg p-4 flex items-center justify-between">
              <div><p className="text-sm font-medium">Sign Out</p><p className="text-xs text-muted-foreground">Log out of your account</p></div>
              <Button variant="destructive" size="sm" onClick={handleLogout} className="gap-1.5"><LogOut className="w-4 h-4" />Sign Out</Button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
