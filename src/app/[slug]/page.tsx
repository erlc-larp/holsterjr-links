import { redirect } from "next/navigation";

const API_BASE = process.env.NEXT_PUBLIC_LINKS_API_URL || "https://api.holsterjr.xyz/links";

export const dynamic = "force-dynamic";

export default async function RedirectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  try {
    const res = await fetch(`${API_BASE}/r/${slug}`, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      redirect(data.url);
    }
  } catch (e) {
    // redirect() throws a special error internally, rethrow it
    throw e;
  }

  return (
    <div className="max-w-sm mx-auto py-20 px-6 text-center">
      <h1 className="text-lg font-semibold text-stone-800 mb-2">link not found</h1>
      <p className="text-sm text-stone-400">this short link doesn't exist.</p>
      <a href="/" className="text-sm text-amber-600 hover:text-amber-800 mt-4 inline-block">go home</a>
    </div>
  );
}
