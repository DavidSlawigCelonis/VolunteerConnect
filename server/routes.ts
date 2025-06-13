import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertProjectSchema, insertApplicationSchema } from "@shared/schema";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { z } from "zod";

// Admin credentials - in a real app, these would be stored securely in a database
const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "admin123"; // In production, use a secure password

// Authentication middleware
const isAuthenticated = (req: any, res: any, next: any) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Session configuration
  app.use(session({
    secret: "your-secret-key", // In production, use a secure secret
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  }));

  // Initialize Passport
  app.use(passport.initialize());
  app.use(passport.session());

  // Passport configuration
  passport.use(new LocalStrategy((username, password, done) => {
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      return done(null, { id: 1, username: ADMIN_USERNAME });
    }
    return done(null, false, { message: "Invalid credentials" });
  }));

  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((id: number, done) => {
    if (id === 1) {
      done(null, { id: 1, username: ADMIN_USERNAME });
    } else {
      done(null, false);
    }
  });

  // Login route
  app.post("/api/login", passport.authenticate("local"), (req, res) => {
    res.json({ message: "Login successful" });
  });

  // Logout route
  app.post("/api/logout", (req, res) => {
    req.logout(() => {
      res.json({ message: "Logout successful" });
    });
  });

  // Check authentication status
  app.get("/api/auth/status", (req, res) => {
    res.json({ isAuthenticated: req.isAuthenticated() });
  });

  // Get all projects
  app.get("/api/projects", async (req, res) => {
    try {
      const projects = await storage.getAllProjects();
      res.json(projects);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  // Create new project (protected)
  app.post("/api/projects", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertProjectSchema.parse(req.body);
      const project = await storage.createProject(validatedData);
      res.status(201).json(project);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Failed to create project" });
      }
    }
  });

  // Create application and update project status
  app.post("/api/applications", async (req, res) => {
    try {
      const validatedData = insertApplicationSchema.parse(req.body);
      
      // Create the application
      const application = await storage.createApplication(validatedData);
      
      // Update project status to accepted
      await storage.updateProjectStatus(validatedData.projectId, "accepted");
      
      // Simulate email confirmation
      console.log("📧 Email notification sent to:", validatedData.volunteerEmail);
      console.log("✅ Application accepted for project ID:", validatedData.projectId);
      
      res.status(201).json(application);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Failed to create application" });
      }
    }
  });

  // Get all applications (protected)
  app.get("/api/applications", isAuthenticated, async (req, res) => {
    try {
      const applications = await storage.getAllApplications();
      res.json(applications);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch applications" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
