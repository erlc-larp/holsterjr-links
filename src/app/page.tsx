"use client";

import { useState, useEffect, useCallback } from "react";

const API_BASE = process.env.NEXT_PUBLIC_LINKS_API_URL || "https://api.holsterjr.xyz/links";
const SHORT_BASE = process.env.NEXT_PUBLIC_SHORT_BASE || "https://links.holsterjr.xyz";

type Link = {
  id: number;
  slug: string;
  url: string;
  clicks: number;
  created_at: string;
};

export default function LinksPage() {
  const [key, setKey] = useState("");
  const [authed, setAuthed] = useState(false);
  const [links, setLinks] = useState<Link[]>([]);
  const [url, setUrl] = useState("");
  const [slug, setSlug] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const [editId, setEditId] = useState<number | null>(null);
  const [editUrl, setEditUrl] = useState("");
  const [editSlug, setEditSlug] = useState("");
  const [search, setSearch] = useState("");

  const headers = useCallback(
    () => ({ "Content-Type": "application/json", "x-admin-key": key }),
    [key]
  );

  const loadLinks = useCallback(async () => {
    const res = await fetch(API_BASE, { headers: { "x-admin-key": key } });
    if (res.ok) setLinks(await res.json());
  }, [key]);

  useEffect(() => {
    if (authed) loadLinks();
  }, [authed, loadLinks]);

  const login = async () => {
    if (!key.trim()) return;
    const res = await fetch(`${API_BASE}/auth`, { headers: { "x-admin-key": key } });
    if (res.ok) {
      setAuthed(true);
    } else {
      alert("invalid key");
    }
  };

  const createLink = async () => {
    if (!url) return;
    const res = await fetch(API_BASE, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({ url, slug: slug || undefined }),
    });
    if (res.ok) {
      const data = await res.json();
      setUrl("");
      setSlug("");
      copyToClipboard(`${SHORT_BASE}/${data.slug}`);
      loadLinks();
    } else {
      const err = await res.json();
      alert(err.error);
    }
  };

  const updateLink = async () => {
    if (!editId) return;
    await fetch(`${API_BASE}/${editId}`, {
      method: "PUT",
      headers: headers(),
      body: JSON.stringify({ url: editUrl, slug: editSlug }),
    });
    setEditId(null);
    loadLinks();
  };

  const deleteLink = async (id: number) => {
    if (!confirm("delete this link?")) return;
    await fetch(`${API_BASE}/${id}`, { method: "DELETE", headers: headers() });
    loadLinks();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(text);
    setTimeout(() => setCopied(null), 2000);
  };

  const filtered = search
    ? links.filter((l) => l.slug.includes(search) || l.url.includes(search))
    : links;

  if (!authed) {
    return (
      <div className="max-w-sm mx-auto py-20 px-6">
        <h1 className="text-lg font-semibold text-stone-800 mb-6">links</h1>
        <input
          type="password"
          placeholder="admin key"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && login()}
          className="w-full border border-stone-200 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:border-amber-300"
        />
        <button
          onClick={login}
          className="mt-3 w-full bg-stone-800 text-white text-sm py-2 rounded-md hover:bg-stone-700 transition-colors"
        >
          login
        </button>
      </div>
    );
  }

  const input = "w-full border border-stone-200 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:border-amber-300";

  return (
    <div className="max-w-3xl mx-auto py-10 px-6">
      <header className="flex items-center justify-between mb-8">
        <h1 className="text-lg font-semibold text-stone-800 tracking-tight">links</h1>
        <span className="text-xs text-stone-400">{links.length} links</span>
      </header>

      {/* Create form */}
      <div className="bg-white rounded-md border border-stone-200 border-l-3 border-l-amber-300 px-5 py-4 shadow-xs mb-6">
        <div className="flex gap-2">
          <input
            placeholder="https://example.com/long-url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && createLink()}
            className={`flex-1 ${input}`}
          />
          <input
            placeholder="slug (optional)"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && createLink()}
            className={`w-36 ${input}`}
          />
          <button
            onClick={createLink}
            className="bg-stone-800 text-white text-sm px-4 py-2 rounded-md hover:bg-stone-700 transition-colors cursor-pointer shrink-0"
          >
            shorten
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          placeholder="search links..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={input}
        />
      </div>

      {/* Edit form */}
      {editId && (
        <div className="bg-white rounded-md border border-stone-200 border-l-3 border-l-orange-400 px-5 py-4 shadow-xs mb-4">
          <h2 className="text-sm font-semibold text-stone-800 mb-3">edit link</h2>
          <div className="space-y-2">
            <input value={editSlug} onChange={(e) => setEditSlug(e.target.value)} placeholder="slug" className={input} />
            <input value={editUrl} onChange={(e) => setEditUrl(e.target.value)} placeholder="url" className={input} />
            <div className="flex gap-2">
              <button onClick={updateLink} className="bg-stone-800 text-white text-sm px-4 py-2 rounded-md hover:bg-stone-700 transition-colors cursor-pointer">save</button>
              <button onClick={() => setEditId(null)} className="text-sm text-stone-400 hover:text-stone-600 cursor-pointer">cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Links list */}
      <div className="space-y-2">
        {filtered.map((link) => {
          const shortUrl = `${SHORT_BASE}/${link.slug}`;
          return (
            <div
              key={link.id}
              className="bg-white rounded-md border border-stone-200 border-l-3 border-l-stone-300 px-5 py-4 shadow-xs"
            >
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-stone-800 font-mono">/{link.slug}</span>
                    <button
                      onClick={() => copyToClipboard(shortUrl)}
                      className="text-xs text-amber-600 hover:text-amber-800 cursor-pointer"
                    >
                      {copied === shortUrl ? "copied" : "copy"}
                    </button>
                  </div>
                  <p className="text-sm text-stone-400 mt-1 truncate">{link.url}</p>
                </div>
                <span className="text-xs text-stone-400 tabular-nums shrink-0 ml-4">
                  {link.clicks} click{link.clicks !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="flex items-center gap-3 mt-2">
                <button
                  onClick={() => { setEditId(link.id); setEditSlug(link.slug); setEditUrl(link.url); }}
                  className="text-xs text-amber-600 hover:text-amber-800 cursor-pointer"
                >
                  edit
                </button>
                <button onClick={() => deleteLink(link.id)} className="text-xs text-red-500 hover:text-red-700 cursor-pointer">
                  delete
                </button>
                <span className="text-xs text-stone-400">
                  {new Date(link.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && <p className="text-sm text-stone-400">{search ? "no matches" : "no links yet"}</p>}
      </div>
    </div>
  );
}
