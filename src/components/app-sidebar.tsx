"use client"

import * as React from "react"
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
          url: "#",
        },
        {
          title: "Thumbnail Generator",
          url: "#",
        },
      ],
    },
    {
      title: "Optimize",
      url: "#",
      icon: IconRocket,
      items: [
        {
          title: "Video SEO Generator",
          url: "#",
        },
        {
          title: "Script Shortener",
          url: "#",
        },
        {
          title: "Hook Detector",
          url: "#",
        },
        {
          title: "Content Safety Checker",
          url: "#",
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
          url: "#",
        },
        {
          title: "Outlier Detector",
          url: "#",
        },
        {
          title: "Niche Finder",
          url: "#",
        },
        {
          title: "Consistency Checker",
          url: "#",
        },
      ],
    },
    {
      title: "Growth",
      url: "#",
      icon: IconTrendingUp,
      items: [
        {
          title: "Creator Growth Dashboard",
          url: "#",
        },
      ],
    },
    {
      title: "History",
      url: "#",
      icon: IconHistory,
    },
    {
      title: "Billing",
      url: "#",
      icon: IconCreditCard,
    },
    {
      title: "Affiliate",
      url: "#",
      icon: IconUsers,
    },
    {
      title: "Settings",
      url: "#",
      icon: IconSettings,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="#">
                <Image src="/logo.png" alt="Logo" width={24} height={24} />
                <span className="text-base font-semibold">Vidzara</span>
              </a>
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
