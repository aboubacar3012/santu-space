"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Flag, MoreHorizontal, Paperclip, Pencil, Pin, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { fr } from "@/i18n/fr";
import { currentUser } from "@/mocks/members";
import { relativeTime } from "@/lib/utils";
import type { Member, Post } from "@/types";
import { Avatar } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { ReactionButton } from "@/components/ReactionButton";
import { CommentsSection } from "@/components/CommentsSection";
import { ReportDialog } from "@/components/ReportDialog";
import { EmptyState } from "@/components/EmptyState";
import { SkeletonPost } from "@/components/Skeleton";
import { useToast } from "@/components/Toast";

export function PostDetail({ postId }: { postId: string }) {
  const [post, setPost] = useState<Post>();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [reportOpen, setReportOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(false);
  const [postDraft, setPostDraft] = useState({ title: "", content: "" });
  const { showToast } = useToast();
  const router = useRouter();

  useEffect(() => {
    void Promise.all([api.getPost(postId), api.getMembers()])
      .then(([nextPost, nextMembers]) => {
        setPost(nextPost);
        setMembers(nextMembers);
      })
      .finally(() => setLoading(false));
  }, [postId]);

  if (loading)
    return (
      <div className="detail-page">
        <SkeletonPost />
      </div>
    );
  if (!post)
    return <EmptyState title={fr.state.empty} action={<Link href="/">{fr.actions.back}</Link>} />;
  const author = members.find((member) => member.id === post.authorId);
  if (!author) return <EmptyState title={fr.state.error} />;

  function startEditingPost() {
    setPostDraft({ title: post!.title, content: post!.content });
    setEditingPost(true);
  }

  async function savePost() {
    const updated = await api.updatePost(post!.id, postDraft);
    setPost((item) => (item ? { ...item, ...updated } : item));
    setEditingPost(false);
    showToast(fr.post.updated);
  }

  async function togglePin() {
    const nextPosts = await api.togglePin(postId);
    const next = nextPosts.find((item) => item.id === postId);
    if (next) setPost(next);
    showToast(fr.post.pinned);
  }

  async function remove() {
    await api.deletePost(postId);
    showToast(fr.post.deleted);
    router.push("/");
  }

  return (
    <div className="detail-page">
      <Link href="/" className="back-link">
        <ArrowLeft size={17} />
        {fr.actions.back}
      </Link>
      <Card className="post-detail-card">
        <div className="post-detail-top">
          <Avatar member={author} size="lg" />
          <div>
            <strong>{author.name}</strong>
            <span>
              {fr.members[author.role]} · {relativeTime(post.createdAt)}
            </span>
          </div>
          <details className="menu post-detail-menu">
            <summary className="icon-button" aria-label={fr.common.moreActions}>
              <MoreHorizontal size={20} />
            </summary>
            <div className="menu-popover post-menu-popover">
              <button type="button" onClick={() => setReportOpen(true)}>
                <Flag size={15} />
                {fr.actions.report}
              </button>
              {currentUser.id === author.id ? (
                <button type="button" onClick={startEditingPost}>
                  <Pencil size={15} />
                  {fr.actions.edit}
                </button>
              ) : null}
              {currentUser.role === "admin" || currentUser.role === "moderator" ? (
                <button type="button" onClick={() => void togglePin()}>
                  <Pin size={15} />
                  {fr.actions.pin}
                </button>
              ) : null}
              {currentUser.id === author.id ||
              currentUser.role === "admin" ||
              currentUser.role === "moderator" ? (
                <button type="button" onClick={() => void remove()}>
                  <Trash2 size={15} />
                  {fr.actions.delete}
                </button>
              ) : null}
            </div>
          </details>
        </div>
        {post.pinned ? (
          <span className="detail-pin">
            <Pin size={13} />
            {fr.feed.pinnedPost}
          </span>
        ) : null}
        {editingPost ? (
          <form
            className="post-edit-form"
            onSubmit={(event) => {
              event.preventDefault();
              void savePost();
            }}
          >
            <input
              required
              value={postDraft.title}
              onChange={(event) =>
                setPostDraft((draft) => ({
                  ...draft,
                  title: event.target.value,
                }))
              }
              aria-label={fr.feed.composerTitle}
            />
            <textarea
              required
              rows={6}
              value={postDraft.content}
              onChange={(event) =>
                setPostDraft((draft) => ({
                  ...draft,
                  content: event.target.value,
                }))
              }
              aria-label={fr.feed.composerBody}
            />
            <div>
              <button
                type="button"
                className="button button-secondary"
                onClick={() => setEditingPost(false)}
              >
                {fr.actions.cancel}
              </button>
              <button className="button button-primary" type="submit">
                {fr.actions.save}
              </button>
            </div>
          </form>
        ) : (
          <>
            <h1>{post.title}</h1>
            <p className="post-full-content">{post.content}</p>
          </>
        )}
        {post.attachment ? (
          <div className="attachment-card">
            <span>
              <Paperclip size={18} />
            </span>
            <div>
              <strong>{post.attachment}</strong>
              <small>{fr.post.attachmentMeta}</small>
            </div>
          </div>
        ) : null}
        <div className="detail-actions">
          <ReactionButton
            count={post.likes}
            active={post.liked}
            onClick={() => {
              void api
                .toggleLike(post.id)
                .then((items) => setPost(items.find((item) => item.id === post.id)));
            }}
          />
          <span>
            {post.commentCount} {fr.feed.comments}
          </span>
        </div>
      </Card>
      <CommentsSection
        postId={postId}
        members={members}
        user={currentUser}
        onCountChange={(delta) =>
          setPost((item) =>
            item
              ? {
                  ...item,
                  commentCount: Math.max(0, item.commentCount + delta),
                }
              : item,
          )
        }
      />
      <ReportDialog
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        onSubmit={() => showToast(fr.report.sent)}
      />
    </div>
  );
}
