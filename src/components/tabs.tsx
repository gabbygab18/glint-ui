"use client";

import type { ReactNode } from "react";
import { Tabs as UiTabs, TabsContent, TabsList, TabsTrigger } from "@/registry/items/tabs/tabs";

/** Site wrapper around the registry Tabs primitive. */
export function Tabs({ tabs, label }: { tabs: { label: string; content: ReactNode }[]; label: string }) {
  return (
    <UiTabs defaultValue={tabs[0].label}>
      <TabsList aria-label={label} className="mb-3">
        {tabs.map((t) => (
          <TabsTrigger key={t.label} value={t.label}>
            {t.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {tabs.map((t) => (
        <TabsContent key={t.label} value={t.label}>
          {t.content}
        </TabsContent>
      ))}
    </UiTabs>
  );
}
