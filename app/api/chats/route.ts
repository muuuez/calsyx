import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase";
import { createChat, getUserChats } from "@/lib/db";

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient();
    const { data: userData } = await supabase.auth.getUser();

    if (!userData.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await getUserChats(userData.user.id);
    if (!result.success) {
      console.error("getUserChats error:", result.error);
      return NextResponse.json(
        { success: true, chats: [] },
        {
          status: 200,
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
          },
        }
      );
    }

    return NextResponse.json(
      { success: true, chats: result.data || [] },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
      }
    );
  } catch (err) {
    console.error("Chats GET error:", err);
    return NextResponse.json(
      { success: true, chats: [] },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
      }
    );
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient();
    const { data: userData } = await supabase.auth.getUser();

    if (!userData.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await createChat(userData.user.id);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to create chat" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, chat: result.data },
      { status: 201 }
    );
  } catch (err) {
    console.error("Chats POST error:", err);
    return NextResponse.json({ error: "Failed to create chat" }, { status: 500 });
  }
}
