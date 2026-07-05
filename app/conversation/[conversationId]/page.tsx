import { ConversationRepository } from "@/repositories/conversation-repository";
import { ChatInterface } from "@/components/chat-interface/chat-interface";
import { getSession } from "@/lib/auth-guard";
import { redirect } from "next/navigation";
import { Suspense } from "react";

interface PageProps {
  params: Promise<{ conversationId: string }>;
}

export default async function ConversationPage({ params }: PageProps) {
  const { conversationId } = await params;
  const session = await getSession();
  if (!session || !session.user.id) {
    redirect("/");
  }

  const conversation = await ConversationRepository.getConversation(
    session.user.id,
    conversationId
  );

  if (!conversation) {
    redirect("/");
  }

  const clientMessages = await ConversationRepository.getMessages(conversationId, [
    "user",
    "assistant",
  ]);

  const serializedMessages = clientMessages.map(m => ({
    id: m.id,
    role: m.role as "user" | "assistant",
    content: m.content,
    timestamp: m.createdAt.toISOString(),
  }));

  return (
    <Suspense fallback={null}>
      <ChatInterface initialMessages={serializedMessages} />
    </Suspense>
  );
}
