"use client";

import { useState } from "react";
import { ChevronDown, CreditCard, LogOut, Mail, MessageSquare, Settings, User, UserPlus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "./dropdown-menu";

export default function Demo(p: Record<string, unknown>) {
  const [statusBar, setStatusBar] = useState(true);
  const [minimap, setMinimap] = useState(false);
  const [theme, setTheme] = useState("system");

  return (
    // Opens by default so the preview shows it; the menu lives in the top layer, anchored to the trigger.
    <div className="flex h-110 w-full items-start justify-center pt-4">
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>
          <span className="size-5 rounded-full bg-linear-to-br from-lime-300 to-emerald-500" />
          Ana Reyes
          <ChevronDown className="text-muted-foreground" />
        </DropdownMenuTrigger>
        <DropdownMenuContent {...p}>
          <DropdownMenuItem icon={<User />} shortcut="⇧⌘P">
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem icon={<CreditCard />} shortcut="⌘B">
            Billing
          </DropdownMenuItem>
          <DropdownMenuItem icon={<Settings />} shortcut="⌘,">
            Settings
          </DropdownMenuItem>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger icon={<UserPlus />}>Invite people</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem icon={<Mail />}>Email</DropdownMenuItem>
              <DropdownMenuItem icon={<MessageSquare />}>Message</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem disabled>Copy invite link</DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuSeparator />
          <DropdownMenuCheckboxItem checked={statusBar} onCheckedChange={setStatusBar}>
            Status bar
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem checked={minimap} onCheckedChange={setMinimap}>
            Minimap
          </DropdownMenuCheckboxItem>
          <DropdownMenuSeparator />
          <DropdownMenuLabel>Theme</DropdownMenuLabel>
          <DropdownMenuRadioGroup value={theme} onValueChange={setTheme} aria-label="Theme">
            <DropdownMenuRadioItem value="light">Light</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="dark">Dark</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="system">System</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem icon={<LogOut />} shortcut="⇧⌘Q" variant="destructive">
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
