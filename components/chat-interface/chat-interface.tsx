"use client"

import * as React from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import {
  SendHorizontal,
  User,
  Loader2
} from "lucide-react"

import { cn } from "@/lib/utils"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { useChatStore } from "@/lib/use-chat-store"
import { fetchChats, fetchMessages, sendMessage, createChat, type Message as ChatMessage } from "@/lib/chats"
import { FormattedMessage } from "./formatted-message"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  MessageScrollerProvider,
  MessageScroller,
  MessageScrollerViewport,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerButton,
} from "@/components/ui/message-scroller"
import {
  Message,
  MessageAvatar,
  MessageContent,
  MessageHeader,
} from "@/components/ui/message"
import { Bubble, BubbleContent } from "@/components/ui/bubble"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { EmptyState } from "./empty-state"
import { PersonaSelector } from "./persona-selector"
import { authClient } from "@/lib/auth-client"
import { LoginDialog } from "@/components/auth-interface/login-dialog"

interface ChatInterfaceProps {
  initialMessages?: Array<{
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: string;
  }>;
}


interface PendingExchange {
  userText: string
  assistantText: string
  sentAtLength: number
}

export function ChatInterface({ initialMessages }: ChatInterfaceProps) {
  const queryClient = useQueryClient()
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const activeChatId = params.conversationId as string | undefined
  const { activePersona } = useChatStore()

  const [inputText, setInputText] = React.useState("")
  const [isBusy, setIsBusy] = React.useState(false)
  const [pending, setPending] = React.useState<PendingExchange | null>(null)
  const initialSendProcessed = React.useRef(false)

  const { data: session, isPending: isSessionPending } = authClient.useSession()

  const { data: chats = [] } = useQuery({
    queryKey: ["chats"],
    queryFn: fetchChats,
    enabled: !!session,
  })

  const currentChat = chats.find((c) => c.id === activeChatId)
  const currentChatPersona = currentChat?.persona || activePersona

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ["messages", activeChatId],
    queryFn: () => (activeChatId ? fetchMessages(activeChatId) : Promise.resolve([])),
    initialData: initialMessages
      ? initialMessages.map((m) => ({
        ...m,
        timestamp: new Date(m.timestamp),
      }))
      : undefined,
    enabled: !!activeChatId && !!session,
  })

  const handleSend = async (text: string) => {
    if (!session || !text.trim() || isBusy) return

    const trimmed = text.trim()
    setInputText("")
    setIsBusy(true)

    try {
      let chatId = activeChatId

      if (!chatId) {
        const title = trimmed.length > 45 ? trimmed.substring(0, 45) + "..." : trimmed
        const newChat = await createChat(title, activePersona)
        router.push(`/conversation/${newChat.id}?msg=${encodeURIComponent(trimmed)}`)
        return
      }

      setPending({
        userText: trimmed,
        assistantText: "",
        sentAtLength: messages.length,
      })

      await sendMessage(chatId, trimmed, (chunk) => {
        setPending((prev) => prev && {
          ...prev,
          assistantText: prev.assistantText + chunk,
        })
      })

      await queryClient.invalidateQueries({ queryKey: ["messages", chatId] })
      await queryClient.invalidateQueries({ queryKey: ["chats"] })
    } catch (err) {
      console.error(err)
      toast.error(activeChatId ? "Failed to send message" : "Failed to create chat")
    } finally {
      setIsBusy(false)
      setPending(null)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend(inputText)
    }
  }

  React.useEffect(() => {
    if (activeChatId) {
      const pendingMsg = searchParams.get("msg")
      if (pendingMsg && !initialSendProcessed.current) {
        initialSendProcessed.current = true
        // Clean up the URL search params immediately to prevent re-triggering on manual reloads
        window.history.replaceState(null, "", `/conversation/${activeChatId}`)
        handleSend(pendingMsg)
      }
    }
  }, [activeChatId, searchParams])

  const displayMessages = React.useMemo(() => {
    if (!pending) return messages

    const list = [...messages]

    const hasUserMsg =
      messages.length > pending.sentAtLength &&
      messages[pending.sentAtLength]?.role === "user"

    if (!hasUserMsg) {
      list.push({
        id: "optimistic-user",
        role: "user",
        content: pending.userText,
        timestamp: new Date(),
      })
    }
    const hasAssistantMsg =
      messages.length > pending.sentAtLength + 1 &&
      messages[pending.sentAtLength + 1]?.role === "assistant"

    if (!hasAssistantMsg) {
      list.push({
        id: "streaming-assistant",
        role: "assistant",
        content: pending.assistantText,
        timestamp: new Date(),
      })
    }

    return list
  }, [messages, pending])

  if (isSessionPending) {
    return (
      <div className="size-full flex-1 flex flex-col items-center justify-center gap-3 bg-background">
        <Loader2 className="animate-spin text-muted-foreground" size={28} />
        <p className="text-xs text-muted-foreground tracking-widest uppercase">Checking session...</p>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-background relative">
      <div className="flex-1 min-h-0 relative">
        {!activeChatId ? (
          <EmptyState onSelectPrompt={handleSend} />
        ) : isLoading ? (
          <div className="size-full flex flex-col items-center justify-center gap-3">
            <Loader2 className="animate-spin text-muted-foreground" size={28} />
            <p className="text-xs text-muted-foreground tracking-widest uppercase">Loading messages...</p>
          </div>
        ) : (
          <MessageScrollerProvider>
            <MessageScroller className="size-full">
              <MessageScrollerViewport className="px-4 py-8 md:px-8">
                <MessageScrollerContent className="max-w-3xl mx-auto">
                  {displayMessages.map((message) => {
                    const isUser = message.role === "user"
                    return (
                      <MessageScrollerItem key={message.id}>
                        <Message align={isUser ? "end" : "start"} className="gap-4">
                          <MessageAvatar className="border border-border/40">
                            <Avatar size="sm">
                              <AvatarFallback className={cn(
                                "flex size-full items-center justify-center rounded-full text-xs font-semibold select-none",
                                isUser
                                  ? "bg-primary/10 text-primary"
                                  : currentChatPersona === "piyush"
                                    ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                                    : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                              )}>
                                {isUser ? (
                                  <User size={12} />
                                ) : currentChatPersona === "piyush" ? (
                                  <span className="font-extrabold text-[9px]">PS</span>
                                ) : (
                                  <span className="font-extrabold text-[9px]">HS</span>
                                )}
                              </AvatarFallback>
                            </Avatar>
                          </MessageAvatar>
                          <MessageContent>
                            <MessageHeader>
                              {isUser
                                ? "You"
                                : currentChatPersona === "piyush"
                                  ? "Piyush Sir"
                                  : "Hitesh Sir"}
                            </MessageHeader>
                            <Bubble variant={isUser ? "default" : "outline"} align={isUser ? "end" : "start"} className="shadow-xs">
                              <BubbleContent className={cn("leading-relaxed select-text", isUser ? "whitespace-pre-wrap text-sm" : "py-1")}>
                                {isUser ? (
                                  message.content
                                ) : message.content ? (
                                  <FormattedMessage content={message.content} />
                                ) : (
                                  <span className="flex items-center gap-1 py-1">
                                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/60" style={{ animationDelay: '0ms' }} />
                                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/60" style={{ animationDelay: '150ms' }} />
                                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/60" style={{ animationDelay: '300ms' }} />
                                  </span>
                                )}
                              </BubbleContent>
                            </Bubble>
                          </MessageContent>
                        </Message>
                      </MessageScrollerItem>
                    )
                  })}
                </MessageScrollerContent>
              </MessageScrollerViewport>
              <MessageScrollerButton />
            </MessageScroller>
          </MessageScrollerProvider>
        )}
      </div>

      <div className="border-t border-border/40 p-4 md:p-6 bg-background flex flex-col gap-2">
        <div className="max-w-3xl w-full mx-auto flex justify-start">
          <PersonaSelector />
        </div>
        <div className="max-w-3xl w-full mx-auto relative flex items-end gap-2 border border-border/60 bg-card/30 backdrop-blur-md p-1 px-3 shadow-xs">
          <Textarea
            rows={1}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={!session || isBusy}
            placeholder={session ? (isBusy ? "Waiting for response..." : "Type a message, or select a pre-prompt...") : "Please sign in to chat"}
            className="flex-1 min-h-[44px] max-h-[200px] resize-none border-0 bg-transparent py-3 pr-12 text-sm leading-relaxed outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-hidden"
          />
          <div className="absolute right-3 bottom-2 flex items-center gap-2">
            <Button
              size="icon-xs"
              variant="ghost"
              onClick={() => handleSend(inputText)}
              disabled={!session || !inputText.trim() || isBusy}
              className="text-muted-foreground hover:text-foreground hover:bg-transparent"
            >
              {isBusy ? (
                <Loader2 className="animate-spin" size={16} />
              ) : (
                <SendHorizontal size={16} className="hover:text-primary transition-colors" />
              )}
              <span className="sr-only">Send</span>
            </Button>
          </div>
        </div>
        <p className="text-[10px] text-center text-muted-foreground/60 mt-2 select-none">
          Persona AI may generate inaccurate results. Press Enter to send, Shift+Enter for new line.
        </p>
      </div>

      {!session && (
        <div className="absolute inset-0 bg-background/50 backdrop-blur-md z-40 flex flex-col items-center justify-center p-4 gap-3 text-center animate-in fade-in duration-200">
          <p className="text-sm font-medium text-muted-foreground select-none">
            Please log in to start chatting with AI personas
          </p>
          <div className="w-32">
            <LoginDialog />
          </div>
        </div>
      )}
    </div>
  )
}