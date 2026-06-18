import { IconGhost } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center bg-muted/10 rounded-xl border border-dashed p-8">
      <div className="bg-muted/50 p-4 rounded-full mb-4">
        <IconGhost className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold">No generations yet</h3>
      <p className="text-sm text-muted-foreground max-w-sm mt-1 mb-6">
        You haven't generated any content yet. Start by creating your first script or checking your hook.
      </p>
      <Button asChild>
        <Link href="/dashboard/create/script-writer">
          Create First Script
        </Link>
      </Button>
    </div>
  )
}
