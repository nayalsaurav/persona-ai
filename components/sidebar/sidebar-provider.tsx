"use client"

import { useEffect } from "react"
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/sidebar/app-sidebar"
import { ThemeToggle } from "@/components/theme-toggle"

/** Registers Cmd/Ctrl+B to toggle the sidebar. Must be rendered inside SidebarProvider. */
function SidebarKeyboardShortcut() {
  const { toggleSidebar } = useSidebar()

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "b") {
        e.preventDefault()
        toggleSidebar()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [toggleSidebar])

  return null
}

export function AppSidebarProvider({ children }: { children?: React.ReactNode }) {
  return (
    <SidebarProvider defaultOpen className="h-svh overflow-hidden">
      <SidebarKeyboardShortcut />
      <AppSidebar />

      <SidebarInset className="relative min-h-0">
        {/* Top bar */}
        <header className="flex h-12 shrink-0 items-center justify-between border-b border-border/40 px-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1 text-muted-foreground hover:text-foreground" />
          </div>
          <div className="flex items-center">
            <ThemeToggle />
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 flex flex-col min-h-0">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
