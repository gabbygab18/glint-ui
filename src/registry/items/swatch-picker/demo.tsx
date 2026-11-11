"use client";

import { motion } from "motion/react";
import { useState } from "react";
import { SwatchPicker } from "./swatch-picker";

export default function Demo(p: Record<string, unknown>) {
  const [color, setColor] = useState("#b5e61d");

  return (
    <div className="w-[21rem] max-w-full overflow-hidden rounded-2xl border border-border bg-card shadow-xl">
      <div className="grid h-36 place-items-center bg-muted/50">
        <motion.div
          className="h-20 w-28 rounded-[1.4rem] shadow-lg"
          animate={{ backgroundColor: color }}
          transition={{ duration: 0.35 }}
          aria-hidden
        />
      </div>
      <div className="p-5">
        <p className="text-sm font-semibold text-foreground">Desk mat</p>
        <p className="mb-4 text-xs text-muted-foreground">Felt, 90 × 40 cm</p>
        <SwatchPicker {...p} value={color} onChange={setColor} />
      </div>
    </div>
  );
}
