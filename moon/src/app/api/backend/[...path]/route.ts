import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const BACKEND_URL = process.env.BACKEND_API_URL?.trim().replace(/\/+$/, "") ?? "";

function backendUrl(req: NextRequest, path: string[]): string {
  if (!BACKEND_URL) throw new Error("BACKEND_API_URL is not configured.");
  const url = new URL(`${BACKEND_URL}/api/${path.join("/")}`);
  req.nextUrl.searchParams.forEach((value, key) => url.searchParams.append(key, value));
  return url.toString();
}

async function proxy(req: NextRequest, path: string[], method: string) {
  if (!BACKEND_URL) {
    return NextResponse.json({ error: "Backend API is not configured." }, { status: 503 });
  }

  const headers = new Headers();
  const contentType = req.headers.get("content-type");
  if (contentType) headers.set("content-type", contentType);
  const cookie = req.headers.get("cookie");
  if (cookie) headers.set("cookie", cookie);

  const response = await fetch(backendUrl(req, path), {
    method,
    headers,
    body: method === "GET" || method === "HEAD" ? undefined : await req.arrayBuffer(),
    redirect: "manual",
  });

  const responseHeaders = new Headers(response.headers);
  responseHeaders.delete("set-cookie");
  responseHeaders.delete("content-length");

  const setCookie = response.headers.get("set-cookie");
  if (setCookie) {
    const rewritten = setCookie
      .replace(/;\s*Domain=[^;]*/gi, "")
      .replace(/;\s*SameSite=[^;]*/gi, "; SameSite=Lax")
      .replace(/;\s*Secure/gi, "; Secure");
    responseHeaders.set("set-cookie", rewritten);
  }

  const body = method === "HEAD" ? null : await response.arrayBuffer();
  return new NextResponse(body, { status: response.status, headers: responseHeaders });
}

export function GET(req: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return context.params.then((p) => proxy(req, p.path, "GET"));
}
export function POST(req: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return context.params.then((p) => proxy(req, p.path, "POST"));
}
export function PUT(req: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return context.params.then((p) => proxy(req, p.path, "PUT"));
}
export function PATCH(req: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return context.params.then((p) => proxy(req, p.path, "PATCH"));
}
export function DELETE(req: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return context.params.then((p) => proxy(req, p.path, "DELETE"));
}
export function OPTIONS(req: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return context.params.then((p) => proxy(req, p.path, "OPTIONS"));
}
