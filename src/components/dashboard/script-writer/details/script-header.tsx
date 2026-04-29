"use client"

import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface ScriptHeaderProps {
  title: string
}

export function ScriptHeader({ title }: ScriptHeaderProps) {
  return (
    <div className="flex items-center gap-3">
      <Button variant="ghost" size="icon" asChild className="rounded-full size-9 shrink-0">
        <Link href="/dashboard/create/script-writer">
          <ArrowLeft className="size-4" />
        </Link>
      </Button>
      <h1 className="text-lg sm:text-xl font-semibold text-foreground truncate">{title}</h1>
    </div>
  )
}
