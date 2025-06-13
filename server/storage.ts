import { projects, applications, type Project, type InsertProject, type Application, type InsertApplication } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  // Projects
  getAllProjects(): Promise<Project[]>;
  getProject(id: number): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProjectStatus(id: number, status: string): Promise<Project | undefined>;
  deleteProject(id: number): Promise<void>;
  
  // Applications
  createApplication(application: InsertApplication): Promise<Application>;
  getApplicationsByProject(projectId: number): Promise<Application[]>;
  getAllApplications(): Promise<Application[]>;
  getApplication(id: number): Promise<Application | undefined>;
  updateApplicationStatus(id: number, status: string): Promise<Application | undefined>;
}

export class DatabaseStorage implements IStorage {
  async getAllProjects(): Promise<Project[]> {
    return await db.select().from(projects).orderBy(projects.createdAt);
  }

  async getProject(id: number): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project || undefined;
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const [project] = await db
      .insert(projects)
      .values(insertProject)
      .returning();
    return project;
  }

  async updateProjectStatus(id: number, status: string): Promise<Project | undefined> {
    const [project] = await db
      .update(projects)
      .set({ status })
      .where(eq(projects.id, id))
      .returning();
    return project || undefined;
  }

  async deleteProject(id: number): Promise<void> {
    await db.delete(projects).where(eq(projects.id, id));
  }

  async createApplication(insertApplication: InsertApplication): Promise<Application> {
    const [application] = await db
      .insert(applications)
      .values(insertApplication)
      .returning();
    return application;
  }

  async getApplicationsByProject(projectId: number): Promise<Application[]> {
    return await db.select().from(applications).where(eq(applications.projectId, projectId));
  }

  async getAllApplications(): Promise<Application[]> {
    return await db
      .select({
        id: applications.id,
        projectId: applications.projectId,
        volunteerName: applications.volunteerName,
        volunteerEmail: applications.volunteerEmail,
        volunteerPhone: applications.volunteerPhone,
        motivation: applications.motivation,
        status: applications.status,
        appliedAt: applications.appliedAt,
        project: {
          id: projects.id,
          title: projects.title,
          description: projects.description,
          category: projects.category,
          status: projects.status,
          timeCommitment: projects.timeCommitment,
          duration: projects.duration,
          location: projects.location
        }
      })
      .from(applications)
      .leftJoin(projects, eq(applications.projectId, projects.id))
      .orderBy(applications.appliedAt);
  }

  async getApplication(id: number): Promise<Application | undefined> {
    const [application] = await db.select().from(applications).where(eq(applications.id, id));
    return application || undefined;
  }

  async updateApplicationStatus(id: number, status: string): Promise<Application | undefined> {
    const [application] = await db
      .update(applications)
      .set({ status })
      .where(eq(applications.id, id))
      .returning();
    return application || undefined;
  }
}

export const storage = new DatabaseStorage();
