import { NicheFinderClient } from "@/components/dashboard/niche-finder/niche-finder-client";
import { redirect } from "next/navigation";

export default async function NicheFinderPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const generationId = params.generationId as string | undefined;

  if (generationId) {
    redirect(`/dashboard/analyze/niche-finder/${generationId}`);
  }

  return <NicheFinderClient />;
}
