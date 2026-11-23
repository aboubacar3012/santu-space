"use client";

import { Search } from "lucide-react";
import { fr } from "@/i18n/fr";

export function SearchBar() {
  return (
    <label className="search-bar">
      <Search size={18} aria-hidden="true" />
      <span className="sr-only">{fr.community.search}</span>
      <input type="search" placeholder={fr.community.search} />
      <kbd aria-label={fr.common.keyboardSearch}>⌘ K</kbd>
    </label>
  );
}
