"use client";

import { Heart, MessageCircle, Pencil, RotateCcw, Trash2 } from "lucide-react";
import { useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { CommentForm } from "@/components/CommentForm";
import { fr } from "@/i18n/fr";
import { relativeTime } from "@/lib/utils";
import type { Comment, Member } from "@/types";

type CommentActions = {
  onReply: (content: string, parentId: string) => Promise<void>;
  onRetry: (comment: Comment) => Promise<void>;
  onLike: (comment: Comment) => Promise<void>;
  onEdit: (comment: Comment, content: string) => Promise<void>;
  onDelete: (comment: Comment) => Promise<void>;
};

export function CommentThread({
  comments,
  members,
  user,
  ...actions
}: {
  comments: Comment[];
  members: Member[];
  user: Member;
} & CommentActions) {
  return (
    <div className="comment-threads">
      {comments
        .filter((comment) => !comment.parentId)
        .map((comment) => {
          const author = members.find((member) => member.id === comment.authorId);
          if (!author) return null;
          return (
            <CommentBranch
              key={comment.id}
              comment={comment}
              author={author}
              replies={comments.filter((item) => item.parentId === comment.id)}
              members={members}
              user={user}
              {...actions}
            />
          );
        })}
    </div>
  );
}

function CommentBranch({
  comment,
  author,
  replies,
  members,
  user,
  ...actions
}: {
  comment: Comment;
  author: Member;
  replies: Comment[];
  members: Member[];
  user: Member;
} & CommentActions) {
  const [replying, setReplying] = useState(false);
  return (
    <article className="comment-branch">
      <div className="comment-main">
        <Avatar member={author} size="md" />
        <div className="comment-body">
          <CommentEntry
            comment={comment}
            author={author}
            user={user}
            {...actions}
            onReplyClick={() => setReplying((value) => !value)}
          />
          {replying ? (
            <CommentForm
              user={user}
              compact
              placeholder={`${fr.post.replyTo} ${author.name}…`}
              onSubmit={(content) => actions.onReply(content, comment.id)}
              onCancel={() => setReplying(false)}
            />
          ) : null}
          {replies.length ? (
            <div className="comment-replies">
              {replies.map((reply) => {
                const replyAuthor = members.find((member) => member.id === reply.authorId);
                return replyAuthor ? (
                  <div className="nested-comment" key={reply.id}>
                    <Avatar member={replyAuthor} size="sm" />
                    <div>
                      <CommentEntry
                        comment={reply}
                        author={replyAuthor}
                        user={user}
                        {...actions}
                        compact
                      />
                    </div>
                  </div>
                ) : null;
              })}
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
}

function CommentEntry({
  comment,
  author,
  user,
  compact = false,
  onReply,
  onRetry,
  onLike,
  onEdit,
  onDelete,
  onReplyClick,
}: {
  comment: Comment;
  author: Member;
  user: Member;
  compact?: boolean;
  onReply?: CommentActions["onReply"];
  onReplyClick?: () => void;
} & Omit<CommentActions, "onReply">) {
  const [editing, setEditing] = useState(false);
  const [content, setContent] = useState(comment.content);
  const isAuthor = comment.authorId === user.id;
  const canDelete = isAuthor || user.role === "admin" || user.role === "moderator";
  void onReply;

  return (
    <>
      <div className="comment-bubble">
        <div>
          <strong>{author.name}</strong>
          <span>{relativeTime(comment.createdAt)}</span>
        </div>
        {editing ? (
          <form
            className="comment-edit-form"
            onSubmit={async (event) => {
              event.preventDefault();
              await onEdit(comment, content);
              setEditing(false);
            }}
          >
            <textarea
              required
              rows={3}
              value={content}
              onChange={(event) => setContent(event.target.value)}
            />
            <div>
              <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>
                {fr.actions.cancel}
              </Button>
              <Button size="sm" type="submit">
                {fr.actions.save}
              </Button>
            </div>
          </form>
        ) : (
          <p>{comment.content}</p>
        )}
      </div>
      <div className="comment-meta">
        <button type="button" onClick={() => void onLike(comment)}>
          <Heart size={compact ? 12 : 13} />
          {comment.likes}
        </button>
        {!compact && onReplyClick ? (
          <button type="button" onClick={onReplyClick}>
            <MessageCircle size={13} />
            {fr.actions.reply}
          </button>
        ) : null}
        {isAuthor && !comment.status ? (
          <button type="button" onClick={() => setEditing(true)}>
            <Pencil size={12} />
            {fr.actions.edit}
          </button>
        ) : null}
        {canDelete && !comment.status ? (
          <button type="button" className="failed-label" onClick={() => void onDelete(comment)}>
            <Trash2 size={12} />
            {fr.actions.delete}
          </button>
        ) : null}
        {comment.status === "sending" ? (
          <span className="sending-label">{fr.post.sending}</span>
        ) : null}
        {comment.status === "failed" ? (
          <button type="button" className="failed-label" onClick={() => void onRetry(comment)}>
            <RotateCcw size={13} />
            {fr.actions.retry}
          </button>
        ) : null}
      </div>
    </>
  );
}
