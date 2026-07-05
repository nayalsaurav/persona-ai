"use client"

import * as React from "react"
import { Sparkles, Terminal, Cpu, HelpCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
  EmptyMedia,
} from "@/components/ui/empty"

const PRE_PROMPTS = [
  {
    id: "p1",
    icon: Sparkles,
    title: "Explain Quantum Computing",
    text: "Explain quantum computing in simple terms for a high schooler.",
    color: "bg-blue-500/10 text-blue-500",
  },
  {
    id: "p2",
    icon: Terminal,
    title: "TypeScript Debounce Hook",
    text: "Write a TypeScript function to debounce an API call.",
    color: "bg-amber-500/10 text-amber-600 dark:text-amber-500",
  },
  {
    id: "p3",
    icon: Cpu,
    title: "TCP vs UDP Protocol",
    text: "Explain the difference between TCP and UDP with a comparison table.",
    color: "bg-emerald-500/10 text-emerald-500",
  },
  {
    id: "p4",
    icon: HelpCircle,
    title: "Debug React useEffect",
    text: "Help me debug a memory leak in my React useEffect cleanups.",
    color: "bg-purple-500/10 text-purple-500",
  },
]

interface EmptyStateProps {
  onSelectPrompt: (text: string) => void
}

export function EmptyState({ onSelectPrompt }: EmptyStateProps) {
  return (
    <div className="size-full overflow-y-auto no-scrollbar flex flex-col items-center px-4 py-8">
      <Empty className="max-w-2xl border-none p-0 flex flex-col gap-6 animate-in fade-in duration-300 w-full my-auto">
        <EmptyHeader className="max-w-xl flex flex-col items-center">
          <EmptyMedia variant="icon" className="mb-2 bg-primary/10 text-primary rounded-none border border-primary/20">
            <Sparkles size={20} className="text-primary animate-pulse" />
          </EmptyMedia>
          <EmptyTitle className="font-heading text-3xl font-extrabold tracking-tight text-foreground normal-case">
            What query can we solve today?
          </EmptyTitle>
          <EmptyDescription className="text-muted-foreground text-sm max-w-md mx-auto leading-relaxed mt-1 text-center">
            Type a message or select a suggestion template below. You can switch your tutor persona using the selector directly above the chatbox.
          </EmptyDescription>
        </EmptyHeader>

        {/* Pre-prompts grid inside EmptyContent */}
        <EmptyContent className="max-w-2xl w-full mt-2">
          <div className="text-xs font-semibold tracking-wider text-muted-foreground/80 uppercase mb-3 text-center w-full">
            Start with a suggestion
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left w-full">
            {PRE_PROMPTS.map((prompt) => {
              const Icon = prompt.icon
              return (
                <button
                  key={prompt.id}
                  onClick={() => onSelectPrompt(prompt.text)}
                  className="group flex flex-col gap-2 p-4 rounded-none border border-border bg-card/55 hover:border-foreground/30 hover:bg-card hover:shadow-xs transition-all duration-300 outline-none text-left cursor-pointer w-full"
                >
                  <div className={cn("p-2 w-fit rounded-none border", prompt.color, prompt.color.includes("blue") ? "border-blue-500/20" : prompt.color.includes("amber") ? "border-amber-500/20" : prompt.color.includes("emerald") ? "border-emerald-500/20" : "border-purple-500/20")}>
                    <Icon size={16} />
                  </div>
                  <div className="font-heading text-sm font-semibold tracking-wide text-foreground group-hover:text-primary transition-colors">
                    {prompt.title}
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {prompt.text}
                  </p>
                </button>
              )
            })}
          </div>
        </EmptyContent>
      </Empty>
    </div>
  )
}
