import { cn } from "@/lib/utils";
import type { Member } from "@/types";

export function Avatar({
  member,
  size = "md",
  className,
}: {
  member: Pick<Member, "name" | "initials" | "color" | "online">;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}) {
  return (
    <span
      className={cn("avatar", `avatar-${size}`, `avatar-${member.color}`, className)}
      role="img"
      aria-label={member.name}
      title={member.name}
    >
      {member.initials}
      {size !== "sm" && member.online ? <span className="avatar-status" /> : null}
    </span>
  );
}
