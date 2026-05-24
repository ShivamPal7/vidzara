import { redirect } from "next/navigation";
import VideoSeoClient from "./video-seo-client";

export default async function VideoSeoPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const generationId = params.generationId as string | undefined;

  if (generationId) {
    redirect(`/dashboard/create/video-seo/${generationId}`);
  }

  return <VideoSeoClient />;
}
