"use client";

import Link from "next/link";
import { Check, Flag, MessageCircle, MoreHorizontal, Paperclip, Pin, RotateCcw } from "lucide-react";
import { useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { ReactionButton } from "@/components/ReactionButton";
import { ReportDialog } from "@/components/ReportDialog";
import { CommentsSection } from "@/components/CommentsSection";
import { fr } from "@/i18n/fr";
import { relativeTime } from "@/lib/utils";
import type { Category, Member, Post } from "@/types";

export function PostCard({ post, author, category, lastCommenter, members, user, openToken, onLike, onReport, onRetry, onCommentCountChange }: {
  post: Post;
  author: Member;
  category: Category;
  lastCommenter?: Member;
  members: Member[];
  user: Member;
  openToken?: number;
  onLike: () => void;
  onReport: (reason: string) => void;
  onRetry?: () => void;
  onCommentCountChange: (delta: number, lastCommenterId?: string) => void;
}) {
  const [reportOpen, setReportOpen] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [seenToken, setSeenToken] = useState(0);
  if (openToken && openToken !== seenToken) {
    setSeenToken(openToken);
    setCommentsOpen(true);
  }
  const commentsId = `comments-${post.id}`;
  return (
    <>
      <Card id={`post-${post.id}`} className={`post-card ${post.pinned ? "is-pinned" : ""}`}>
        {post.pinned ? <div className="pin-label"><Pin size={13} fill="currentColor" />{fr.feed.pinnedPost}</div> : null}
        <div className="post-header">
          <Avatar member={author} />
          <div className="post-author"><strong>{author.name}</strong><span>{fr.members[author.role]} <i>·</i> {relativeTime(post.createdAt)}</span></div>
          <span className={`post-category category-${category.color}`}>{category.name}</span>
          <details className="menu post-menu">
            <summary className="icon-button" aria-label={fr.common.moreActions}><MoreHorizontal size={19} /></summary>
            <div className="menu-popover post-menu-popover"><button type="button" onClick={() => setReportOpen(true)}><Flag size={15} />{fr.actions.report}</button></div>
          </details>
        </div>
        <Link href={`/posts/${post.id}`} className="post-content">
          <h2>{post.title}</h2>
          <p>{post.excerpt}</p>
          {post.attachment ? <span className="attachment-chip"><Paperclip size={14} />{post.attachment}</span> : null}
        </Link>
        {post.status ? (
          <div className={`delivery-status ${post.status}`}>
            {post.status === "sending" ? <><span className="sending-dot" />{fr.feed.writing}</> : <><Check size={14} />{fr.feed.failed}<button type="button" onClick={onRetry}><RotateCcw size={13} />{fr.actions.retry}</button></>}
          </div>
        ) : null}
        <div className="post-footer">
          <ReactionButton count={post.likes} active={post.liked} onClick={onLike} />
          <button type="button" className={`comment-button ${commentsOpen ? "active" : ""}`} disabled={Boolean(post.status)} aria-expanded={commentsOpen} aria-controls={commentsId} onClick={() => setCommentsOpen((open) => !open)}><MessageCircle size={17} />{post.commentCount} <span>{fr.feed.comments}</span></button>
          {lastCommenter ? <span className="last-commenter">{fr.feed.lastReply} <strong>{lastCommenter.name}</strong><Avatar member={lastCommenter} size="sm" /></span> : null}
        </div>
        {commentsOpen ? <div id={commentsId}><CommentsSection postId={post.id} members={members} user={user} variant="inline" onCountChange={onCommentCountChange} /></div> : null}
      </Card>
      <ReportDialog open={reportOpen} onClose={() => setReportOpen(false)} onSubmit={onReport} />
    </>
  );
}
