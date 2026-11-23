export function SkeletonPost() {
  return (
    <div className="card skeleton-card skeleton-post" aria-hidden="true">
      <div className="skeleton-row"><i className="skeleton-avatar" /><span><i className="skeleton-line short" /><i className="skeleton-line tiny" /></span></div>
      <i className="skeleton-line title" /><i className="skeleton-line" /><i className="skeleton-line" /><i className="skeleton-line medium" />
      <div className="skeleton-actions"><i /><i /><i /></div>
    </div>
  );
}

export function SkeletonMember() {
  return <div className="card skeleton-card skeleton-member" aria-hidden="true"><i className="skeleton-avatar" /><i className="skeleton-line medium" /><i className="skeleton-line short" /></div>;
}

export function SkeletonSidebar() {
  return <div className="card skeleton-card skeleton-sidebar" aria-hidden="true"><i className="skeleton-banner" /><i className="skeleton-line title" /><i className="skeleton-line" /><i className="skeleton-line medium" /></div>;
}
