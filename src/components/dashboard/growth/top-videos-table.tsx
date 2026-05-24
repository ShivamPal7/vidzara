"use client";

import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { IconVideo, IconChevronDown, IconChevronUp } from "@tabler/icons-react";
import { Skeleton } from "@/components/ui/skeleton";

interface TopVideosTableProps {
  data: any[];
  loading?: boolean;
}

export function TopVideosTable({ data, loading }: TopVideosTableProps) {
  const [sortCol, setSortCol] = useState<string>("views");
  const [sortDesc, setSortDesc] = useState<boolean>(true);

  const handleSort = (col: string) => {
    if (sortCol === col) {
      setSortDesc(!sortDesc);
    } else {
      setSortCol(col);
      setSortDesc(true);
    }
  };

  const sortedData = [...data].sort((a, b) => {
    if (a[sortCol] < b[sortCol]) return sortDesc ? 1 : -1;
    if (a[sortCol] > b[sortCol]) return sortDesc ? -1 : 1;
    return 0;
  });

  const columns = [
    { key: "title", label: "Video Title" },
    { key: "views", label: "Views" },
    { key: "watchTime", label: "Watch Time" },
    { key: "likes", label: "Likes" },
    { key: "ctr", label: "CTR (%)" },
    { key: "avgDuration", label: "Avg. Duration" },
  ];

  return (
    <Card className="rounded-xl border border-border/50 bg-card/30 p-3 sm:p-5 overflow-hidden w-full min-w-0">
      <div className="flex items-center gap-2 mb-4 sm:mb-6">
        <IconVideo className="w-4 h-4 sm:w-5 sm:h-5 text-primary shrink-0" />
        <h3 className="text-xs sm:text-sm font-semibold text-foreground">Top Videos</h3>
      </div>
      <div className="overflow-x-auto w-full min-w-0 select-none">
        <Table>
          <TableHeader>
            <TableRow className="border-border/50 hover:bg-transparent">
              <TableHead className="w-10 sm:w-12 text-center text-xs">#</TableHead>
              {columns.map((col) => (
                <TableHead 
                  key={col.key} 
                  className={`cursor-pointer hover:text-foreground transition-colors text-xs ${col.key === 'title' ? 'min-w-[180px] sm:min-w-[250px]' : 'text-right'}`}
                  onClick={() => handleSort(col.key)}
                >
                  <div className={`flex items-center gap-1 ${col.key === 'title' ? 'justify-start' : 'justify-end'}`}>
                    {col.label}
                    {sortCol === col.key && (
                      sortDesc ? <IconChevronDown className="w-3.5 h-3.5" /> : <IconChevronUp className="w-3.5 h-3.5" />
                    )}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i} className="border-border/50">
                  <TableCell><Skeleton className="h-4 w-4 mx-auto" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-28 sm:w-48" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-12 sm:w-16 ml-auto" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-12 sm:w-16 ml-auto" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-10 sm:w-12 ml-auto" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-8 sm:w-10 ml-auto" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-12 sm:w-16 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : (
              sortedData.map((row, index) => (
                <TableRow key={row.id || index} className="border-border/50 hover:bg-card/50">
                  <TableCell className="text-center text-muted-foreground font-mono text-[10px] sm:text-xs">{index + 1}</TableCell>
                  <TableCell className="font-medium truncate max-w-[130px] sm:max-w-[300px] text-xs sm:text-sm" title={row.title}>{row.title}</TableCell>
                  <TableCell className="text-right font-mono text-xs sm:text-sm">{row.views.toLocaleString()}</TableCell>
                  <TableCell className="text-right font-mono text-xs sm:text-sm">{typeof row.watchTime === 'number' ? row.watchTime.toLocaleString() : row.watchTime}</TableCell>
                  <TableCell className="text-right font-mono text-xs sm:text-sm">{row.likes.toLocaleString()}</TableCell>
                  <TableCell className="text-right font-mono text-xs sm:text-sm">{row.ctr}%</TableCell>
                  <TableCell className="text-right font-mono text-xs sm:text-sm">{row.avgDuration}</TableCell>
                </TableRow>
              ))
            )}
            {!loading && sortedData.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="h-20 sm:h-24 text-center text-muted-foreground text-xs sm:text-sm">
                  No videos found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
