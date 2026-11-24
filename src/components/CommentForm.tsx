"use client";

import { Send } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { fr } from "@/i18n/fr";
import type { Member } from "@/types";

export function CommentForm({
  user,
  compact = false,
  placeholder = fr.post.replyPlaceholder,
  onSubmit,
  onCancel,
}: {
  user: Member;
  compact?: boolean;
  placeholder?: string;
  onSubmit: (content: string) => Promise<void>;
  onCancel?: () => void;
}) {
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!content.trim()) return;
    setSending(true);
    try {
      await onSubmit(content.trim());
      setContent("");
      onCancel?.();
    } finally {
      setSending(false);
    }
  }

  return (
    <form className={`comment-form ${compact ? "compact" : ""}`} onSubmit={submit}>
      <Avatar member={user} size={compact ? "sm" : "md"} />
      <div>
        <textarea
          required
          autoFocus={compact}
          rows={compact ? 2 : 3}
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder={placeholder}
          disabled={sending}
          aria-label={fr.post.replyPlaceholder}
        />
        <div className="comment-form-actions">
          {onCancel ? (
            <Button variant="ghost" size="sm" onClick={onCancel}>
              {fr.actions.cancel}
            </Button>
          ) : null}
          <Button size="sm" type="submit" disabled={sending || !content.trim()}>
            <Send size={14} />
            {sending ? fr.post.sending : fr.actions.send}
          </Button>
        </div>
      </div>
    </form>
  );
}
