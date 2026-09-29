// Checks that the preinstalled toolchain actually works on this platform.
// Run by the Dockerfile at build time (and by the Gradescope setup), so a
// broken dependency fails the build instead of failing on a student's laptop.
// Run it from any folder outside the repo: packages are found via /node_modules.
import Database from "better-sqlite3";
import { init } from "z3-solver";
import ejs from "ejs";
import express from "express";
import { JSDOM } from "jsdom";

const db = new Database(":memory:");
const row = db.prepare("SELECT 40 + 2 AS answer").get();
if (row.answer !== 42) throw new Error(`SQLite returned ${row.answer}`);
db.close();

const { Context, em } = await init();
const { Solver, Int } = new Context("smoke");
const x = Int.const("x");
const solver = new Solver();
solver.add(x.add(1).eq(3));
const result = await solver.check();
if (result !== "sat" || solver.model().eval(x).toString() !== "2") {
  throw new Error(`z3 returned ${result}`);
}
em.PThread.terminateAllThreads();

if (ejs.render("<%= t %>", { t: "ok" }) !== "ok") throw new Error("ejs render");
if (typeof express !== "function") throw new Error("express import");

const dom = new JSDOM("<p id=p></p><script>document.getElementById('p').textContent = 'ok';</script>", {
  runScripts: "dangerously",
});
if (dom.window.document.getElementById("p").textContent !== "ok") throw new Error("jsdom script");
dom.window.close();

console.log("smoke test ok: better-sqlite3, z3-solver, ejs, express, jsdom");
