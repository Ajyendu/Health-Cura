/**
 * Vercel Routing Middleware when Project Root Directory = repo root.
 * Same behavior as frontend/middleware.js (keep in sync).
 */
export default async function middleware(request) {
  const url = new URL(request.url);
  const backend = process.env.BACKEND_ORIGIN?.replace(/\/$/, "");
  if (!backend) {
    return new Response(
      JSON.stringify({
        success: false,
        message:
          "Set BACKEND_ORIGIN in Vercel (Production) to your API origin, e.g. https://xxx.onrender.com",
      }),
      { status: 503, headers: { "content-type": "application/json" } }
    );
  }

  const target = `${backend}${url.pathname}${url.search}`;
  const headers = new Headers(request.headers);
  headers.delete("host");

  /** @type {RequestInit} */
  const init = {
    method: request.method,
    headers,
    redirect: "manual",
  };

  if (!["GET", "HEAD"].includes(request.method)) {
    const buf = await request.arrayBuffer();
    if (buf.byteLength) init.body = buf;
  }

  let upstream;
  try {
    upstream = await fetch(target, init);
  } catch {
    return new Response(
      JSON.stringify({ success: false, message: "Upstream request failed" }),
      { status: 502, headers: { "content-type": "application/json" } }
    );
  }

  const outHeaders = new Headers();
  upstream.headers.forEach((value, key) => {
    const k = key.toLowerCase();
    if (k === "transfer-encoding" || k === "content-encoding") return;
    outHeaders.append(key, value);
  });

  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: outHeaders,
  });
}

export const config = {
  matcher: ["/api/v1", "/api/v1/:path*"],
};
