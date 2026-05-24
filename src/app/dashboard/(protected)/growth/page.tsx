import { ConnectChannelPrompt } from "@/components/dashboard/growth/connect-channel";
import { ChannelHeader } from "@/components/dashboard/growth/channel-header";
import { PeriodSelector } from "@/components/dashboard/growth/period-selector";
import { KPICards } from "@/components/dashboard/growth/kpi-cards";
import { ViewsChart } from "@/components/dashboard/growth/views-chart";
import { SubscriberChart } from "@/components/dashboard/growth/subscriber-chart";
import { TrafficSources } from "@/components/dashboard/growth/traffic-sources";
import { DeviceBreakdown } from "@/components/dashboard/growth/device-breakdown";
import { Demographics } from "@/components/dashboard/growth/demographics";
import { TopCountries } from "@/components/dashboard/growth/top-countries";
import { TopVideosTable } from "@/components/dashboard/growth/top-videos-table";
import { ChannelHealthScore } from "@/components/dashboard/growth/channel-health-score";
import { 
  getConnectedChannel, 
  getKPIMetrics, 
  getViewsChartData, 
  getSubscriberChartData, 
  getTrafficSources, 
  getDemographics, 
  getTopCountries, 
  getDeviceBreakdown, 
  getTopVideos 
} from "@/actions/growth-analytics";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { IconInfoCircle } from "@tabler/icons-react";

// Mock Data as fallback when Google APIs are in sandbox/development mode or return errors
const mockKPI = {
  views: { value: 142830, delta: 12.4 },
  watchTime: { value: 4201, delta: 8.1 },
  netSubscribers: { value: 1284, delta: 22.3 },
  impressions: { value: 892100, delta: -3.2 },
  ctr: { value: 4.8, delta: 0.6 },
  avgViewDuration: { value: "4:32", delta: 5.1 },
};

const mockViewsData: Array<[string, number, number]> = Array.from({ length: 28 }).map((_, i) => {
  const d = new Date();
  d.setDate(d.getDate() - (28 - i));
  return [
    d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    Math.floor(Math.random() * 5000) + 1000,
    Math.floor(Math.random() * 500) + 100, // minutes
  ];
});

const mockSubscriberData: Array<[string, number, number]> = Array.from({ length: 28 }).map((_, i) => {
  const d = new Date();
  d.setDate(d.getDate() - (28 - i));
  return [
    d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    Math.floor(Math.random() * 50) + 10, // gained
    Math.floor(Math.random() * 20), // lost
  ];
});

const mockTrafficSources: Array<[string, number, number]> = [
  ["YT_SEARCH", 45000, 1200],
  ["SUGGESTED_VIDEO", 35000, 950],
  ["BROWSE_FEATURES", 25000, 800],
  ["EXT_URL", 15000, 400],
  ["DIRECT_OR_UNKNOWN", 10000, 200],
  ["NOTIFICATION", 5000, 150],
  ["PLAYLIST", 2000, 50],
];

const mockDeviceBreakdown: Array<[string, number]> = [
  ["MOBILE", 85000],
  ["DESKTOP", 45000],
  ["TV", 15000],
  ["TABLET", 10000],
  ["GAME_CONSOLE", 2000],
];

const mockDemographics: Array<[string, string, number]> = [
  ["age1824", "male", 25.5],
  ["age1824", "female", 12.0],
  ["age2534", "male", 30.2],
  ["age2534", "female", 15.1],
  ["age3544", "male", 10.5],
  ["age3544", "female", 5.2],
  ["age4554", "male", 1.0],
  ["age4554", "female", 0.5],
];

const mockTopCountries: Array<[string, number, number]> = [
  ["IN", 65000, 1800],
  ["US", 45000, 1500],
  ["GB", 15000, 450],
  ["CA", 10000, 300],
  ["AU", 5000, 150],
  ["DE", 2000, 80],
];

const mockTopVideos = [
  { id: "1", title: "10 React Hooks You Should Know", views: 45000, watchTime: 1200, likes: 2500, ctr: 5.2, avgDuration: "5:30" },
  { id: "2", title: "Next.js 14 App Router Crash Course", views: 35000, watchTime: 1800, likes: 1800, ctr: 4.8, avgDuration: "8:15" },
  { id: "3", title: "TypeScript Generics Explained", views: 25000, watchTime: 800, likes: 1200, ctr: 6.1, avgDuration: "4:45" },
  { id: "4", title: "Tailwind CSS Best Practices", views: 15000, watchTime: 450, likes: 800, ctr: 3.5, avgDuration: "3:20" },
  { id: "5", title: "Building a SaaS with Next.js and Prisma", views: 10000, watchTime: 600, likes: 500, ctr: 7.2, avgDuration: "12:00" },
];

const mockHealthScore = {
  score: 82,
  strengths: ["High click-through rate on recent videos", "Strong subscriber growth this week", "Good audience retention on tutorials"],
  weaknesses: ["Low upload frequency", "Descriptions missing key tags", "Thumbnails lack consistent branding"],
  actionItems: ["Post at least 2 times per week", "Update descriptions on top 5 videos", "Create a reusable thumbnail template"],
};

export default async function GrowthDashboardPage(props: {
  searchParams?: Promise<{ period?: string }>;
}) {
  const searchParams = await props.searchParams;
  const period = searchParams?.period || '28d';

  // Check YouTube connection
  const connectionResult = await getConnectedChannel();

  if (!connectionResult.success || !connectionResult.data) {
    return <ConnectChannelPrompt />;
  }

  const channel = connectionResult.data;

  // Try to load real analytics data
  let kpiData = null;
  let viewsData = null;
  let subscriberData = null;
  let trafficSourcesData = null;
  let demographicsData = null;
  let topCountriesData = null;
  let deviceBreakdownData = null;
  let topVideosData = null;
  let isDemoData = false;
  let apiErrorMessage = "";

  try {
    const [
      kpiRes,
      viewsRes,
      subRes,
      trafficRes,
      demoRes,
      countriesRes,
      deviceRes,
      videosRes
    ] = await Promise.all([
      getKPIMetrics(period),
      getViewsChartData(period),
      getSubscriberChartData(period),
      getTrafficSources(period),
      getDemographics(period),
      getTopCountries(period),
      getDeviceBreakdown(period),
      getTopVideos(period)
    ]);

    if (kpiRes.success && kpiRes.data) {
      // Parse real KPI data
      const current = kpiRes.data.current;
      const previous = kpiRes.data.previous;
      
      const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
      };

      const calculateDelta = (curr: number, prev: number) => {
        if (!prev) return 0;
        return Number((((curr - prev) / prev) * 100).toFixed(1));
      };

      const currViews = Number(current[0] || 0);
      const prevViews = Number(previous[0] || 0);

      const currMinutes = Number(current[1] || 0);
      const prevMinutes = Number(previous[1] || 0);

      const currGained = Number(current[2] || 0);
      const currLost = Number(current[3] || 0);
      const prevGained = Number(previous[2] || 0);
      const prevLost = Number(previous[3] || 0);

      const currImpressions = Number(current[4] || 0);
      const prevImpressions = Number(previous[4] || 0);

      const currCTR = Number(current[5] || 0);
      const prevCTR = Number(previous[5] || 0);

      const currDuration = Number(current[6] || 0);
      const prevDuration = Number(previous[6] || 0);

      kpiData = {
        views: { value: currViews, delta: calculateDelta(currViews, prevViews) },
        watchTime: { value: Number((currMinutes / 60).toFixed(1)), delta: calculateDelta(currMinutes, prevMinutes) },
        netSubscribers: { value: currGained - currLost, delta: calculateDelta(currGained - currLost, prevGained - prevLost) },
        impressions: { value: currImpressions, delta: calculateDelta(currImpressions, prevImpressions) },
        ctr: { value: Number(currCTR.toFixed(2)), delta: calculateDelta(currCTR, prevCTR) },
        avgViewDuration: { value: formatDuration(currDuration), delta: calculateDelta(currDuration, prevDuration) }
      };
    }

    if (viewsRes.success && viewsRes.data) {
      viewsData = viewsRes.data.map((row: any) => [
        new Date(row[0]).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        Number(row[1] || 0),
        Number(row[2] || 0)
      ]) as Array<[string, number, number]>;
    }

    if (subRes.success && subRes.data) {
      subscriberData = subRes.data.map((row: any) => [
        new Date(row[0]).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        Number(row[1] || 0),
        Number(row[2] || 0)
      ]) as Array<[string, number, number]>;
    }

    if (trafficRes.success && trafficRes.data) {
      trafficSourcesData = trafficRes.data.map((row: any) => [
        String(row[0] || '').replace('trafficSourceType.', ''),
        Number(row[1] || 0),
        Number(row[2] || 0)
      ]) as Array<[string, number, number]>;
    }

    if (demoRes.success && demoRes.data) {
      demographicsData = demoRes.data.map((row: any) => [
        String(row[0] || ''),
        String(row[1] || ''),
        Number(row[2] || 0)
      ]) as Array<[string, string, number]>;
    }

    if (countriesRes.success && countriesRes.data) {
      topCountriesData = countriesRes.data.map((row: any) => [
        String(row[0] || ''),
        Number(row[1] || 0),
        Number(row[2] || 0)
      ]) as Array<[string, number, number]>;
    }

    if (deviceRes.success && deviceRes.data) {
      deviceBreakdownData = deviceRes.data.map((row: any) => [
        String(row[0] || ''),
        Number(row[1] || 0)
      ]) as Array<[string, number]>;
    }

    if (videosRes.success && videosRes.data) {
      topVideosData = videosRes.data.map((row: any, idx: number) => ({
        id: String(idx + 1),
        title: `Video ${row[0] || idx + 1}`,
        views: Number(row[1] || 0),
        watchTime: Number(row[2] || 0),
        likes: Number(row[3] || 0),
        ctr: Number(row[5] || 0),
        avgDuration: `${Math.floor(Number(row[4] || 0) / 60)}:${Math.floor(Number(row[4] || 0) % 60).toString().padStart(2, '0')}`
      }));
    }

    // If critical parts of data are missing, use fallbacks gracefully without throwing a scary console error
    if (!kpiData || !viewsData) {
      isDemoData = true;
      apiErrorMessage = "No active video views or upload history found for this period. Showing high-fidelity simulated metrics.";
    }
  } catch (err) {
    console.error("[Growth Dashboard API Error]", err);
    isDemoData = true;
    apiErrorMessage = err instanceof Error ? err.message : "Unable to reach Google YouTube Analytics API";
  }

  // Ensure fully formatted fallbacks
  const finalKPI = isDemoData ? mockKPI : kpiData!;
  const finalViews = isDemoData ? mockViewsData : viewsData!;
  const finalSubs = isDemoData ? mockSubscriberData : subscriberData!;
  const finalTraffic = isDemoData ? mockTrafficSources : trafficSourcesData!;
  const finalDemo = isDemoData ? mockDemographics : demographicsData!;
  const finalCountries = isDemoData ? mockTopCountries : topCountriesData!;
  const finalDevice = isDemoData ? mockDeviceBreakdown : deviceBreakdownData!;
  const finalTopVideos = isDemoData ? mockTopVideos : topVideosData!;

  return (
    <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto px-2 sm:px-4 md:px-6 py-4 sm:py-6 w-full min-w-0 overflow-hidden">
      <ChannelHeader
        channelTitle={channel.channelTitle}
        channelHandle={channel.channelHandle || `@${channel.channelTitle.toLowerCase().replace(/\s+/g, '')}`}
        thumbnailUrl={channel.thumbnailUrl || "https://github.com/shadcn.png"}
        subscriberCount={Number(channel.subscriberCount)}
      />

      {isDemoData && (
        <Alert className="bg-amber-500/10 border-amber-500/20 text-amber-200">
          <IconInfoCircle className="w-5 h-5 text-amber-500" />
          <AlertTitle className="font-semibold text-amber-400">Sandbox Preview Mode</AlertTitle>
          <AlertDescription className="text-amber-300/90 text-sm">
            We connected to your channel, but couldn't load official YouTube Analytics ({apiErrorMessage}). 
            Displaying simulated high-fidelity metrics for previewing the Vidzara operating system.
          </AlertDescription>
        </Alert>
      )}
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Analytics Overview</h2>
          <p className="text-sm text-muted-foreground">Monitor your channel's performance metrics.</p>
        </div>
        <PeriodSelector />
      </div>
      
      <KPICards data={finalKPI} />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-w-0 w-full overflow-hidden">
        <ViewsChart data={finalViews} />
        <SubscriberChart data={finalSubs} />
      </div>
      
      <TopVideosTable data={finalTopVideos} />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-w-0 w-full overflow-hidden">
        <TrafficSources data={finalTraffic} />
        <DeviceBreakdown data={finalDevice} />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start min-w-0 w-full overflow-hidden">
        <div className="space-y-6 min-w-0 w-full overflow-hidden">
          <Demographics data={finalDemo} />
          <TopCountries data={finalCountries} />
        </div>
        <div className="min-w-0 w-full overflow-hidden">
          <ChannelHealthScore {...mockHealthScore} />
        </div>
      </div>
    </div>
  );
}
