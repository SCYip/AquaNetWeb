/**
 * CORS helper for Supabase Edge Functions.
 *
 * Allows the AquaNet frontend (any origin in dev, the deployed origin in
 * production) to call the SMS endpoints from the browser.
 */

const ALLOWED_HEADERS = [
  "authorization",
  "x-client-info",
  "apikey",
  "content-type",
].join(", ");

export function corsHeaders(origin: string | null): Record<string, string> {
  // Echo the Origin header back (browsers require an exact match when
  // credentials are involved). Falls back to "*" if no origin was sent
  // (e.g. server-to-server calls or curl).
  return {
    "access-control-allow-origin": origin ?? "*",
    "access-control-allow-methods": "POST, OPTIONS",
    "access-control-allow-headers": ALLOWED_HEADERS,
    "access-control-max-age": "86400",
    "vary": "Origin",
  };
}

/** Build a JSON Response with CORS + standard JSON headers attached. */
export function jsonResponse(
  body: unknown,
  init: { status?: number; origin?: string | null; extra?: Record<string, string> } = {},
): Response {
  const headers: Record<string, string> = {
    "content-type": "application/json; charset=utf-8",
    ...corsHeaders(init.origin ?? null),
    ...(init.extra ?? {}),
  };
  return new Response(JSON.stringify(body), {
    status: init.status ?? 200,
    headers,
  });
}

/** Handle CORS preflight (OPTIONS) for POST endpoints. */
export function preflightResponse(origin: string | null): Response {
  return new Response(null, {
    status: 204,
    headers: corsHeaders(origin),
  });
}
