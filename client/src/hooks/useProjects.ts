import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { type Project, type InsertProject } from "@shared/schema";

export function useProjects() {
  // Query to fetch all projects
  const { 
    data: projects = [], 
    isLoading, 
    error 
  } = useQuery<Project[]>({ 
    queryKey: ["/api/projects"], 
  });

  // Mutation to create a new project
  const createProjectMutation = useMutation({
    mutationFn: async (project: InsertProject) => {
      const res = await apiRequest("POST", "/api/projects", project);
      return res.json();
    },
    onSuccess: () => {
      // Invalidate the projects query to refetch data
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
    },
  });

  // Mutation to update a project
  const updateProjectMutation = useMutation({
    mutationFn: async ({ id, project }: { id: number; project: Partial<InsertProject> }) => {
      const res = await apiRequest("PUT", `/api/projects/${id}`, project);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
    },
  });

  // Mutation to delete a project
  const deleteProjectMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/projects/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
    },
  });

  return {
    projects,
    isLoading,
    error,
    createProject: createProjectMutation.mutateAsync,
    isCreating: createProjectMutation.isPending,
    updateProject: updateProjectMutation.mutateAsync,
    isUpdating: updateProjectMutation.isPending,
    deleteProject: deleteProjectMutation.mutateAsync,
    isDeleting: deleteProjectMutation.isPending,
  };
}

export function useProject(id: number) {
  // Query to fetch a specific project
  const { 
    data: project, 
    isLoading, 
    error 
  } = useQuery<Project>({ 
    queryKey: [`/api/projects/${id}`],
    enabled: !!id,
  });

  return {
    project,
    isLoading,
    error,
  };
}
