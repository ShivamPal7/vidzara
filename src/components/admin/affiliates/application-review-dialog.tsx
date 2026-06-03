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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  IconCheck,
  IconX,
  IconLoader2,
  IconExternalLink,
} from "@tabler/icons-react";
import {
  approveAffiliateApplication,
  rejectAffiliateApplication,
} from "@/actions/admin/affiliates";

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

interface ApplicationReviewDialogProps {
  application: AffiliateApplication | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function ApplicationReviewDialog({
  application,
  open,
  onOpenChange,
  onSuccess,
}: ApplicationReviewDialogProps) {
  const [commissionRate, setCommissionRate] = useState("10");
  const [adminNotes, setAdminNotes] = useState("");
  const [loading, setLoading] = useState<"approve" | "reject" | null>(null);

  if (!application) return null;

  const socialLinks =
    application.socialLinks as Record<string, string> | null | undefined;

  async function handleApprove() {
    if (!application) return;
    setLoading("approve");
    try {
      const rate = parseFloat(commissionRate);
      if (isNaN(rate) || rate < 1 || rate > 50) {
        toast.error("Commission rate must be between 1% and 50%.");
        setLoading(null);
        return;
      }
      const result = await approveAffiliateApplication(application.id, rate);
      if (result.success) {
        toast.success("Application approved!", {
          description: `${application.user.name ?? "The creator"} is now an affiliate partner.`,
        });
        setAdminNotes("");
        setCommissionRate("10");
        onOpenChange(false);
        onSuccess?.();
      } else {
        toast.error("Approval failed. Please try again.");
      }
    } catch {
      toast.error("Unexpected error. Please try again.");
    } finally {
      setLoading(null);
    }
  }

  async function handleReject() {
    if (!application) return;
    if (!adminNotes.trim()) {
      toast.error("Admin notes are required when rejecting an application.");
      return;
    }
    setLoading("reject");
    try {
      const result = await rejectAffiliateApplication(application.id, adminNotes.trim());
      if (result.success) {
        toast.warning("Application rejected.", {
          description: "The applicant has been notified.",
        });
        setAdminNotes("");
        onOpenChange(false);
        onSuccess?.();
      } else {
        toast.error("Rejection failed. Please try again.");
      }
    } catch {
      toast.error("Unexpected error. Please try again.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-900 border border-zinc-800 text-zinc-100 max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-zinc-100">
            Review Application
          </DialogTitle>
          <DialogDescription className="text-zinc-400 text-sm">
            Review the creator&apos;s details then approve or reject their affiliate application.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-1">
          {/* Applicant info */}
          <div className="rounded-xl bg-zinc-950/50 border border-zinc-800/80 px-4 py-3">
            <p className="text-sm font-semibold text-zinc-200">
              {application.user.name ?? "Unknown User"}
            </p>
            <p className="text-xs text-zinc-400">{application.user.email}</p>
          </div>

          {/* Niche */}
          {application.niche && (
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">Niche</p>
              <p className="text-sm text-zinc-300 bg-zinc-950/40 border border-zinc-800/80 rounded-lg px-3 py-2">
                {application.niche}
              </p>
            </div>
          )}

          {/* Channel Link */}
          {application.channelLink && (
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
                Channel Link
              </p>
              <a
                href={application.channelLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-sm text-indigo-400 hover:text-indigo-300 hover:underline bg-zinc-950/40 border border-zinc-800/80 rounded-lg px-3 py-2 transition-colors"
              >
                <IconExternalLink className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{application.channelLink}</span>
              </a>
            </div>
          )}

          {/* Social Links */}
          {socialLinks && Object.keys(socialLinks).length > 0 && (
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
                Social Links
              </p>
              <div className="space-y-1.5 bg-zinc-950/40 border border-zinc-800/80 rounded-lg px-3 py-2">
                {Object.entries(socialLinks).map(([platform, url]) => (
                  <div key={platform} className="flex items-center justify-between gap-2">
                    <span className="text-xs text-zinc-500 capitalize">{platform}</span>
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-indigo-400 hover:underline truncate max-w-[60%]"
                    >
                      {url}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Motivation */}
          {application.motivation && (
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
                Motivation
              </p>
              <p className="text-sm text-zinc-300 bg-zinc-950/40 border border-zinc-800/80 rounded-lg px-3 py-2 leading-relaxed">
                {application.motivation}
              </p>
            </div>
          )}

          <Separator className="bg-zinc-800" />

          {/* Commission Rate */}
          <div className="space-y-2">
            <Label htmlFor="commission-rate" className="text-xs font-semibold text-zinc-300">
              Commission Rate (%)
            </Label>
            <div className="relative">
              <Input
                id="commission-rate"
                type="number"
                min={1}
                max={50}
                step={0.5}
                value={commissionRate}
                onChange={(e) => setCommissionRate(e.target.value)}
                className="bg-zinc-950/50 border-zinc-800 text-zinc-200 focus-visible:ring-indigo-500/30 pr-8 text-sm"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm font-bold pointer-events-none">
                %
              </span>
            </div>
            <p className="text-[10px] text-zinc-500">
              Default is 10%. This sets the affiliate&apos;s commission percentage on conversions.
            </p>
          </div>

          {/* Admin Notes */}
          <div className="space-y-2">
            <Label htmlFor="app-admin-notes" className="text-xs font-semibold text-zinc-300">
              Admin Notes{" "}
              <span className="text-red-400 font-normal">(required for rejection)</span>
            </Label>
            <Textarea
              id="app-admin-notes"
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Add notes about this decision (required when rejecting)..."
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
            onClick={handleReject}
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
            onClick={handleApprove}
            disabled={!!loading}
            className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold shadow-[0_0_15px_rgba(16,185,129,0.2)]"
          >
            {loading === "approve" ? (
              <IconLoader2 className="w-4 h-4 animate-spin mr-1.5" />
            ) : (
              <IconCheck className="w-4 h-4 mr-1.5" />
            )}
            Approve Application
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
