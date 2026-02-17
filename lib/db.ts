import { createClient } from "./supabase";

interface Chat {
  id: string;
  user_id: string;
  title: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

interface Message {
  id: string;
  chat_id: string;
  user_id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

interface DbResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export async function createChat(userId: string): Promise<DbResponse<Chat>> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("chats")
      .insert({
        user_id: userId,
        title: null,
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (err) {
    return { success: false, error: "Failed to create chat" };
  }
}

export async function getUserChats(userId: string): Promise<DbResponse<Chat[]>> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("chats")
      .select("*")
      .eq("user_id", userId)
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data || [] };
  } catch (err) {
    return { success: false, error: "Failed to fetch chats" };
  }
}

export async function getChatMessages(
  chatId: string,
  userId: string
): Promise<DbResponse<Message[]>> {
  try {
    const supabase = await createClient();

    // Verify user owns this chat
    const { data: chat, error: chatError } = await supabase
      .from("chats")
      .select("user_id")
      .eq("id", chatId)
      .single();

    if (chatError || !chat || chat.user_id !== userId) {
      return { success: false, error: "Unauthorized" };
    }

    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("chat_id", chatId)
      .order("created_at", { ascending: true });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data || [] };
  } catch (err) {
    return { success: false, error: "Failed to fetch messages" };
  }
}

export async function saveMessage(
  chatId: string,
  userId: string,
  role: "user" | "assistant",
  content: string
): Promise<DbResponse<Message>> {
  try {
    const supabase = await createClient();

    // Verify user owns this chat
    const { data: chat, error: chatError } = await supabase
      .from("chats")
      .select("user_id")
      .eq("id", chatId)
      .single();

    if (chatError || !chat || chat.user_id !== userId) {
      return { success: false, error: "Unauthorized" };
    }

    const { data, error } = await supabase
      .from("messages")
      .insert({
        chat_id: chatId,
        user_id: userId,
        role,
        content,
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    // Update chat's updated_at timestamp
    await supabase
      .from("chats")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", chatId);

    return { success: true, data };
  } catch (err) {
    return { success: false, error: "Failed to save message" };
  }
}

export async function updateChatTitle(
  chatId: string,
  userId: string,
  title: string
): Promise<DbResponse<Chat>> {
  try {
    const supabase = await createClient();

    // Verify user owns this chat
    const { data: chat, error: chatError } = await supabase
      .from("chats")
      .select("user_id")
      .eq("id", chatId)
      .single();

    if (chatError || !chat || chat.user_id !== userId) {
      return { success: false, error: "Unauthorized" };
    }

    const { data, error } = await supabase
      .from("chats")
      .update({ title })
      .eq("id", chatId)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (err) {
    return { success: false, error: "Failed to update chat title" };
  }
}

export async function softDeleteChat(
  chatId: string,
  userId: string
): Promise<DbResponse<void>> {
  try {
    const supabase = await createClient();

    // Verify user owns this chat
    const { data: chat, error: chatError } = await supabase
      .from("chats")
      .select("user_id")
      .eq("id", chatId)
      .single();

    if (chatError || !chat || chat.user_id !== userId) {
      return { success: false, error: "Unauthorized" };
    }

    const { error } = await supabase
      .from("chats")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", chatId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: "Failed to delete chat" };
  }
}
