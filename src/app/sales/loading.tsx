import { DashboardSkeleton } from "@/components/shared/loading-skeleton";

export default function SalesLoading() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-muted" />
        <div className="h-10 w-32 animate-pulse rounded-lg bg-muted" />
      </div>
      <DashboardSkeleton />
    </div>
  );
}
