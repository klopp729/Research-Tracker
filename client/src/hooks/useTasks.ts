import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { type Task, type InsertTask } from "@shared/schema";

interface UseTasksOptions {
  enabled?: boolean;
}

export function useTasks(milestoneId: number, taskId?: number, options: UseTasksOptions = {}) {
  // Query to fetch all tasks for a milestone
  const { 
    data: tasks = [], 
    isLoading: tasksLoading, 
    error: tasksError 
  } = useQuery<Task[]>({ 
    queryKey: ["/api/tasks", { milestoneId }],
    queryFn: async ({ queryKey }) => {
      if (!milestoneId) return [];
      
      const res = await fetch(`/api/tasks?milestoneId=${milestoneId}`, {
        credentials: "include",
      });
      if (!res.ok) {
        throw new Error("Failed to fetch tasks");
      }
      return res.json();
    },
    enabled: milestoneId > 0 && (options.enabled !== false),
  });

  // Query to fetch a specific task
  const { 
    data: task, 
    isLoading: taskLoading, 
    error: taskError 
  } = useQuery<Task>({ 
    queryKey: [`/api/tasks/${taskId}`],
    enabled: !!taskId,
  });

  // Mutation to create a new task
  const createTaskMutation = useMutation({
    mutationFn: async (task: InsertTask) => {
      const res = await apiRequest("POST", "/api/tasks", task);
      return res.json();
    },
    onSuccess: () => {
      // Invalidate queries to refetch data
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
    },
  });

  // Mutation to update a task
  const updateTaskMutation = useMutation({
    mutationFn: async (task: Partial<Task> & { id: number }) => {
      const { id, ...rest } = task;
      const res = await apiRequest("PUT", `/api/tasks/${id}`, rest);
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: [`/api/tasks/${data.id}`] });
    },
  });

  // Mutation to delete a task
  const deleteTaskMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/tasks/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
    },
  });

  return {
    tasks,
    task,
    isLoading: taskId ? taskLoading : tasksLoading,
    error: taskId ? taskError : tasksError,
    createTask: createTaskMutation.mutateAsync,
    isCreating: createTaskMutation.isPending,
    updateTask: updateTaskMutation.mutateAsync,
    isUpdating: updateTaskMutation.isPending,
    deleteTask: deleteTaskMutation.mutateAsync,
    isDeleting: deleteTaskMutation.isPending,
  };
}
