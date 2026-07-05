import { getSession } from "@/lib/auth-guard";
import { NextRequest, NextResponse } from "next/server";
import { Persona } from "@/validation/persona";
import { ConversationRepository } from "@/repositories/conversation-repository";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !session.user.id) {
      return NextResponse.json({ message: "UNAUTHORIZED" }, { status: 401 });
    }

    const conversations = await ConversationRepository.getConversations(session.user.id);

    return NextResponse.json({ 
      message: "Fetched all conversations",
      data: conversations
    });
  } catch (error) {
    console.error("GET conversations error:", error);
    return NextResponse.json({ message: "INTERNAL_SERVER_ERROR" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { persona, title } = body;

    if (persona !== Persona.PIYUSH && persona !== Persona.HITESH) {
      return NextResponse.json({ message: "INVALID_PERSONA" }, { status: 400 });
    }

    const session = await getSession();
    if (!session || !session.user.id) {
      return NextResponse.json({ message: "UNAUTHORIZED" }, { status: 401 });
    }

    const conversation = await ConversationRepository.createConversation(
      session.user.id,
      persona,
      title
    );

    return NextResponse.json({ 
      message: "Created new conversation successfully",
      data: conversation
    });
  } catch (error) {
    console.error("POST conversations error:", error);
    return NextResponse.json({ message: "INTERNAL_SERVER_ERROR" }, { status: 500 });
  }
}
