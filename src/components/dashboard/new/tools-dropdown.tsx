"use client"

import {
  Settings2,
  ChevronDown,
  FileText,
  Search,
  Lightbulb,
  Image as ImageIcon,
  Zap,
  Scissors,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const tools = [
  {
    id: "script-writer",
    icon: FileText,
    label: "Script Writer",
    description: "Write compelling scripts",
  },
  {
    id: "video-seo",
    icon: Search,
    label: "Video SEO",
    description: "Title, description, tags & keywords",
  },
  {
    id: "topic-generator",
    icon: Lightbulb,
    label: "Topic Generator",
    description: "Discover trending topic ideas",
  },
  {
    id: "thumbnail-concepts",
    icon: ImageIcon,
    label: "Thumbnail Concepts",
    description: "Generate thumbnail ideas",
  },
  {
    id: "hook-generator",
    icon: Zap,
    label: "Hook Generator",
    description: "Create attention-grabbing hooks",
  },
  {
    id: "script-shortener",
    icon: Scissors,
    label: "Script Shortener",
    description: "Trim scripts for maximum impact",
  },
]

interface ToolsDropdownProps {
  value: string
  onChange: (value: string) => void
}

export function ToolsDropdown({ value, onChange }: ToolsDropdownProps) {
  const selectedTool = tools.find((t) => t.id === value)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="secondary"
          size="sm"
          className="h-9 gap-1.5 rounded-lg px-2.5 sm:px-3 text-xs font-medium"
        >
          {selectedTool ? (
            <>
              <selectedTool.icon className="size-4" />
              <span className="hidden sm:inline">{selectedTool.label}</span>
              {/* X to clear tool selection */}
            </>
          ) : (
            <>
              <Settings2 className="size-4" />
              <span className="hidden sm:inline">Tools</span>
            </>
          )}
          <ChevronDown className="size-3 opacity-60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        sideOffset={8}
        className="w-72 rounded-xl p-2"
      >
        {/* Clear selection option */}
        {value && (
          <DropdownMenuItem
            onClick={() => onChange("")}
            className="flex items-center gap-3 rounded-lg px-3 py-2 cursor-pointer mb-1"
          >
            <div className="flex items-center justify-center size-10 rounded-lg bg-muted/80">
              <Settings2 className="size-5 text-muted-foreground" />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-medium text-foreground">YouTube Coach (Default)</span>
              <span className="text-xs text-muted-foreground">Chat with your AI coach</span>
            </div>
          </DropdownMenuItem>
        )}

        {tools.map((tool) => (
          <DropdownMenuItem
            key={tool.id}
            onClick={() => onChange(tool.id)}
            className="flex items-center gap-3 rounded-lg px-3 py-3 cursor-pointer"
          >
            <div className="flex items-center justify-center size-10 rounded-lg bg-muted/80">
              <tool.icon className="size-5 text-foreground" />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-medium text-foreground">{tool.label}</span>
              <span className="text-xs text-muted-foreground">{tool.description}</span>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
