import { getSession } from "@/lib/auth-guard";
import { NextRequest, NextResponse } from "next/server";
import { ConversationRepository } from "@/repositories/conversation-repository";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    const { conversationId } = await params;
    const session = await getSession();
    if (!session || !session.user.id) {
      return NextResponse.json({ message: "UNAUTHORIZED" }, { status: 401 });
    }

    const result = await ConversationRepository.deleteConversation(
      session.user.id,
      conversationId
    );

    if (result.count === 0) {
      return NextResponse.json(
        { message: "CONVERSATION_NOT_FOUND" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Conversation deleted successfully",
      data: { id: conversationId },
    });
  } catch (error) {
    console.error("DELETE conversation error:", error);
    return NextResponse.json(
      { message: "INTERNAL_SERVER_ERROR" },
      { status: 500 }
    );
  }
}
