import { IconBulb } from "@tabler/icons-react";

export function TopicGeneratorHeader() {
  return (
    <div className="flex flex-col items-center text-center space-y-4">
      <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
        <IconBulb className="h-6 w-6 text-primary" />
      </div>
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Topic Generator</h1>
        <p className="text-muted-foreground max-w-[600px]">
          Analyze competitor channels to discover top-performing content and generate viral ideas.
        </p>
      </div>
    </div>
  );
}
