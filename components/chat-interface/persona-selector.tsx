"use client"

import * as React from "react"
import { useQuery } from "@tanstack/react-query"
import { useChatStore } from "@/lib/use-chat-store"
import { fetchChats, type Chat } from "@/lib/chats"
import { useParams } from "next/navigation"
import { cn } from "@/lib/utils"

export function PersonaSelector() {
  const params = useParams()
  const activeChatId = params.conversationId as string | undefined
  const { activePersona, setActivePersona } = useChatStore()

  // Fetch chats to find active chat's persona
  const { data: chats = [] } = useQuery<Chat[]>({
    queryKey: ["chats"],
    queryFn: fetchChats,
    enabled: !!activeChatId,
  })

  const currentChat = chats.find((c) => c.id === activeChatId)
  const isChatActive = !!activeChatId
  const persona = isChatActive ? (currentChat?.persona || "piyush") : activePersona

  return (
    <div className="flex items-center gap-1.5 bg-muted/50 p-1 border border-border/40 select-none">
      {isChatActive ? (
        /* Read-only status display when inside a chat */
        <div className="flex items-center gap-2 px-3 py-1 text-xs font-semibold uppercase tracking-wider">
          <span className="text-muted-foreground">Tutor:</span>
          <span
            className={cn(
              "px-1.5 py-0.5 border text-[10px]",
              persona === "piyush"
                ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30"
                : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30"
            )}
          >
            {persona === "piyush" ? "Piyush Sir" : "Hitesh Sir"}
          </span>
        </div>
      ) : (
        /* Selectable persona segment control when on empty workspace */
        <div className="flex items-center relative">
          <button
            onClick={() => setActivePersona("piyush")}
            className={cn(
              "px-3 py-1 text-[11px] font-semibold uppercase tracking-wider transition-all cursor-pointer border border-transparent",
              persona === "piyush"
                ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Piyush Sir
          </button>
          <button
            onClick={() => setActivePersona("hitesh")}
            className={cn(
              "px-3 py-1 text-[11px] font-semibold uppercase tracking-wider transition-all cursor-pointer border border-transparent",
              persona === "hitesh"
                ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Hitesh Sir
          </button>
        </div>
      )}
    </div>
  )
}
