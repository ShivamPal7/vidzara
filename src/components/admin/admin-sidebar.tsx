"use client"

import * as React from "react"
import Link from "next/link"
import {
  IconDashboard,
  IconUsers,
  IconCreditCard,
  IconAffiliate,
  IconSettings,
  IconArrowLeft,
  IconCash
} from "@tabler/icons-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  useSidebar,
} from "@/components/ui/sidebar"
import Image from "next/image"
import { usePathname } from "next/navigation"

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/admin",
      icon: IconDashboard,
    },
    {
      title: "Users",
      url: "/admin/users",
      icon: IconUsers,
    },
    {
      title: "Subscriptions",
      url: "/admin/subscriptions",
      icon: IconCreditCard,
    },
    {
      title: "Affiliates",
      url: "/admin/affiliates",
      icon: IconAffiliate,
    },
    {
      title: "Payouts",
      url: "/admin/payouts",
      icon: IconCash,
    },
  ],
}

export function AdminSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { setOpenMobile, isMobile } = useSidebar()
  const pathname = usePathname()

  React.useEffect(() => {
    setOpenMobile(false)
  }, [pathname, setOpenMobile])
  
  return (
    <Sidebar collapsible="offcanvas" side={isMobile ? "right" : "left"} className="border-r border-border/50 bg-zinc-950/50" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5! mt-2"
            >
              <Link href="/admin">
                <Image src="/logo.png" alt="Logo" width={32} height={32} />
                <span className="text-lg font-semibold text-zinc-100">Vidzara Admin</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-zinc-400">Overview</SidebarGroupLabel>
          <SidebarGroupContent className="flex flex-col gap-1 mt-2">
            <SidebarMenu>
              {data.navMain.map((item) => {
                const isActive = pathname === item.url || (item.url !== "/admin" && pathname.startsWith(item.url))
                const Icon = item.icon
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      tooltip={item.title}
                      isActive={isActive}
                      className={isActive ? "bg-indigo-500/10 text-indigo-400" : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50"}
                    >
                      <Link href={item.url}>
                        <Icon size={18} />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="gap-4 px-4 pb-4">
        <SidebarMenu>
          <SidebarMenuItem>
             <SidebarMenuButton
                asChild
                className="text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50"
              >
                <Link href="/dashboard">
                  <IconArrowLeft size={18} />
                  <span>Back to App</span>
                </Link>
              </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
