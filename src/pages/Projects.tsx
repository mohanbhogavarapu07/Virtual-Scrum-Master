import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Users, Calendar, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";

const projects = [
  {
    id: 1,
    name: "E-commerce Platform Redesign",
    description: "Complete UI/UX overhaul of the customer portal",
    status: "active",
    owner: "Sarah Chen",
    team: 8,
    sprints: 5,
    progress: 65,
  },
  {
    id: 2,
    name: "Mobile App Development",
    description: "Native iOS and Android application",
    status: "active",
    owner: "Michael Roberts",
    team: 6,
    sprints: 3,
    progress: 45,
  },
  {
    id: 3,
    name: "API Integration",
    description: "Third-party payment gateway integration",
    status: "active",
    owner: "Jessica Williams",
    team: 4,
    sprints: 2,
    progress: 80,
  },
  {
    id: 4,
    name: "Analytics Dashboard",
    description: "Real-time business intelligence platform",
    status: "planning",
    owner: "David Kumar",
    team: 5,
    sprints: 0,
    progress: 0,
  },
];

const Projects = () => {
  const navigate = useNavigate();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500/10 text-green-500 hover:bg-green-500/20";
      case "planning":
        return "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
            <p className="text-muted-foreground mt-1">Manage and track all your team projects</p>
          </div>
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            New Project
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
          {projects.map((project) => (
            <Card 
              key={project.id} 
              className="hover:shadow-lg transition-all cursor-pointer"
              onClick={() => navigate(`/project/${project.id}`)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-xl">{project.name}</CardTitle>
                    <CardDescription>{project.description}</CardDescription>
                  </div>
                  <Badge className={getStatusColor(project.status)}>
                    {project.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="w-4 h-4" />
                      <span>{project.team} members</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>{project.sprints} sprints</span>
                    </div>
                  </div>
                  
                  {project.progress > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">{project.progress}%</span>
                      </div>
                      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary transition-all"
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="pt-2 border-t border-border">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                        {project.owner.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="text-sm">
                        <p className="font-medium">{project.owner}</p>
                        <p className="text-muted-foreground text-xs">Project Owner</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Projects;
