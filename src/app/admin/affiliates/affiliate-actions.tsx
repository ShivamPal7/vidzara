"use client";

import { updateAffiliateStatus } from "@/actions/admin/affiliates";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { IconUserCheck, IconUserOff, IconLoader2 } from "@tabler/icons-react";
import { toast } from "sonner";

export function AffiliateActions({ affiliateId, isEnabled }: { affiliateId: string, isEnabled: boolean }) {
  const [loading, setLoading] = useState(false);

  async function handleToggle() {
    try {
      setLoading(true);
      const res = await updateAffiliateStatus(affiliateId, !isEnabled);
      if (res.success) {
        if (isEnabled) {
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
    <Button 
      variant={isEnabled ? "outline" : "default"} 
      size="sm" 
      onClick={handleToggle}
      disabled={loading}
      className={`relative overflow-hidden font-medium transition-all duration-300 active:scale-95 border
        ${isEnabled 
          ? "border-amber-500/20 text-amber-500 bg-amber-500/5 hover:bg-amber-500/10 hover:text-amber-400 hover:border-amber-500/30" 
          : "border-emerald-600/30 bg-emerald-500 text-zinc-950 hover:bg-emerald-400 font-semibold shadow-[0_0_15px_rgba(16,185,129,0.15)]"
        }
      `}
    >
      <span className="flex items-center gap-1.5">
        {loading ? (
          <IconLoader2 className="w-4 h-4 animate-spin" />
        ) : isEnabled ? (
          <IconUserOff className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-0.5" />
        ) : (
          <IconUserCheck className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" />
        )}
        <span>{loading ? "Updating..." : isEnabled ? "Disable Partner" : "Approve & Activate"}</span>
      </span>
    </Button>
  );
}
