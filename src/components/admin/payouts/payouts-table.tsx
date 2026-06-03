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
  IconBuildingBank,
  IconBrandPaypal,
  IconCurrencyRupee,
  IconInbox,
} from "@tabler/icons-react";
import { PayoutReviewDialog } from "./payout-review-dialog";

type WithdrawalRequest = {
  id: string;
  affiliateId: string;
  creditsAmount: number;
  monetaryAmount: any;
  currency: string;
  method: "UPI" | "BANK" | "PAYPAL";
  paymentDetails: any;
  status: "PENDING" | "APPROVED" | "REJECTED";
  adminNotes?: string | null;
  processedAt?: Date | null;
  createdAt: Date;
  affiliate: {
    id: string;
    referralCode: string;
    user: {
      name: string | null;
      email: string;
      image?: string | null;
    };
  };
};

interface PayoutsTableProps {
  requests: WithdrawalRequest[];
}

const STATUS_STYLES: Record<
  WithdrawalRequest["status"],
  string
> = {
  PENDING:
    "bg-amber-500/10 text-amber-400 border-amber-500/20 flex items-center gap-1.5",
  APPROVED:
    "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 flex items-center gap-1.5",
  REJECTED: "bg-red-500/10 text-red-400 border-red-500/20 flex items-center gap-1.5",
};

const METHOD_STYLES: Record<WithdrawalRequest["method"], string> = {
  UPI: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  BANK: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  PAYPAL: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
};

const METHOD_ICONS = {
  UPI: <IconCurrencyRupee className="w-3 h-3" />,
  BANK: <IconBuildingBank className="w-3 h-3" />,
  PAYPAL: <IconBrandPaypal className="w-3 h-3" />,
};

export function PayoutsTable({ requests }: PayoutsTableProps) {
  const [selectedRequest, setSelectedRequest] = useState<WithdrawalRequest | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  function openReview(request: WithdrawalRequest) {
    setSelectedRequest(request);
    setDialogOpen(true);
  }

  return (
    <>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-zinc-950/40 border-b border-zinc-800">
            <TableRow className="hover:bg-transparent border-zinc-800">
              <TableHead className="text-zinc-400 font-medium py-3.5 pl-6">Creator</TableHead>
              <TableHead className="text-zinc-400 font-medium py-3.5">Method</TableHead>
              <TableHead className="text-zinc-400 font-medium py-3.5">Credits</TableHead>
              <TableHead className="text-zinc-400 font-medium py-3.5">Amount</TableHead>
              <TableHead className="text-zinc-400 font-medium py-3.5">Status</TableHead>
              <TableHead className="text-zinc-400 font-medium py-3.5">Requested</TableHead>
              <TableHead className="text-zinc-400 font-medium py-3.5 text-right pr-6">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.map((req) => {
              const initials = req.affiliate.user.name
                ? req.affiliate.user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2)
                : "AF";

              const amountDisplay =
                req.currency === "INR"
                  ? `₹${Number(req.monetaryAmount).toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                    })}`
                  : `$${Number(req.monetaryAmount).toFixed(2)}`;

              return (
                <TableRow
                  key={req.id}
                  className="hover:bg-zinc-900/30 border-zinc-800/60 transition-colors duration-150"
                >
                  {/* Creator column */}
                  <TableCell className="py-4 pl-6">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9 border border-zinc-800 shadow-sm ring-1 ring-zinc-800/30">
                        {req.affiliate.user.image && (
                          <AvatarImage
                            src={req.affiliate.user.image}
                            alt={req.affiliate.user.name ?? ""}
                          />
                        )}
                        <AvatarFallback className="bg-gradient-to-br from-indigo-500/20 to-purple-500/20 text-indigo-400 font-semibold text-xs">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-semibold text-zinc-200 text-sm tracking-tight">
                          {req.affiliate.user.name ?? "—"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {req.affiliate.user.email}
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  {/* Method column */}
                  <TableCell className="py-4">
                    <Badge
                      className={`flex items-center gap-1.5 w-fit text-xs font-semibold border ${METHOD_STYLES[req.method]}`}
                    >
                      {METHOD_ICONS[req.method]}
                      {req.method}
                    </Badge>
                  </TableCell>

                  {/* Credits column */}
                  <TableCell className="py-4">
                    <span className="font-mono font-bold text-zinc-200 text-sm">
                      {req.creditsAmount.toLocaleString()}
                    </span>
                    <span className="text-xs text-zinc-500 ml-1">cr</span>
                  </TableCell>

                  {/* Amount column */}
                  <TableCell className="py-4">
                    <span className="font-mono font-bold text-zinc-100 text-sm">
                      {amountDisplay}
                    </span>
                    <span className="ml-1.5 text-[10px] text-zinc-500 font-medium">
                      {req.currency}
                    </span>
                  </TableCell>

                  {/* Status column */}
                  <TableCell className="py-4">
                    <Badge
                      className={`text-xs font-semibold border px-2.5 py-0.5 rounded-full w-fit ${STATUS_STYLES[req.status]}`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          req.status === "PENDING"
                            ? "bg-amber-400 animate-pulse"
                            : req.status === "APPROVED"
                              ? "bg-emerald-400"
                              : "bg-red-400"
                        }`}
                      />
                      {req.status.charAt(0) + req.status.slice(1).toLowerCase()}
                    </Badge>
                  </TableCell>

                  {/* Requested date column */}
                  <TableCell className="py-4">
                    <div className="flex flex-col text-xs gap-0.5">
                      <span className="font-medium text-zinc-200 flex items-center gap-1.5">
                        <IconCalendar className="w-3.5 h-3.5 text-zinc-500" />
                        {new Date(req.createdAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                      <span className="text-[10px] text-muted-foreground pl-5">
                        {new Date(req.createdAt).toLocaleTimeString(undefined, {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </TableCell>

                  {/* Actions column */}
                  <TableCell className="py-4 text-right pr-6">
                    {req.status === "PENDING" ? (
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openReview(req)}
                          className="h-8 px-3 border-emerald-500/20 bg-emerald-500/5 text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300 hover:border-emerald-500/30 font-medium text-xs"
                        >
                          <IconCheck className="w-3.5 h-3.5 mr-1" />
                          Review
                        </Button>
                      </div>
                    ) : (
                      <span className="text-xs text-zinc-600 italic">
                        {req.status === "APPROVED" ? (
                          <span className="flex items-center justify-end gap-1 text-emerald-600">
                            <IconCheck className="w-3.5 h-3.5" />
                            Processed
                          </span>
                        ) : (
                          <span className="flex items-center justify-end gap-1 text-red-600">
                            <IconX className="w-3.5 h-3.5" />
                            Declined
                          </span>
                        )}
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}

            {requests.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="h-40 text-center">
                  <div className="flex flex-col items-center justify-center gap-2 text-zinc-500">
                    <IconInbox className="w-8 h-8 text-zinc-700" />
                    <p className="font-medium text-zinc-400">No payout requests found.</p>
                    <p className="text-xs text-zinc-600">
                      Withdrawal requests from affiliates will appear here.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <PayoutReviewDialog
        request={selectedRequest}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </>
  );
}
