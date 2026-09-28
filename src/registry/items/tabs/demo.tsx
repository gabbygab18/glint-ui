"use client";

import { Bell, KeyRound, User } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs";

const field =
  "h-9 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none transition-shadow focus-visible:ring-2 focus-visible:ring-ring/60";

export default function Demo(p: Record<string, unknown>) {
  return (
    <div className="w-full max-w-md rounded-2xl border border-border bg-card p-5 shadow-xl">
      <Tabs key={String(p.orientation)} defaultValue="account" {...p}>
        <TabsList>
          <TabsTrigger value="account">
            <User /> Account
          </TabsTrigger>
          <TabsTrigger value="password">
            <KeyRound /> Password
          </TabsTrigger>
          <TabsTrigger value="alerts">
            <Bell /> Alerts
          </TabsTrigger>
        </TabsList>
        <TabsContent value="account" className="grid gap-3">
          <p className="text-sm text-muted-foreground">Update your profile. Changes are visible to your team.</p>
          <label className="grid gap-1.5 text-sm font-medium text-foreground">
            Name
            <input className={field} defaultValue="Maya Chen" />
          </label>
          <label className="grid gap-1.5 text-sm font-medium text-foreground">
            Username
            <input className={field} defaultValue="@maya" />
          </label>
        </TabsContent>
        <TabsContent value="password" className="grid gap-3">
          <p className="text-sm text-muted-foreground">Use at least 12 characters with a mix of words.</p>
          <label className="grid gap-1.5 text-sm font-medium text-foreground">
            Current password
            <input type="password" className={field} />
          </label>
          <label className="grid gap-1.5 text-sm font-medium text-foreground">
            New password
            <input type="password" className={field} />
          </label>
        </TabsContent>
        <TabsContent value="alerts" className="grid gap-2">
          {["Mentions", "Direct messages", "Weekly digest"].map((l, i) => (
            <label key={l} className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5 text-sm text-foreground">
              {l}
              <input type="checkbox" defaultChecked={i < 2} className="size-4 accent-primary" />
            </label>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
