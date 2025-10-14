import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useParams } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { Users, Calendar, TrendingUp, Plus, Package } from "lucide-react";
import { EnhancedAIChatWidget } from "@/components/ai/EnhancedAIChatWidget";

const ProjectDetail = () => {
  const { id } = useParams();
  const { getProject, tasks } = useApp();
  const project = getProject(id || "1");

  if (!project) {
    return <DashboardLayout><div>Project not found</div></DashboardLayout>;
  }

  const projectTasks = tasks.filter(t => 
    project.sprints.some(s => s.id === t.sprintId)
  );

  const completedTasks = projectTasks.filter(t => t.status === "done").length;
  const totalTasks = projectTasks.length;
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
            <p className="text-muted-foreground mt-1">{project.description}</p>
          </div>
          <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20">
            {project.status}
          </Badge>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Team Members</CardTitle>
              <Users className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{project.teamMembers.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Active Sprints</CardTitle>
              <Calendar className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{project.sprints.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Progress</CardTitle>
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{progress}%</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Releases</CardTitle>
              <Package className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{project.releases.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="sprints">Sprints</TabsTrigger>
            <TabsTrigger value="releases">Releases</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Project Progress</CardTitle>
                  <CardDescription>Overall completion status</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Completed Tasks</span>
                      <span className="font-medium">{completedTasks} / {totalTasks}</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Owner</p>
                      <p className="font-medium">{project.owner}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Started</p>
                      <p className="font-medium">{project.createdAt.toLocaleDateString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Latest updates and changes</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-green-500 mt-2" />
                      <div className="space-y-1 flex-1">
                        <p className="text-sm font-medium">Task completed</p>
                        <p className="text-xs text-muted-foreground">Setup CI/CD pipeline - 2 days ago</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-blue-500 mt-2" />
                      <div className="space-y-1 flex-1">
                        <p className="text-sm font-medium">Sprint started</p>
                        <p className="text-xs text-muted-foreground">Sprint 5 began - 8 days ago</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-purple-500 mt-2" />
                      <div className="space-y-1 flex-1">
                        <p className="text-sm font-medium">Team member added</p>
                        <p className="text-xs text-muted-foreground">RJ joined the team - 10 days ago</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="sprints" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Sprint List</h3>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                New Sprint
              </Button>
            </div>
            <div className="space-y-3">
              {project.sprints.map((sprint) => (
                <Card key={sprint.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{sprint.name}</CardTitle>
                        <CardDescription>{sprint.goal}</CardDescription>
                      </div>
                      <Badge className="bg-blue-500/10 text-blue-500">
                        {sprint.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Start Date</p>
                        <p className="font-medium">{sprint.startDate.toLocaleDateString()}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">End Date</p>
                        <p className="font-medium">{sprint.endDate.toLocaleDateString()}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Velocity</p>
                        <p className="font-medium">{sprint.velocity} points</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="releases" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Release Pipeline</h3>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                New Release
              </Button>
            </div>
            <div className="space-y-3">
              {project.releases.map((release) => (
                <Card key={release.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">Version {release.version}</CardTitle>
                        <CardDescription>{release.notes}</CardDescription>
                      </div>
                      <Badge className="bg-purple-500/10 text-purple-500">
                        {release.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Release Date</p>
                        <p className="font-medium">{release.releaseDate.toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Features</p>
                        <div className="flex flex-wrap gap-2">
                          {release.features.map((feature, idx) => (
                            <Badge key={idx} variant="secondary">{feature}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="team" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Team Members</h3>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Add Member
              </Button>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {project.teamMembers.map((member) => (
                <Card key={member}>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-lg font-medium text-primary">
                        {member}
                      </div>
                      <div>
                        <p className="font-medium">Team Member {member}</p>
                        <p className="text-sm text-muted-foreground">Developer</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default ProjectDetail;
