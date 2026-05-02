import { redirect } from "next/navigation";
import { getTopicGenerationById } from "@/actions/topic-generator";
import { GenerationDetails } from "@/components/dashboard/topic-generator/generation-details";
import { TopicGeneration } from "@/components/dashboard/topic-generator/types";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function TopicGenerationDetailsPage({ params }: PageProps) {
  const { id } = await params;
  const result = await getTopicGenerationById(id);

  if (!result.success || !result.data) {
    redirect("/dashboard/analyze/topic-generator");
  }

  return (
    <div className="flex flex-col items-center w-full min-h-[calc(100vh-4rem)] px-2">
      <GenerationDetails generation={result.data as unknown as TopicGeneration} />
    </div>
  );
}
