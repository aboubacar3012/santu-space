import { Suspense } from "react";
import { PostDetail } from "@/components/PostDetail";
import { SkeletonPost } from "@/components/Skeleton";

async function PostRoute({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PostDetail postId={id} />;
}

export default function PostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="detail-page">
          <SkeletonPost />
        </div>
      }
    >
      <PostRoute params={params} />
    </Suspense>
  );
}
