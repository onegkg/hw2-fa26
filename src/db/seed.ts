import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { closeDb, openDb, run } from "./connection.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const seed = readFileSync(resolve(__dirname, "seed.sql"), "utf-8");

const db = openDb();
run(db, seed);
closeDb(db);

console.log("Database seeded with sample courses and prerequisites");
