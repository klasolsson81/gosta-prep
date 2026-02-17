export default function SkeletonCard() {
  return (
    <div className="bg-glass border border-glass-border rounded-xl px-3.5 py-3 animate-pulse">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-full bg-surface shrink-0" />
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="h-4 bg-surface rounded w-32" />
            <div className="w-5 h-5 bg-surface rounded-full" />
          </div>
          <div className="h-3 bg-surface rounded w-full" />
          <div className="h-3 bg-surface rounded w-2/3" />
          <div className="flex gap-1.5 mt-1">
            <div className="h-5 bg-surface rounded-full w-16" />
            <div className="h-5 bg-surface rounded-full w-14" />
            <div className="h-5 bg-surface rounded-full w-20" />
          </div>
        </div>
      </div>
    </div>
  );
}
