// schema.ts
export const DB_NAME = "ecosdacama.db";

// (mantenha os seus, se já tiver)
export const CREATE_META = `
CREATE TABLE IF NOT EXISTS _meta (
  k TEXT PRIMARY KEY,
  v TEXT
);
`;

export const INIT_SCHEMA_VERSION = `
INSERT OR IGNORE INTO _meta (k, v) VALUES ('schema_version', '1');
`;

// 👇 Tabela sem "sentimentos" e com "humor INTEGER"
export const CREATE_SONHOS_TABLE = `
CREATE TABLE IF NOT EXISTS Sonhos (
  id       INTEGER PRIMARY KEY AUTOINCREMENT,
  titulo   TEXT    NOT NULL,
  sonho    TEXT    NOT NULL,
  tipo     TEXT    NOT NULL,   -- 'normal' | 'lúcido' | 'pesadelo' | 'recorrente'
  humor    INTEGER,            -- 1..5 (1=ótimo, 5=péssimo) - opcional
  when_at  TEXT                -- ISO string
  interpretacao TEXT   
);
`;
