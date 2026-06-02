const express = require("express");
const cors = require("cors");
const { nanoid } = require("nanoid");
const db = require("./db");

const app = express();
app.use(cors());
app.use(express.json());

const ADMIN_KEY = process.env.ADMIN_KEY || "changeme";

function auth(req, res, next) {
  const key = req.headers["x-admin-key"];
  if (key !== ADMIN_KEY) return res.status(401).json({ error: "unauthorized" });
  next();
}

// get all links
app.get("/", auth, (req, res) => {
  const rows = db.prepare("SELECT * FROM links ORDER BY created_at DESC").all();
  res.json(rows);
});

// resolve a slug (public)
app.get("/r/:slug", (req, res) => {
  const link = db.prepare("SELECT * FROM links WHERE slug = ?").get(req.params.slug);
  if (!link) return res.status(404).json({ error: "not found" });
  db.prepare("UPDATE links SET clicks = clicks + 1 WHERE id = ?").run(link.id);
  res.json({ url: link.url });
});

// create a link
app.post("/", auth, (req, res) => {
  const { url, slug } = req.body;
  if (!url) return res.status(400).json({ error: "url required" });

  const finalSlug = slug || nanoid(6);

  const existing = db.prepare("SELECT * FROM links WHERE slug = ?").get(finalSlug);
  if (existing) return res.status(409).json({ error: "slug already taken" });

  const result = db.prepare("INSERT INTO links (slug, url) VALUES (?, ?)").run(finalSlug, url);
  res.json({ id: result.lastInsertRowid, slug: finalSlug, url });
});

// update a link
app.put("/:id", auth, (req, res) => {
  const { url, slug } = req.body;
  const link = db.prepare("SELECT * FROM links WHERE id = ?").get(req.params.id);
  if (!link) return res.status(404).json({ error: "not found" });

  if (slug && slug !== link.slug) {
    const existing = db.prepare("SELECT * FROM links WHERE slug = ? AND id != ?").get(slug, req.params.id);
    if (existing) return res.status(409).json({ error: "slug already taken" });
  }

  db.prepare("UPDATE links SET url = COALESCE(?, url), slug = COALESCE(?, slug) WHERE id = ?")
    .run(url || null, slug || null, req.params.id);
  res.json({ ok: true });
});

// delete a link
app.delete("/:id", auth, (req, res) => {
  db.prepare("DELETE FROM links WHERE id = ?").run(req.params.id);
  res.json({ ok: true });
});

// --- Auth check ---
app.get("/auth", auth, (req, res) => {
  res.json({ ok: true });
});

const PORT = process.env.PORT || 4501;
app.listen(PORT, () => console.log(`links api on :${PORT}`));
