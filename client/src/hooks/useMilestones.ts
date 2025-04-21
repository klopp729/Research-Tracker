import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { type Milestone, type InsertMilestone } from "@shared/schema";

interface UseMilestonesOptions {
  enabled?: boolean;
}

export function useMilestones(projectId: number, options: UseMilestonesOptions = {}) {
  // Query to fetch milestones for a project
  const { 
    data: milestones = [], 
    isLoading, 
    error 
  } = useQuery<Milestone[]>({ 
    queryKey: ["/api/milestones", { projectId }],
    queryFn: async ({ queryKey }) => {
      const res = await fetch(`/api/milestones?projectId=${projectId}`, {
        credentials: "include",
      });
      if (!res.ok) {
        throw new Error("Failed to fetch milestones");
      }
      return res.json();
    },
    enabled: projectId > 0 && (options.enabled !== false),
  });

  // Mutation to create a new milestone
  const createMilestoneMutation = useMutation({
    mutationFn: async (milestone: InsertMilestone) => {
      const res = await apiRequest("POST", "/api/milestones", milestone);
      return res.json();
    },
    onSuccess: () => {
      // Invalidate queries to refetch data
      queryClient.invalidateQueries({ queryKey: ["/api/milestones"] });
    },
  });

  // Mutation to update a milestone
  const updateMilestoneMutation = useMutation({
    mutationFn: async ({ id, milestone }: { id: number; milestone: Partial<InsertMilestone> }) => {
      const res = await apiRequest("PUT", `/api/milestones/${id}`, milestone);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/milestones"] });
    },
  });

  // Mutation to delete a milestone
  const deleteMilestoneMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/milestones/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/milestones"] });
    },
  });

  return {
    milestones,
    isLoading,
    error,
    createMilestone: createMilestoneMutation.mutateAsync,
    isCreating: createMilestoneMutation.isPending,
    updateMilestone: updateMilestoneMutation.mutateAsync,
    isUpdating: updateMilestoneMutation.isPending,
    deleteMilestone: deleteMilestoneMutation.mutateAsync,
    isDeleting: deleteMilestoneMutation.isPending,
  };
}

export function useMilestone(id: number) {
  // Query to fetch a specific milestone
  const { 
    data: milestone, 
    isLoading, 
    error 
  } = useQuery<Milestone>({ 
    queryKey: [`/api/milestones/${id}`],
    enabled: !!id,
  });

  return {
    milestone,
    isLoading,
    error,
  };
}
