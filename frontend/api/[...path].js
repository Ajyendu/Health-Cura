/**
 * Vercel: single catch-all for /api/*. Set BACKEND_ORIGIN (e.g. https://xxx.onrender.com).
 * Use when Project Root = `frontend`. Build with VITE_API_BASE_URL=/api/v1
 */
const MAX_BODY = 12 * 1024 * 1024;

function fullApiPath(req) {
  const url = req.url || "/";
  if (url.startsWith("/api/")) {
    return url;
  }
  const q = url.includes("?") ? url.slice(url.indexOf("?")) : "";
  const pathname = url.split("?")[0] || "/";

  const parts = req.query?.path;
  const fromQuery = Array.isArray(parts) ? parts.join("/") : parts || "";
  if (fromQuery) {
    return `/api/${fromQuery}${q}`;
  }

  if (pathname && pathname !== "/" && !pathname.startsWith("/api")) {
    const p = pathname.startsWith("/") ? pathname : `/${pathname}`;
    return `/api${p}${q}`;
  }

  return `/api${q}`;
}

async function handler(req, res) {
  const backend = process.env.BACKEND_ORIGIN?.replace(/\/$/, "");
  if (!backend) {
    res.status(503).json({
      success: false,
      message:
        "Set BACKEND_ORIGIN in Vercel env to your API origin (e.g. https://xxx.onrender.com).",
    });
    return;
  }

  const path = fullApiPath(req);
  if (!path.startsWith("/api/v1")) {
    res.status(404).json({ success: false, message: "Not found" });
    return;
  }

  const target = `${backend}${path}`;

  const forwardHeaders = {};
  const allow = [
    "cookie",
    "authorization",
    "content-type",
    "accept",
    "accept-language",
    "x-requested-with",
    "origin",
    "referer",
  ];
  for (const h of allow) {
    const v = req.headers[h];
    if (v) forwardHeaders[h] = Array.isArray(v) ? v.join(", ") : v;
  }

  let body;
  if (!["GET", "HEAD"].includes(req.method)) {
    const chunks = [];
    let size = 0;
    for await (const chunk of req) {
      size += chunk.length;
      if (size > MAX_BODY) {
        res.status(413).json({ success: false, message: "Payload too large" });
        return;
      }
      chunks.push(chunk);
    }
    body = chunks.length ? Buffer.concat(chunks) : undefined;
  }

  let upstream;
  try {
    upstream = await fetch(target, {
      method: req.method,
      headers: forwardHeaders,
      body,
      redirect: "manual",
    });
  } catch (e) {
    res.status(502).json({
      success: false,
      message: "Upstream request failed",
      details: process.env.VERCEL_ENV === "development" ? String(e?.message || e) : undefined,
    });
    return;
  }

  const skip = new Set([
    "connection",
    "transfer-encoding",
    "content-encoding",
    "keep-alive",
  ]);

  upstream.headers.forEach((value, key) => {
    const k = key.toLowerCase();
    if (k === "set-cookie") return;
    if (skip.has(k)) return;
    try {
      res.setHeader(key, value);
    } catch {
      /* ignore */
    }
  });

  const setCookies =
    typeof upstream.headers.getSetCookie === "function"
      ? upstream.headers.getSetCookie()
      : [];
  if (setCookies.length) {
    for (const c of setCookies) {
      res.appendHeader("Set-Cookie", c);
    }
  } else {
    const single = upstream.headers.get("set-cookie");
    if (single) res.appendHeader("Set-Cookie", single);
  }

  res.status(upstream.status);
  const buf = Buffer.from(await upstream.arrayBuffer());
  res.send(buf);
}

handler.config = { runtime: "nodejs20.x" };
module.exports = handler;
