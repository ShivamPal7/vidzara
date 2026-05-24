import { redirect } from "next/navigation";
import ThumbnailClient from "./thumbnail-client";

export default async function ThumbnailGeneratorPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const generationId = params.generationId as string | undefined;

  if (generationId) {
    redirect(`/dashboard/create/thumbnail/${generationId}`);
  }

  return <ThumbnailClient />;
}
