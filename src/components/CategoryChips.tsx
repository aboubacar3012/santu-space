"use client";

import { SlidersHorizontal } from "lucide-react";
import { fr } from "@/i18n/fr";
import { cn } from "@/lib/utils";
import type { Category, SortMode } from "@/types";

export function CategoryChips({
  categories,
  selected,
  sort,
  onSelect,
  onSort,
}: {
  categories: Category[];
  selected: string;
  sort: SortMode;
  onSelect: (id: string) => void;
  onSort: (sort: SortMode) => void;
}) {
  return (
    <div className="filter-bar">
      <div className="category-chips">
        <button type="button" className={cn("category-chip", selected === "all" && "selected")} onClick={() => onSelect("all")}>{fr.feed.all}</button>
        {categories.map((category) => (
          <button key={category.id} type="button" className={cn("category-chip", selected === category.id && "selected")} onClick={() => onSelect(category.id)}>
            <i className={`category-dot category-${category.color}`} />{category.name}
          </button>
        ))}
      </div>
      <label className="sort-select" aria-label={fr.feed.sort}>
        <SlidersHorizontal size={15} />
        <select value={sort} onChange={(event) => onSort(event.target.value as SortMode)}>
          <option value="recent">{fr.feed.recent}</option>
          <option value="popular">{fr.feed.popular}</option>
          <option value="pinned">{fr.feed.pinned}</option>
        </select>
      </label>
    </div>
  );
}
