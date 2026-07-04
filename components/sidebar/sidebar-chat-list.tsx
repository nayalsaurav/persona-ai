"use client"

import { useQuery } from "@tanstack/react-query"
import { fetchChats, type Chat } from "@/lib/chats"
import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

function relativeTime(date: Date): string {
  const diff = Date.now() - date.getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "Just now"
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

function ChatSkeleton() {
  return (
    <div className="flex flex-col gap-2 px-2 py-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="h-8 rounded-md bg-sidebar-accent animate-pulse" />
      ))}
    </div>
  )
}

export function SidebarChatList() {
  const { open } = useSidebar()
  const { data: chats, isLoading, isError } = useQuery<Chat[]>({
    queryKey: ["chats"],
    queryFn: fetchChats,
  })

  if (!open) {
    return <SidebarContent className="flex-1" />
  }

  return (
    <SidebarContent className="flex-1">
      <SidebarGroup>
        <SidebarGroupLabel>Recent</SidebarGroupLabel>
        <SidebarMenu>
          {isLoading && <ChatSkeleton />}
          {isError && (
            <p className="px-2 py-2 text-xs text-destructive">Failed to load chats.</p>
          )}
          {chats?.map((chat) => (
            <SidebarMenuItem key={chat.id}>
              <Tooltip>
                <TooltipTrigger render={
                  <SidebarMenuButton
                    className="flex flex-col items-start gap-0.5 h-auto py-2"
                  >
                    <span className="truncate text-sm leading-tight w-full">{chat.title}</span>
                    <span className="text-[11px] text-sidebar-foreground/50 leading-normal">
                      {relativeTime(chat.timestamp)}
                    </span>
                  </SidebarMenuButton>
                }>
                </TooltipTrigger>
                <TooltipContent side="right">{chat.title}</TooltipContent>
              </Tooltip>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroup>
    </SidebarContent>
  )
}
