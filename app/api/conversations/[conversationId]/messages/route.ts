import { getSession } from "@/lib/auth-guard";
import { NextRequest, NextResponse } from "next/server";
import { ConversationRepository } from "@/repositories/conversation-repository";
import { runAgent } from "@/lib/agent";
import { Persona } from "@/validation/persona";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    const { conversationId } = await params;
    const session = await getSession();
    if (!session || !session.user.id) {
      return NextResponse.json({ message: "UNAUTHORIZED" }, { status: 401 });
    }

    const conversation = await ConversationRepository.getConversation(
      session.user.id,
      conversationId
    );

    if (!conversation) {
      return NextResponse.json(
        { message: "CONVERSATION_NOT_FOUND" },
        { status: 404 }
      );
    }

    const clientMessages = await ConversationRepository.getMessages(conversationId, [
      "user",
      "assistant",
    ]);

    return NextResponse.json({
      message: "Fetched messages successfully",
      data: clientMessages,
    });
  } catch (error) {
    console.error("GET messages error:", error);
    return NextResponse.json(
      { message: "INTERNAL_SERVER_ERROR" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    const { conversationId } = await params;

    const session = await getSession();

    if (!session?.user.id) {
      return NextResponse.json(
        { message: "UNAUTHORIZED" },
        { status: 401 }
      );
    }

    const conversation = await ConversationRepository.getConversation(
      session.user.id,
      conversationId
    );

    if (!conversation) {
      return NextResponse.json(
        { message: "CONVERSATION_NOT_FOUND" },
        { status: 404 }
      );
    }

    const body = await req.json();
    const { message } = body;

    if (!message) {
      return NextResponse.json(
        { message: "MESSAGE_REQUIRED" },
        { status: 400 }
      );
    }

    // Save user message
    await ConversationRepository.createMessage(
      conversationId,
      message,
      "user"
    );
    
    const messages = await ConversationRepository.getMessages(conversationId, [
      "user",
      "assistant",
    ], 30);

    const history = messages.map((m) => ({
      role: m.role as "user" | "assistant" | "developer" | "system",
      content: m.content,
    }));

    // Initialize agent generator
    const generator = runAgent(
      conversation.persona as Persona,
      history
    );

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        try {
          let next = await generator.next();
          while (!next.done) {
            if (next.value) {
              controller.enqueue(encoder.encode(next.value));
            }
            next = await generator.next();
          }

          const finalResponse = next.value as string;

          // Save final AI response to DB
          await ConversationRepository.createMessage(
            conversationId,
            finalResponse,
            "assistant"
          );

          controller.close();
        } catch (err) {
          console.error("Streaming error in route:", err);
          controller.error(err);
        }
      }
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Transfer-Encoding": "chunked",
        "Cache-Control": "no-cache, no-transform",
        "Connection": "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (error) {
    console.error("POST message error:", error);

    return NextResponse.json(
      { message: "INTERNAL_SERVER_ERROR" },
      { status: 500 }
    );
  }
}

