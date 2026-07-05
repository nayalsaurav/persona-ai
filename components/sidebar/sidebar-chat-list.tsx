"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { fetchChats, deleteChat, type Chat } from "@/lib/chats"
import { Trash2, Lock } from "lucide-react"
import { toast } from "sonner"
import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuAction,
  useSidebar,
} from "@/components/ui/sidebar"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import { useParams, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { authClient } from "@/lib/auth-client"

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
  const params = useParams()
  const router = useRouter()
  const activeChatId = params.conversationId as string | undefined
  const queryClient = useQueryClient()

  const { data: session } = authClient.useSession()

  const { data: chats, isLoading, isError } = useQuery<Chat[]>({
    queryKey: ["chats"],
    queryFn: fetchChats,
    enabled: !!session,
  })

  const deleteMutation = useMutation({
    mutationFn: deleteChat,
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: ["chats"] })
      if (activeChatId === deletedId) {
        router.push("/")
      }
      toast.success("Chat deleted successfully")
    },
    onError: () => {
      toast.error("Failed to delete chat")
    }
  })

  if (!session) {
    if (!open) {
      return <SidebarContent className="flex-1" />
    }
    return (
      <SidebarContent className="flex-1">
        <SidebarGroup>
          <SidebarGroupLabel>Recent</SidebarGroupLabel>
          <div className="flex flex-col items-center justify-center p-6 text-center gap-2 mt-4 select-none">
            <Lock size={16} className="text-sidebar-foreground/40" />
            <p className="text-[11px] text-sidebar-foreground/60 leading-normal max-w-[140px] mx-auto">
              Sign in to view your recent conversations.
            </p>
          </div>
        </SidebarGroup>
      </SidebarContent>
    )
  }

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
                    className="flex flex-row items-center gap-2 h-auto py-2"
                    isActive={activeChatId === chat.id}
                    onClick={() => router.push(`/conversation/${chat.id}`)}
                  >
                    <div className={cn(
                      "shrink-0 flex items-center justify-center size-5 text-[8px] font-extrabold border select-none",
                      chat.persona === "piyush"
                        ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30"
                        : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30"
                    )}>
                      {chat.persona === "piyush" ? "PS" : "HS"}
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col items-start gap-0.5">
                      <span className="truncate text-sm leading-tight w-full pr-6">{chat.title}</span>
                      <span className="text-[11px] text-sidebar-foreground/50 leading-normal">
                        {relativeTime(chat.timestamp)}
                      </span>
                    </div>
                  </SidebarMenuButton>
                }>
                </TooltipTrigger>
                <TooltipContent side="right">{chat.title}</TooltipContent>
              </Tooltip>
              <SidebarMenuAction
                showOnHover
                onClick={(e) => {
                  e.stopPropagation()
                  deleteMutation.mutate(chat.id)
                }}
                disabled={deleteMutation.isPending}
                className="text-sidebar-foreground/50 hover:text-destructive hover:bg-transparent"
              >
                <Trash2 size={14} />
                <span className="sr-only">Delete chat</span>
              </SidebarMenuAction>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroup>
    </SidebarContent>
  )
}
