import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Skeleton } from "@/components/ui/skeleton";

export const PageLoading = () => (
  <DashboardLayout>
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-4 border-b border-border">
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-6 w-48" />
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-card border border-border rounded-lg p-4 space-y-3">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-7 w-16" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 lg:col-span-8">
          <Skeleton className="h-64 w-full rounded-lg" />
        </div>
        <div className="col-span-12 lg:col-span-4">
          <Skeleton className="h-64 w-full rounded-lg" />
        </div>
      </div>
    </div>
  </DashboardLayout>
);
