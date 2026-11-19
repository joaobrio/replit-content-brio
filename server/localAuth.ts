// LOCAL-DEV: substituto do replitAuth.ts para rodar fora do Replit.
//
// O original faz OpenID Connect contra replit.com e exige REPLIT_DOMAINS, REPL_ID
// e ISSUER_URL — variáveis que só existem dentro do Replit. Aqui a sessão é
// resolvida com um usuário fixo de desenvolvimento, mantendo o mesmo contrato que
// as rotas esperam: req.user.claims.sub com o id do usuário.
//
// Isto NÃO é autenticação. Só serve para ver o sistema rodando na máquina.
import type { Express, RequestHandler } from "express";
import { storage } from "./storage";

const DEV_USER = {
  id: "dev-local",
  email: "dev@localhost",
  firstName: "Dev",
  lastName: "Local",
  profileImageUrl: null as string | null,
};

export async function setupAuth(app: Express) {
  // garante que o usuário de desenvolvimento existe na tabela users,
  // porque projects.user_id tem chave estrangeira para ela
  try {
    await storage.upsertUser(DEV_USER);
    console.log("[local-auth] usuário de desenvolvimento pronto:", DEV_USER.id);
  } catch (err) {
    console.warn("[local-auth] não consegui gravar o usuário dev:", err);
  }

  app.use((req: any, _res, next) => {
    req.user = { claims: { sub: DEV_USER.id, email: DEV_USER.email } };
    req.isAuthenticated = () => true;
    next();
  });

  app.get("/api/login", (_req, res) => res.redirect("/"));
  app.get("/api/logout", (_req, res) => res.redirect("/"));
}

export const isAuthenticated: RequestHandler = (_req, _res, next) => next();
