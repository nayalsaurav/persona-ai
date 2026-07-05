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
import { useRouter } from "next/navigation"
import { authClient } from "@/lib/auth-client"

export function AppSidebarHeader() {
  const { open } = useSidebar()
  const router = useRouter()
  const { data: session } = authClient.useSession()

  const handleNewChat = () => {
    if (!session) return
    router.push("/")
  }

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
                <Tooltip>
                  <TooltipTrigger render={
                    <Button 
                      variant="ghost" 
                      size="icon-sm" 
                      className="text-sidebar-foreground hover:bg-sidebar-accent"
                      disabled={!session}
                    >
                      <SearchIcon />
                      <span className="sr-only">Search</span>
                    </Button>
                  } />
                  <TooltipContent side="bottom">Search</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger render={
                    <Button 
                      variant="ghost" 
                      size="icon-sm" 
                      className="text-sidebar-foreground hover:bg-sidebar-accent"
                      onClick={handleNewChat}
                      disabled={!session}
                    >
                      <PlusIcon />
                      <span className="sr-only">New chat</span>
                    </Button>
                  } />
                  <TooltipContent side="bottom">New chat</TooltipContent>
                </Tooltip>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1">
              <span className="font-heading text-base font-bold tracking-widest text-sidebar-foreground py-1">
                AI
              </span>
              <Tooltip>
                <TooltipTrigger render={
                  <Button 
                    variant="ghost" 
                    size="icon-sm" 
                    className="text-sidebar-foreground hover:bg-sidebar-accent"
                    disabled={!session}
                  >
                    <SearchIcon />
                    <span className="sr-only">Search</span>
                  </Button>
                } />
                <TooltipContent side="right">Search</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger render={
                  <Button 
                    variant="ghost" 
                    size="icon-sm" 
                    className="text-sidebar-foreground hover:bg-sidebar-accent"
                    onClick={handleNewChat}
                    disabled={!session}
                  >
                    <PlusIcon />
                    <span className="sr-only">New chat</span>
                  </Button>
                } />
                <TooltipContent side="right">New chat</TooltipContent>
              </Tooltip>
            </div>
          )}
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>
  )
}
