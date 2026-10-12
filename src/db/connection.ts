/**
 * connection.ts — opening the SQLite database and running SQL against it.
 *
 * Every other module talks to the database through these helpers. They run
 * each query right away and return its result, so there is nothing to await.
 */

import Database from "better-sqlite3";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

/**
 * The database file, relative to the folder you run commands from. The tests
 * set DB_FILE=test.sqlite (see vitest.config.ts), so running them doesn't
 * replace the plan you generated with `npm run solve`.
 */
export const DB_FILE = process.env.DB_FILE ?? "db.sqlite";

/** An open database connection. */
export type Db = Database.Database;

/**
 * Opens a database file (default: db.sqlite), creating it if it doesn't
 * exist, or, with ":memory:", a fresh in-memory database. Close it with
 * closeDb when you're done.
 */
export function openDb(file: string = DB_FILE): Db {
    return new Database(file === ":memory:" ? file : resolve(file));
}

/** Closes a connection from openDb. */
export function closeDb(db: Db): void {
    db.close();
}

/**
 * Opens the database, runs `fn` with it, and always closes it afterwards.
 * The web server calls this once per request.
 */
export function withDb<T>(fn: (db: Db) => T): T {
    if (!existsSync(resolve(DB_FILE))) {
        throw new Error(`${DB_FILE} doesn't exist yet. Create it with: npm run db:init && npm run db:seed`);
    }
    const db = openDb(DB_FILE);
    try {
        return fn(db);
    } finally {
        closeDb(db);
    }
}

/** Runs a query and returns all result rows as objects. `?` placeholders are filled from `params`. */
export function all<T>(db: Db, sql: string, params: unknown[] = []): T[] {
    return db.prepare(sql).all(...params) as T[];
}

/** Runs a query and returns its first row, or undefined if there are none. */
export function get<T>(db: Db, sql: string, params: unknown[] = []): T | undefined {
    return db.prepare(sql).get(...params) as T | undefined;
}

/** Runs SQL that returns no rows. Without params, it may contain several statements. */
export function run(db: Db, sql: string, params: unknown[] = []): void {
    if (params.length === 0) {
        db.exec(sql);
    } else {
        db.prepare(sql).run(...params);
    }
}

/** Runs `fn` inside a transaction: all of its changes are saved, or none are. */
export function transaction(db: Db, fn: () => void): void {
    db.transaction(fn)();
}
