/**
 * Absolute API base for Server Components / sitemap.
 * Browser env often uses NEXT_PUBLIC_API_URL=/api (same-origin proxy),
 * which Node fetch cannot resolve without an origin.
 */
export function getServerApiBase(): string {
  const raw = process.env.NEXT_PUBLIC_API_URL?.trim();
  const origin = (
    process.env.NEXT_PUBLIC_API_ORIGIN ||
    process.env.API_PROXY_TARGET ||
    "http://localhost:3002"
  ).replace(/\/$/, "");

  if (!raw) return `${origin}/api`;
  if (/^https?:\/\//i.test(raw)) return raw.replace(/\/$/, "");

  const path = raw.startsWith("/") ? raw : `/${raw}`;
  return `${origin}${path}`;
}
