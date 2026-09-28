import type { MetadataRoute } from "next";
import { registry } from "@/registry";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return ["", "/components", "/docs", "/docs/installation", ...registry.map((e) => `/components/${e.slug}`)].map((path) => ({
    url: `${SITE_URL}${path}`,
  }));
}
