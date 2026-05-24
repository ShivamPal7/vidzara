import { TopicGeneratorClient } from "@/components/dashboard/topic-generator/topic-generator-client";
import { redirect } from "next/navigation";

export default async function TopicGeneratorPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const generationId = params.generationId as string | undefined;

  if (generationId) {
    redirect(`/dashboard/analyze/topic-generator/${generationId}`);
  }

  return <TopicGeneratorClient />;
}
