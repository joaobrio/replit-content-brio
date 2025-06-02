import express from "express";
import cors from "cors";

const app = express();

// Configuração CORS para permitir frontend Vercel
app.use(cors({
  origin: process.env.FRONTEND_URL || "*",
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

// Import and register routes
(async () => {
  // Dynamic import based on environment
  if (process.env.VERCEL) {
    // For Vercel, use modified auth
    global.isVercel = true;
  }
  
  const { registerRoutes } = await import("../server/routes");
  await registerRoutes(app);
})();

// Export para Vercel
export default app;
