import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import initSqlJs, { type Database } from "sql.js";
import { beforeEach, describe, expect, it } from "vitest";

const schema = readFileSync(new URL("../../db/schema.sql", import.meta.url), "utf8");
const wasmPath = createRequire(import.meta.url).resolve("sql.js/dist/sql-wasm.wasm");
const SQL = await initSqlJs({
  locateFile: () => wasmPath,
  useOldExtensionFunctions: false,
});

const insertShow = (db: Database, id = 1) =>
  db.run("INSERT INTO shows (id, name) VALUES (?, ?)", [id, `Show ${id}`]);

describe("db/schema.sql", () => {
  let db: Database;

  beforeEach(() => {
    db = new SQL.Database();
    db.run("PRAGMA foreign_keys = ON");
    db.run(schema);
  });

  it("creates every table and is idempotent", () => {
    db.run(schema);
    const rows = db.exec("SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name");
    expect(rows[0]?.values.flat()).toEqual(["genres", "search_results", "show_genres", "shows"]);
  });

  it.each([
    ["a blank name", "INSERT INTO shows (id, name) VALUES (1, '')"],
    ["a non-positive id", "INSERT INTO shows (id, name) VALUES (0, 'x')"],
    ["an out-of-range rating", "INSERT INTO shows (id, name, rating_average) VALUES (1, 'x', 11)"],
    ["a non-HTTPS image", "INSERT INTO shows (id, name, image_medium_url) VALUES (1, 'x', 'http://a')"],
  ])("rejects %s", (_label, statement) => {
    expect(() => db.run(statement)).toThrow(/constraint/i);
  });

  it("enforces foreign keys", () => {
    expect(() =>
      db.run("INSERT INTO search_results (query_text, show_id, result_rank) VALUES ('q', 99, 1)"),
    ).toThrow(/constraint/i);
  });

  it("enforces a unique rank per query", () => {
    insertShow(db, 1);
    insertShow(db, 2);
    db.run("INSERT INTO search_results (query_text, show_id, result_rank) VALUES ('q', 1, 1)");
    expect(() =>
      db.run("INSERT INTO search_results (query_text, show_id, result_rank) VALUES ('q', 2, 1)"),
    ).toThrow(/constraint/i);
  });

  it("cascades deletes to dependent rows", () => {
    insertShow(db);
    db.run("INSERT INTO genres (name) VALUES ('Drama')");
    db.run("INSERT INTO show_genres (show_id, genre_name) VALUES (1, 'Drama')");
    db.run("INSERT INTO search_results (query_text, show_id, result_rank) VALUES ('q', 1, 1)");

    db.run("DELETE FROM shows WHERE id = 1");

    expect(db.exec("SELECT COUNT(*) FROM show_genres")[0]?.values[0]?.[0]).toBe(0);
    expect(db.exec("SELECT COUNT(*) FROM search_results")[0]?.values[0]?.[0]).toBe(0);
  });
});
