import { getGenerationById } from "@/actions/get-generation";
import { HookDetectorClient } from "@/components/dashboard/hook-detector/hook-detector-client";

export default async function HookDetectorPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const generationId = params.generationId as string | undefined;

  let initialData = null;
  if (generationId) {
    const res = await getGenerationById(generationId);
    if (res.success && res.data) {
      initialData = res.data;
    }
  }

  return <HookDetectorClient initialData={initialData} />;
}
