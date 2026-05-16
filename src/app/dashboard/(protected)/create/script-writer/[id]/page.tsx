import { ScriptHeader } from "@/components/dashboard/script-writer/details/script-header"
import { ScriptEditor } from "@/components/dashboard/script-writer/details/script-editor"
import { ScriptRefineSidebar } from "@/components/dashboard/script-writer/details/script-refine-sidebar"
import { MobileRefine } from "@/components/dashboard/script-writer/details/mobile-refine"


import { getScriptDetail } from "@/actions/script-writer"
import { redirect } from "next/navigation"

// Note: Ensure `params` structure matches Next.js App Router rules
export default async function ScriptDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  
  const res = await getScriptDetail(resolvedParams.id);
  
  if (!res.success || !res.data) {
    redirect("/dashboard/create/script-writer");
  }

  const { title, content, refinementSuggestions } = res.data as any;
  
  return (
    <div className="flex flex-col flex-1 h-full max-h-full">
      <div className="shrink-0 mb-4 lg:mb-6">
        <ScriptHeader title={title} />
      </div>
      
      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0 relative">
        <div className="flex-1 min-w-0 h-full pb-28 lg:pb-0">
           <ScriptEditor content={content} title={title} />
        </div>
        <div className="hidden lg:block w-[320px] shrink-0">
           <ScriptRefineSidebar generationId={resolvedParams.id} currentContent={content} suggestions={refinementSuggestions} />
        </div>
      </div>

      {/* Mobile Floating Refine */}
      <div className="lg:hidden fixed bottom-4 left-4 right-4 z-50">
         <MobileRefine generationId={resolvedParams.id} currentContent={content} suggestions={refinementSuggestions} />
      </div>
    </div>
  )
}
