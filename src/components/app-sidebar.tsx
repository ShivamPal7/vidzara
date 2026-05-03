"use client"

import * as React from "react"
import Link from "next/link"
import {
  IconChartBar,
  IconChecklist,
  IconCompass,
  IconEye,
  IconFileText,
  IconHistory,
  IconBulb,
  IconPhoto,
  IconRocket,
  IconScissors,
  IconSearch,
  IconShieldCheck,
  IconTarget,
  IconTrendingUp,
  IconWand,
} from "@tabler/icons-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import Image from "next/image"

const data = {
  navMain: [
    {
      title: "Script Writer",
      url: "/dashboard/create/script-writer",
      icon: IconFileText,
    },
    {
      title: "Video SEO Generator",
      url: "/dashboard/create/video-seo",
      icon: IconSearch,
    },
    {
      title: "Topic Generator",
      url: "/dashboard/analyze/topic-generator",
      icon: IconBulb,
    },
    {
      title: "Thumbnail Concepts",
      url: "/dashboard/create/thumbnail",
      icon: IconPhoto,
    },
    {
      title: "Script Shortener",
      url: "/dashboard/optimize/script-shortener",
      icon: IconScissors,
    },
    {
      title: "Hook Detector",
      url: "/dashboard/optimize/hook-detector",
      icon: IconTarget,
    },
    {
      title: "Content Safety",
      url: "/dashboard/optimize/content-safety",
      icon: IconShieldCheck,
    },
    {
      title: "Competitors",
      url: "/dashboard/analyze/competitors",
      icon: IconEye,
    },
    {
      title: "Niche Finder",
      url: "/dashboard/analyze/niche-finder",
      icon: IconCompass,
    },
    {
      title: "Consistency Checker",
      url: "/dashboard/analyze/consistency-checker",
      icon: IconChecklist,
    },
    {
      title: "Growth",
      url: "/dashboard/growth",
      icon: IconTrendingUp,
    },
    {
      title: "History",
      url: "/dashboard/history",
      icon: IconHistory,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { isMobile } = useSidebar()
  
  return (
    <Sidebar collapsible="offcanvas" side={isMobile ? "right" : "left"} {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5! mt-2"
            >
              <Link href="/dashboard">
                <Image src="/logo.png" alt="Logo" width={32} height={32} />
                <span className="text-lg font-semibold">Vidzara</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
