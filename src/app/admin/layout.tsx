import { auth } from "@/lib/auth";
import { isAdmin } from "@/lib/admin";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  if (!isAdmin(session.user.email)) {
    redirect("/dashboard");
  }

  return (
    <SidebarProvider
      style={{
        "--sidebar-width": "calc(var(--spacing) * 72)",
        "--header-height": "calc(var(--spacing) * 12)",
      } as React.CSSProperties}
    >
      <AdminSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 border-b px-2 md:px-4 bg-background/50 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-2 px-2 md:px-4">
            <div className="hidden md:flex items-center gap-2">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />
            </div>
            <h1 className="text-sm font-medium text-zinc-300">Admin Panel</h1>
          </div>
          <div className="md:hidden">
              <SidebarTrigger />
          </div>
        </header>
        <div className="flex flex-1 flex-col px-2 md:px-6 lg:px-8 py-2 md:py-4 lg:py-6">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
