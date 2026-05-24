import { getGenerationHistory } from "@/actions/history";
import { HistoryCard } from "@/components/dashboard/history/history-card";
import { HistoryFilter } from "@/components/dashboard/history/history-filter";
import { IconHistory } from "@tabler/icons-react";
import { Feature } from "../../../../../prisma/generated/prisma/enums";
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious,
  PaginationEllipsis
} from "@/components/ui/pagination";

export default async function HistoryPage(props: {
  searchParams?: Promise<{ page?: string; feature?: string; dateRange?: string }>;
}) {
  const searchParams = await props.searchParams;
  const page = searchParams?.page ? parseInt(searchParams.page, 10) : 1;
  const featureParam = searchParams?.feature as Feature | undefined;
  const dateRange = searchParams?.dateRange;
  const limit = 20;

  const result = await getGenerationHistory({ page, limit, feature: featureParam, dateRange });

  if (!result.success || !result.data) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in duration-300">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10 text-destructive mb-4">
          <IconHistory className="h-10 w-10" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight mb-2">Failed to load history</h2>
        <p className="text-muted-foreground max-w-sm">
          {result.error || "An unexpected error occurred while loading your history."}
        </p>
      </div>
    );
  }

  const { items, totalPages } = result.data;

  // Build base query string (without page) for pagination links
  const buildPageUrl = (p: number) => {
    const params = new URLSearchParams();
    params.set("page", String(p));
    if (featureParam) params.set("feature", featureParam);
    if (dateRange) params.set("dateRange", dateRange);
    return `/dashboard/history?${params.toString()}`;
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-6 overflow-x-hidden space-y-6 animate-in fade-in duration-300">
      {/* Compact responsive header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/50 pb-4">
        <h1 className="text-lg font-semibold flex items-center gap-2 text-foreground">
          <IconHistory className="w-4 h-4 text-primary shrink-0" />
          Generation History
        </h1>
        <div className="w-full sm:w-auto flex justify-end">
          <HistoryFilter />
        </div>
      </div>

      {items.length === 0 ? (
        <div className="flex min-h-[400px] flex-col items-center justify-center rounded-xl border border-dashed bg-muted/30 p-8 text-center backdrop-blur-sm">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
            <IconHistory className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold mb-2">No history found</h2>
          <p className="text-muted-foreground max-w-sm mb-6">
            {featureParam 
              ? "You haven't generated anything with this specific tool yet."
              : "You haven't generated anything yet. Try using some of our AI tools to create your first content!"}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-col gap-2 w-full min-w-0">
            {items.map((item) => (
              <HistoryCard key={item.id} generation={item} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="pt-4 pb-12">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      href={page > 1 ? buildPageUrl(page - 1) : "#"} 
                      className={page <= 1 ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                    if (
                      p === 1 || 
                      p === totalPages || 
                      (p >= page - 1 && p <= page + 1)
                    ) {
                      return (
                        <PaginationItem key={p}>
                          <PaginationLink 
                            href={buildPageUrl(p)}
                            isActive={p === page}
                          >
                            {p}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    }
                    
                    if (p === 2 && page > 3) return <PaginationItem key={p}><PaginationEllipsis /></PaginationItem>;
                    if (p === totalPages - 1 && page < totalPages - 2) return <PaginationItem key={p}><PaginationEllipsis /></PaginationItem>;
                    
                    return null;
                  })}

                  <PaginationItem>
                    <PaginationNext 
                      href={page < totalPages ? buildPageUrl(page + 1) : "#"} 
                      className={page >= totalPages ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
