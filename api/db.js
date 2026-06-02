const Database = require("better-sqlite3");
const path = require("path");

const db = new Database(path.join(__dirname, "links.db"));

db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS links (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT UNIQUE NOT NULL,
    url TEXT NOT NULL,
    clicks INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_links_slug ON links(slug);
`);

module.exports = db;
