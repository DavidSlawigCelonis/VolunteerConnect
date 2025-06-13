import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertProjectSchema, type Project, type Application, type InsertProject } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { HandHeart, Settings, CheckCircle, Users, ClipboardList, PlusCircle, Inbox, UserCheck, Send, LogOut } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function Admin() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const { data: projects = [], isLoading: projectsLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const { data: applications = [], isLoading: applicationsLoading } = useQuery<Application[]>({
    queryKey: ["/api/applications"],
  });

  const form = useForm<InsertProject>({
    resolver: zodResolver(insertProjectSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      status: "Open",
      timeCommitment: "",
      duration: "",
      location: "",
    },
  });

  const createProjectMutation = useMutation({
    mutationFn: async (data: InsertProject) => {
      const response = await apiRequest("POST", "/api/projects", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      form.reset();
      toast({
        title: "Success",
        description: "Project created successfully!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteProjectMutation = useMutation({
    mutationFn: async (projectId: number) => {
      await apiRequest("DELETE", `/api/projects/${projectId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({
        title: "Success",
        description: "Project deleted successfully!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateApplicationStatusMutation = useMutation({
    mutationFn: async ({ applicationId, status }: { applicationId: number; status: string }) => {
      const response = await apiRequest("PATCH", `/api/applications/${applicationId}/status`, { status });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/applications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({
        title: "Success",
        description: "Application status updated successfully!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertProject) => {
    createProjectMutation.mutate(data);
  };

  const handleDeleteProject = (projectId: number) => {
    if (window.confirm("Are you sure you want to delete this project? This action cannot be undone.")) {
      deleteProjectMutation.mutate(projectId);
    }
  };

  const handleUpdateApplicationStatus = (applicationId: number, status: string) => {
    updateApplicationStatusMutation.mutate({ applicationId, status });
  };

  const availableProjects = projects.filter(p => p.status === "available");
  const acceptedProjects = projects.filter(p => p.status === "accepted");

  const handleLogout = async () => {
    try {
      await apiRequest("POST", "/api/logout");
      toast({
        title: "Success",
        description: "Logged out successfully!",
      });
      setLocation("/login");
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to logout",
        variant: "destructive",
      });
    }
  };

  if (projectsLoading || applicationsLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                  <HandHeart className="text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">VolunteerHub</h1>
                  <p className="text-xs text-gray-500">Project Management Platform</p>
                </div>
              </div>
              <nav className="flex space-x-6">
                <Link href="/" className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-lg">
                  Projects
                </Link>
                <Link href="/admin" className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg">
                  Admin
                </Link>
              </nav>
            </div>
          </div>
        </header>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl border p-6">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <HandHeart className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">VolunteerHub</h1>
                <p className="text-xs text-gray-500">Project Management Platform</p>
              </div>
            </div>
            <nav className="flex space-x-6">
              <Link href="/" className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition-colors flex items-center">
                <CheckCircle className="mr-2 h-4 w-4" />
                Projects
              </Link>
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-gray-50 rounded-lg transition-colors flex items-center"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h2>
          <p className="text-gray-600">Manage volunteer projects and track applications</p>
        </div>

        {/* Admin Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <ClipboardList className="text-blue-600 h-6 w-6" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{projects.length}</p>
                <p className="text-sm text-gray-600">Total Projects</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="text-green-600 h-6 w-6" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{availableProjects.length}</p>
                <p className="text-sm text-gray-600">Available</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <UserCheck className="text-orange-600 h-6 w-6" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{acceptedProjects.length}</p>
                <p className="text-sm text-gray-600">Accepted</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Send className="text-purple-600 h-6 w-6" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{applications.length}</p>
                <p className="text-sm text-gray-600">Applications</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Add New Project Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <PlusCircle className="text-blue-500 mr-3 h-5 w-5" />
              Add New Project
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Project Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter project title" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="environment">Environment</SelectItem>
                            <SelectItem value="education">Education</SelectItem>
                            <SelectItem value="community">Community</SelectItem>
                            <SelectItem value="healthcare">Healthcare</SelectItem>
                            <SelectItem value="technology">Technology</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe the project, requirements, and what volunteers will do..."
                          rows={4}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormField
                    control={form.control}
                    name="timeCommitment"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Time Commitment</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., 5-10 hrs/week" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Duration</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., 3 months" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location Type</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select location" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="remote">Remote</SelectItem>
                            <SelectItem value="local">Local</SelectItem>
                            <SelectItem value="regional">Regional</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={createProjectMutation.isPending}
                    className="flex items-center"
                  >
                    {createProjectMutation.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Creating...
                      </>
                    ) : (
                      <>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Create Project
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Applications List */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Inbox className="text-blue-500 mr-3 h-5 w-5" />
              Applications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {applications.map((application) => (
                <Card key={application.id} className="relative">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold">{application.volunteerName}</h3>
                        <p className="text-sm text-gray-500">{application.volunteerEmail}</p>
                        {application.volunteerPhone && (
                          <p className="text-sm text-gray-500">{application.volunteerPhone}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {application.status === "pending" && (
                          <>
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleUpdateApplicationStatus(application.id, "accepted")}
                            >
                              Accept
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleUpdateApplicationStatus(application.id, "rejected")}
                            >
                              Reject
                            </Button>
                          </>
                        )}
                        {application.status === "accepted" && (
                          <Badge className="bg-green-100 text-green-800">Accepted</Badge>
                        )}
                        {application.status === "rejected" && (
                          <Badge className="bg-red-100 text-red-800">Rejected</Badge>
                        )}
                      </div>
                    </div>
                    <div className="mt-4">
                      <h4 className="text-sm font-medium mb-2">Motivation</h4>
                      <p className="text-sm text-gray-600">{application.motivation}</p>
                    </div>
                    <div className="mt-4 text-sm text-gray-500">
                      Applied on {new Date(application.appliedAt).toLocaleDateString()}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Projects List */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <ClipboardList className="text-blue-500 mr-3 h-5 w-5" />
              Projects
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <Card key={project.id} className="relative">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold">{project.title}</h3>
                        <p className="text-sm text-gray-500">{project.category}</p>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteProject(project.id)}
                      >
                        Delete
                      </Button>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">{project.description}</p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">{project.timeCommitment}</span>
                      <span className="text-gray-500">{project.duration}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
