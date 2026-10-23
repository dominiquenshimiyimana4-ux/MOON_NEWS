import { NextResponse, type NextRequest } from "next/server";
import { recordVisit } from "@/lib/analytics/visitorStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/analytics/visit
 *
 * Public ingestion endpoint called by the client `VisitorTracker` whenever a
 * page loads (pageview) or the visitor shows activity (heartbeat). It records
 * the visit server-side, de-duplicating refreshes, and returns the freshly
 * computed counts so the tracker can update optimistically.
 *
 * Body (all optional except `page`):
 *   { visitorToken, sessionId, page, source, device, browser, os, kind }
 */
export async function POST(req: NextRequest) {
  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const page = typeof body.page === "string" && body.page ? body.page : "/";
  const visitorToken = typeof body.visitorToken === "string" ? body.visitorToken : "";

  const result = recordVisit({
    visitorToken,
    sessionId: typeof body.sessionId === "string" ? body.sessionId : undefined,
    page,
    source: typeof body.source === "string" ? body.source : undefined,
    device:
      body.device === "mobile" || body.device === "tablet" || body.device === "desktop"
        ? body.device
        : undefined,
    browser: typeof body.browser === "string" ? body.browser : undefined,
    os: typeof body.os === "string" ? body.os : undefined,
    country: typeof body.country === "string" ? body.country : undefined,
    city: typeof body.city === "string" ? body.city : undefined,
    kind: body.kind === "heartbeat" ? "heartbeat" : "pageview",
  });

  return NextResponse.json(result, {
    status: 202,
    headers: { "Cache-Control": "no-store" },
  });
}
