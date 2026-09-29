import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { closeDb, DB_FILE, openDb, run } from "./connection.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const schema = readFileSync(resolve(__dirname, "schema.sql"), "utf-8");

const db = openDb();
run(db, schema);
closeDb(db);

console.log(`Database ${DB_FILE} initialized from schema.sql`);
