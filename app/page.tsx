import { ChatInterface } from "@/components/chat-interface/chat-interface"
import { Suspense } from "react"

export default function Home() {
  return (
    <Suspense fallback={null}>
      <ChatInterface />
    </Suspense>
  )
}
