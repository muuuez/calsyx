import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase";
import { softDeleteChat } from "@/lib/db";

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

    const { chatId } = body as Record<string, unknown>;

    if (!chatId || typeof chatId !== "string" || chatId.length === 0) {
      return NextResponse.json(
        { error: "Valid chatId is required" },
        { status: 400 }
      );
    }

    const result = await softDeleteChat(chatId, userData.user.id);
    if (!result.success) {
      const status = result.error?.includes("Unauthorized") ? 403 : 500;
      return NextResponse.json(
        { error: result.error || "Failed to delete chat" },
        { status }
      );
    }

    return NextResponse.json(
      { success: true, message: "Chat deleted successfully" },
      { status: 200 }
    );
  } catch (err) {
    console.error("Delete chat error:", err);
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
