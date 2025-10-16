// Signup API (stubbed): removes Google Sheets integration for security and performance.
// This endpoint performs basic validation and returns success without external calls.

function cors(res: any) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

export default async function handler(req: any, res: any) {
  cors(res);

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  let body: any = {};
  try {
    body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
  } catch {
    body = {};
  }
  const { email, name, source, meta } = body;
  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  const timestamp = new Date().toISOString();
  const ip = (req.headers["x-forwarded-for"] as string) || req.socket?.remoteAddress || "";
  const userAgent = (req.headers["user-agent"] as string) || "";
  const referer = (req.headers["referer"] as string) || "";

  try {
    // SECURITY NOTE: This stub intentionally avoids storing PII.
    // In production, integrate with a secure backend (database or ESP) instead.
    const safeLog = {
      timestamp,
      email,
      name: name || "",
      source: source || "",
      ip,
      userAgent,
      referer,
      meta: meta ? true : false, // do not log meta contents
    };
    console.log("Signup received:", safeLog);
    return res.status(200).json({ ok: true });
  } catch (err: any) {
    console.error("Signup handler failed:", err?.message || err);
    return res.status(500).json({ error: "Failed to process signup" });
  }
}