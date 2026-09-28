export const SITE_NAME = "Glint UI";
export const SITE_TAGLINE = "Animated React components you copy, paste and ship.";

// Blank env values (e.g. a variable added in Vercel with no value) count as unset.
const env = (v: string | undefined) => v?.trim() || undefined;
const withProtocol = (host: string) => (/^https?:\/\//.test(host) ? host : `https://${host}`);

const siteHost = env(process.env.NEXT_PUBLIC_SITE_URL) ?? env(process.env.VERCEL_PROJECT_PRODUCTION_URL);
export const SITE_URL = siteHost ? withProtocol(siteHost).replace(/\/+$/, "") : "http://localhost:3000";

export const GITHUB_URL = env(process.env.NEXT_PUBLIC_GITHUB_URL) ?? "https://github.com/gabbygab18/glint-ui";
