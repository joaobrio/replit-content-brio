// Dynamic auth import for Vercel compatibility
const authImport = process.env.VERCEL ? "./vercelAuth" : "./replitAuth";
const { setupAuth, isAuthenticated } = await import(authImport);

// Re-export original routes with dynamic auth
export { registerRoutes } from "./routes-original";
