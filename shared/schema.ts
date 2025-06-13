import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  status: text("status").notNull().default("Open"), // Open, accepted
  timeCommitment: text("time_commitment"),
  duration: text("duration"),
  location: text("location"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const applications = pgTable("applications", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull().references(() => projects.id),
  volunteerName: text("volunteer_name").notNull(),
  volunteerEmail: text("volunteer_email").notNull(),
  volunteerPhone: text("volunteer_phone"),
  motivation: text("motivation"),
  status: text("status").notNull().default("pending"), // pending, accepted, rejected
  appliedAt: timestamp("applied_at").defaultNow().notNull(),
});

export const projectsRelations = relations(projects, ({ many }) => ({
  applications: many(applications),
}));

export const applicationsRelations = relations(applications, ({ one }) => ({
  project: one(projects, {
    fields: [applications.projectId],
    references: [projects.id],
  }),
}));

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
});

export const insertApplicationSchema = createInsertSchema(applications).omit({
  id: true,
  appliedAt: true,
});

export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projects.$inferSelect;
export type InsertApplication = z.infer<typeof insertApplicationSchema>;
export type Application = typeof applications.$inferSelect;
