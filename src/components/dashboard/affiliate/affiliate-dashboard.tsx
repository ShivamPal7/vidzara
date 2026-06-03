"use client";

import { AffiliateStatsCards } from "./affiliate-stats-cards";
import { AffiliateReferralLink } from "./affiliate-referral-link";
import { AffiliateCreditsConvert } from "./affiliate-credits-convert";
import { WithdrawalForm } from "./withdrawal-form";
import { AffiliateTransactionsTable } from "./affiliate-transactions-table";

export function AffiliateDashboard({
  affiliate,
}: {
  affiliate: any;
}) {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <AffiliateStatsCards affiliate={affiliate} />
      
      <AffiliateReferralLink 
        referralCode={affiliate.referralCode} 
        referrals={affiliate.referrals} 
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AffiliateCreditsConvert affiliateCredits={affiliate.affiliateCredits} />
        <WithdrawalForm 
          affiliateCredits={affiliate.affiliateCredits} 
          withdrawalRequests={affiliate.withdrawalRequests} 
        />
      </div>
      
      <AffiliateTransactionsTable 
        referrals={affiliate.referrals} 
        withdrawals={affiliate.withdrawalRequests} 
      />
    </div>
  );
}
