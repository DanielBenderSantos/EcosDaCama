// db.ts
import { CREATE_META, CREATE_SONHOS_TABLE, DB_NAME, INIT_SCHEMA_VERSION } from "./schema";
import type { DB } from "./types";
import { createDB } from "./driver"; // 👈 estático por plataforma

let driver: DB | null = null;

export async function initDB(): Promise<DB> {
  if (!driver) {
    driver = await createDB(DB_NAME);
    try { await driver.exec("PRAGMA foreign_keys = ON"); } catch {}

    await driver.exec(CREATE_META);
    await driver.exec(INIT_SCHEMA_VERSION);
    await driver.exec(CREATE_SONHOS_TABLE);

    // 🔧 Migrações idempotentes (seguras se você NÃO reinstalar, mas ok manter)
    // garantir coluna when_at (se vier de um DB antigo sem ela)
    try { await driver.exec(`ALTER TABLE Sonhos ADD COLUMN when_at TEXT`); } catch {}
    // garantir coluna humor (se vier de um DB antigo)
    try { await driver.exec(`ALTER TABLE Sonhos ADD COLUMN humor INTEGER`); } catch {}
    // ⚠️ Não há mais "sentimentos" no schema novo.
  }
  return driver;
}

function getDBOrThrow(): DB {
  if (!driver) throw new Error("DB não inicializado. Chame initDB() antes.");
  return driver;
}

// ===== Tipos de domínio =====

export interface Sonho {
  id?: number;
  titulo: string;
  sonho: string;
  tipo: "normal" | "lúcido" | "pesadelo" | "recorrente";
  humor?: number | null;  // 1..5 (1=ótimo, 5=péssimo)
  when_at?: string;       // ISO (Date.toISOString())
}

// ===== CRUD =====

export async function addSonho(data: Omit<Sonho, "id">): Promise<void> {
  const db = getDBOrThrow();
  await db.exec(
    `INSERT INTO Sonhos (titulo, sonho, tipo, humor, when_at) VALUES (?, ?, ?, ?, ?)`,
    [
      data.titulo,
      data.sonho,
      data.tipo,
      data.humor ?? null,
      data.when_at ?? null,
    ]
  );
}

export async function listSonhos(): Promise<Sonho[]> {
  const db = getDBOrThrow();
  const rows = await db.getAll<{
    id: number;
    titulo: string;
    sonho: string;
    tipo: string;
    humor: number | null;
    when_at: string | null;
  }>(
    `SELECT id, titulo, sonho, tipo, humor, when_at
     FROM Sonhos
     ORDER BY id DESC`
  );
  return rows.map(r => ({
    id: r.id,
    titulo: r.titulo,
    sonho: r.sonho,
    tipo: r.tipo as Sonho["tipo"],
    humor: r.humor ?? null,
    when_at: r.when_at ?? undefined,
  }));
}

export async function getSonho(id: number): Promise<Sonho | undefined> {
  const db = getDBOrThrow();
  const r = await db.getOne<{
    id: number;
    titulo: string;
    sonho: string;
    tipo: string;
    humor: number | null;
    when_at: string | null;
  }>(
    `SELECT id, titulo, sonho, tipo, humor, when_at
     FROM Sonhos
     WHERE id = ?`,
    [id]
  );
  if (!r) return undefined;
  return {
    id: r.id,
    titulo: r.titulo,
    sonho: r.sonho,
    tipo: r.tipo as Sonho["tipo"],
    humor: r.humor ?? null,
    when_at: r.when_at ?? undefined,
  };
}

export async function updateSonho(id: number, patch: Partial<Omit<Sonho, "id">>): Promise<void> {
  const db = getDBOrThrow();
  const sets: string[] = [];
  const vals: any[] = [];

  if (patch.titulo !== undefined)  { sets.push("titulo = ?");  vals.push(patch.titulo); }
  if (patch.sonho !== undefined)   { sets.push("sonho = ?");   vals.push(patch.sonho); }
  if (patch.tipo !== undefined)    { sets.push("tipo = ?");    vals.push(patch.tipo); }
  if (patch.humor !== undefined)   { sets.push("humor = ?");   vals.push(patch.humor); }
  if (patch.when_at !== undefined) { sets.push("when_at = ?"); vals.push(patch.when_at); }

  if (!sets.length) return;
  vals.push(id);

  await db.exec(`UPDATE Sonhos SET ${sets.join(", ")} WHERE id = ?`, vals);
}

export async function deleteSonho(id: number): Promise<void> {
  const db = getDBOrThrow();
  await db.exec(`DELETE FROM Sonhos WHERE id = ?`, [id]);
}
