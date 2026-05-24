import { IconBrandYoutube, IconChartBar, IconBrain, IconUsers } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function ConnectChannelPrompt() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 bg-card/30 rounded-xl border border-border/50">
      <div className="bg-red-500/10 p-4 rounded-full mb-6">
        <IconBrandYoutube className="w-16 h-16 text-red-500" stroke={1.5} />
      </div>
      <h2 className="text-3xl font-bold mb-3 tracking-tight">Connect Your YouTube Channel</h2>
      <p className="text-muted-foreground mb-8 max-w-md text-lg">
        Unlock deep analytics — views, watch time, subscribers, demographics, traffic sources and more.
      </p>
      
      <Button asChild size="lg" className="px-8 mb-12 text-base font-medium rounded-full bg-red-600 hover:bg-red-700 text-white border-0">
        <Link href="/api/auth/youtube">
          <IconBrandYoutube className="w-5 h-5 mr-2" />
          Connect YouTube
        </Link>
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-3xl">
        <div className="flex flex-col items-center p-4 bg-card/50 rounded-xl border border-border/50">
          <IconChartBar className="w-8 h-8 text-primary mb-3" stroke={1.5} />
          <span className="font-semibold">28+ Metrics</span>
        </div>
        <div className="flex flex-col items-center p-4 bg-card/50 rounded-xl border border-border/50">
          <IconBrain className="w-8 h-8 text-primary mb-3" stroke={1.5} />
          <span className="font-semibold">AI Insights</span>
        </div>
        <div className="flex flex-col items-center p-4 bg-card/50 rounded-xl border border-border/50">
          <IconUsers className="w-8 h-8 text-primary mb-3" stroke={1.5} />
          <span className="font-semibold">Audience Demographics</span>
        </div>
      </div>
    </div>
  );
}
