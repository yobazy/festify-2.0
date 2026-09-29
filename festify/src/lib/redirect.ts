const PARSE_BASE = "http://festify.local";

/**
 * Only allow single-site relative paths ("/events?x=1"). Rejects absolute,
 * protocol-relative ("//evil.com"), backslash and control-character tricks
 * ("/\t/evil.com" becomes "//evil.com" once a browser strips the tab).
 */
export function getSafeRedirectPath(nextPath: unknown, fallback = "/") {
  if (
    typeof nextPath !== "string" ||
    !nextPath.startsWith("/") ||
    /[\\\x00-\x1f\x7f]/.test(nextPath)
  ) {
    return fallback;
  }

  try {
    const url = new URL(nextPath, PARSE_BASE);
    if (url.origin !== PARSE_BASE) return fallback;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return fallback;
  }
}
