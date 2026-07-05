"use client"

import * as React from "react"
import { LogInIcon, LogOut } from "lucide-react"
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
import { authClient } from "@/lib/auth-client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "sonner"

export function AppSidebarFooter() {
  const { open } = useSidebar()
  const { data: session, isPending } = authClient.useSession()
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)

  const handleLogout = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          toast.success("Logged out successfully")
          setTimeout(() => {
            window.location.reload()
          }, 500)
        },
        onError: (ctx) => {
          toast.error(ctx.error.message || "Failed to log out")
        }
      }
    })
  }

  // Get user initials for fallback
  const getInitials = (name?: string) => {
    if (!name) return "U"
    return name.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2)
  }

  return (
    <SidebarFooter className="px-3 pb-4 pt-2">
      <SidebarMenu>
        <SidebarMenuItem>
          {isPending ? (
            <div className="h-10 w-full animate-pulse bg-muted rounded-md" />
          ) : session ? (
            open ? (
              <div className="flex items-center justify-between gap-2 p-1.5 border border-border/40 rounded-lg bg-card/40 backdrop-blur-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <Avatar size="sm" className="border border-border/60">
                    {session.user.image && (
                      <AvatarImage 
                        src={session.user.image} 
                        alt={session.user.name || "User"} 
                      />
                    )}
                    <AvatarFallback className="text-[10px] font-semibold bg-primary/10 text-primary">
                      {getInitials(session.user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col min-w-0 text-left">
                    <span className="text-xs font-semibold truncate text-foreground leading-tight">
                      {session.user.name}
                    </span>
                    <span className="text-[10px] text-muted-foreground truncate leading-tight">
                      {session.user.email}
                    </span>
                  </div>
                </div>
                <Tooltip>
                  <TooltipTrigger render={
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={handleLogout}
                      className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0"
                    />
                  }>
                    <LogOut size={14} />
                    <span className="sr-only">Log out</span>
                  </TooltipTrigger>
                  <TooltipContent side="top">Log out</TooltipContent>
                </Tooltip>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Tooltip>
                  <TooltipTrigger render={
                    <div className="w-full h-8 flex items-center justify-center p-0 rounded-md">
                      <Avatar size="sm" className="border border-border/60">
                        {session.user.image && (
                          <AvatarImage 
                            src={session.user.image} 
                            alt={session.user.name || "User"} 
                          />
                        )}
                        <AvatarFallback className="text-[9px] font-semibold bg-primary/10 text-primary">
                          {getInitials(session.user.name)}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  } />
                  <TooltipContent side="right">{session.user.name}</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger render={
                    <Button
                      variant="ghost"
                      onClick={handleLogout}
                      className="w-full h-8 flex items-center justify-center p-0 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                    />
                  }>
                    <LogOut size={15} />
                    <span className="sr-only">Log out</span>
                  </TooltipTrigger>
                  <TooltipContent side="right">Log out</TooltipContent>
                </Tooltip>
              </div>
            )
          ) : open ? (
            <LoginDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
          ) : (
            <Tooltip>
              <TooltipTrigger render={
                <Button
                  variant="ghost"
                  onClick={() => setIsDialogOpen(true)}
                  className="w-full h-8 flex items-center justify-center p-0 rounded-md text-sidebar-foreground hover:bg-sidebar-accent"
                />
              }>
                <LogInIcon />
                <span className="sr-only">Login</span>
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
      {!session && !open && (
        <LoginDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} showTrigger={false} />
      )}
    </SidebarFooter>
  )
}
