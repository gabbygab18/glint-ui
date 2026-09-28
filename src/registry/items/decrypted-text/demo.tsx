"use client";

import { DecryptedText } from "./decrypted-text";

export default function Demo(p: Record<string, unknown>) {
  return <DecryptedText text="" {...p} className="font-mono text-3xl text-lime-300 sm:text-4xl" />;
}
