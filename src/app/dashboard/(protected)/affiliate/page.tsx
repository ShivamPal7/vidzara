import { getAffiliateStatus } from '@/actions/affiliates';
import { AffiliateApplyForm } from '@/components/dashboard/affiliate/affiliate-apply-form';
import { PendingStatusCard } from '@/components/dashboard/affiliate/pending-status-card';
import { AffiliateDashboard } from '@/components/dashboard/affiliate/affiliate-dashboard';

export const metadata = { title: 'Earn Program - Vidzara' };

export default async function AffiliatePage() {
  const affiliateStatus = await getAffiliateStatus();
  
  if (affiliateStatus.status === 'approved' && affiliateStatus.affiliate) {
    return <AffiliateDashboard affiliate={affiliateStatus.affiliate} />;
  }
  
  if (affiliateStatus.status === 'pending' && affiliateStatus.application) {
    return <PendingStatusCard application={affiliateStatus.application} />;
  }
  
  // none or rejected - show apply form
  return (
    <div className="max-w-4xl mx-auto py-8 w-full">
      <AffiliateApplyForm 
        rejectedApplication={affiliateStatus.status === 'rejected' && affiliateStatus.application ? affiliateStatus.application : undefined} 
      />
    </div>
  );
}
