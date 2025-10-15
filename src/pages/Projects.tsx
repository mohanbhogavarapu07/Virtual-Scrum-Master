import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Users, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { FadeIn } from "@/components/ui/fade-in";
import { motion } from "framer-motion";

const Projects = () => {
  const navigate = useNavigate();
  const { projects, tasks } = useApp();
  
  const getProjectProgress = (projectId: string) => {
    const projectTasks = tasks.filter(t => {
      const project = projects.find(p => p.id === projectId);
      return project?.sprints.some(s => s.id === t.sprintId);
    });
    
    if (projectTasks.length === 0) return 0;
    const completed = projectTasks.filter(t => t.status === "done").length;
    return Math.round((completed / projectTasks.length) * 100);
  };

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
      <div className="space-y-8">
        <FadeIn>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold tracking-tight mb-2">Projects</h1>
              <p className="text-muted-foreground text-lg">Manage and track all your team projects</p>
            </div>
            <Button className="gap-2 rounded-xl shadow-sm hover:shadow-md">
              <Plus className="w-4 h-4" />
              New Project
            </Button>
          </div>
        </FadeIn>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
          {projects.map((project, index) => (
            <FadeIn key={project.id} delay={index * 0.1}>
              <motion.div
                whileHover={{ scale: 1.01 }}
                transition={{ duration: 0.2 }}
              >
                <Card 
                  className="cursor-pointer border-none shadow-sm hover:shadow-lg transition-all bg-card/50 backdrop-blur-sm"
                  onClick={() => navigate(`/project/${project.id}`)}
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-2 flex-1">
                        <CardTitle className="text-xl">{project.name}</CardTitle>
                        <CardDescription className="text-sm">{project.description}</CardDescription>
                      </div>
                      <Badge className={`${getStatusColor(project.status)} rounded-lg px-3 py-1 text-xs font-medium border-0`}>
                        {project.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    <div className="flex items-center gap-6 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <div className="p-1.5 rounded-lg bg-muted">
                          <Users className="w-4 h-4" />
                        </div>
                        <span>{project.teamMembers.length} members</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <div className="p-1.5 rounded-lg bg-muted">
                          <Calendar className="w-4 h-4" />
                        </div>
                        <span>{project.sprints.length} sprints</span>
                      </div>
                    </div>
                    
                    {getProjectProgress(project.id) > 0 && (
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground font-medium">Progress</span>
                          <span className="font-semibold text-foreground">{getProjectProgress(project.id)}%</span>
                        </div>
                        <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${getProjectProgress(project.id)}%` }}
                            transition={{ duration: 1, delay: index * 0.1 + 0.3 }}
                            className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full"
                          />
                        </div>
                      </div>
                    )}

                    <div className="pt-3 border-t border-border/50">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
                          {project.owner.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="text-sm">
                          <p className="font-semibold text-foreground">{project.owner}</p>
                          <p className="text-muted-foreground text-xs">Project Owner</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </FadeIn>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Projects;
