import { Express } from "express";
import { createServer, type Server } from "http";

// Import original routes with a different approach for Vercel
export async function registerRoutes(app: Express): Promise<Server> {
  // For Vercel, we'll dynamically load the appropriate auth
  let setupAuth, isAuthenticated;
  
  if (process.env.VERCEL) {
    const vercelAuth = await import("./vercelAuth");
    setupAuth = vercelAuth.setupAuth;
    isAuthenticated = vercelAuth.isAuthenticated;
  } else {
    const replitAuth = await import("./replitAuth");
    setupAuth = replitAuth.setupAuth;
    isAuthenticated = replitAuth.isAuthenticated;
  }

  // Now register all routes with appropriate auth
  const originalRoutes = await import("./routes-original");
  return originalRoutes.registerRoutes(app, { setupAuth, isAuthenticated });
}
