import { ChevronDown, LoaderCircle } from "lucide-react";
import { fr } from "@/i18n/fr";
import { Button } from "@/components/ui/button";

export function Pagination({ visible, total, loading, onLoadMore }: { visible: number; total: number; loading?: boolean; onLoadMore: () => void }) {
  if (visible >= total) return <p className="pagination-end">{visible} / {total}</p>;
  return (
    <nav className="pagination" aria-label={fr.pagination}>
      <Button variant="secondary" onClick={onLoadMore} disabled={loading}>
        {loading ? <LoaderCircle className="spin" size={16} /> : <ChevronDown size={16} />}
        {fr.actions.loadMore}
      </Button>
      <span>{visible} / {total}</span>
    </nav>
  );
}
