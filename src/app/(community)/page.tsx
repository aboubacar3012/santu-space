"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AlertCircle } from "lucide-react";
import { api } from "@/lib/api";
import { currentUser } from "@/mocks/members";
import { fr } from "@/i18n/fr";
import type { Category, Community, Member, Post, SortMode } from "@/types";
import { PostComposer } from "@/components/PostComposer";
import { CategoryChips } from "@/components/CategoryChips";
import { PostCard } from "@/components/PostCard";
import { Pagination } from "@/components/Pagination";
import { EmptyState } from "@/components/EmptyState";
import { SkeletonPost, SkeletonSidebar } from "@/components/Skeleton";
import { CommunitySidebarCard } from "@/components/CommunitySidebarCard";
import { TopMembersCard } from "@/components/TopMembersCard";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/Toast";
import { focusPost, useFocusRequest } from "@/lib/focus-post";

const pageSize = 6;
const FOCUS_TTL = 15_000;

function arrange(posts: Post[], category: string, sort: SortMode) {
  const next = posts.filter(
    (post) => category === "all" || post.categoryId === category,
  );
  if (sort === "popular") return [...next].sort((a, b) => b.likes - a.likes);
  if (sort === "pinned")
    return [...next].sort((a, b) => Number(b.pinned) - Number(a.pinned));
  return [...next].sort(
    (a, b) =>
      Number(b.pinned) - Number(a.pinned) ||
      +new Date(b.createdAt) - +new Date(a.createdAt),
  );
}

export default function CommunityPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [community, setCommunity] = useState<Community>();
  const [topMembers, setTopMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selected, setSelected] = useState("all");
  const [sort, setSort] = useState<SortMode>("recent");
  const [visible, setVisible] = useState(pageSize);
  const [loadingMore, setLoadingMore] = useState(false);
  const { showToast } = useToast();
  const focus = useFocusRequest();
  const handledToken = useRef(0);
  const [appliedToken, setAppliedToken] = useState(0);

  useEffect(() => {
    void Promise.all([
      api.getPosts(),
      api.getMembers(),
      api.getCategories(),
      api.getCommunity(),
      api.getTopMembers(),
    ])
      .then(
        ([
          nextPosts,
          nextMembers,
          nextCategories,
          nextCommunity,
          nextTopMembers,
        ]) => {
          setPosts(nextPosts);
          setMembers(nextMembers);
          setCategories(nextCategories);
          setCommunity(nextCommunity);
          setTopMembers(nextTopMembers);
        },
      )
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  const target = focus
    ? posts.find((post) => post.id === focus.postId)
    : undefined;

  // Une notification vise un post : on adapte filtre et pagination pour qu'il soit affiché (ajustement pendant le rendu)
  if (focus && target && appliedToken !== focus.token) {
    setAppliedToken(focus.token);
    const nextCategory =
      selected !== "all" && target.categoryId !== selected ? "all" : selected;
    if (nextCategory !== selected) setSelected(nextCategory);
    const position = arrange(posts, nextCategory, sort).findIndex(
      (post) => post.id === target.id,
    );
    if (position + 1 > visible) setVisible(position + 1);
  }

  const filtered = useMemo(
    () => arrange(posts, selected, sort),
    [posts, selected, sort],
  );

  useEffect(() => {
    if (
      !focus ||
      loading ||
      !target ||
      appliedToken !== focus.token ||
      handledToken.current === focus.token
    )
      return;
    const element = document.getElementById(`post-${focus.postId}`);
    if (!element) return;
    handledToken.current = focus.token;
    if (Date.now() - focus.token < FOCUS_TTL) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
      element.classList.add("is-targeted");
      window.setTimeout(() => element.classList.remove("is-targeted"), 2800);
    }
    focusPost.clear();
  }, [focus, loading, target, appliedToken, visible, selected]);

  async function publish(draft: {
    title: string;
    content: string;
    categoryId: string;
    attachment?: string;
  }) {
    const optimistic: Post = {
      ...draft,
      id: `optimistic-${Date.now()}`,
      authorId: currentUser.id,
      excerpt: draft.content,
      createdAt: new Date().toISOString(),
      likes: 0,
      liked: false,
      commentCount: 0,
      pinned: false,
      status: "sending",
    };
    setPosts((items) => [optimistic, ...items]);
    try {
      const saved = await api.createPost(draft);
      setPosts((items) =>
        items.map((post) => (post.id === optimistic.id ? saved : post)),
      );
      showToast(fr.feed.published);
    } catch {
      setPosts((items) =>
        items.map((post) =>
          post.id === optimistic.id ? { ...post, status: "failed" } : post,
        ),
      );
    }
  }

  async function retry(post: Post) {
    setPosts((items) =>
      items.map((item) =>
        item.id === post.id ? { ...item, status: "sending" } : item,
      ),
    );
    try {
      const saved = await api.createPost(post);
      setPosts((items) =>
        items.map((item) => (item.id === post.id ? saved : item)),
      );
    } catch {
      setPosts((items) =>
        items.map((item) =>
          item.id === post.id ? { ...item, status: "failed" } : item,
        ),
      );
    }
  }

  async function loadMore() {
    setLoadingMore(true);
    await new Promise((resolve) => setTimeout(resolve, 350));
    setVisible((count) => count + pageSize);
    setLoadingMore(false);
  }

  if (error) {
    return (
      <EmptyState
        title={fr.state.error}
        action={
          <Button onClick={() => location.reload()}>
            <AlertCircle size={16} />
            {fr.actions.retry}
          </Button>
        }
      />
    );
  }

  return (
    <div className="community-page">
      <section className="feed-column">
        <div className="page-intro">
          <p className="eyebrow">{community?.name ?? fr.brand}</p>
          <h1>{fr.feed.title}</h1>
          <p>{fr.feed.subtitle}</p>
        </div>
        {!loading ? (
          <PostComposer
            user={currentUser}
            categories={categories}
            onPublish={publish}
          />
        ) : (
          <SkeletonPost />
        )}
        {!loading ? (
          <CategoryChips
            categories={categories}
            selected={selected}
            sort={sort}
            onSelect={(id) => {
              setSelected(id);
              setVisible(pageSize);
            }}
            onSort={setSort}
          />
        ) : null}
        <div
          className="post-list"
          aria-label={fr.common.loadingPosts}
          aria-busy={loading}
        >
          {loading ? (
            Array.from({ length: 3 }, (_, index) => (
              <SkeletonPost key={index} />
            ))
          ) : filtered.length ? (
            filtered.slice(0, visible).map((post) => {
              const author =
                members.find((member) => member.id === post.authorId) ??
                currentUser;
              const category =
                categories.find((item) => item.id === post.categoryId) ??
                categories[0];
              const lastCommenter = members.find(
                (member) => member.id === post.lastCommenterId,
              );
              return (
                <PostCard
                  key={post.id}
                  openToken={
                    focus?.postId === post.id && focus.openComments
                      ? focus.token
                      : undefined
                  }
                  post={post}
                  author={author}
                  category={category}
                  lastCommenter={lastCommenter}
                  members={members}
                  user={currentUser}
                  onCommentCountChange={(delta, commenterId) =>
                    setPosts((items) =>
                      items.map((item) =>
                        item.id === post.id
                          ? {
                              ...item,
                              commentCount: Math.max(
                                0,
                                item.commentCount + delta,
                              ),
                              lastCommenterId:
                                commenterId ?? item.lastCommenterId,
                            }
                          : item,
                      ),
                    )
                  }
                  onLike={() => {
                    void api.toggleLike(post.id).then(setPosts);
                  }}
                  onReport={() => showToast(fr.report.sent)}
                  onRetry={
                    post.status === "failed"
                      ? () => void retry(post)
                      : undefined
                  }
                />
              );
            })
          ) : (
            <EmptyState title={fr.feed.empty} description={fr.feed.emptyHint} />
          )}
        </div>
        {!loading && filtered.length ? (
          <Pagination
            visible={Math.min(visible, filtered.length)}
            total={filtered.length}
            loading={loadingMore}
            onLoadMore={() => void loadMore()}
          />
        ) : null}
      </section>
      <aside className="community-sidebar" aria-label={fr.community.explore}>
        {loading || !community ? (
          <>
            <SkeletonSidebar />
            <SkeletonSidebar />
          </>
        ) : (
          <>
            <CommunitySidebarCard community={community} user={currentUser} />
            <TopMembersCard members={topMembers} />
          </>
        )}
      </aside>
    </div>
  );
}
