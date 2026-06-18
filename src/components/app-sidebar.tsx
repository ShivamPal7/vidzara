"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import Image from "next/image"
import { cn } from "@/lib/utils"
import {
  IconFileText,
  IconSearch,
  IconPhoto,
  IconScissors,
  IconTarget,
  IconShieldCheck,
  IconBulb,
  IconEye,
  IconCompass,
  IconChecklist,
  IconTrendingUp,
  IconHistory,
  IconCoins,
  IconUsers,
  IconSettings,
  IconCirclePlusFilled,
} from "@tabler/icons-react"

import { NavUser } from "@/components/nav-user"
import { Button } from "@/components/ui/button"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  useSidebar,
} from "@/components/ui/sidebar"
import { CreditsIndicator } from "@/components/dashboard/credits-indicator"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { setOpenMobile, isMobile } = useSidebar()
  const pathname = usePathname()

  React.useEffect(() => {
    setOpenMobile(false)
  }, [pathname, setOpenMobile])

  // Explicit grouped navigation structure meeting strict guidelines
  const navigationGroups = [
    {
      label: "Create",
      items: [
        { title: "Script Writer", url: "/dashboard/create/script-writer", icon: IconFileText },
        { title: "Video SEO Generator", url: "/dashboard/create/video-seo", icon: IconSearch },
        { title: "Thumbnail Concepts", url: "/dashboard/create/thumbnail", icon: IconPhoto },
      ]
    },
    {
      label: "Optimize",
      items: [
        { title: "Script Shortener", url: "/dashboard/optimize/script-shortener", icon: IconScissors },
        { title: "Hook Detector", url: "/dashboard/optimize/hook-detector", icon: IconTarget },
        { title: "Content Safety", url: "/dashboard/optimize/content-safety", icon: IconShieldCheck },
      ]
    },
    {
      label: "Analyze",
      items: [
        { title: "Topic Generator", url: "/dashboard/analyze/topic-generator", icon: IconBulb },
        { title: "Competitors", url: "/dashboard/analyze/competitors", icon: IconEye },
        { title: "Niche Finder", url: "/dashboard/analyze/niche-finder", icon: IconCompass },
        { title: "Consistency Checker", url: "/dashboard/analyze/consistency-checker", icon: IconChecklist },
      ]
    },
    {
      label: "Manage",
      items: [
        { title: "Growth Dashboard", url: "/dashboard/growth", icon: IconTrendingUp },
        { title: "History Logs", url: "/dashboard/history", icon: IconHistory },
        { title: "Plan & Pricing", url: "/dashboard/billing", icon: IconCoins },
        { title: "Affiliate Portal", url: "/dashboard/affiliate", icon: IconUsers },
        { title: "Preferences", url: "/dashboard/settings", icon: IconSettings },
      ]
    }
  ]

  return (
    <Sidebar collapsible="offcanvas" side={isMobile ? "right" : "left"} {...props} className="border-r border-border/40 bg-sidebar">
      {/* Sidebar Header with branding and New Chat */}
      <SidebarHeader className="border-b border-border/40 pb-4 px-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="hover:bg-transparent mt-2 data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <Link href="/dashboard" className="flex items-center gap-2">
                <Image src="/logo.png" alt="Logo" width={28} height={28} className="rounded-lg shadow-sm" />
                <span className="text-lg font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent tracking-tight">Vidzara</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        
        {/* New Chat CTA Button */}
        <div className="mt-4 px-1">
          <Button
            asChild
            className="w-full bg-primary text-primary-foreground hover:bg-primary/95 active:bg-primary/95 shadow-md font-semibold py-5 rounded-xl flex items-center justify-center gap-2 group transition-all duration-200"
          >
            <Link href="/dashboard/new">
              <IconCirclePlusFilled className="size-4 group-hover:scale-110 transition-transform" />
              <span>New Chat</span>
            </Link>
          </Button>
        </div>
      </SidebarHeader>

      {/* Sidebar Content with Grouped Items */}
      <SidebarContent className="px-3 py-4 space-y-5 overflow-y-auto">
        {navigationGroups.map((group) => (
          <SidebarGroup key={group.label} className="p-0">
            <SidebarGroupLabel className="px-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 mb-1.5 select-none">
              {group.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon
                  const active = pathname === item.url || pathname.startsWith(item.url + "/")
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        tooltip={item.title}
                        isActive={active}
                        className={cn(
                          "transition-all duration-150 rounded-lg py-2 px-3 flex items-center gap-2.5",
                          active 
                            ? "bg-primary/10 text-primary font-semibold hover:bg-primary/15 hover:text-primary" 
                            : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                        )}
                      >
                        <Link href={item.url}>
                          <Icon className={cn("size-4 shrink-0", active ? "text-primary" : "text-muted-foreground")} />
                          <span className="text-sm tracking-wide">{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      {/* Sidebar Footer with user info & credits */}
      <SidebarFooter className="border-t border-border/40 p-4 gap-4">
        <CreditsIndicator />
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
