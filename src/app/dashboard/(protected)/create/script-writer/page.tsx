import { redirect } from "next/navigation";
import ScriptWriterClient from "./script-writer-client";

export default async function ScriptWriterPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const generationId = params.generationId as string | undefined;

  if (generationId) {
    redirect(`/dashboard/create/script-writer/${generationId}`);
  }

  return <ScriptWriterClient />;
}
