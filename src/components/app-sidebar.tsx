"use client"

import * as React from "react"
import Link from "next/link"
import {
  IconChartBar,
  IconCreditCard,
  IconHistory,
  IconRocket,
  IconSettings,
  IconTrendingUp,
  IconUsers,
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
      title: "Create",
      url: "#",
      icon: IconWand,
      items: [
        {
          title: "Script Writer",
          url: "/dashboard/create/script-writer",
        },
        {
          title: "Thumbnail Generator",
          url: "/dashboard/create/thumbnail",
        },
        {
          title: "Video SEO Generator",
          url: "/dashboard/create/video-seo",
        },
      ],
    },
    {
      title: "Optimize",
      url: "#",
      icon: IconRocket,
      items: [
        {
          title: "Script Shortener",
          url: "/dashboard/optimize/script-shortener",
        },
        {
          title: "Hook Detector",
          url: "/dashboard/optimize/hook-detector",
        },
        {
          title: "Content Safety Checker",
          url: "/dashboard/optimize/content-safety",
        },
      ],
    },
    {
      title: "Analyze",
      url: "#",
      icon: IconChartBar,
      items: [
        {
          title: "Topic Generator",
          url: "/dashboard/analyze/topic-generator",
        },
        {
          title: "Outlier Detector",
          url: "/dashboard/analyze/outlier-detector",
        },
        {
          title: "Niche Finder",
          url: "/dashboard/analyze/niche-finder",
        },
        {
          title: "Consistency Checker",
          url: "/dashboard/analyze/consistency-checker",
        },
      ],
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
    {
      title: "Billing",
      url: "/dashboard/billing",
      icon: IconCreditCard,
    },
    {
      title: "Affiliate",
      url: "/dashboard/affiliate",
      icon: IconUsers,
    },
    {
      title: "Settings",
      url: "/dashboard/settings",
      icon: IconSettings,
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
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <Link href="/dashboard">
                <Image src="/logo.png" alt="Logo" width={24} height={24} />
                <span className="text-base font-semibold">Vidzara</span>
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
