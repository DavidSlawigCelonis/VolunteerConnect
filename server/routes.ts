import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertProjectSchema, insertApplicationSchema } from "@shared/schema";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { z } from "zod";
import MemoryStore from "memorystore";

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
  // Create a memory store with a longer TTL
  const MemoryStoreSession = MemoryStore(session);

  // Session configuration
  app.use(session({
    store: new MemoryStoreSession({
      checkPeriod: 86400000, // Prune expired entries every 24h
      max: 1000, // Maximum number of sessions
    }),
    secret: "your-secret-key", // In production, use a secure secret
    resave: true,
    saveUninitialized: true,
    cookie: {
      secure: process.env.NODE_ENV === 'production', // Set to true in production
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      domain: process.env.NODE_ENV === 'production' ? '.blender.com' : undefined // Add domain in production
    }
  }));

  // Initialize Passport
  app.use(passport.initialize());
  app.use(passport.session());

  // Passport configuration
  passport.use(new LocalStrategy((username, password, done) => {
    console.log("Attempting login for user:", username);
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      console.log("Login successful for user:", username);
      return done(null, { id: 1, username: ADMIN_USERNAME });
    }
    console.log("Login failed for user:", username);
    return done(null, false, { message: "Invalid credentials" });
  }));

  passport.serializeUser((user: any, done) => {
    console.log("Serializing user:", user);
    done(null, user.id);
  });

  passport.deserializeUser((id: number, done) => {
    console.log("Deserializing user with id:", id);
    if (id === 1) {
      done(null, { id: 1, username: ADMIN_USERNAME });
    } else {
      done(null, false);
    }
  });

  // Login route
  app.post("/api/login", (req, res, next) => {
    console.log("Login request received");
    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) {
        console.error("Login error:", err);
        return next(err);
      }
      if (!user) {
        console.log("Login failed:", info);
        return res.status(401).json({ message: info.message || "Invalid credentials" });
      }
      req.logIn(user, (err: any) => {
        if (err) {
          console.error("Login error:", err);
          return next(err);
        }
        console.log("User logged in successfully:", user);
        // Save session explicitly
        req.session.save((err: any) => {
          if (err) {
            console.error("Session save error:", err);
            return next(err);
          }
          console.log("Session saved successfully");
          // Set a custom header to indicate successful login
          res.setHeader('X-Auth-Status', 'success');
          return res.json({ message: "Login successful", user });
        });
      });
    })(req, res, next);
  });

  // Logout route
  app.post("/api/logout", (req, res) => {
    console.log("Logout request received");
    req.logout(() => {
      req.session.destroy((err: any) => {
        if (err) {
          console.error("Logout error:", err);
          return res.status(500).json({ message: "Failed to logout" });
        }
        console.log("Session destroyed successfully");
        res.clearCookie("connect.sid");
        res.json({ message: "Logout successful" });
      });
    });
  });

  // Check authentication status
  app.get("/api/auth/status", (req, res) => {
    console.log("Auth status check - isAuthenticated:", req.isAuthenticated());
    console.log("Auth status check - user:", req.user);
    console.log("Auth status check - session:", req.session);
    res.json({ 
      isAuthenticated: req.isAuthenticated(),
      user: req.user
    });
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

  // Delete project (protected)
  app.delete("/api/projects/:id", isAuthenticated, async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      if (isNaN(projectId)) {
        return res.status(400).json({ message: "Invalid project ID" });
      }
      await storage.deleteProject(projectId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete project" });
    }
  });

  // Create application and update project status
  app.post("/api/applications", async (req, res) => {
    try {
      const validatedData = insertApplicationSchema.parse(req.body);
      
      // Create the application
      const application = await storage.createApplication(validatedData);
      
      // Simulate email confirmation
      console.log("📧 Email notification sent to:", validatedData.volunteerEmail);
      console.log("✅ Application received for project ID:", validatedData.projectId);
      
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

  // Get single application (protected)
  app.get("/api/applications/:id", isAuthenticated, async (req, res) => {
    try {
      const applicationId = parseInt(req.params.id);
      if (isNaN(applicationId)) {
        return res.status(400).json({ message: "Invalid application ID" });
      }
      const application = await storage.getApplication(applicationId);
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }
      res.json(application);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch application" });
    }
  });

  // Update application status (protected)
  app.patch("/api/applications/:id/status", isAuthenticated, async (req, res) => {
    try {
      const applicationId = parseInt(req.params.id);
      if (isNaN(applicationId)) {
        return res.status(400).json({ message: "Invalid application ID" });
      }

      const { status } = req.body;
      if (!status || !["accepted", "rejected"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      const application = await storage.getApplication(applicationId);
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }

      const updatedApplication = await storage.updateApplicationStatus(applicationId, status);
      
      // If application is accepted, update project status
      if (status === "accepted") {
        await storage.updateProjectStatus(application.projectId, "accepted");
      }

      res.json(updatedApplication);
    } catch (error) {
      res.status(500).json({ message: "Failed to update application status" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
