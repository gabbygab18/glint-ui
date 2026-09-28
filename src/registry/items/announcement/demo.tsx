"use client";

import { Announcement } from "./announcement";

export default function Demo(p: Record<string, unknown>) {
  return (
    <div className="flex max-w-xl flex-col items-center gap-6 px-6 text-center">
      <Announcement href="#" onClick={(e) => e.preventDefault()} {...p} />
      <h2 className="text-4xl font-semibold tracking-tight text-balance text-foreground sm:text-5xl">
        Ship interfaces that feel alive
      </h2>
      <p className="max-w-md text-balance text-muted-foreground">
        Accessible, animated building blocks you copy into your app and make your own.
      </p>
      <Announcement href="#" onClick={(e) => e.preventDefault()} tag={null} shine={false}>
        Read the 2.0 migration guide
      </Announcement>
    </div>
  );
}
