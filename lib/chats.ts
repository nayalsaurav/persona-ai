export interface Chat {
  id: string
  title: string
  timestamp: Date
  persona: "piyush" | "hitesh"
}

export interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

export async function fetchChats(): Promise<Chat[]> {
  const res = await fetch("/api/conversations");
  if (!res.ok) throw new Error("Failed to fetch chats");
  const json = await res.json();
  
  return json.data.map((c: any) => ({
    id: c.id,
    title: c.title,
    persona: c.persona,
    timestamp: new Date(c.updatedAt || c.createdAt),
  }));
}

export async function fetchMessages(chatId: string): Promise<Message[]> {
  const res = await fetch(`/api/conversations/${chatId}/messages`);
  if (!res.ok) throw new Error("Failed to fetch messages");
  const json = await res.json();

  return json.data.map((m: any) => ({
    id: m.id,
    role: m.role,
    content: m.content,
    timestamp: new Date(m.createdAt),
  }));
}

export async function createChat(
  title: string,
  persona: "piyush" | "hitesh" = "piyush"
): Promise<Chat> {
  const res = await fetch("/api/conversations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, persona }),
  });
  if (!res.ok) throw new Error("Failed to create conversation");
  const json = await res.json();
  const c = json.data;

  return {
    id: c.id,
    title: c.title,
    persona: c.persona,
    timestamp: new Date(c.updatedAt || c.createdAt),
  };
}

export async function sendMessage(
  chatId: string,
  message: string,
  onChunk?: (text: string) => void
): Promise<void> {
  const res = await fetch(`/api/conversations/${chatId}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });
  if (!res.ok) throw new Error("Failed to send message");

  const reader = res.body?.getReader();
  if (!reader) throw new Error("Response body is not readable");

  const decoder = new TextDecoder();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value, { stream: true });
    if (onChunk) {
      onChunk(chunk);
    }
  }
}

export async function addAssistantMessage(chatId: string, content: string): Promise<Message> {
  const res = await fetch(`/api/conversations/${chatId}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content, role: "assistant" }),
  });
  if (!res.ok) throw new Error("Failed to add assistant message");
  const json = await res.json();

  return {
    id: json.id,
    role: json.role,
    content: json.content,
    timestamp: new Date(json.createdAt),
  };
}

export async function deleteChat(id: string): Promise<void> {
  const res = await fetch(`/api/conversations/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete conversation");
}
