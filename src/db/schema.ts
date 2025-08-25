// TUDO sobre schema e migrações fica aqui

export const DB_NAME = "EcosDaCama";

// Tabela principal (agora com when_at)
export const CREATE_SONHOS_TABLE = `
CREATE TABLE IF NOT EXISTS Sonhos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  titulo TEXT NOT NULL,
  sonho TEXT NOT NULL,
  sentimentos TEXT NOT NULL, -- JSON string: ["feliz","triste",...]
  tipo TEXT NOT NULL,        -- ex.: "normal", "lúcido", "pesadelo", "recorrente"
  when_at TEXT               -- ISO string (Date.toISOString())
);
`;

// Meta (controle de versão simples - pode continuar igual)
export const CREATE_META = `
CREATE TABLE IF NOT EXISTS _meta (
  key TEXT PRIMARY KEY,
  value TEXT
);
`;

export const INIT_SCHEMA_VERSION = `
INSERT OR IGNORE INTO _meta (key, value) VALUES ('schema_version', '1');
`;

export const GET_SCHEMA_VERSION = `
SELECT value FROM _meta WHERE key='schema_version';
`;
