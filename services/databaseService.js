const { Pool } = require('pg');

// Configurar conexão com PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

class DatabaseService {
  static async initializeDatabase() {
    // Criar tabela se não existir
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS projetos_mpmp (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        nome_projeto VARCHAR(255) NOT NULL,
        descricao TEXT,
        arquivo_cloud_id VARCHAR(500) UNIQUE NOT NULL,
        arquivo_url TEXT NOT NULL,
        arquivo_nome VARCHAR(255) NOT NULL,
        arquivo_tamanho BIGINT,
        arquivo_formato VARCHAR(50),
        status VARCHAR(50) DEFAULT 'ativo',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    try {
      await pool.query(createTableQuery);
      console.log('Tabela projetos_mpmp verificada/criada com sucesso');
    } catch (error) {
      console.error('Erro ao criar tabela:', error);
    }
  }

  static async saveProject(projectData) {
    const query = `
      INSERT INTO projetos_mpmp (
        user_id,
        nome_projeto,
        descricao,
        arquivo_cloud_id,
        arquivo_url,
        arquivo_nome,
        arquivo_tamanho,
        arquivo_formato
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;

    const values = [
      projectData.userId,
      projectData.nomeProjeto,
      projectData.descricao,
      projectData.cloudId,
      projectData.url,
      projectData.nomeOriginal,
      projectData.tamanho,
      projectData.formato
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async getUserProjects(userId) {
    const query = `
      SELECT * FROM projetos_mpmp 
      WHERE user_id = $1 AND status = 'ativo'
      ORDER BY created_at DESC
    `;

    const result = await pool.query(query, [userId]);
    return result.rows;
  }

  static async deleteProject(projectId, userId) {
    const query = `
      UPDATE projetos_mpmp 
      SET status = 'deletado', updated_at = NOW()
      WHERE id = $1 AND user_id = $2
      RETURNING *
    `;

    const result = await pool.query(query, [projectId, userId]);
    return result.rows[0];
  }
}

module.exports = DatabaseService;
