import { NextResponse } from "next/server";

export const runtime = "nodejs";

const REPO = "kaustavr19/New-Portfolio";

// Revalidate at most once every 5 minutes — this is ambient flavor, not
// something that needs to be second-fresh, and keeps us well clear of
// GitHub's unauthenticated rate limit.
export const revalidate = 300;

export async function GET() {
  try {
    const res = await fetch(`https://api.github.com/repos/${REPO}/commits?per_page=1`, {
      headers: { Accept: "application/vnd.github+json" },
      next: { revalidate: 300 },
    });
    if (!res.ok) {
      return NextResponse.json({ ok: false }, { status: 502 });
    }
    const data = await res.json();
    const commit = Array.isArray(data) ? data[0] : null;
    if (!commit) {
      return NextResponse.json({ ok: false }, { status: 502 });
    }
    return NextResponse.json({
      ok: true,
      sha: (commit.sha as string).slice(0, 7),
      message: (commit.commit?.message as string ?? "").split("\n")[0],
      date: commit.commit?.author?.date ?? commit.commit?.committer?.date ?? null,
      url: commit.html_url,
    });
  } catch {
    return NextResponse.json({ ok: false }, { status: 502 });
  }
}
