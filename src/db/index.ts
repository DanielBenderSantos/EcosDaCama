// db/index.ts
import { CREATE_META, CREATE_SONHOS_TABLE, DB_NAME, INIT_SCHEMA_VERSION } from "./schema";
import type { DB } from "./types";
import { createDB } from "./driver";

let driver: DB | null = null;

export type Sonho = {
  id?: number;
  titulo: string;
  sonho: string;
  tipo?: string | null;
  humor?: number | null;
  when_at?: string | null;
  interpretacao?: string | null;     // 👈 novo campo
};

// Normaliza tipos para o SQLite (evita undefined no prepare/bind)
const toDB = (v: any) =>
  v === undefined ? null
  : v === true ? 1
  : v === false ? 0
  : v instanceof Date ? v.toISOString()
  : typeof v === "object" && v !== null ? JSON.stringify(v)
  : v;

export async function initDB(): Promise<DB> {
  if (!driver) {
    driver = await createDB(DB_NAME);
    try { await driver.exec("PRAGMA foreign_keys = ON"); } catch {}

    await driver.exec(CREATE_META);
    await driver.exec(INIT_SCHEMA_VERSION);
    await driver.exec(CREATE_SONHOS_TABLE);

    // 🔧 Migrações idempotentes
    try { await driver.exec(`ALTER TABLE Sonhos ADD COLUMN when_at TEXT`); } catch {}
    try { await driver.exec(`ALTER TABLE Sonhos ADD COLUMN interpretacao TEXT`); } catch {} // 👈 nova migração
  }
  return driver!;
}

function getDBOrThrow(): DB {
  if (!driver) throw new Error("DB não inicializado. Chame initDB() antes.");
  return driver!;
}

// CRUD
export async function addSonho(s: Omit<Sonho, "id">) {
  const db = getDBOrThrow();
  const sql = `INSERT INTO Sonhos (titulo, sonho, tipo, humor, when_at, interpretacao)
               VALUES (?,?,?,?,?,?)`;
  const params = [
    s.titulo, s.sonho, s.tipo ?? null, s.humor ?? null, s.when_at ?? null, s.interpretacao ?? null
  ].map(toDB);
  // use o método de parâmetros do seu driver (runAsync/execute/etc.)
  // @ts-ignore
  return await db.runAsync?.(sql, params) ?? await db.exec(sql, params as any);
}

export async function updateSonho(id: number, s: Omit<Sonho, "id">) {
  const db = getDBOrThrow();
  const sql = `UPDATE Sonhos
                 SET titulo=?, sonho=?, tipo=?, humor=?, when_at=?, interpretacao=?
               WHERE id=?`;
  const params = [
    s.titulo, s.sonho, s.tipo ?? null, s.humor ?? null, s.when_at ?? null, s.interpretacao ?? null, id
  ].map(toDB);
  // @ts-ignore
  return await db.runAsync?.(sql, params) ?? await db.exec(sql, params as any);
}

export async function getSonho(id: number): Promise<Sonho | null> {
  const db = getDBOrThrow();
  const sql = `SELECT id, titulo, sonho, tipo, humor, when_at, interpretacao FROM Sonhos WHERE id=? LIMIT 1`;
  const rows = // @ts-ignore
    await db.getAllAsync?.(sql, [id]) ?? await db.select?.(sql, [id]) ?? [];
  return (rows && rows[0]) || null;
}

export async function listSonhos(): Promise<Sonho[]> {
  const db = getDBOrThrow();
  const sql = `SELECT id, titulo, sonho, tipo, humor, when_at, interpretacao FROM Sonhos ORDER BY when_at DESC, id DESC`;
  const rows = // @ts-ignore
    await db.getAllAsync?.(sql, []) ?? await db.select?.(sql, []) ?? [];
  return rows as Sonho[];
}
