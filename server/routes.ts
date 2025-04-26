import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertProjectSchema, 
  insertMilestoneSchema, 
  insertTaskSchema, 
  taskStatusEnum 
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  const authMiddleware = (req: any, res: any, next: any) => {
    const userId = req.headers['x-replit-user-id'];
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    next();
  };

  // Apply auth middleware to all API routes
  app.use('/api', authMiddleware);

  // API routes for projects
  app.get("/api/projects", async (req: Request, res: Response) => {
    const projects = await storage.getAllProjects();
    res.json(projects);
  });

  app.get("/api/projects/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid project ID format" });
    }

    const project = await storage.getProject(id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.json(project);
  });

  app.post("/api/projects", async (req: Request, res: Response) => {
    try {
      // Validate request body
      const projectData = insertProjectSchema.parse(req.body);

      // Default to user ID 1 for now
      if (!projectData.userId) {
        projectData.userId = 1;
      }

      const newProject = await storage.createProject(projectData);
      res.status(201).json(newProject);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid project data", errors: error.format() });
      }
      res.status(500).json({ message: "Failed to create project" });
    }
  });

  app.put("/api/projects/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid project ID format" });
      }

      const projectData = insertProjectSchema.partial().parse(req.body);

      const updatedProject = await storage.updateProject(id, projectData);
      if (!updatedProject) {
        return res.status(404).json({ message: "Project not found" });
      }

      res.json(updatedProject);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid project data", errors: error.format() });
      }
      res.status(500).json({ message: "Failed to update project" });
    }
  });

  app.delete("/api/projects/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid project ID format" });
    }

    const deleted = await storage.deleteProject(id);
    if (!deleted) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.status(204).end();
  });

  // API routes for milestones
  app.get("/api/milestones", async (req: Request, res: Response) => {
    const projectId = req.query.projectId ? parseInt(req.query.projectId as string, 10) : undefined;

    if (projectId) {
      if (isNaN(projectId)) {
        return res.status(400).json({ message: "Invalid project ID format" });
      }

      const milestones = await storage.getMilestonesByProjectId(projectId);
      return res.json(milestones);
    }

    const milestones = await storage.getAllMilestones();
    res.json(milestones);
  });

  app.get("/api/milestones/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid milestone ID format" });
    }

    const milestone = await storage.getMilestone(id);
    if (!milestone) {
      return res.status(404).json({ message: "Milestone not found" });
    }

    res.json(milestone);
  });

  app.post("/api/milestones", async (req: Request, res: Response) => {
    try {
      // Validate request body
      const milestoneData = insertMilestoneSchema.parse({
        ...req.body,
        deadline: new Date(req.body.deadline)
      });

      const newMilestone = await storage.createMilestone(milestoneData);
      res.status(201).json(newMilestone);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid milestone data", errors: error.format() });
      }
      res.status(500).json({ message: "Failed to create milestone" });
    }
  });

  app.put("/api/milestones/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid milestone ID format" });
      }

      let milestoneData = insertMilestoneSchema.partial().parse(req.body);

      // Convert deadline to Date object if provided
      if (milestoneData.deadline && typeof milestoneData.deadline === 'string') {
        milestoneData = {
          ...milestoneData,
          deadline: new Date(milestoneData.deadline)
        };
      }

      const updatedMilestone = await storage.updateMilestone(id, milestoneData);
      if (!updatedMilestone) {
        return res.status(404).json({ message: "Milestone not found" });
      }

      res.json(updatedMilestone);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid milestone data", errors: error.format() });
      }
      res.status(500).json({ message: "Failed to update milestone" });
    }
  });

  app.delete("/api/milestones/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid milestone ID format" });
    }

    const deleted = await storage.deleteMilestone(id);
    if (!deleted) {
      return res.status(404).json({ message: "Milestone not found" });
    }

    res.status(204).end();
  });

  // API routes for tasks
  app.get("/api/tasks", async (req: Request, res: Response) => {
    const milestoneId = req.query.milestoneId ? parseInt(req.query.milestoneId as string, 10) : undefined;

    if (milestoneId) {
      if (isNaN(milestoneId)) {
        return res.status(400).json({ message: "Invalid milestone ID format" });
      }

      const tasks = await storage.getTasksByMilestoneId(milestoneId);
      return res.json(tasks);
    }

    const tasks = await storage.getAllTasks();
    res.json(tasks);
  });

  app.get("/api/tasks/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid task ID format" });
    }

    const task = await storage.getTask(id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json(task);
  });

  app.post("/api/tasks", async (req: Request, res: Response) => {
    try {
      // Validate request body
      const taskData = insertTaskSchema.parse({
        ...req.body,
        dueDate: new Date(req.body.dueDate)
      });

      // Validate status
      taskStatusEnum.parse(taskData.status);

      const newTask = await storage.createTask(taskData);
      res.status(201).json(newTask);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid task data", errors: error.format() });
      }
      res.status(500).json({ message: "Failed to create task" });
    }
  });

  app.put("/api/tasks/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid task ID format" });
      }

      const taskData = insertTaskSchema.partial().parse({
        ...req.body,
        dueDate: req.body.dueDate ? new Date(req.body.dueDate) : undefined
      });

      // Validate status if provided
      if (taskData.status) {
        taskStatusEnum.parse(taskData.status);
      }

      const updatedTask = await storage.updateTask(id, taskData);
      if (!updatedTask) {
        return res.status(404).json({ message: "Task not found" });
      }

      res.json(updatedTask);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid task data", errors: error.format() });
      }
      res.status(500).json({ message: "Failed to update task" });
    }
  });

  app.delete("/api/tasks/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid task ID format" });
    }

    const deleted = await storage.deleteTask(id);
    if (!deleted) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.status(204).end();
  });

  const httpServer = createServer(app);
  return httpServer;
}