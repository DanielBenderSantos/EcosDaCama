// schema.ts
export const DB_NAME = "ecosdacama.db";

export const CREATE_META = `
CREATE TABLE IF NOT EXISTS _meta (
  k TEXT PRIMARY KEY,
  v TEXT
);
`;

export const INIT_SCHEMA_VERSION = `
INSERT OR IGNORE INTO _meta (k, v) VALUES ('schema_version', '1');
`;

export const CREATE_SONHOS_TABLE = `
CREATE TABLE IF NOT EXISTS Sonhos (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  titulo        TEXT    NOT NULL,
  sonho         TEXT    NOT NULL,
  tipo          TEXT    NOT NULL,
  humor         INTEGER NULL,
  when_at       TEXT    NULL,
  interpretacao TEXT    NULL
);
`;

// 🔧 Função de migração idempotente
export async function runMigrations(db: any) {
  // cria tabela se não existir
  await db.exec(CREATE_SONHOS_TABLE);

  // adiciona colunas se não existirem (ignora erro caso já existam)
  try { await db.exec(`ALTER TABLE Sonhos ADD COLUMN when_at TEXT`); } catch {}
  try { await db.exec(`ALTER TABLE Sonhos ADD COLUMN interpretacao TEXT`); } catch {}

  // índices úteis
  try { await db.exec(`CREATE INDEX IF NOT EXISTS ix_sonhos_when_at ON Sonhos(when_at)`); } catch {}
  try { await db.exec(`CREATE INDEX IF NOT EXISTS ix_sonhos_tipo ON Sonhos(tipo)`); } catch {}
}
