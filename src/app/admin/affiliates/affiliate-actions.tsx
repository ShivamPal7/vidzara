"use client";

import { updateAffiliateStatus } from "@/actions/admin/affiliates";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { IconUserCheck, IconUserOff, IconLoader2, IconPencil } from "@tabler/icons-react";
import { toast } from "sonner";
import { EditPartnerDialog } from "@/components/admin/affiliates/edit-partner-dialog";

interface AffiliateActionsProps {
  affiliate: {
    id: string;
    enabled: boolean;
    commissionRate: number;
    adminNotes: string | null;
    user: {
      name: string | null;
      email: string;
    };
  };
}

export function AffiliateActions({ affiliate }: AffiliateActionsProps) {
  const [loading, setLoading] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  async function handleToggle() {
    try {
      setLoading(true);
      const res = await updateAffiliateStatus(affiliate.id, !affiliate.enabled);
      if (res.success) {
        if (affiliate.enabled) {
          toast.warning("Partner status disabled.", {
            description: "The affiliate will no longer receive commission on referrals.",
          });
        } else {
          toast.success("Partner status active!", {
            description: "The affiliate is approved and can start earning commissions.",
          });
        }
      } else {
        toast.error("Failed to update status.");
      }
    } catch (error) {
      console.error(error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="flex items-center justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setEditOpen(true)}
          className="border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 rounded-xl font-medium h-9 px-3 transition-all duration-200"
        >
          <IconPencil className="w-4 h-4 mr-1.5" />
          Edit
        </Button>
        <Button 
          variant={affiliate.enabled ? "outline" : "default"} 
          size="sm" 
          onClick={handleToggle}
          disabled={loading}
          className={`relative overflow-hidden font-medium transition-all duration-300 active:scale-95 border h-9 px-3 rounded-xl
            ${affiliate.enabled 
              ? "border-amber-500/20 text-amber-500 bg-amber-500/5 hover:bg-amber-500/10 hover:text-amber-400 hover:border-amber-500/30" 
              : "border-emerald-600/30 bg-emerald-500 text-zinc-950 hover:bg-emerald-400 font-semibold shadow-[0_0_15px_rgba(16,185,129,0.15)]"
            }
          `}
        >
          <span className="flex items-center gap-1.5">
            {loading ? (
              <IconLoader2 className="w-4 h-4 animate-spin" />
            ) : affiliate.enabled ? (
              <IconUserOff className="w-4 h-4" />
            ) : (
              <IconUserCheck className="w-4 h-4" />
            )}
            <span>{loading ? "Updating..." : affiliate.enabled ? "Disable" : "Approve & Activate"}</span>
          </span>
        </Button>
      </div>

      <EditPartnerDialog
        affiliate={affiliate}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
    </>
  );
}
