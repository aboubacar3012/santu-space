"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { fr } from "@/i18n/fr";
import type { Comment, Member } from "@/types";
import { Card } from "@/components/ui/card";
import { CommentForm } from "@/components/CommentForm";
import { CommentThread } from "@/components/CommentThread";
import { EmptyState } from "@/components/EmptyState";
import { useToast } from "@/components/Toast";

type Props = {
  postId: string;
  members: Member[];
  user: Member;
  variant?: "page" | "inline";
  onCountChange?: (delta: number, lastCommenterId?: string) => void;
};

export function CommentsSection({ postId, members, user, variant = "page", onCountChange }: Props) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const { showToast } = useToast();
  const inline = variant === "inline";

  useEffect(() => {
    let active = true;
    void api
      .getComments(postId)
      .then((items) => active && setComments(items))
      .catch(() => active && setError(true))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [postId]);

  async function submit(content: string, parentId: string | null) {
    const optimistic: Comment = {
      id: `optimistic-${Date.now()}`,
      postId,
      authorId: user.id,
      content,
      parentId,
      createdAt: new Date().toISOString(),
      likes: 0,
      status: "sending",
    };
    setComments((items) => [...items, optimistic]);
    try {
      const saved = await api.createComment(postId, content, parentId);
      setComments((items) => items.map((item) => (item.id === optimistic.id ? saved : item)));
      onCountChange?.(1, user.id);
      showToast(fr.post.sent);
    } catch {
      setComments((items) =>
        items.map((item) => (item.id === optimistic.id ? { ...item, status: "failed" } : item)),
      );
    }
  }

  async function retry(comment: Comment) {
    setComments((items) =>
      items.map((item) => (item.id === comment.id ? { ...item, status: "sending" } : item)),
    );
    try {
      const saved = await api.createComment(postId, comment.content, comment.parentId);
      setComments((items) => items.map((item) => (item.id === comment.id ? saved : item)));
      onCountChange?.(1, user.id);
    } catch {
      setComments((items) =>
        items.map((item) => (item.id === comment.id ? { ...item, status: "failed" } : item)),
      );
    }
  }

  async function like(comment: Comment) {
    const previous = comment.likes;
    setComments((items) =>
      items.map((item) => (item.id === comment.id ? { ...item, likes: item.likes + 1 } : item)),
    );
    try {
      const next = await api.toggleCommentLike(comment.id);
      setComments((items) =>
        items.map((item) => (item.id === comment.id ? { ...item, likes: next.likes } : item)),
      );
    } catch {
      setComments((items) =>
        items.map((item) => (item.id === comment.id ? { ...item, likes: previous } : item)),
      );
    }
  }

  async function edit(comment: Comment, content: string) {
    const updated = await api.updateComment(comment.id, content);
    setComments((items) =>
      items.map((item) => (item.id === comment.id ? { ...item, content: updated.content } : item)),
    );
    showToast(fr.post.commentUpdated);
  }

  async function remove(comment: Comment) {
    await api.deleteComment(comment.id);
    const removed = comments.filter(
      (item) => item.id === comment.id || item.parentId === comment.id,
    ).length;
    setComments((items) =>
      items.filter((item) => item.id !== comment.id && item.parentId !== comment.id),
    );
    onCountChange?.(-removed);
    showToast(fr.post.commentDeleted);
  }

  const composer = (
    <CommentForm user={user} compact={inline} onSubmit={(content) => submit(content, null)} />
  );

  return (
    <section
      id={inline ? undefined : "comments"}
      className={inline ? "inline-comments" : "comments-section"}
      aria-busy={loading}
    >
      {inline ? null : (
        <div className="comments-heading">
          <h2>{fr.post.responses}</h2>
          <span>{comments.length}</span>
        </div>
      )}
      {inline ? composer : <Card className="comment-composer-card">{composer}</Card>}
      {loading ? (
        <p className="comments-status" role="status">
          {fr.state.loading}
        </p>
      ) : error ? (
        <p className="comments-status" role="alert">
          {fr.state.error}
        </p>
      ) : comments.length ? (
        <CommentThread
          comments={comments}
          members={members}
          user={user}
          onReply={submit}
          onRetry={retry}
          onLike={like}
          onEdit={edit}
          onDelete={remove}
        />
      ) : inline ? (
        <p className="comments-status">{fr.post.noComments}</p>
      ) : (
        <EmptyState title={fr.post.noComments} />
      )}
    </section>
  );
}
