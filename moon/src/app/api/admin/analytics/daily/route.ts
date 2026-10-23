import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/lib/analytics/guard";
import { getTraffic } from "@/lib/analytics/visitorStore";
import type { TrafficRange } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const RANGES: TrafficRange[] = ["today", "7d", "30d", "12m"];

/**
 * GET /api/admin/analytics/daily?range=7d
 *
 * Protected. Returns just the traffic series (visitors + page views per bucket)
 * for the requested range — the data behind the visitor chart.
 */
export async function GET(req: NextRequest) {
  const guard = requireAdmin(req);
  if (!guard.ok) {
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }

  const rangeParam = req.nextUrl.searchParams.get("range") as TrafficRange | null;
  const range: TrafficRange = rangeParam && RANGES.includes(rangeParam) ? rangeParam : "7d";

  return NextResponse.json(getTraffic(range), {
    headers: { "Cache-Control": "no-store" },
  });
}
