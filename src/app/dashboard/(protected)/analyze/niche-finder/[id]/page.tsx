import { redirect } from "next/navigation";
import { getNicheGenerationById } from "@/actions/niche-finder";
import { GenerationDetails } from "@/components/dashboard/niche-finder/generation-details";
import { NicheGeneration } from "@/components/dashboard/niche-finder/types";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function NicheGenerationDetailsPage({ params }: PageProps) {
  const { id } = await params;
  const result = await getNicheGenerationById(id);

  if (!result.success || !result.data) {
    redirect("/dashboard/analyze/niche-finder");
  }

  return (
    <div className="flex flex-col items-center w-full min-h-[calc(100vh-4rem)] px-2">
      <GenerationDetails generation={result.data as unknown as NicheGeneration} />
    </div>
  );
}
