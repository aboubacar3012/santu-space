import Link from "next/link";
import { School } from "lucide-react";
import { community } from "@/mocks/community";
import { fr } from "@/i18n/fr";

export function CommunityBrand() {
  return (
    <Link href="/" className="community-brand" aria-label={community.name}>
      <span className="brand-mark">
        <School size={21} strokeWidth={2.2} aria-hidden="true" />
      </span>
      <span className="brand-copy">
        <strong>{fr.brand}</strong>
        <span>{community.name}</span>
      </span>
    </Link>
  );
}
