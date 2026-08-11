import "server-only";

function normalizeUrl(value: string | undefined) {
  const normalized = value?.trim();
  if (!normalized) return undefined;

  return normalized.includes("://") ? normalized : `https://${normalized}`;
}

export function getAppUrl() {
  const configuredUrl = normalizeUrl(
    process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_APP_URL,
  );
  if (configuredUrl) return configuredUrl;

  const vercelHost =
    process.env.VERCEL_ENV === "production"
      ? process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL
      : process.env.VERCEL_URL || process.env.VERCEL_PROJECT_PRODUCTION_URL;

  return normalizeUrl(vercelHost) || "http://localhost:3000";
}

export function getTrustedOrigins() {
  return Array.from(
    new Set(
      [
        getAppUrl(),
        normalizeUrl(process.env.VERCEL_URL),
        normalizeUrl(process.env.VERCEL_PROJECT_PRODUCTION_URL),
        ...(process.env.NODE_ENV === "production" ? [] : ["http://localhost:*", "http://127.0.0.1:*"]),
      ].filter((origin): origin is string => Boolean(origin)),
    ),
  );
}
