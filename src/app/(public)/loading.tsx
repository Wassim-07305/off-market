export default function PublicLoading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 p-6">
      <div className="h-10 w-64 animate-pulse rounded-lg bg-muted" />
      <div className="w-full max-w-2xl space-y-4">
        <div className="h-4 w-full animate-pulse rounded-lg bg-muted" />
        <div className="h-4 w-5/6 animate-pulse rounded-lg bg-muted" />
        <div className="h-4 w-4/6 animate-pulse rounded-lg bg-muted" />
      </div>
    </div>
  );
}
