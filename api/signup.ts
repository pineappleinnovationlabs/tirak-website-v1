/**
 * Server-side adapter for email interest signup.
 *
 * Proxies POST /interest to the Core Worker at CORE_API_URL (which includes /api).
 * - Requires valid incoming stable Idempotency-Key (no silent per-retry generation).
 * - No live fallback when CORE_API_URL is absent — explicit failure.
 * - Bounded validated backend response required ({ success: true, data: { interestId } }).
 * - No logging of email, IP, bearer tokens, or PII.
 * - Clean user-facing errors avoiding internal stack traces.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

const CORE_API_URL = process.env.CORE_API_URL;
const TIMEOUT_MS = 12_000;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function cors(res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Idempotency-Key');
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 320;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  cors(res);

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  if (!CORE_API_URL) {
    return res.status(500).json({
      error: 'Server misconfiguration: CORE_API_URL is not configured.',
    });
  }

  let body: Record<string, unknown> = {};
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
  } catch {
    return res.status(400).json({ error: 'Invalid JSON request body.' });
  }

  const { email, name, source } = body as {
    email?: string;
    name?: string;
    source?: string;
  };

  if (!email || typeof email !== 'string' || !isValidEmail(email.trim())) {
    return res.status(400).json({ error: 'A valid email address is required.' });
  }

  const headerKey = (req.headers['idempotency-key'] || req.headers['Idempotency-Key']) as string | undefined;
  if (!headerKey || typeof headerKey !== 'string' || !UUID_RE.test(headerKey.trim())) {
    return res.status(400).json({
      error: 'A valid UUID Idempotency-Key header is required.',
    });
  }
  const idempotencyKey = headerKey.trim();

  const upstreamUrl = `${CORE_API_URL.replace(/\/+$/, '')}/interest`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const upstream = await fetch(upstreamUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Idempotency-Key': idempotencyKey,
      },
      body: JSON.stringify({
        email: email.trim().toLowerCase(),
        name: typeof name === 'string' && name.trim().length > 0 ? name.trim().slice(0, 200) : undefined,
        source: typeof source === 'string' && source.trim().length > 0 ? source.trim().slice(0, 100) : 'tirak_prelaunch',
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    let rawText = '';
    try {
      rawText = await upstream.text();
    } catch {
      return res.status(502).json({ error: 'Failed to read response from upstream service.' });
    }

    let parsed: Record<string, unknown> | null = null;
    try {
      parsed = JSON.parse(rawText);
    } catch {
      return res.status(502).json({ error: 'Malformed non-JSON response from upstream service.' });
    }

    if (!upstream.ok || !parsed || parsed.success !== true) {
      const errorMsg =
        typeof parsed?.message === 'string'
          ? parsed.message
          : typeof parsed?.error === 'string'
          ? parsed.error
          : `Upstream request failed with status ${upstream.status}.`;
      return res.status(upstream.status >= 400 && upstream.status < 600 ? upstream.status : 502).json({
        error: errorMsg,
      });
    }

    const dataObj = parsed.data as Record<string, unknown> | undefined;
    if (
      !dataObj ||
      typeof dataObj !== 'object' ||
      typeof dataObj.interestId !== 'string' ||
      dataObj.interestId.trim().length === 0
    ) {
      return res.status(502).json({
        error: 'Malformed upstream response: missing valid interestId.',
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        interestId: dataObj.interestId.trim(),
      },
    });
  } catch (err: unknown) {
    clearTimeout(timeout);
    const isAbort = err instanceof DOMException && err.name === 'AbortError';
    return res.status(502).json({
      error: isAbort
        ? 'Upstream request timed out.'
        : 'Upstream service is currently unreachable. Please try again shortly.',
    });
  }
}
