"use client"

import { PlusIcon, SearchIcon } from "lucide-react"
import {
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export function AppSidebarHeader() {
  const { open } = useSidebar()

  return (
    <SidebarHeader className="px-3 py-3">
      <SidebarMenu>
        <SidebarMenuItem>
          {open ? (
            <div className="flex items-center justify-between w-full">
              <SidebarMenuButton
                className="font-heading text-lg font-bold tracking-widest uppercase text-sidebar-foreground hover:bg-transparent w-auto px-2"
                tooltip="Persona AI"
              >
                <span className="font-heading text-base font-bold tracking-widest">Persona AI</span>
              </SidebarMenuButton>
              <div className="flex items-center gap-0.5">
                <Button variant="ghost" size="icon-sm" className="text-sidebar-foreground hover:bg-sidebar-accent">
                  <SearchIcon />
                  <span className="sr-only">Search</span>
                </Button>
                <Button variant="ghost" size="icon-sm" className="text-sidebar-foreground hover:bg-sidebar-accent">
                  <PlusIcon />
                  <span className="sr-only">New chat</span>
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1">
              <span className="font-heading text-base font-bold tracking-widest text-sidebar-foreground py-1">
                AI
              </span>
              <Tooltip>
                <TooltipTrigger render={
                  <Button variant="ghost" size="icon-sm" className="text-sidebar-foreground hover:bg-sidebar-accent">
                    <SearchIcon />
                    <span className="sr-only">Search</span>
                  </Button>
                }>
                </TooltipTrigger>
                <TooltipContent side="right">Search</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger render={
                  <Button variant="ghost" size="icon-sm" className="text-sidebar-foreground hover:bg-sidebar-accent">
                    <PlusIcon />
                    <span className="sr-only">New chat</span>
                  </Button>
                }>
                </TooltipTrigger>
                <TooltipContent side="right">New chat</TooltipContent>
              </Tooltip>
            </div>
          )}
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>
  )
}
