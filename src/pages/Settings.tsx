import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { useApp } from "@/context/AppContext";
import { 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Zap, 
  Building,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";

const settingSections = [
  { id: "profile", label: "Profile", icon: User },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "security", label: "Security", icon: Shield },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "integrations", label: "Integrations", icon: Zap },
  { id: "organization", label: "Organization", icon: Building },
];

const Settings = () => {
  const { currentUser } = useApp();

  return (
    <DashboardLayout>
      <div className="space-y-4">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-xl font-semibold">Settings</h1>
          <p className="text-sm text-muted-foreground">Manage your account and preferences</p>
        </motion.div>

        <div className="grid grid-cols-12 gap-4">
          {/* Sidebar Navigation */}
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="col-span-12 lg:col-span-3"
          >
            <div className="bg-card border border-border rounded-lg p-2">
              {settingSections.map((section, index) => (
                <button
                  key={section.id}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors text-left",
                    index === 0 
                      ? "bg-primary/10 text-primary" 
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <section.icon className="w-4 h-4" />
                  {section.label}
                  <ChevronRight className="w-4 h-4 ml-auto" />
                </button>
              ))}
            </div>
          </motion.div>

          {/* Main Content */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="col-span-12 lg:col-span-9 space-y-4"
          >
            {/* Profile Section */}
            <div className="bg-card border border-border rounded-lg">
              <div className="px-4 py-3 border-b border-border">
                <h2 className="text-sm font-semibold">Profile Information</h2>
                <p className="text-xs text-muted-foreground">Update your personal details</p>
              </div>
              <div className="p-4 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-xl font-bold text-white">
                    {currentUser.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <Button variant="outline" size="sm">Change Avatar</Button>
                    <p className="text-xs text-muted-foreground mt-1">JPG, PNG up to 5MB</p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-xs font-medium">First Name</Label>
                    <Input id="firstName" defaultValue={currentUser.name.split(' ')[0]} className="h-9" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-xs font-medium">Last Name</Label>
                    <Input id="lastName" defaultValue={currentUser.name.split(' ')[1]} className="h-9" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-xs font-medium">Email</Label>
                  <Input id="email" type="email" defaultValue={currentUser.email} className="h-9" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role" className="text-xs font-medium">Role</Label>
                  <div className="flex items-center gap-2">
                    <Input id="role" defaultValue={currentUser.role.replace('_', ' ')} className="h-9 capitalize" disabled />
                    <Badge variant="outline" className="text-2xs">Managed by admin</Badge>
                  </div>
                </div>
                <Button size="sm">Save Changes</Button>
              </div>
            </div>

            {/* Notifications Section */}
            <div className="bg-card border border-border rounded-lg">
              <div className="px-4 py-3 border-b border-border">
                <h2 className="text-sm font-semibold">Notification Preferences</h2>
                <p className="text-xs text-muted-foreground">Control how you receive notifications</p>
              </div>
              <div className="divide-y divide-border">
                {[
                  { 
                    title: "Email Notifications", 
                    description: "Receive email updates about your projects",
                    enabled: true 
                  },
                  { 
                    title: "AI Scrum Master Alerts", 
                    description: "Get notified about blockers and recommendations",
                    enabled: true 
                  },
                  { 
                    title: "Sprint Reminders", 
                    description: "Reminders for upcoming sprint events and standups",
                    enabled: true 
                  },
                  { 
                    title: "Task Assignments", 
                    description: "Notifications when tasks are assigned to you",
                    enabled: false 
                  },
                ].map((pref, index) => (
                  <div key={index} className="flex items-center justify-between px-4 py-3">
                    <div>
                      <p className="text-sm font-medium">{pref.title}</p>
                      <p className="text-xs text-muted-foreground">{pref.description}</p>
                    </div>
                    <Switch defaultChecked={pref.enabled} />
                  </div>
                ))}
              </div>
            </div>

            {/* AI Settings */}
            <div className="bg-card border border-border rounded-lg">
              <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold">AI Scrum Master Settings</h2>
                  <p className="text-xs text-muted-foreground">Configure AI assistant behavior</p>
                </div>
                <Badge className="text-2xs bg-primary/10 text-primary border-0">AI-Powered</Badge>
              </div>
              <div className="divide-y divide-border">
                {[
                  { 
                    title: "Automatic Task Updates", 
                    description: "Allow AI to automatically update task statuses based on activity",
                    enabled: true 
                  },
                  { 
                    title: "Blocker Detection", 
                    description: "AI monitors for potential blockers and alerts you",
                    enabled: true 
                  },
                  { 
                    title: "Sprint Recommendations", 
                    description: "Receive AI-generated recommendations for sprint planning",
                    enabled: true 
                  },
                  { 
                    title: "Standup Summaries", 
                    description: "AI generates daily standup summaries from team updates",
                    enabled: false 
                  },
                ].map((pref, index) => (
                  <div key={index} className="flex items-center justify-between px-4 py-3">
                    <div>
                      <p className="text-sm font-medium">{pref.title}</p>
                      <p className="text-xs text-muted-foreground">{pref.description}</p>
                    </div>
                    <Switch defaultChecked={pref.enabled} />
                  </div>
                ))}
              </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-card border border-destructive/30 rounded-lg">
              <div className="px-4 py-3 border-b border-destructive/30">
                <h2 className="text-sm font-semibold text-destructive">Danger Zone</h2>
                <p className="text-xs text-muted-foreground">Irreversible actions</p>
              </div>
              <div className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Delete Account</p>
                  <p className="text-xs text-muted-foreground">Permanently delete your account and all data</p>
                </div>
                <Button variant="destructive" size="sm">Delete Account</Button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
