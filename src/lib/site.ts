export const SITE_NAME = "Glint UI";
export const SITE_TAGLINE = "Animated React components you copy, paste and ship.";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");

export const GITHUB_URL = process.env.NEXT_PUBLIC_GITHUB_URL ?? "https://github.com";
