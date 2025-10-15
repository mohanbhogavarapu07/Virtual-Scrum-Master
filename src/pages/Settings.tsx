import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { FadeIn } from "@/components/ui/fade-in";

const Settings = () => {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <FadeIn>
          <div>
            <h1 className="text-4xl font-bold tracking-tight mb-2">Settings</h1>
            <p className="text-muted-foreground text-lg">Manage your account and preferences</p>
          </div>
        </FadeIn>

        <div className="grid gap-6">
          <FadeIn delay={0.1}>
            <Card className="border-none shadow-sm bg-card/50 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl">Profile Information</CardTitle>
                <CardDescription>Update your personal details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid gap-5 md:grid-cols-2">
                  <div className="space-y-2.5">
                    <Label htmlFor="firstName" className="text-sm font-medium">First Name</Label>
                    <Input id="firstName" defaultValue="John" />
                  </div>
                  <div className="space-y-2.5">
                    <Label htmlFor="lastName" className="text-sm font-medium">Last Name</Label>
                    <Input id="lastName" defaultValue="Doe" />
                  </div>
                </div>
                <div className="space-y-2.5">
                  <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                  <Input id="email" type="email" defaultValue="john.doe@example.com" />
                </div>
                <div className="space-y-2.5">
                  <Label htmlFor="role" className="text-sm font-medium">Role</Label>
                  <Input id="role" defaultValue="Scrum Master" />
                </div>
                <Button className="rounded-xl shadow-sm hover:shadow-md">Save Changes</Button>
              </CardContent>
            </Card>
          </FadeIn>

          <FadeIn delay={0.2}>
            <Card className="border-none shadow-sm bg-card/50 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl">Preferences</CardTitle>
                <CardDescription>Customize your experience</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                  <div className="space-y-1">
                    <Label className="text-sm font-semibold">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive email updates about your projects</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                  <div className="space-y-1">
                    <Label className="text-sm font-semibold">AI Suggestions</Label>
                    <p className="text-sm text-muted-foreground">Get intelligent recommendations from AI assistant</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                  <div className="space-y-1">
                    <Label className="text-sm font-semibold">Sprint Reminders</Label>
                    <p className="text-sm text-muted-foreground">Reminders for upcoming sprint events</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>
          </FadeIn>

          <FadeIn delay={0.3}>
            <Card className="border-none shadow-sm bg-card/50 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl">Danger Zone</CardTitle>
                <CardDescription>Irreversible actions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-5 border border-destructive/30 rounded-xl bg-destructive/5">
                  <div>
                    <p className="font-semibold text-foreground">Delete Account</p>
                    <p className="text-sm text-muted-foreground mt-1">Permanently delete your account and all data</p>
                  </div>
                  <Button variant="destructive" className="rounded-xl shadow-sm">Delete</Button>
                </div>
              </CardContent>
            </Card>
          </FadeIn>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
