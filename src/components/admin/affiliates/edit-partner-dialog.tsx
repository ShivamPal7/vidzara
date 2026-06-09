"use client";

import { useState, useEffect } from "react";
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
import { Switch } from "@/components/ui/switch";
import { IconLoader2, IconDeviceFloppy } from "@tabler/icons-react";
import { editAffiliateDetails } from "@/actions/admin/affiliates";

interface EditPartnerDialogProps {
  affiliate: {
    id: string;
    enabled: boolean;
    commissionRate: number; // decimal e.g. 0.1
    adminNotes: string | null;
    user: {
      name: string | null;
      email: string;
    };
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function EditPartnerDialog({
  affiliate,
  open,
  onOpenChange,
  onSuccess,
}: EditPartnerDialogProps) {
  const [commissionRate, setCommissionRate] = useState("10");
  const [enabled, setEnabled] = useState(true);
  const [adminNotes, setAdminNotes] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (affiliate && open) {
      // Convert decimal rate to percentage (e.g., 0.1 -> 10)
      const ratePercentage = affiliate.commissionRate * 100;
      setCommissionRate(ratePercentage.toString());
      setEnabled(affiliate.enabled);
      setAdminNotes(affiliate.adminNotes || "");
    }
  }, [affiliate, open]);

  if (!affiliate) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!affiliate) return;
    setLoading(true);

    try {
      const rate = parseFloat(commissionRate);
      if (isNaN(rate) || rate < 0 || rate > 100) {
        toast.error("Commission rate must be a valid percentage between 0% and 100%.");
        setLoading(false);
        return;
      }

      const result = await editAffiliateDetails(affiliate.id, {
        commissionRate: rate,
        enabled,
        adminNotes: adminNotes.trim() || null,
      });

      if (result.success) {
        toast.success("Affiliate details updated successfully.");
        onOpenChange(false);
        onSuccess?.();
      } else {
        toast.error("Failed to update affiliate details.");
      }
    } catch (error: any) {
      toast.error(error.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-900 border border-zinc-800 text-zinc-100 max-w-md shadow-2xl p-6 rounded-2xl">
        <DialogHeader className="space-y-1.5">
          <DialogTitle className="text-lg font-bold text-zinc-100 font-outfit">
            Edit Partner Details
          </DialogTitle>
          <DialogDescription className="text-zinc-400 text-sm">
            Modify details for {affiliate.user.name || affiliate.user.email}.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 py-2">
          {/* User Display (Read-Only) */}
          <div className="rounded-xl bg-zinc-950/50 border border-zinc-800/80 px-4 py-3 space-y-0.5">
            <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Partner Creator</p>
            <p className="text-sm font-semibold text-zinc-200">
              {affiliate.user.name || "Unknown User"}
            </p>
            <p className="text-xs text-zinc-400 font-mono">{affiliate.user.email}</p>
          </div>

          {/* Commission Rate */}
          <div className="space-y-2">
            <Label htmlFor="edit-commission-rate" className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
              Commission Rate (%)
            </Label>
            <div className="relative">
              <Input
                id="edit-commission-rate"
                type="number"
                min={0}
                max={100}
                step={0.1}
                value={commissionRate}
                onChange={(e) => setCommissionRate(e.target.value)}
                placeholder="10"
                className="bg-zinc-950/50 border-zinc-800 text-zinc-200 focus-visible:ring-indigo-500/30 pr-8 text-sm h-10 rounded-xl"
                required
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 text-sm font-bold pointer-events-none">
                %
              </span>
            </div>
            <p className="text-[10px] text-zinc-500">
              Set the partner's share. Entered as a percentage (e.g. 15 for 15%), stored internally as decimal (0.15).
            </p>
          </div>

          {/* Enabled Status Switch */}
          <div className="flex items-center justify-between p-3.5 rounded-xl border border-zinc-800/60 bg-zinc-950/20">
            <div className="space-y-0.5">
              <Label htmlFor="edit-enabled" className="text-xs font-bold text-zinc-300 uppercase tracking-wider cursor-pointer">
                Partner Active Status
              </Label>
              <p className="text-[10px] text-zinc-500">
                Turn off to disable referral commission and link redirects.
              </p>
            </div>
            <Switch
              id="edit-enabled"
              checked={enabled}
              onCheckedChange={setEnabled}
              className="data-[state=checked]:bg-indigo-600"
            />
          </div>

          {/* Admin Notes */}
          <div className="space-y-2">
            <Label htmlFor="edit-admin-notes" className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
              Admin Notes
            </Label>
            <Textarea
              id="edit-admin-notes"
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Internal notes about this affiliate (reason for rate changes, social accounts, details, etc.)..."
              className="bg-zinc-950/50 border-zinc-800 text-zinc-200 placeholder:text-zinc-600 focus-visible:ring-indigo-500/30 resize-none text-sm min-h-[90px] rounded-xl"
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t border-zinc-800/60">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 rounded-xl px-4 text-xs font-semibold"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-4 text-xs font-semibold"
            >
              {loading ? (
                <IconLoader2 className="w-4 h-4 animate-spin mr-1.5" />
              ) : (
                <IconDeviceFloppy className="w-4 h-4 mr-1.5" />
              )}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
