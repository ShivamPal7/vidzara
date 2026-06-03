"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IconCashBanknote, IconClock, IconAlertCircle } from "@tabler/icons-react";
import { requestWithdrawal } from "@/actions/affiliates";

export function WithdrawalForm({
  affiliateCredits,
  withdrawalRequests,
}: {
  affiliateCredits: number;
  withdrawalRequests: any[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState(Math.max(20000, Math.min(20000, affiliateCredits)));
  const [method, setMethod] = useState<"UPI" | "BANK" | "PAYPAL">("UPI");

  const pendingRequest = withdrawalRequests.find(r => r.status === "PENDING");
  
  if (pendingRequest) {
    return (
      <div className="bg-zinc-950/40 backdrop-blur-xl border border-amber-500/20 rounded-2xl p-6 flex flex-col items-center justify-center text-center space-y-4">
        <div className="p-4 bg-amber-500/10 rounded-full text-amber-400">
          <IconClock className="w-8 h-8 animate-pulse" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-amber-400 mb-2">Withdrawal Pending</h3>
          <p className="text-sm text-zinc-400">
            You have a pending withdrawal request for <strong className="text-zinc-200">{pendingRequest.creditsAmount.toLocaleString()} credits</strong> (₹{pendingRequest.monetaryAmount.toString()}).
          </p>
          <p className="text-xs text-zinc-500 mt-2">
            Please wait for our team to process this request before submitting another one. Payouts are usually processed within 3-5 business days.
          </p>
        </div>
      </div>
    );
  }

  const minCredits = 20000;
  const monetaryValue = (amount * 0.05).toFixed(2);
  const isEligible = affiliateCredits >= minCredits;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (amount < minCredits || amount > affiliateCredits) return;
    
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    
    const data = {
      creditsAmount: amount,
      currency: "INR" as const,
      method,
      paymentDetails: {
        upiId: method === "UPI" ? formData.get("upiId") as string : undefined,
        accountNumber: method === "BANK" ? formData.get("accountNumber") as string : undefined,
        ifsc: method === "BANK" ? formData.get("ifsc") as string : undefined,
        bankName: method === "BANK" ? formData.get("bankName") as string : undefined,
        paypalEmail: method === "PAYPAL" ? formData.get("paypalEmail") as string : undefined,
      }
    };

    const res = await requestWithdrawal(data);
    if (res.success) {
      toast.success("Withdrawal request submitted successfully!");
      router.refresh();
    } else {
      toast.error(res.error || "Failed to submit request.");
    }
    setLoading(false);
  }

  return (
    <div className="bg-zinc-950/40 backdrop-blur-xl border border-zinc-800/50 rounded-2xl p-6 flex flex-col">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-400 border border-emerald-500/20">
          <IconCashBanknote className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-zinc-100">Request Payout</h3>
          <p className="text-xs text-zinc-400">Withdraw your earnings to your account</p>
        </div>
      </div>

      {!isEligible ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6 border border-dashed border-zinc-800 rounded-xl">
          <IconAlertCircle className="w-8 h-8 text-zinc-600 mb-3" />
          <p className="text-sm text-zinc-400">
            You need a minimum of <strong className="text-zinc-200">20,000 credits (₹1,000)</strong> to request a payout.
          </p>
          <p className="text-xs text-zinc-500 mt-1">Keep referring creators to reach the threshold!</p>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="flex-1 space-y-6">
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-zinc-400">Credits to withdraw</span>
              <span className="text-zinc-500">Available: {affiliateCredits}</span>
            </div>
            
            <div className="flex items-center gap-4">
              <Input 
                type="number" 
                min={minCredits} 
                step={1}
                max={affiliateCredits}
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="bg-zinc-900 border-zinc-700 text-zinc-100 font-mono"
              />
              <Button 
                type="button"
                variant="outline" 
                className="shrink-0 bg-zinc-900 border-zinc-700 hover:bg-zinc-800 hover:text-emerald-400"
                onClick={() => setAmount(affiliateCredits)}
              >
                Max
              </Button>
            </div>
            <div className="text-right text-sm">
              <span className="text-zinc-400">You will receive: </span>
              <span className="font-bold text-emerald-400">₹{monetaryValue}</span>
            </div>
          </div>

          <div className="space-y-4">
            <Label>Payout Method</Label>
            <div className="flex gap-2">
              {["UPI", "BANK", "PAYPAL"].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMethod(m as any)}
                  className={`flex-1 py-2 text-xs font-medium rounded-lg border transition-all ${
                    method === m 
                      ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400' 
                      : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  {m === "BANK" ? "Bank Transfer" : m}
                </button>
              ))}
            </div>

            {method === "UPI" && (
              <div className="space-y-2">
                <Label htmlFor="upiId">UPI ID</Label>
                <Input id="upiId" name="upiId" placeholder="username@bank" required className="bg-zinc-900 border-zinc-800" />
              </div>
            )}
            
            {method === "PAYPAL" && (
              <div className="space-y-2">
                <Label htmlFor="paypalEmail">PayPal Email</Label>
                <Input id="paypalEmail" name="paypalEmail" type="email" placeholder="email@example.com" required className="bg-zinc-900 border-zinc-800" />
              </div>
            )}

            {method === "BANK" && (
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="accountNumber">Account Number</Label>
                  <Input id="accountNumber" name="accountNumber" required className="bg-zinc-900 border-zinc-800" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="ifsc">IFSC Code</Label>
                    <Input id="ifsc" name="ifsc" required className="bg-zinc-900 border-zinc-800" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bankName">Bank Name</Label>
                    <Input id="bankName" name="bankName" required className="bg-zinc-900 border-zinc-800" />
                  </div>
                </div>
              </div>
            )}
          </div>

          <Button 
            type="submit" 
            disabled={loading || amount < minCredits || amount > affiliateCredits}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {loading ? "Submitting..." : "Submit Request"}
          </Button>
        </form>
      )}
    </div>
  );
}
