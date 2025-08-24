import initSqlJs from "sql.js";
import type { Database, SqlJsStatic } from "sql.js";
import type { DB } from "./types";

// Persistência simples no localStorage (base64)
function saveToLocalStorage(name: string, db: Database): void {
  const binary = db.export();
  const str = String.fromCharCode(...binary);
  const b64 = btoa(str);
  localStorage.setItem(`${name}.db/base64`, b64);
}
function loadFromLocalStorage(name: string): Uint8Array | null {
  const b64 = localStorage.getItem(`${name}.db/base64`);
  if (!b64) return null;
  const str = atob(b64);
  const arr = new Uint8Array(str.length);
  for (let i = 0; i < str.length; i++) arr[i] = str.charCodeAt(i);
  return arr;
}

function candidates(): string[] {
  const origin = (globalThis as any)?.location?.origin ?? "";
  return [
    // 1) local (pasta public) — recomendado
    `${origin}/sql-wasm.wasm`,
    // 2) fallback: CDN oficial do sql.js (funciona para dev)
    "https://sql.js.org/dist/sql-wasm.wasm",
  ];
}

async function findAvailableWasm(): Promise<string> {
  const urls = candidates();
  for (const url of urls) {
    try {
      const res = await fetch(url, { method: "HEAD", cache: "no-store" });
      if (res.ok) return url;
    } catch {
      // tenta o próximo
    }
  }
  throw new Error(
    `sql-wasm.wasm não encontrado nas URLs: \n${urls.join("\n")}\n` +
    `Coloque o arquivo em /public/sql-wasm.wasm e rode com cache limpo (npx expo start --web -c).`
  );
}

async function loadSQL(): Promise<SqlJsStatic> {
  const url = await findAvailableWasm();
  console.log("[sql.js] carregando wasm de:", url);
  return await initSqlJs({ locateFile: () => url });
}

export async function createDB(name: string): Promise<DB> {
  console.log("[DB] usando driver WEB (sql.js)");
  const SQL = await loadSQL();
  const existing = loadFromLocalStorage(name);
  const db: Database = existing ? new SQL.Database(existing) : new SQL.Database();

  const exec = async (sql: string, params?: any[]) => {
    db.run(sql, params ?? []);
    saveToLocalStorage(name, db);
  };

  const getAll = async <T = Record<string, any>>(sql: string, params?: any[]): Promise<T[]> => {
    const stmt = db.prepare(sql);
    try {
      stmt.bind(params ?? []);
      const rows: any[] = [];
      while (stmt.step()) rows.push(stmt.getAsObject());
      return rows as T[];
    } finally {
      stmt.free();
    }
  };

  const getOne = async <T = Record<string, any>>(sql: string, params?: any[]): Promise<T | undefined> => {
    const rows = await getAll<T>(sql, params);
    return rows[0];
  };

  const close = async () => {
    saveToLocalStorage(name, db);
    db.close();
  };

  const api: DB = { exec, getAll, getOne, close };
  return api;
}

export default createDB;
