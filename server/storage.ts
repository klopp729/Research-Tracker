import { 
  users, type User, type InsertUser,
  projects, type Project, type InsertProject,
  milestones, type Milestone, type InsertMilestone,
  tasks, type Task, type InsertTask, type TaskStatus
} from "@shared/schema";

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Project operations
  getAllProjects(): Promise<Project[]>;
  getProject(id: number): Promise<Project | undefined>;
  getProjectsByUserId(userId: number): Promise<Project[]>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: number, project: Partial<InsertProject>): Promise<Project | undefined>;
  deleteProject(id: number): Promise<boolean>;
  
  // Milestone operations
  getAllMilestones(): Promise<Milestone[]>;
  getMilestone(id: number): Promise<Milestone | undefined>;
  getMilestonesByProjectId(projectId: number): Promise<Milestone[]>;
  createMilestone(milestone: InsertMilestone): Promise<Milestone>;
  updateMilestone(id: number, milestone: Partial<InsertMilestone>): Promise<Milestone | undefined>;
  deleteMilestone(id: number): Promise<boolean>;
  
  // Task operations
  getAllTasks(): Promise<Task[]>;
  getTask(id: number): Promise<Task | undefined>;
  getTasksByMilestoneId(milestoneId: number): Promise<Task[]>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: number, task: Partial<InsertTask>): Promise<Task | undefined>;
  deleteTask(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private projects: Map<number, Project>;
  private milestones: Map<number, Milestone>;
  private tasks: Map<number, Task>;
  
  private userCurrentId: number;
  private projectCurrentId: number;
  private milestoneCurrentId: number;
  private taskCurrentId: number;

  constructor() {
    this.users = new Map();
    this.projects = new Map();
    this.milestones = new Map();
    this.tasks = new Map();
    
    this.userCurrentId = 1;
    this.projectCurrentId = 1;
    this.milestoneCurrentId = 1;
    this.taskCurrentId = 1;
    
    // Initialize with a default user
    this.createUser({ username: "yamada", password: "password" });
    
    // Add sample data for development
    const projectId = this.createSampleData();
  }
  
  // Create some sample data
  private createSampleData(): number {
    // Create a sample project
    const project = this.createProject({
      title: "機械学習による画像認識の研究",
      goal: "CNNを用いた効率的な画像認識システムの開発と評価",
      userId: 1
    });
    
    // Create milestones
    const milestone1 = this.createMilestone({
      title: "中間発表",
      deadline: new Date("2023-12-15"),
      projectId: project.id
    });
    
    const milestone2 = this.createMilestone({
      title: "論文提出",
      deadline: new Date("2024-02-28"),
      projectId: project.id
    });
    
    // Create tasks for milestone 1
    this.createTask({
      title: "先行研究の調査",
      description: "画像認識分野の最新論文をレビューし、手法を比較する。",
      status: "COMPLETED",
      dueDate: new Date("2023-11-20"),
      notes: "主要な論文リスト:\n- Smith et al. (2022) - CNN性能比較\n- Johnson (2023) - 最新の画像認識手法",
      attachments: [
        { id: "1", name: "research_summary.pdf", type: "application/pdf", url: "#" },
        { id: "2", name: "paper_notes.docx", type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", url: "#" }
      ],
      milestoneId: milestone1.id
    });
    
    this.createTask({
      title: "学習データセットの準備",
      description: "画像データの収集と前処理を行う。アノテーション作業も含む。",
      status: "IN_PROGRESS",
      dueDate: new Date("2023-12-01"),
      notes: "画像データセットについて：\n- 少なくとも1000枚の訓練データが必要\n- クラス間のバランスを確保すること\n- データ拡張を適用して過学習を防ぐ",
      attachments: [
        { id: "3", name: "dataset_specifications.pdf", type: "application/pdf", url: "#" },
        { id: "4", name: "image_metadata.xlsx", type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", url: "#" }
      ],
      milestoneId: milestone1.id
    });
    
    this.createTask({
      title: "CNN学習モデルの構築",
      description: "ResNet50ベースのモデルを実装し、ハイパーパラメータを調整する。",
      status: "NOT_STARTED",
      dueDate: new Date("2023-12-10"),
      notes: "",
      attachments: [
        { id: "5", name: "model_architecture.png", type: "image/png", url: "#" }
      ],
      milestoneId: milestone1.id
    });
    
    return project.id;
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Project operations
  async getAllProjects(): Promise<Project[]> {
    return Array.from(this.projects.values());
  }
  
  async getProject(id: number): Promise<Project | undefined> {
    return this.projects.get(id);
  }
  
  async getProjectsByUserId(userId: number): Promise<Project[]> {
    return Array.from(this.projects.values()).filter(
      (project) => project.userId === userId
    );
  }
  
  async createProject(project: InsertProject): Promise<Project> {
    const id = this.projectCurrentId++;
    const newProject: Project = { ...project, id };
    this.projects.set(id, newProject);
    return newProject;
  }
  
  async updateProject(id: number, projectUpdate: Partial<InsertProject>): Promise<Project | undefined> {
    const existingProject = this.projects.get(id);
    if (!existingProject) return undefined;
    
    const updatedProject: Project = { ...existingProject, ...projectUpdate };
    this.projects.set(id, updatedProject);
    return updatedProject;
  }
  
  async deleteProject(id: number): Promise<boolean> {
    // Delete all related milestones and tasks first
    const projectMilestones = await this.getMilestonesByProjectId(id);
    for (const milestone of projectMilestones) {
      await this.deleteMilestone(milestone.id);
    }
    
    return this.projects.delete(id);
  }
  
  // Milestone operations
  async getAllMilestones(): Promise<Milestone[]> {
    return Array.from(this.milestones.values());
  }
  
  async getMilestone(id: number): Promise<Milestone | undefined> {
    return this.milestones.get(id);
  }
  
  async getMilestonesByProjectId(projectId: number): Promise<Milestone[]> {
    return Array.from(this.milestones.values()).filter(
      (milestone) => milestone.projectId === projectId
    );
  }
  
  async createMilestone(milestone: InsertMilestone): Promise<Milestone> {
    const id = this.milestoneCurrentId++;
    const newMilestone: Milestone = { ...milestone, id };
    this.milestones.set(id, newMilestone);
    return newMilestone;
  }
  
  async updateMilestone(id: number, milestoneUpdate: Partial<InsertMilestone>): Promise<Milestone | undefined> {
    const existingMilestone = this.milestones.get(id);
    if (!existingMilestone) return undefined;
    
    const updatedMilestone: Milestone = { ...existingMilestone, ...milestoneUpdate };
    this.milestones.set(id, updatedMilestone);
    return updatedMilestone;
  }
  
  async deleteMilestone(id: number): Promise<boolean> {
    // Delete all related tasks first
    const milestoneTasks = await this.getTasksByMilestoneId(id);
    for (const task of milestoneTasks) {
      await this.deleteTask(task.id);
    }
    
    return this.milestones.delete(id);
  }
  
  // Task operations
  async getAllTasks(): Promise<Task[]> {
    return Array.from(this.tasks.values());
  }
  
  async getTask(id: number): Promise<Task | undefined> {
    return this.tasks.get(id);
  }
  
  async getTasksByMilestoneId(milestoneId: number): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(
      (task) => task.milestoneId === milestoneId
    );
  }
  
  async createTask(task: InsertTask): Promise<Task> {
    const id = this.taskCurrentId++;
    const newTask: Task = { ...task, id };
    this.tasks.set(id, newTask);
    return newTask;
  }
  
  async updateTask(id: number, taskUpdate: Partial<InsertTask>): Promise<Task | undefined> {
    const existingTask = this.tasks.get(id);
    if (!existingTask) return undefined;
    
    const updatedTask: Task = { ...existingTask, ...taskUpdate };
    this.tasks.set(id, updatedTask);
    return updatedTask;
  }
  
  async deleteTask(id: number): Promise<boolean> {
    return this.tasks.delete(id);
  }
}

export const storage = new MemStorage();
