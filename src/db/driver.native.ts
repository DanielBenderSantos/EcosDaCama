import * as SQLite from "expo-sqlite";
import type { DB } from "./types";

function ensureDbFile(name: string): string {
  // Garante uma única extensão .db
  return name.endsWith(".db") ? name : `${name}.db`;
}

export async function createDB(name: string): Promise<DB> {
  console.log("[DB] usando driver NATIVO (expo-sqlite)");
  const file = ensureDbFile(name);
  const conn = await SQLite.openDatabaseAsync(file);

  return {
    async exec(sql: string, params?: any[]) {
      if (params && params.length) {
        await conn.runAsync(sql, params);
      } else {
        await conn.execAsync(sql);
      }
    },

    async select<T = Record<string, any>>(sql: string, params?: any[]) {
      // alias principal usado pelo export/import
      const rows = await conn.getAllAsync<T>(sql, params ?? []);
      return rows;
    },

    async getAll<T = Record<string, any>>(sql: string, params?: any[]) {
      const rows = await conn.getAllAsync<T>(sql, params ?? []);
      return rows;
    },

    async getOne<T = Record<string, any>>(sql: string, params?: any[]) {
      const row = await conn.getFirstAsync<T>(sql, params ?? []);
      return (row as T) ?? undefined;
    },

    async close() {
      const anyConn: any = conn as any;
      if (typeof anyConn.closeAsync === "function") {
        await anyConn.closeAsync();
      }
    },
  };
}

export default createDB;
