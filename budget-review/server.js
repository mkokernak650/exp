const crypto = require("crypto");
const fs = require("fs");
const http = require("http");
const path = require("path");

const PORT = Number(process.env.PORT || 8080);
const ROOT = __dirname;
const ALLOWED_EMAIL = (process.env.ALLOWED_EMAIL || "mkokernak@consumerexp.com").toLowerCase();
const REQUIRE_CLOUDFLARE_ACCESS = process.env.REQUIRE_CLOUDFLARE_ACCESS === "1";
const TEAM_DOMAIN = process.env.CLOUDFLARE_ACCESS_TEAM_DOMAIN || "";
const AUDIENCE = process.env.CLOUDFLARE_ACCESS_AUD || "";
const ISSUER = TEAM_DOMAIN ? `https://${TEAM_DOMAIN}.cloudflareaccess.com` : "";
const CERTS_URL = ISSUER ? `${ISSUER}/cdn-cgi/access/certs` : "";
const ACCESS_CERT_CACHE_MS = 60 * 60 * 1000;
let accessCertCache = { expiresAt: 0, keys: new Map() };

const MIME_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".png": "image/png",
};

const publicPaths = new Set(["/healthz"]);

function decodeBase64Url(value) {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  return Buffer.from(padded, "base64").toString("utf8");
}

function decodeJwtJson(value) {
  try {
    return JSON.parse(decodeBase64Url(value));
  } catch {
    return null;
  }
}

function timingSafeEqualText(a, b) {
  const left = Buffer.from(String(a));
  const right = Buffer.from(String(b));
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}

async function getCloudflareAccessKeys() {
  if (accessCertCache.expiresAt > Date.now()) return accessCertCache.keys;
  if (!CERTS_URL) throw new Error("Missing Cloudflare Access team domain.");

  const response = await fetch(CERTS_URL);
  if (!response.ok) throw new Error(`Could not load Cloudflare Access certs: ${response.status}`);

  const body = await response.json();
  const keys = new Map();
  for (const jwk of body.keys || []) {
    if (jwk.kid) keys.set(jwk.kid, crypto.createPublicKey({ key: jwk, format: "jwk" }));
  }

  accessCertCache = { expiresAt: Date.now() + ACCESS_CERT_CACHE_MS, keys };
  return keys;
}

async function verifyCloudflareAccessJwt(token) {
  const parts = String(token || "").split(".");
  if (parts.length !== 3) return null;

  const [encodedHeader, encodedPayload, encodedSignature] = parts;
  const header = decodeJwtJson(encodedHeader);
  const payload = decodeJwtJson(encodedPayload);
  if (!header || !payload || header.alg !== "RS256" || !header.kid) return null;

  const keys = await getCloudflareAccessKeys();
  const publicKey = keys.get(header.kid);
  if (!publicKey) return null;

  const verifier = crypto.createVerify("RSA-SHA256");
  verifier.update(`${encodedHeader}.${encodedPayload}`);
  verifier.end();

  const signature = Buffer.from(encodedSignature.replace(/-/g, "+").replace(/_/g, "/"), "base64");
  if (!verifier.verify(publicKey, signature)) return null;

  return payload;
}

function hasExpectedAccessClaims(payload) {
  const now = Math.floor(Date.now() / 1000);
  const email = String(payload.email || "").toLowerCase();

  if (!timingSafeEqualText(email, ALLOWED_EMAIL)) return false;
  if (payload.aud !== AUDIENCE) return false;
  if (payload.iss !== ISSUER) return false;
  if (typeof payload.exp === "number" && payload.exp <= now) return false;
  if (typeof payload.nbf === "number" && payload.nbf > now) return false;

  return true;
}

async function isAllowedByCloudflareAccess(req) {
  if (!REQUIRE_CLOUDFLARE_ACCESS) return true;
  if (!TEAM_DOMAIN || !AUDIENCE) return false;

  const token = req.headers["cf-access-jwt-assertion"];
  const payload = await verifyCloudflareAccessJwt(token);
  if (!payload) return false;
  return hasExpectedAccessClaims(payload);
}

function send(res, status, body, contentType = "text/plain; charset=utf-8") {
  res.writeHead(status, {
    "Content-Type": contentType,
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Cache-Control": status === 200 ? "no-store" : "no-store",
  });
  res.end(body);
}

function resolveFile(urlPath) {
  const cleanPath = decodeURIComponent(urlPath.split("?")[0]);
  const requested = cleanPath === "/" ? "/index.html" : cleanPath;
  const filePath = path.normalize(path.join(ROOT, requested));
  if (!filePath.startsWith(ROOT)) return null;
  return filePath;
}

const server = http.createServer(async (req, res) => {
  const urlPath = req.url || "/";
  if (publicPaths.has(urlPath)) return send(res, 200, "ok");
  try {
    if (!(await isAllowedByCloudflareAccess(req))) return send(res, 403, "Access denied.");
  } catch (error) {
    console.error(error);
    return send(res, 403, "Access denied.");
  }

  const filePath = resolveFile(urlPath);
  if (!filePath || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    return send(res, 404, "Not found.");
  }

  const ext = path.extname(filePath);
  send(res, 200, fs.readFileSync(filePath), MIME_TYPES[ext] || "application/octet-stream");
});

server.listen(PORT, () => {
  console.log(`Budget Review listening on ${PORT}`);
});
