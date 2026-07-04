"use client"

import { LogInIcon } from "lucide-react"
import {
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { LoginDialog } from "@/components/auth-interface/login-dialog"

export function AppSidebarFooter() {
  const { open } = useSidebar()

  return (
    <SidebarFooter className="px-3 pb-4 pt-2">
      <SidebarMenu>
        <SidebarMenuItem>
          {open ? (
            <LoginDialog />
          ) : (
            <Tooltip>
              <TooltipTrigger render={<Button
                variant="ghost"
                size="icon-sm"
                className="w-full text-sidebar-foreground hover:bg-sidebar-accent"
              >
                <LogInIcon />
                <span className="sr-only">Login</span>
              </Button>}>

              </TooltipTrigger>
              <TooltipContent side="right">Login</TooltipContent>
            </Tooltip>
          )}
        </SidebarMenuItem>

        {open && (
          <SidebarMenuItem>
            <div className="flex items-center justify-center gap-3 px-2 py-2">
              <a href="#" className="text-[11px] text-sidebar-foreground/50 hover:text-sidebar-foreground transition-colors">
                Terms
              </a>
              <span className="text-sidebar-foreground/30 text-[11px]">·</span>
              <a href="#" className="text-[11px] text-sidebar-foreground/50 hover:text-sidebar-foreground transition-colors">
                Privacy
              </a>
              <span className="text-sidebar-foreground/30 text-[11px]">·</span>
              <a href="#" className="text-[11px] text-sidebar-foreground/50 hover:text-sidebar-foreground transition-colors">
                Refund Policy
              </a>
            </div>
          </SidebarMenuItem>
        )}
      </SidebarMenu>
    </SidebarFooter>
  )
}
