import { type Request, Response, NextFunction } from "express";

// Middleware temporário para Vercel - substitua com sua autenticação real
export async function setupAuth(app: any) {
  // Por enquanto, vamos simular autenticação
  console.log("Auth setup for Vercel environment");
}

export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  // Por enquanto, vamos permitir acesso para testar
  // Em produção, implemente autenticação real (JWT, Auth0, Clerk, etc)
  (req as any).user = {
    claims: {
      sub: "demo-user"
    }
  };
  next();
}
