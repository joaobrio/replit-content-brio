// LOCAL-DEV: driver trocado do @neondatabase/serverless (WebSocket, exige Neon na
// nuvem) para node-postgres, que fala com o Postgres instalado na máquina.
// O original está preservado em server/db.neon.ts — para voltar, é só restaurar.
import pg from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool, { schema });
