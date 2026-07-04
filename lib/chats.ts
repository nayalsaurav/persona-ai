export interface Chat {
  id: string
  title: string
  timestamp: Date
}

const DUMMY_CHATS: Chat[] = [
  { id: "1", title: "How does React Server Components work?", timestamp: new Date(Date.now() - 1000 * 60 * 2) },
  { id: "2", title: "Write a Python script to parse CSV files", timestamp: new Date(Date.now() - 1000 * 60 * 30) },
  { id: "3", title: "Explain the difference between TCP and UDP", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3) },
  { id: "4", title: "Best practices for Next.js project structure", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 10) },
  { id: "5", title: "Debug my TypeScript generics issue", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24) },
  { id: "6", title: "Design a REST API for a blog platform", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2) },
  { id: "7", title: "Intro to machine learning concepts", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5) },
]

export async function fetchChats(): Promise<Chat[]> {
  await new Promise((r) => setTimeout(r, 500))
  return DUMMY_CHATS
}
