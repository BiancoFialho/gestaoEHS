
// src/lib/db.ts
import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';

// Variável global para armazenar a conexão do banco de dados
let db: Database | null = null;

/**
 * Abre e retorna a conexão com o banco de dados SQLite.
 * Cria o banco de dados e a tabela se não existirem.
 */
export async function getDbConnection(): Promise<Database> {
  if (db) {
    return db;
  }

  // Abre a conexão com o banco de dados (cria o arquivo se não existir)
  db = await open({
    filename: './ehs_database.sqlite', // Nome do arquivo do banco de dados
    driver: sqlite3.Database,
  });

  console.log('Conexão com SQLite estabelecida.');

  // Exemplo: Cria uma tabela de exemplo se ela não existir
  // Você deve adaptar isso para as suas tabelas reais
  await db.exec(`
    CREATE TABLE IF NOT EXISTS kpis (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      value REAL NOT NULL,
      category TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

   await db.exec(`
    CREATE TABLE IF NOT EXISTS incidents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      description TEXT NOT NULL,
      date TEXT NOT NULL,
      type TEXT NOT NULL, -- 'Acidente com Afastamento', 'Acidente sem Afastamento', 'Quase Acidente'
      severity TEXT, -- 'Leve', 'Moderado', 'Grave', 'Fatalidade'
      location TEXT,
      reported_by TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  console.log('Tabela(s) verificada(s)/criada(s).');

  return db;
}

/**
 * Fecha a conexão com o banco de dados.
 * Geralmente não é necessário chamar isso em aplicações web long-running,
 * mas pode ser útil em scripts ou testes.
 */
export async function closeDbConnection(): Promise<void> {
  if (db) {
    await db.close();
    db = null;
    console.log('Conexão com SQLite fechada.');
  }
}

// Exemplo de função para inserir dados (adapte conforme necessário)
export async function insertKpi(name: string, value: number, category?: string) {
  const db = await getDbConnection();
  const result = await db.run(
    'INSERT INTO kpis (name, value, category) VALUES (?, ?, ?)',
    name, value, category ?? null
  );
  return result.lastID;
}

// Exemplo de função para buscar dados (adapte conforme necessário)
export async function getAllKpis() {
  const db = await getDbConnection();
  const kpis = await db.all('SELECT * FROM kpis ORDER BY updated_at DESC');
  return kpis;
}
