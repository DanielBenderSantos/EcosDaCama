import * as SQLite from "expo-sqlite";
import type { DB } from "./types";

export async function createDB(name: string): Promise<DB> {
  const conn = await SQLite.openDatabaseAsync(`${name}.db`);

  return {
    async exec(sql: string, params?: any[]) {
      if (params && params.length) {
        await conn.runAsync(sql, params);
      } else {
        await conn.execAsync(sql);
      }
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
