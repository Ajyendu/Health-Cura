/**
 * Vercel serverless proxy: forwards /api/v1/* to BACKEND_ORIGIN (e.g. Render API).
 * Set BACKEND_ORIGIN in Vercel → Environment Variables (e.g. https://your-api.onrender.com).
 * Build the frontend with VITE_API_BASE_URL=/api/v1 so the browser stays same-origin.
 */

const MAX_BODY = 12 * 1024 * 1024;

function requestPath(req) {
  const raw = req.url || "";
  if (raw.startsWith("/api/v1")) {
    return raw;
  }
  const slug = req.query?.slug;
  const tail = Array.isArray(slug) ? slug.join("/") : slug || "";
  const q = raw.includes("?") ? raw.slice(raw.indexOf("?")) : "";
  return `/api/v1/${tail}${q}`;
}

module.exports = async (req, res) => {
  const backend = process.env.BACKEND_ORIGIN?.replace(/\/$/, "");
  if (!backend) {
    res.status(503).json({
      success: false,
      message:
        "Set BACKEND_ORIGIN in Vercel env to your API origin (e.g. https://xxx.onrender.com).",
    });
    return;
  }

  const path = requestPath(req);
  if (!path.startsWith("/api/v1")) {
    res.status(404).end();
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
      details: process.env.NODE_ENV === "development" ? String(e?.message || e) : undefined,
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
      /* ignore invalid header names */
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
};
