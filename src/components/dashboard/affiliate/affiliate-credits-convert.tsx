"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { IconExchange, IconInfoCircle } from "@tabler/icons-react";
import { convertAffiliateCredits } from "@/actions/affiliates";

export function AffiliateCreditsConvert({
  affiliateCredits,
}: {
  affiliateCredits: number;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState(20);

  const usageCredits = Math.floor(amount / 20);
  const estimatedValue = (amount * 0.05).toFixed(2);

  async function handleConvert() {
    if (amount < 20 || amount > affiliateCredits) {
      toast.error("Invalid amount.");
      return;
    }

    setLoading(true);
    const res = await convertAffiliateCredits(amount);
    if (res.success) {
      toast.success(`Successfully converted to ${res.usageCreditsGained} usage credits!`);
      setAmount(20);
      router.refresh();
    } else {
      toast.error(res.error || "Failed to convert credits.");
    }
    setLoading(false);
  }

  return (
    <div className="bg-zinc-950/40 backdrop-blur-xl border border-zinc-800/50 rounded-2xl p-4 sm:p-6 flex flex-col">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 bg-indigo-500/10 rounded-xl text-indigo-400 border border-indigo-500/20">
          <IconExchange className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-base sm:text-lg font-bold text-zinc-100">Convert to Usage Credits</h3>
          <p className="text-xs text-zinc-400">Trade affiliate credits for platform usage</p>
        </div>
      </div>

      <div className="flex-1 space-y-6">
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 flex items-start gap-3">
          <IconInfoCircle className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
          <div className="text-sm text-zinc-300">
            <p><strong>Conversion Rate:</strong> 20 Affiliate Credits = 1 Usage Credit</p>
            <p className="mt-1 text-zinc-500">Instead of withdrawing cash, you can use your earned credits to generate more content on Vidzara.</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-zinc-400">Amount to convert</span>
            <span className="text-zinc-500">Available: {affiliateCredits}</span>
          </div>
          
          <div className="flex items-center gap-4">
            <Input 
              type="number" 
              min={20} 
              step={20}
              max={affiliateCredits}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="bg-zinc-900 border-zinc-700 text-zinc-100 font-mono"
            />
            <Button 
              variant="outline" 
              className="shrink-0 bg-zinc-900 border-zinc-700 hover:bg-zinc-800 hover:text-indigo-400"
              onClick={() => setAmount(Math.floor(affiliateCredits / 20) * 20)}
              disabled={affiliateCredits < 20}
            >
              Max
            </Button>
          </div>
        </div>

        {amount >= 20 && (
          <div className="flex items-center justify-between p-4 rounded-xl bg-zinc-900 border border-zinc-800">
            <div>
              <div className="text-sm text-zinc-400">You will get</div>
              <div className="text-xl font-bold text-emerald-400">+{usageCredits} Usage Credits</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-zinc-400">Value sacrificed</div>
              <div className="text-lg font-medium text-zinc-300">₹{estimatedValue}</div>
            </div>
          </div>
        )}
      </div>

      <Button 
        onClick={handleConvert}
        disabled={loading || amount < 20 || amount > affiliateCredits}
        className="w-full mt-6 bg-indigo-600 hover:bg-indigo-700 text-white"
      >
        {loading ? "Converting..." : "Convert Now"}
      </Button>
    </div>
  );
}
