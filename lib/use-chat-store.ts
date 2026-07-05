import { create } from "zustand"

interface ChatState {
  activeChatId: string | null
  setActiveChatId: (id: string | null) => void
  activePersona: "piyush" | "hitesh"
  setActivePersona: (persona: "piyush" | "hitesh") => void
}

export const useChatStore = create<ChatState>((set) => ({
  activeChatId: null,
  setActiveChatId: (id) => set({ activeChatId: id }),
  activePersona: "piyush",
  setActivePersona: (persona) => set((state) => {
    if (state.activeChatId !== null) return {}
    return { activePersona: persona }
  }),
}))
