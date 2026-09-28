"use client";

import { useState } from "react";
import { ArrowRight, Plus, Rocket, Trash2 } from "lucide-react";
import { Button } from "./button";

export default function Demo(p: Record<string, unknown>) {
  const [loading, setLoading] = useState(false);
  const icon = p.size === "icon";
  const deploy = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1800);
  };

  return (
    <div className="flex flex-col items-center gap-8">
      <Button
        onClick={deploy}
        {...p}
        startIcon={icon ? undefined : <Rocket />}
        aria-label={icon ? String(p.children) : undefined}
        loading={Boolean(p.loading) || loading}
      >
        {icon ? <Rocket /> : (p.children as string)}
      </Button>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button variant="secondary" startIcon={<Plus />}>
          New file
        </Button>
        <Button variant="outline">Cancel</Button>
        <Button variant="ghost">Skip</Button>
        <Button variant="destructive" startIcon={<Trash2 />}>
          Delete
        </Button>
        <Button variant="link" endIcon={<ArrowRight />}>
          Learn more
        </Button>
      </div>
    </div>
  );
}
