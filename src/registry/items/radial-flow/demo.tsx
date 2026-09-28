"use client";

import { BarChart3, Bell, CreditCard, Database, HardDrive, KeyRound, Mail, Sparkles, Zap } from "lucide-react";
import { RadialFlow } from "./radial-flow";

const nodes = [
  { label: "Postgres", hint: "Primary DB", icon: <Database /> },
  { label: "Stripe", hint: "Payments", icon: <CreditCard /> },
  { label: "Auth", hint: "SSO + OAuth", icon: <KeyRound /> },
  { label: "Storage", hint: "S3 buckets", icon: <HardDrive /> },
  { label: "Resend", hint: "Email", icon: <Mail /> },
  { label: "Analytics", hint: "Events", icon: <BarChart3 /> },
  { label: "Webhooks", hint: "Outbound", icon: <Bell /> },
  { label: "OpenAI", hint: "Inference", icon: <Sparkles /> },
];

export default function Demo(p: Record<string, unknown>) {
  return <RadialFlow hub={{ label: "Glint Core", icon: <Zap /> }} nodes={nodes} {...p} />;
}
