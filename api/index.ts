import express, { type Request, Response, NextFunction } from "express";
import cors from "cors";
import { registerRoutes } from "../server/routes";

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

// Logging simplificado para Vercel
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Registrar todas as rotas
(async () => {
  try {
    await registerRoutes(app);
  } catch (error) {
    console.error("Error registering routes:", error);
  }
})();

// Error handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  console.error("API Error:", err);
  res.status(status).json({ message });
});

// Export para Vercel
export default app;
