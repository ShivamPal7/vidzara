import { CompetitorsView } from "@/components/dashboard/competitors/competitors-view";

export const metadata = {
  title: "Competitors | Vidzara",
  description: "Track and analyze competitor performance",
};

export default function CompetitorsPage() {
  return (
    <div className="flex-1 space-y-4 px-2 md:px-4 pt-2 md:pt-0">
      <CompetitorsView />
    </div>
  );
}
