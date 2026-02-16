import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase";
import { getChatMessages } from "@/lib/db";

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient();
    const { data: userData } = await supabase.auth.getUser();

    if (!userData.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const chatId = request.nextUrl.searchParams.get("chatId");

    if (!chatId || chatId.length === 0) {
      return NextResponse.json(
        { error: "Valid chatId query parameter is required" },
        { status: 400 }
      );
    }

    const result = await getChatMessages(chatId, userData.user.id);
    if (!result.success) {
      const status = result.error?.includes("Unauthorized") ? 403 : 500;
      return NextResponse.json(
        { error: result.error || "Failed to fetch messages" },
        { status }
      );
    }

    return NextResponse.json(
      { success: true, messages: result.data || [] },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
      }
    );
  } catch (err) {
    console.error("Get messages error:", err);
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
