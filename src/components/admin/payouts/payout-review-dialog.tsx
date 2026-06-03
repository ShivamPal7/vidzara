"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  IconCheck,
  IconX,
  IconLoader2,
  IconBuildingBank,
  IconBrandPaypal,
  IconCurrencyRupee,
} from "@tabler/icons-react";
import { processWithdrawalRequest } from "@/actions/admin/affiliates";

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

interface PayoutReviewDialogProps {
  request: WithdrawalRequest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function PayoutReviewDialog({
  request,
  open,
  onOpenChange,
  onSuccess,
}: PayoutReviewDialogProps) {
  const [adminNotes, setAdminNotes] = useState("");
  const [loading, setLoading] = useState<"approve" | "reject" | null>(null);

  if (!request) return null;

  async function handleAction(approved: boolean) {
    if (!request) return;
    setLoading(approved ? "approve" : "reject");
    try {
      const result = await processWithdrawalRequest(
        request.id,
        approved,
        adminNotes || undefined
      );
      if (result.success) {
        toast.success(approved ? "Payout approved!" : "Payout rejected.", {
          description: approved
            ? "The affiliate has been notified about the approval."
            : "The request has been declined and noted.",
        });
        setAdminNotes("");
        onOpenChange(false);
        onSuccess?.();
      } else {
        toast.error("Action failed. Please try again.");
      }
    } catch {
      toast.error("Unexpected error. Please try again.");
    } finally {
      setLoading(null);
    }
  }

  const methodIcon = {
    UPI: <IconCurrencyRupee className="w-4 h-4" />,
    BANK: <IconBuildingBank className="w-4 h-4" />,
    PAYPAL: <IconBrandPaypal className="w-4 h-4" />,
  }[request.method];

  const methodColor = {
    UPI: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    BANK: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    PAYPAL: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
  }[request.method];

  const amountDisplay =
    request.currency === "INR"
      ? `₹${Number(request.monetaryAmount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`
      : `$${Number(request.monetaryAmount).toFixed(2)}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-900 border border-zinc-800 text-zinc-100 max-w-lg shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-zinc-100 flex items-center gap-2">
            Review Payout Request
          </DialogTitle>
          <DialogDescription className="text-zinc-400 text-sm">
            Review the payment details and approve or reject this withdrawal.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-1">
          {/* Requester info */}
          <div className="flex items-center justify-between rounded-xl bg-zinc-950/50 border border-zinc-800/80 px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-zinc-200">
                {request.affiliate.user.name ?? "Unknown User"}
              </p>
              <p className="text-xs text-zinc-400">{request.affiliate.user.email}</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-zinc-100 font-mono">{amountDisplay}</p>
              <p className="text-[10px] text-zinc-500">{request.creditsAmount} credits</p>
            </div>
          </div>

          {/* Method Badge */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-400 font-medium">Payment Method:</span>
            <Badge
              className={`flex items-center gap-1.5 text-xs font-semibold border ${methodColor}`}
            >
              {methodIcon}
              {request.method}
            </Badge>
          </div>

          <Separator className="bg-zinc-800" />

          {/* Payment Details */}
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
              Payment Details
            </p>
            <div className="rounded-xl bg-zinc-950/40 border border-zinc-800/80 p-4 space-y-2">
              {request.method === "UPI" && (
                <DetailRow label="UPI ID" value={request.paymentDetails.upiId ?? "—"} />
              )}
              {request.method === "BANK" && (
                <>
                  <DetailRow label="Account Number" value={request.paymentDetails.accountNumber ?? "—"} />
                  <DetailRow label="IFSC Code" value={request.paymentDetails.ifscCode ?? "—"} />
                  <DetailRow label="Bank Name" value={request.paymentDetails.bankName ?? "—"} />
                  {request.paymentDetails.accountHolderName && (
                    <DetailRow label="Account Holder" value={request.paymentDetails.accountHolderName} />
                  )}
                </>
              )}
              {request.method === "PAYPAL" && (
                <DetailRow label="PayPal Email" value={request.paymentDetails.paypalEmail ?? "—"} />
              )}
            </div>
          </div>

          {/* Admin Notes */}
          <div className="space-y-2">
            <Label htmlFor="admin-notes" className="text-xs font-semibold text-zinc-300">
              Admin Notes{" "}
              <span className="text-zinc-500 font-normal">(optional for approval)</span>
            </Label>
            <Textarea
              id="admin-notes"
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Add internal notes about this payout decision..."
              className="bg-zinc-950/50 border-zinc-800 text-zinc-200 placeholder:text-zinc-600 focus-visible:ring-indigo-500/30 resize-none text-sm min-h-[80px]"
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={!!loading}
            className="border-zinc-700 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
          >
            Cancel
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleAction(false)}
            disabled={!!loading}
            className="border-red-500/20 bg-red-500/5 text-red-400 hover:bg-red-500/10 hover:text-red-300 hover:border-red-500/30"
          >
            {loading === "reject" ? (
              <IconLoader2 className="w-4 h-4 animate-spin mr-1.5" />
            ) : (
              <IconX className="w-4 h-4 mr-1.5" />
            )}
            Reject
          </Button>
          <Button
            size="sm"
            onClick={() => handleAction(true)}
            disabled={!!loading}
            className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold shadow-[0_0_15px_rgba(16,185,129,0.2)]"
          >
            {loading === "approve" ? (
              <IconLoader2 className="w-4 h-4 animate-spin mr-1.5" />
            ) : (
              <IconCheck className="w-4 h-4 mr-1.5" />
            )}
            Approve Payout
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-xs text-zinc-500 shrink-0">{label}</span>
      <span className="text-sm font-mono font-medium text-zinc-200 text-right break-all">
        {value}
      </span>
    </div>
  );
}
