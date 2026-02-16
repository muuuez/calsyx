import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase";
import { updateChatTitle } from "@/lib/db";
import { generateChatTitle } from "@/lib/ai";

const MAX_TITLE_LENGTH = 100;

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient();
    const { data: userData } = await supabase.auth.getUser();

    if (!userData.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

    if (!chatId || typeof chatId !== "string" || chatId.length === 0) {
      return NextResponse.json(
        { error: "Valid chatId is required" },
        { status: 400 }
      );
    }

    if (!message || typeof message !== "string" || message.length === 0) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Generate title from first message
    const titleResult = await generateChatTitle(message);
    if (!titleResult.success || !titleResult.data) {
      return NextResponse.json(
        { error: titleResult.error || "Failed to generate title" },
        { status: 500 }
      );
    }

    // Cap title length for consistency
    const title = titleResult.data.slice(0, MAX_TITLE_LENGTH);

    // Update chat with generated title
    const updateResult = await updateChatTitle(
      chatId,
      userData.user.id,
      title
    );

    if (!updateResult.success) {
      const status = updateResult.error?.includes("Unauthorized") ? 403 : 500;
      return NextResponse.json(
        { error: updateResult.error || "Failed to update title" },
        { status }
      );
    }

    return NextResponse.json(
      { success: true, title },
      { status: 200 }
    );
  } catch (err) {
    console.error("Generate title error:", err);
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
