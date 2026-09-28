"use client";

import { AlertDialog } from "./alert-dialog";

const fakeDelete = () => new Promise((resolve) => setTimeout(resolve, 1200));

export default function Demo(p: Record<string, unknown>) {
  // Rendered open and contained so the preview stage shows it; users get a true modal by default.
  return <AlertDialog title="Delete this project?" {...p} onConfirm={fakeDelete} defaultOpen position="absolute" />;
}
