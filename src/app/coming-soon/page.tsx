import type { Metadata } from "next";
import { ComingSoon } from "@/components/coming-soon";
import { registry } from "@/registry";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/site";

export const metadata: Metadata = {
  title: { absolute: `${SITE_NAME} — Coming soon` },
  description: SITE_TAGLINE,
};

export default function ComingSoonPage() {
  return <ComingSoon count={registry.length} />;
}
