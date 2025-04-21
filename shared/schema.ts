import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User model (kept from original schema)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Project model
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  goal: text("goal").notNull(),
  userId: integer("user_id").notNull(), // Foreign key to users
});

export const insertProjectSchema = createInsertSchema(projects).pick({
  title: true,
  goal: true,
  userId: true,
});

export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projects.$inferSelect;

// Milestone model
export const milestones = pgTable("milestones", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  deadline: timestamp("deadline").notNull(),
  projectId: integer("project_id").notNull(), // Foreign key to projects
});

export const insertMilestoneSchema = createInsertSchema(milestones).pick({
  title: true,
  deadline: true,
  projectId: true,
});

export type InsertMilestone = z.infer<typeof insertMilestoneSchema>;
export type Milestone = typeof milestones.$inferSelect;

// Task status enum
export const taskStatusEnum = z.enum(["NOT_STARTED", "IN_PROGRESS", "COMPLETED"]);
export type TaskStatus = z.infer<typeof taskStatusEnum>;

// Task model
export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  status: text("status").notNull().default("NOT_STARTED"),
  dueDate: timestamp("due_date").notNull(),
  notes: text("notes"),
  attachments: jsonb("attachments").default([]), // JSON array of attachment objects
  milestoneId: integer("milestone_id").notNull(), // Foreign key to milestones
});

export const insertTaskSchema = createInsertSchema(tasks).pick({
  title: true,
  description: true,
  status: true,
  dueDate: true,
  notes: true,
  attachments: true,
  milestoneId: true,
});

export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Task = typeof tasks.$inferSelect;

// Attachment interface (used within Task attachments field)
export interface Attachment {
  id: string;
  name: string;
  type: string;
  url: string;
}
