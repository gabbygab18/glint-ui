"use client";

import { StripeButton } from "./stripe-button";

export default function Demo(p: Record<string, unknown>) {
  return <StripeButton {...p}>Deploy now</StripeButton>;
}
