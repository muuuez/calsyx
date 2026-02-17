import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase";
import { saveMessage, getChatMessages } from "@/lib/db";
import { generateChatResponse } from "@/lib/ai";

const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 20; // max messages per minute
const userMessageCounts = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const userLimit = userMessageCounts.get(userId);

  if (!userLimit || now > userLimit.resetTime) {
    userMessageCounts.set(userId, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (userLimit.count >= RATE_LIMIT_MAX) {
    return false;
  }

  userLimit.count++;
  return true;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient();
    const { data: userData } = await supabase.auth.getUser();

    if (!userData.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate limiting
    if (!checkRateLimit(userData.user.id)) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a moment." },
        { status: 429 }
      );
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    if (typeof body !== "object" || body === null) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    const { chatId, message } = body as Record<string, unknown>;

    // Validation
    if (!chatId || typeof chatId !== "string" || chatId.length === 0) {
      return NextResponse.json(
        { error: "Valid chatId is required" },
        { status: 400 }
      );
    }

    if (!message || typeof message !== "string" || message.length === 0) {
      return NextResponse.json(
        { error: "Message cannot be empty" },
        { status: 400 }
      );
    }

    if (message.length > 2000) {
      return NextResponse.json(
        { error: "Message too long (max 2000 characters)" },
        { status: 400 }
      );
    }

    // Save user message with error handling
    const userMsgResult = await saveMessage(
      chatId,
      userData.user.id,
      "user",
      message
    );

    if (!userMsgResult.success) {
      return NextResponse.json(
        { error: userMsgResult.error || "Failed to save your message" },
        { status: userMsgResult.error?.includes("Unauthorized") ? 403 : 500 }
      );
    }

    // Get chat history
    const historyResult = await getChatMessages(chatId, userData.user.id);
    if (!historyResult.success || !historyResult.data) {
      return NextResponse.json(
        { error: "Failed to load chat history" },
        { status: 500 }
      );
    }

    // Generate AI response with timeout
    const aiResult = await generateChatResponse(historyResult.data);
    if (!aiResult.success || !aiResult.data) {
      console.error("AI generation error:", aiResult.error);
      return NextResponse.json(
        { error: "Failed to generate response. Please try again." },
        { status: 500 }
      );
    }

    // Save AI response
    const aiMsgResult = await saveMessage(
      chatId,
      userData.user.id,
      "assistant",
      aiResult.data
    );

    if (!aiMsgResult.success) {
      return NextResponse.json(
        { error: "Failed to save AI response" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        userMessage: userMsgResult.data,
        assistantMessage: aiMsgResult.data,
      },
      { 
        status: 200,
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
      }
    );
  } catch (err) {
    console.error("Chat API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
