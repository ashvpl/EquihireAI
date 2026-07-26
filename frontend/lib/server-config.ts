/**
 * SERVER-ONLY configuration for Next.js API proxy routes.
 * This is NOT imported by client-side code.
 *
 * Uses BACKEND_URL (no NEXT_PUBLIC_ prefix for security).
 * Falls back to NEXT_PUBLIC_BACKEND_URL for backwards compat.
 */

function normalizeBackendUrl(url: string): string {
  if (!url) return url;
  // If the URL has no protocol, prepend https:// (unless it's localhost)
  if (!/^https?:\/\//i.test(url)) {
    const prefix = url.startsWith("localhost") || url.startsWith("127.") ? "http" : "https";
    return `${prefix}://${url}`;
  }
  return url;
}

export const BACKEND_URL = normalizeBackendUrl(
  process.env.BACKEND_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "http://localhost:5001"
);

/**
 * Validate backend configuration at runtime.
 * Should be called inside API handlers, not at module scope.
 */
export function validateBackendConfig() {
  if (process.env.NODE_ENV === "production") {
    const isVercelBuild = process.env.VERCEL === "1" && process.env.CI === "1";
    
    if (!BACKEND_URL || BACKEND_URL.includes("localhost")) {
      if (isVercelBuild) {
        console.warn(
          "⚠️ WARNING: BACKEND_URL is set to localhost or missing during build.\n" +
          "Ensure you have set this in Vercel Project Settings for the deployment to work."
        );
      } else {
        console.error(
          "CRITICAL ERROR: BACKEND_URL is missing or set to localhost in production.\n" +
          "This will cause all API calls to fail.\n" +
          "FIX: Add BACKEND_URL to your Vercel Project Settings > Environment Variables."
        );
      }
    }
  }
}
