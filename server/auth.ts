// Auth compatibility layer for Vercel
import { setupAuth as replitSetup, isAuthenticated as replitAuth } from "./replitAuth";
import { setupAuth as vercelSetup, isAuthenticated as vercelAuth } from "./vercelAuth";

// Export the appropriate auth based on environment
export const setupAuth = process.env.VERCEL ? vercelSetup : replitSetup;
export const isAuthenticated = process.env.VERCEL ? vercelAuth : replitAuth;
