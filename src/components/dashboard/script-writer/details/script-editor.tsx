"use client"

import { useState } from "react"
import { Undo2, Redo2, Copy, Download, Check } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ScriptEditorProps {
  content: string
}

export function ScriptEditor({ content }: ScriptEditorProps) {
  const [hasCopied, setHasCopied] = useState(false)

  // Quick helper to strip HTML tags for raw text output
  const getRawText = () => {
    if (typeof document === "undefined") return content
    const tempDiv = document.createElement("div")
    tempDiv.innerHTML = content
    return tempDiv.textContent || tempDiv.innerText || ""
  }

  const handleCopy = async () => {
    const text = getRawText()
    try {
      await navigator.clipboard.writeText(text)
      setHasCopied(true)
      setTimeout(() => setHasCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy", err)
    }
  }

  const handleDownload = () => {
    const text = getRawText()
    const blob = new Blob([text], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "vidzara-script.txt"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex flex-col h-full rounded-2xl border border-border/40 bg-card/30 backdrop-blur-sm overflow-hidden">
      {/* Toolbar */}
      <div className="flex justify-between items-center px-3 py-1.5 border-b border-border/40">
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" disabled className="size-8 text-muted-foreground hover:text-foreground opacity-50 cursor-not-allowed">
            <Undo2 className="size-4" />
          </Button>
          <Button variant="ghost" size="icon" disabled className="size-8 text-muted-foreground hover:text-foreground opacity-50 cursor-not-allowed">
            <Redo2 className="size-4" />
          </Button>
        </div>
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleCopy}
            className="size-8 text-muted-foreground hover:text-foreground"
          >
            {hasCopied ? <Check className="size-4 text-emerald-500" /> : <Copy className="size-4" />}
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleDownload}
            className="size-8 text-muted-foreground hover:text-foreground"
          >
            <Download className="size-4" />
          </Button>
        </div>
      </div>
      
      {/* Editor Area */}
      <div className="p-5 sm:p-6 lg:p-8 flex-1 overflow-y-auto">
        <div 
          className="max-w-3xl mx-auto [&>h3]:text-foreground [&>h3]:font-semibold [&>h3]:text-base [&>h3]:mb-2 [&>h3]:mt-6 [&>h3:first-child]:mt-0 [&>p]:text-muted-foreground/90 [&>p]:text-[15px] [&>p]:leading-relaxed [&>p]:mb-4 last:[&>p]:mb-0 [&>strong]:text-foreground [&>strong]:font-semibold"
          dangerouslySetInnerHTML={{ __html: content }} 
        />
      </div>
    </div>
  )
}
