import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";
import { Bell, Building, ChevronRight, LogOut, Palette, Shield, User, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
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
  const [activeSection, setActiveSection] = useState("profile");
  const handleLogout = () => { logout(); navigate("/login"); };

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <PageHeader
          title="Settings"
          description="Manage your account and preferences"
          breadcrumbs={[{ label: "Settings" }]}
        />

        <div className="grid grid-cols-12 gap-4">
          {/* Sidebar nav */}
          <div className="col-span-12 lg:col-span-3">
            <div className="bg-card border border-border rounded-lg p-1.5 space-y-0.5">
              {settingSections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors text-left",
                    activeSection === section.id
                      ? "bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))]"
                      : "text-muted-foreground hover:bg-muted"
                  )}
                >
                  <section.icon className="w-4 h-4" />
                  {section.label}
                  <ChevronRight className="w-4 h-4 ml-auto opacity-40" />
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="col-span-12 lg:col-span-9 space-y-4">
            {/* Profile */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="bg-card border border-border rounded-lg"
            >
              <div className="px-4 py-3 border-b border-border">
                <h2 className="text-sm font-semibold">Profile Information</h2>
              </div>
              <div className="p-4 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--accent))] flex items-center justify-center text-lg font-bold text-white">
                    {user?.full_name?.split(" ").map(n => n[0]).join("").toUpperCase() ?? "?"}
                  </div>
                  <div>
                    <p className="font-semibold">{user?.full_name ?? "—"}</p>
                    <p className="text-sm text-muted-foreground">{user?.email ?? "—"}</p>
                    <Badge variant="outline" className="text-2xs capitalize mt-1">{user?.role ?? "—"}</Badge>
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-xs">Full Name</Label>
                    <Input defaultValue={user?.full_name ?? ""} className="h-9" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Email</Label>
                    <Input defaultValue={user?.email ?? ""} className="h-9" />
                  </div>
                </div>
                <Button size="sm">Save Changes</Button>
              </div>
            </motion.div>

            {/* Notifications */}
            <div className="bg-card border border-border rounded-lg">
              <div className="px-4 py-3 border-b border-border">
                <h2 className="text-sm font-semibold">Notifications</h2>
              </div>
              <div className="divide-y divide-border">
                {[
                  { title: "Email Notifications", desc: "Receive email updates for task changes", on: true },
                  { title: "AI Alerts", desc: "Get AI scrum master recommendations", on: true },
                  { title: "Task Assignments", desc: "Notify when tasks are assigned to you", on: false },
                ].map((p, i) => (
                  <div key={i} className="flex items-center justify-between px-4 py-3">
                    <div><p className="text-sm font-medium">{p.title}</p><p className="text-xs text-muted-foreground">{p.desc}</p></div>
                    <Switch defaultChecked={p.on} />
                  </div>
                ))}
              </div>
            </div>

            {/* Danger zone */}
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
