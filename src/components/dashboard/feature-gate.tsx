import Link from 'next/link';
import { IconLock } from '@tabler/icons-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { checkFeatureAccess } from '@/lib/plan-guard';
import { Feature, FEATURES } from '@/types/features';
import { Plan } from '@/types/plans';

interface FeatureGateProps {
  plan: Plan;
  feature: Feature;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  title?: string;
  description?: string;
}

export function FeatureGate({
  plan,
  feature,
  children,
  fallback,
  title,
  description,
}: FeatureGateProps) {
  const { allowed, reason } = checkFeatureAccess(plan, feature);

  if (allowed) {
    return <>{children}</>;
  }

  const metadata = FEATURES[feature];

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <Card className="w-full max-w-md mx-auto mt-8 border-dashed">
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
          <IconLock className="w-6 h-6 text-muted-foreground" />
        </div>
        <CardTitle>{title || `Upgrade to access ${metadata.label}`}</CardTitle>
        <CardDescription>
          {description ||
            reason ||
            `This feature is available on a higher plan. Upgrade to unlock ${metadata.label.toLowerCase()} and more.`}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center">
        <Button asChild>
          <Link href="/dashboard/billing">View Plans & Upgrade</Link>
        </Button>
      </CardContent>
      <CardFooter className="text-sm text-muted-foreground text-center">
        Start your free trial today.
      </CardFooter>
    </Card>
  );
}
