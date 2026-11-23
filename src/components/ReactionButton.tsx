"use client";

import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { fr } from "@/i18n/fr";

export function ReactionButton({ count, active, onClick }: { count: number; active: boolean; onClick: () => void }) {
  return (
    <button type="button" className={cn("reaction-button", active && "active")} onClick={onClick} aria-pressed={active} aria-label={`${count} ${fr.common.reactions}`}>
      <Heart size={17} fill={active ? "currentColor" : "none"} />{count}
    </button>
  );
}
