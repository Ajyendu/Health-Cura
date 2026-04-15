/**
 * Same as frontend/middleware.js — used when Vercel Root Directory is the repo root.
 */
export const config = {
  matcher: "/api/v1/:path*",
};

export default async function middleware(request) {
  const backend = process.env.BACKEND_ORIGIN?.replace(/\/$/, "");
  if (!backend) {
    return new Response(
      JSON.stringify({
        success: false,
        message:
          "BACKEND_ORIGIN is not set in Vercel, or not available to Edge. Add it under Environment Variables.",
      }),
      { status: 503, headers: { "content-type": "application/json; charset=utf-8" } }
    );
  }

  const url = new URL(request.url);
  const { pathname, search } = url;
  if (!pathname.startsWith("/api/v1")) {
    return new Response(JSON.stringify({ success: false, message: "Not found" }), {
      status: 404,
      headers: { "content-type": "application/json; charset=utf-8" },
    });
  }

  const target = `${backend}${pathname}${search}`;
  const headers = new Headers(request.headers);
  headers.delete("host");

  const init = {
    method: request.method,
    headers,
    redirect: "manual",
  };

  if (request.method !== "GET" && request.method !== "HEAD") {
    init.body = await request.arrayBuffer();
  }

  return fetch(target, init);
}
