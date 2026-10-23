import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/lib/analytics/guard";
import { ONLINE_WINDOW_SECONDS, onlineCount } from "@/lib/analytics/visitorStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/admin/analytics/online
 *
 * Protected. Returns the number of visitors currently active (seen within the
 * window). The admin UI polls this cheap endpoint on a short interval for the
 * live "Online now" indicator.
 */
export async function GET(req: NextRequest) {
  const guard = requireAdmin(req);
  if (!guard.ok) {
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }

  return NextResponse.json(
    {
      onlineNow: onlineCount(),
      windowSeconds: ONLINE_WINDOW_SECONDS,
      at: new Date().toISOString(),
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
