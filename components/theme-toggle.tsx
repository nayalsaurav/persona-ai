"use client"

import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { CircleHalfTiltIcon } from "@phosphor-icons/react"

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()

  return (
    <Button
      variant="ghost"
      size="icon-lg"
      className="text-foreground p-0 hover:bg-transparent dark:hover:bg-transparent"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
    >
      <CircleHalfTiltIcon
        className="-rotate-45 size-sm"
        weight="bold"
        size={24}
        color="currentColor"

      />
      <span className="sr-only" suppressHydrationWarning>
        {resolvedTheme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      </span>
    </Button>
  )
}
