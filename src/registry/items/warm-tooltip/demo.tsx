"use client";

import { Bookmark, Heart, Share2 } from "lucide-react";
import { WarmTooltip } from "./warm-tooltip";

const btn =
  "grid size-11 place-items-center rounded-full border border-border bg-card text-foreground transition-transform hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring active:scale-90";

export default function Demo(p: Record<string, unknown>) {
  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex gap-4">
        <WarmTooltip content="Add to favorites" {...p}>
          <button type="button" aria-label="Favorite" className={btn}>
            <Heart className="size-4" />
          </button>
        </WarmTooltip>
        <WarmTooltip {...p} content="Share with your team">
          <button type="button" aria-label="Share" className={btn}>
            <Share2 className="size-4" />
          </button>
        </WarmTooltip>
        <WarmTooltip {...p} content="Save for later">
          <button type="button" aria-label="Bookmark" className={btn}>
            <Bookmark className="size-4" />
          </button>
        </WarmTooltip>
      </div>
      <p className="text-xs text-muted-foreground">Hover and wiggle, or Tab through with the keyboard.</p>
    </div>
  );
}
