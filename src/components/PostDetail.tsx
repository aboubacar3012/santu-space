"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Flag, MoreHorizontal, Paperclip, Pencil, Pin, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { fr } from "@/i18n/fr";
import { currentUser } from "@/mocks/members";
import { relativeTime } from "@/lib/utils";
import type { Comment, Member, Post } from "@/types";
import { Avatar } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { ReactionButton } from "@/components/ReactionButton";
import { CommentForm } from "@/components/CommentForm";
import { CommentThread } from "@/components/CommentThread";
import { ReportDialog } from "@/components/ReportDialog";
import { EmptyState } from "@/components/EmptyState";
import { SkeletonPost } from "@/components/Skeleton";
import { useToast } from "@/components/Toast";

export function PostDetail({ postId }: { postId: string }) {
  const [post, setPost] = useState<Post>();
  const [members, setMembers] = useState<Member[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [reportOpen, setReportOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(false);
  const [postDraft, setPostDraft] = useState({ title: "", content: "" });
  const { showToast } = useToast();
  const router = useRouter();

  useEffect(() => {
    void Promise.all([api.getPost(postId), api.getMembers(), api.getComments(postId)])
      .then(([nextPost, nextMembers, nextComments]) => {
        setPost(nextPost);
        setMembers(nextMembers);
        setComments(nextComments);
      })
      .finally(() => setLoading(false));
  }, [postId]);

  if (loading) return <div className="detail-page"><SkeletonPost /></div>;
  if (!post) return <EmptyState title={fr.state.empty} action={<Link href="/">{fr.actions.back}</Link>} />;
  const author = members.find((member) => member.id === post.authorId);
  if (!author) return <EmptyState title={fr.state.error} />;

  async function submitComment(content: string, parentId: string | null) {
    const optimistic: Comment = { id: `optimistic-${Date.now()}`, postId, authorId: currentUser.id, content, parentId, createdAt: new Date().toISOString(), likes: 0, status: "sending" };
    setComments((items) => [...items, optimistic]);
    try {
      const saved = await api.createComment(postId, content, parentId);
      setComments((items) => items.map((item) => item.id === optimistic.id ? saved : item));
      setPost((item) => item ? { ...item, commentCount: item.commentCount + 1 } : item);
      showToast(fr.post.sent);
    } catch {
      setComments((items) => items.map((item) => item.id === optimistic.id ? { ...item, status: "failed" } : item));
    }
  }

  async function retryComment(comment: Comment) {
    setComments((items) => items.map((item) => item.id === comment.id ? { ...item, status: "sending" } : item));
    try {
      const saved = await api.createComment(postId, comment.content, comment.parentId);
      setComments((items) => items.map((item) => item.id === comment.id ? saved : item));
    } catch {
      setComments((items) => items.map((item) => item.id === comment.id ? { ...item, status: "failed" } : item));
    }
  }

  async function likeComment(comment: Comment) {
    const previous = comment.likes;
    setComments((items) => items.map((item) => item.id === comment.id ? { ...item, likes: item.likes + 1 } : item));
    try {
      const next = await api.toggleCommentLike(comment.id);
      setComments((items) => items.map((item) => item.id === comment.id ? { ...item, likes: next.likes } : item));
    } catch {
      setComments((items) => items.map((item) => item.id === comment.id ? { ...item, likes: previous } : item));
    }
  }

  async function editComment(comment: Comment, content: string) {
    const updated = await api.updateComment(comment.id, content);
    setComments((items) => items.map((item) => item.id === comment.id ? { ...item, content: updated.content } : item));
    showToast(fr.post.commentUpdated);
  }

  async function deleteComment(comment: Comment) {
    await api.deleteComment(comment.id);
    setComments((items) => items.filter((item) => item.id !== comment.id && item.parentId !== comment.id));
    showToast(fr.post.commentDeleted);
  }

  function startEditingPost() {
    setPostDraft({ title: post!.title, content: post!.content });
    setEditingPost(true);
  }

  async function savePost() {
    const updated = await api.updatePost(post!.id, postDraft);
    setPost((item) => item ? { ...item, ...updated } : item);
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
      <Link href="/" className="back-link"><ArrowLeft size={17} />{fr.actions.back}</Link>
      <Card className="post-detail-card">
        <div className="post-detail-top">
          <Avatar member={author} size="lg" />
          <div><strong>{author.name}</strong><span>{fr.members[author.role]} · {relativeTime(post.createdAt)}</span></div>
          <details className="menu post-detail-menu"><summary className="icon-button" aria-label={fr.common.moreActions}><MoreHorizontal size={20} /></summary><div className="menu-popover post-menu-popover">
            <button type="button" onClick={() => setReportOpen(true)}><Flag size={15} />{fr.actions.report}</button>
            {currentUser.id === author.id || currentUser.role === "admin" || currentUser.role === "moderator" ? <button type="button" onClick={startEditingPost}><Pencil size={15} />{fr.actions.edit}</button> : null}
            {currentUser.role === "admin" || currentUser.role === "moderator" ? <button type="button" onClick={() => void togglePin()}><Pin size={15} />{fr.actions.pin}</button> : null}
            {currentUser.id === author.id || currentUser.role === "admin" || currentUser.role === "moderator" ? <button type="button" onClick={() => void remove()}><Trash2 size={15} />{fr.actions.delete}</button> : null}
          </div></details>
        </div>
        {post.pinned ? <span className="detail-pin"><Pin size={13} />{fr.feed.pinnedPost}</span> : null}
        {editingPost ? <form className="post-edit-form" onSubmit={(event) => { event.preventDefault(); void savePost(); }}>
          <input required value={postDraft.title} onChange={(event) => setPostDraft((draft) => ({ ...draft, title: event.target.value }))} aria-label={fr.feed.composerTitle} />
          <textarea required rows={6} value={postDraft.content} onChange={(event) => setPostDraft((draft) => ({ ...draft, content: event.target.value }))} aria-label={fr.feed.composerBody} />
          <div><button type="button" className="button button-secondary" onClick={() => setEditingPost(false)}>{fr.actions.cancel}</button><button className="button button-primary" type="submit">{fr.actions.save}</button></div>
        </form> : <><h1>{post.title}</h1><p className="post-full-content">{post.content}</p></>}
        {post.attachment ? <div className="attachment-card"><span><Paperclip size={18} /></span><div><strong>{post.attachment}</strong><small>PDF · 420 Ko</small></div></div> : null}
        <div className="detail-actions"><ReactionButton count={post.likes} active={post.liked} onClick={() => { void api.toggleLike(post.id).then((items) => setPost(items.find((item) => item.id === post.id))); }} /><span>{post.commentCount} {fr.feed.comments}</span></div>
      </Card>
      <section id="comments" className="comments-section">
        <div className="comments-heading"><h2>{fr.post.responses}</h2><span>{comments.length}</span></div>
        <Card className="comment-composer-card"><CommentForm user={currentUser} onSubmit={(content) => submitComment(content, null)} /></Card>
        {comments.length ? <CommentThread comments={comments} members={members} user={currentUser} onReply={submitComment} onRetry={retryComment} onLike={likeComment} onEdit={editComment} onDelete={deleteComment} /> : <EmptyState title={fr.post.noComments} />}
      </section>
      <ReportDialog open={reportOpen} onClose={() => setReportOpen(false)} onSubmit={() => showToast(fr.report.sent)} />
    </div>
  );
}
