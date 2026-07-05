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
import { authClient } from "@/lib/auth-client"
import { Loader2 } from "lucide-react"

interface LoginDialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  showTrigger?: boolean
  showCloseButton?: boolean
}

export function LoginDialog({
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  showTrigger = true,
  showCloseButton = true
}: LoginDialogProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)

  const open = controlledOpen !== undefined ? controlledOpen : uncontrolledOpen
  const setOpen = controlledOnOpenChange !== undefined ? controlledOnOpenChange : setUncontrolledOpen

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true)
      await authClient.signIn.social({
        provider: "google",
        callbackURL: window.location.origin,
      })
    } catch (err) {
      console.error("Google login error:", err)
      setIsLoading(false)
    }
  }

  return (
    <>
      {showTrigger && (
        <Button
          variant="default"
          className="w-full"
          onClick={() => setOpen(true)}
          id="login-trigger-btn"
        >
          Login
        </Button>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="sm:max-w-sm gap-5"
          showCloseButton={showCloseButton}
        >
          <DialogHeader className="gap-1.5">
            <DialogTitle className="text-base normal-case tracking-normal font-semibold font-sans">
              Login to continue
            </DialogTitle>
            <DialogDescription className="mt-0 text-sm leading-snug">
              Sign in with your Google account.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            <Button
              id="google-login-btn"
              className="w-full flex items-center justify-center gap-3 bg-card hover:bg-muted text-foreground border border-border h-10 px-3 shadow-xs"
              onClick={handleGoogleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="animate-spin" size={16} />
              ) : (
                <svg className="h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                  <path fill="#4285F4" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
                </svg>
              )}
              {isLoading ? "Connecting..." : "Continue"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
