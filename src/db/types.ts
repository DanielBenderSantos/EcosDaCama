// src/db/types.ts
export type Row = Record<string, any>;

export interface DB {
  /** Executa SQL sem retorno de linhas (CREATE/ALTER/INSERT/UPDATE/DELETE/PRAGMA...) */
  exec(sql: string, params?: any[]): Promise<void>;

  /** SELECT padrão (usado pelo módulo de export/import) */
  select<T = Row>(sql: string, params?: any[]): Promise<T[]>;

  /** Utilitários opcionais (alguns drivers expõem também): */
  getAll?<T = Row>(sql: string, params?: any[]): Promise<T[]>;
  getOne?<T = Row>(sql: string, params?: any[]): Promise<T | undefined>;
  close?(): Promise<void>;
}
