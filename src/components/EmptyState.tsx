import { MessageSquareDashed } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { ReactNode } from "react";

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <Card className="empty-state">
      <span>
        <MessageSquareDashed size={24} />
      </span>
      <h2>{title}</h2>
      {description ? <p>{description}</p> : null}
      {action}
    </Card>
  );
}
