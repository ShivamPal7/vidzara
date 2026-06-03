"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { IconCopy, IconCheck, IconShare, IconUsers } from "@tabler/icons-react";

export function AffiliateReferralLink({
  referralCode,
  referrals,
}: {
  referralCode: string;
  referrals: any[];
}) {
  const [copied, setCopied] = useState(false);
  const referralUrl = `https://vidzara.com/?ref=${referralCode}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralUrl);
    setCopied(true);
    toast.success("Referral link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const creditedSignups = referrals.filter(r => r.status === "CREDITED" || r.status === "PAID").length;

  return (
    <div className="relative overflow-hidden bg-zinc-950/40 backdrop-blur-xl border border-zinc-800/50 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
      <div className="absolute -left-24 -bottom-24 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute right-0 top-0 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />
      
      <div className="relative z-10 flex-1 space-y-4">
        <div>
          <h3 className="text-xl font-bold text-zinc-100">Your Referral Link</h3>
          <p className="text-sm text-zinc-400 mt-1 max-w-xl">
            Share this link with your audience. You'll earn affiliate credits for every new user who signs up through your link.
          </p>
        </div>

        <div className="flex items-center gap-2 max-w-lg">
          <Input 
            readOnly 
            value={referralUrl}
            className="bg-zinc-900 border-zinc-700 text-zinc-300 font-mono text-sm h-11"
          />
          <Button 
            onClick={copyToClipboard}
            variant={copied ? "default" : "secondary"}
            className={`h-11 shrink-0 ${copied ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200'}`}
          >
            {copied ? <IconCheck className="w-4 h-4 mr-2" /> : <IconCopy className="w-4 h-4 mr-2" />}
            {copied ? "Copied" : "Copy"}
          </Button>
        </div>
      </div>

      <div className="relative z-10 flex items-center gap-4 bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 shrink-0 w-full md:w-auto">
        <div className="p-3 bg-indigo-500/10 rounded-lg text-indigo-400">
          <IconUsers className="w-6 h-6" />
        </div>
        <div>
          <div className="text-2xl font-bold text-zinc-100">{creditedSignups}</div>
          <div className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Credited Signups</div>
        </div>
      </div>
    </div>
  );
}
