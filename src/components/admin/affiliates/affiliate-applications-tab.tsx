"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  IconCheck,
  IconX,
  IconCalendar,
  IconExternalLink,
  IconInbox,
} from "@tabler/icons-react";
import { ApplicationReviewDialog } from "./application-review-dialog";

type AffiliateApplication = {
  id: string;
  userId: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  channelLink?: string | null;
  niche?: string | null;
  socialLinks?: any;
  motivation?: string | null;
  adminNotes?: string | null;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: string;
    name: string | null;
    email: string;
    image?: string | null;
  };
};

interface AffiliateApplicationsTabProps {
  applications: AffiliateApplication[];
}

type FilterStatus = "ALL" | "PENDING" | "APPROVED" | "REJECTED";

const STATUS_STYLES: Record<AffiliateApplication["status"], string> = {
  PENDING:
    "bg-amber-500/10 text-amber-400 border-amber-500/20 flex items-center gap-1.5",
  APPROVED:
    "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 flex items-center gap-1.5",
  REJECTED: "bg-red-500/10 text-red-400 border-red-500/20 flex items-center gap-1.5",
};

export function AffiliateApplicationsTab({ applications }: AffiliateApplicationsTabProps) {
  const [filter, setFilter] = useState<FilterStatus>("ALL");
  const [selectedApp, setSelectedApp] = useState<AffiliateApplication | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const filtered =
    filter === "ALL" ? applications : applications.filter((a) => a.status === filter);

  const counts = {
    ALL: applications.length,
    PENDING: applications.filter((a) => a.status === "PENDING").length,
    APPROVED: applications.filter((a) => a.status === "APPROVED").length,
    REJECTED: applications.filter((a) => a.status === "REJECTED").length,
  };

  function openReview(app: AffiliateApplication) {
    setSelectedApp(app);
    setDialogOpen(true);
  }

  const filterOptions: { label: string; value: FilterStatus }[] = [
    { label: "All", value: "ALL" },
    { label: "Pending", value: "PENDING" },
    { label: "Approved", value: "APPROVED" },
    { label: "Rejected", value: "REJECTED" },
  ];

  return (
    <>
      {/* Filter tabs */}
      <div className="flex items-center gap-2 px-6 py-3 border-b border-zinc-800 bg-zinc-950/30">
        {filterOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setFilter(opt.value)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
              filter === opt.value
                ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/30"
                : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 border border-transparent"
            }`}
          >
            {opt.label}
            <span
              className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                filter === opt.value
                  ? "bg-indigo-500/20 text-indigo-300"
                  : "bg-zinc-800 text-zinc-500"
              }`}
            >
              {counts[opt.value]}
            </span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-zinc-950/40 border-b border-zinc-800">
            <TableRow className="hover:bg-transparent border-zinc-800">
              <TableHead className="text-zinc-400 font-medium py-3.5 pl-6">Creator</TableHead>
              <TableHead className="text-zinc-400 font-medium py-3.5">Niche</TableHead>
              <TableHead className="text-zinc-400 font-medium py-3.5">Channel</TableHead>
              <TableHead className="text-zinc-400 font-medium py-3.5">Applied</TableHead>
              <TableHead className="text-zinc-400 font-medium py-3.5">Status</TableHead>
              <TableHead className="text-zinc-400 font-medium py-3.5 text-right pr-6">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((app) => {
              const initials = app.user.name
                ? app.user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2)
                : "AF";

              return (
                <TableRow
                  key={app.id}
                  className="hover:bg-zinc-900/30 border-zinc-800/60 transition-colors duration-150"
                >
                  {/* Creator column */}
                  <TableCell className="py-4 pl-6">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9 border border-zinc-800 shadow-sm ring-1 ring-zinc-800/30">
                        {app.user.image && (
                          <AvatarImage src={app.user.image} alt={app.user.name ?? ""} />
                        )}
                        <AvatarFallback className="bg-gradient-to-br from-indigo-500/20 to-purple-500/20 text-indigo-400 font-semibold text-xs">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-semibold text-zinc-200 text-sm tracking-tight">
                          {app.user.name ?? "—"}
                        </span>
                        <span className="text-xs text-muted-foreground">{app.user.email}</span>
                      </div>
                    </div>
                  </TableCell>

                  {/* Niche column */}
                  <TableCell className="py-4">
                    {app.niche ? (
                      <span className="text-sm text-zinc-300 max-w-[120px] truncate block">
                        {app.niche}
                      </span>
                    ) : (
                      <span className="text-xs text-zinc-600 italic">Not specified</span>
                    )}
                  </TableCell>

                  {/* Channel Link column */}
                  <TableCell className="py-4">
                    {app.channelLink ? (
                      <a
                        href={app.channelLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 hover:underline max-w-[140px] truncate"
                      >
                        <IconExternalLink className="w-3 h-3 shrink-0" />
                        {app.channelLink.replace(/^https?:\/\/(www\.)?/, "")}
                      </a>
                    ) : (
                      <span className="text-xs text-zinc-600 italic">—</span>
                    )}
                  </TableCell>

                  {/* Applied Date column */}
                  <TableCell className="py-4">
                    <div className="flex flex-col text-xs gap-0.5">
                      <span className="font-medium text-zinc-200 flex items-center gap-1.5">
                        <IconCalendar className="w-3.5 h-3.5 text-zinc-500" />
                        {new Date(app.createdAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </TableCell>

                  {/* Status column */}
                  <TableCell className="py-4">
                    <Badge
                      className={`text-xs font-semibold border px-2.5 py-0.5 rounded-full w-fit ${STATUS_STYLES[app.status]}`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          app.status === "PENDING"
                            ? "bg-amber-400 animate-pulse"
                            : app.status === "APPROVED"
                              ? "bg-emerald-400"
                              : "bg-red-400"
                        }`}
                      />
                      {app.status.charAt(0) + app.status.slice(1).toLowerCase()}
                    </Badge>
                  </TableCell>

                  {/* Actions column */}
                  <TableCell className="py-4 text-right pr-6">
                    {app.status === "PENDING" ? (
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          onClick={() => openReview(app)}
                          className="h-8 px-3 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/20 hover:text-indigo-300 font-medium text-xs"
                          variant="outline"
                        >
                          Review
                        </Button>
                      </div>
                    ) : (
                      <span className="text-xs">
                        {app.status === "APPROVED" ? (
                          <span className="flex items-center justify-end gap-1 text-emerald-600">
                            <IconCheck className="w-3.5 h-3.5" />
                            Approved
                          </span>
                        ) : (
                          <span className="flex items-center justify-end gap-1 text-red-600">
                            <IconX className="w-3.5 h-3.5" />
                            Rejected
                          </span>
                        )}
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}

            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="h-40 text-center">
                  <div className="flex flex-col items-center justify-center gap-2 text-zinc-500">
                    <IconInbox className="w-8 h-8 text-zinc-700" />
                    <p className="font-medium text-zinc-400">
                      No {filter !== "ALL" ? filter.toLowerCase() : ""} applications.
                    </p>
                    <p className="text-xs text-zinc-600">
                      Applications submitted by creators will appear here.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <ApplicationReviewDialog
        application={selectedApp}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </>
  );
}
