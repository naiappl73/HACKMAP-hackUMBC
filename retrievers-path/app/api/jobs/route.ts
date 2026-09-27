import { NextResponse } from "next/server";

export const runtime = "nodejs";

// GET /api/jobs?q=clinical+psychologist -> live federal job postings from the USAJOBS Search API.
// Needs USAJOBS_API_KEY + USAJOBS_EMAIL (free key: https://developer.usajobs.gov/APIRequest/Index).
// Without them, returns configured:false and the page shows a USAJOBS search link instead.

export type Job = {
  title: string;
  agency: string;
  location: string;
  salary: string;
  closes: string;
  url: string;
};

// The parts of the USAJOBS search response we use.
type UsaJobsItem = {
  MatchedObjectDescriptor?: {
    PositionTitle?: string; OrganizationName?: string; PositionLocationDisplay?: string; PositionURI?: string;
    ApplicationCloseDate?: string; PositionRemuneration?: { MinimumRange: string; MaximumRange: string; RateIntervalCode: string }[];
  };
};

const cache = new Map<string, { at: number; jobs: Job[] }>();
const TTL = 1000 * 60 * 30; // 30 minutes

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get("q")?.trim().slice(0, 80);
  if (!q) return NextResponse.json({ error: "Missing q" }, { status: 400 });

  const key = process.env.USAJOBS_API_KEY;
  const email = process.env.USAJOBS_EMAIL;
  if (!key || !email) return NextResponse.json({ configured: false, jobs: [] });

  const hit = cache.get(q.toLowerCase());
  if (hit && Date.now() - hit.at < TTL) return NextResponse.json({ configured: true, jobs: hit.jobs });

  try {
    const url = `https://data.usajobs.gov/api/search?Keyword=${encodeURIComponent(q)}&ResultsPerPage=5`;
    const res = await fetch(url, {
      headers: { Host: "data.usajobs.gov", "User-Agent": email, "Authorization-Key": key },
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) throw new Error(`USAJOBS responded ${res.status}`);
    const data = await res.json();
    const items: UsaJobsItem[] = data?.SearchResult?.SearchResultItems ?? [];
    const jobs: Job[] = items.map((raw) => {
      const d = raw.MatchedObjectDescriptor ?? {};
      const pay = d.PositionRemuneration?.[0];
      const fmt = (n: string) => Number(n).toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
      return {
        title: d.PositionTitle ?? "Untitled position",
        agency: d.OrganizationName ?? "",
        location: d.PositionLocationDisplay ?? "",
        salary: pay ? `${fmt(pay.MinimumRange)} – ${fmt(pay.MaximumRange)}${pay.RateIntervalCode === "PA" ? "/yr" : ""}` : "",
        closes: d.ApplicationCloseDate ? new Date(d.ApplicationCloseDate).toLocaleDateString("en-US") : "",
        url: d.PositionURI ?? "https://www.usajobs.gov",
      };
    });
    cache.set(q.toLowerCase(), { at: Date.now(), jobs });
    return NextResponse.json({ configured: true, jobs });
  } catch (error) {
    console.error("[jobs] USAJOBS lookup failed:", error);
    return NextResponse.json({ configured: true, jobs: [], error: "Job search is unavailable right now." });
  }
}
