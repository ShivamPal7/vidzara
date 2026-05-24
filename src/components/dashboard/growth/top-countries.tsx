import { Card } from "@/components/ui/card";
import { IconMap2 } from "@tabler/icons-react";
import { Progress } from "@/components/ui/progress";

interface TopCountriesProps {
  data: Array<[string, number, number]>; // countryCode, views, watchMinutes
}

export function TopCountries({ data }: TopCountriesProps) {
  const sortedData = [...data].sort((a, b) => b[1] - a[1]).slice(0, 10);
  const maxViews = sortedData.length > 0 ? sortedData[0][1] : 1;

  const getCountryName = (code: string) => {
    try {
      const regionNames = new Intl.DisplayNames(['en'], { type: 'region' });
      return regionNames.of(code) || code;
    } catch {
      return code;
    }
  };

  return (
    <Card className="rounded-xl border border-border/50 bg-card/30 p-5 flex flex-col">
      <div className="flex items-center gap-2 mb-6">
        <IconMap2 className="w-5 h-5 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">Top Geographies</h3>
      </div>
      <div className="space-y-4">
        {sortedData.map(([code, views], i) => (
          <div key={code} className="flex items-center gap-4">
            <div className="w-5 text-center text-sm font-medium text-muted-foreground">{i + 1}</div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium truncate">{getCountryName(code)}</span>
                <span className="font-mono text-muted-foreground">{views.toLocaleString()}</span>
              </div>
              <Progress value={(views / maxViews) * 100} className="h-1.5 bg-primary/20" />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
