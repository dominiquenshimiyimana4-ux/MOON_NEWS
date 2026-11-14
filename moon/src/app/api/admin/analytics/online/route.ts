import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/lib/analytics/guard";
import { getVisitorFeed } from "@/lib/analytics/visitorStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/admin/analytics/online
 *
 * Protected. Returns live traffic for the admin's visitor box: the number of
 * visitors currently active (seen within the window), today's totals, and one
 * row per visitor seen today with what they are viewing. The admin UI polls
 * this endpoint on a short interval, so a new visit appears in the box without
 * a page reload.
 */
export async function GET(req: NextRequest) {
  const guard = requireAdmin(req);
  if (!guard.ok) {
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }

  const feed = getVisitorFeed();

  return NextResponse.json(
    {
      ...feed,
      at: feed.generatedAt,
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
