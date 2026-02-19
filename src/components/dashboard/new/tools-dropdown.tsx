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
    icon: FileText,
    label: "Script Writer",
    description: "Write compelling scripts",
  },
  {
    icon: Search,
    label: "Video SEO",
    description: "Title, description, tags & keywords",
  },
  {
    icon: Lightbulb,
    label: "Topic Generator",
    description: "Discover trending topic ideas",
  },
  {
    icon: ImageIcon,
    label: "Thumbnail Concepts",
    description: "Generate thumbnail ideas",
  },
  {
    icon: Zap,
    label: "Hook Generator",
    description: "Create attention-grabbing hooks",
  },
  {
    icon: Scissors,
    label: "Script Shortener",
    description: "Trim scripts for maximum impact",
  },
]

export function ToolsDropdown() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="secondary"
          size="sm"
          className="h-9 gap-1.5 rounded-lg px-3 text-xs font-medium"
        >
          <Settings2 className="size-4" />
          Tools
          <ChevronDown className="size-3 opacity-60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        sideOffset={8}
        className="w-72 rounded-xl p-2"
      >
        {tools.map((tool) => (
          <DropdownMenuItem
            key={tool.label}
            className="flex items-center gap-3 rounded-lg px-3 py-3 cursor-pointer"
          >
            <div className="flex items-center justify-center size-10 rounded-lg bg-muted/80">
              <tool.icon className="size-5 text-foreground" />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-medium text-foreground">
                {tool.label}
              </span>
              <span className="text-xs text-muted-foreground">
                {tool.description}
              </span>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
