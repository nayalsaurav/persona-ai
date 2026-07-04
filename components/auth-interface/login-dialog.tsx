"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function LoginDialog() {
  const [open, setOpen] = React.useState(false)
  const [email, setEmail] = React.useState("")

  return (
    <>
      <Button
        variant="default"
        className="w-full"
        onClick={() => setOpen(true)}
        id="login-trigger-btn"
      >
        Login
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="sm:max-w-sm gap-5"
          showCloseButton
        >
          <DialogHeader className="gap-1.5">
            <DialogTitle className="text-base normal-case tracking-normal font-semibold font-sans">
              Login to continue
            </DialogTitle>
            <DialogDescription className="mt-0 text-sm leading-snug">
              We&apos;ll email you a one-time code. No password needed.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="email-input" className="text-xs font-medium normal-case tracking-normal">
                Email
              </Label>
              <Input
                id="email-input"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border border-input bg-muted/40 px-3 h-10"
                autoFocus
              />
            </div>

            <div className="flex flex-col gap-2">
              <Button
                id="login-continue-btn"
                className="w-full bg-primary text-primary-foreground"
                onClick={() => {
                  // handle continue
                }}
              >
                Continue
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
