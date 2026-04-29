import type { RecentScript } from "@/components/dashboard/script-writer/recent-scripts";

export function mapGenerationToRecentScript(generation: {
  id: string;
  output: any;
  createdAt: Date;
}): RecentScript {
  const output = generation.output as any;
  const title = output?.title || "Untitled Script";

  return {
    id: generation.id,
    title,
    createdAt: generation.createdAt,
  };
}

export function mapGenerationToScriptDetail(generation: {
  id: string;
  input: any;
  output: any;
  createdAt: Date;
}) {
  const output = generation.output as any;
  
  return {
    id: generation.id,
    title: output?.title || "Untitled Script",
    content: output?.content || "",
    createdAt: generation.createdAt,
    input: generation.input as any,
  };
}
