export type Row = Record<string, any>;

export interface DB {
  exec: (sql: string, params?: any[]) => Promise<void>;
  getAll: <T = Row>(sql: string, params?: any[]) => Promise<T[]>;
  getOne: <T = Row>(sql: string, params?: any[]) => Promise<T | undefined>;
  close?: () => Promise<void> | void;
}
