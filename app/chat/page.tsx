"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import ChatInput from "@/components/ChatInput";
import ChatContainer from "@/components/ChatContainer";
import ChatList from "@/components/ChatList";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

interface Chat {
  id: string;
  title: string | null;
  created_at: string;
}

interface CacheData {
  chats: Chat[];
  messages: Record<string, Message[]>;
  timestamp: number;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const CACHE_KEY = "chat_app_cache";

export default function ChatPage(): React.ReactElement {
  const router = useRouter();
  const cacheRef = useRef<CacheData>({ chats: [], messages: {}, timestamp: 0 });

  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Restore cache from sessionStorage
  useEffect(() => {
    const cached = sessionStorage.getItem(CACHE_KEY);
    if (cached) {
      try {
        const data = JSON.parse(cached) as CacheData;
        if (Date.now() - data.timestamp < CACHE_DURATION) {
          cacheRef.current = data;
          setChats(data.chats);
          if (data.chats.length > 0) {
            setSelectedChatId(data.chats[0].id);
          }
        }
      } catch {
        // Silently fail cache restoration
      }
    }
  }, []);

  // Save cache to sessionStorage
  const saveCache = useCallback((chatsData: Chat[], messagesData: Record<string, Message[]>) => {
    cacheRef.current = { chats: chatsData, messages: messagesData, timestamp: Date.now() };
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(cacheRef.current));
  }, []);

  // Load chats on mount or when cache is empty
  useEffect(() => {
    if (chats.length > 0) return;

    const loadChats = async (): Promise<void> => {
      try {
        setError(null);
        const response = await fetch("/api/chats", { method: "GET" });
        
        if (response.status === 401) {
          router.push("/auth/login");
          return;
        }

        if (!response.ok) {
          throw new Error(response.status === 500 ? "Server error. Please try again." : "Failed to load chats");
        }

        const data = await response.json() as { chats: Chat[] };
        setChats(data.chats);
        saveCache(data.chats, cacheRef.current.messages);

        if (data.chats.length > 0) {
          setSelectedChatId(data.chats[0].id);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Error loading chats";
        setError(message);
      }
    };

    loadChats();
  }, []);

  // Load messages when selected chat changes
  useEffect(() => {
    if (!selectedChatId) return;

    // Check cache first
    const cached = cacheRef.current.messages[selectedChatId];
    if (cached) {
      setMessages(cached);
      return;
    }

    const loadMessages = async (): Promise<void> => {
      try {
        setError(null);
        const response = await fetch(`/api/chat/messages?chatId=${selectedChatId}`, {
          method: "GET",
        });

        if (response.status === 401) {
          router.push("/auth/login");
          return;
        }

        if (!response.ok) {
          throw new Error("Failed to load messages");
        }

        const data = await response.json() as { messages: Message[] };
        setMessages(data.messages);

        // Update cache
        const updated = { ...cacheRef.current.messages, [selectedChatId]: data.messages };
        saveCache(chats, updated);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Error loading messages";
        setError(message);
      }
    };

    loadMessages();
  }, [selectedChatId, chats, saveCache]);

  const handleNewChat = useCallback(async (): Promise<void> => {
    try {
      setError(null);
      setIsLoading(true);

      const response = await fetch("/api/chats", { method: "POST" });

      if (response.status === 401) {
        router.push("/auth/login");
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to create chat");
      }

      const data = await response.json() as { chat: Chat };
      const updatedChats = [data.chat, ...chats];
      setChats(updatedChats);
      setSelectedChatId(data.chat.id);
      setMessages([]);
      saveCache(updatedChats, cacheRef.current.messages);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error creating chat";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [chats, saveCache, router]);

  const handleSendMessage = useCallback(
    async (message: string): Promise<void> => {
      if (!selectedChatId) return;

      try {
        setError(null);
        setIsLoading(true);

        // Optimistic update
        const userMsg: Message = {
          id: `temp-user-${Date.now()}`,
          role: "user",
          content: message,
          created_at: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, userMsg]);

        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chatId: selectedChatId, message }),
        });

        if (response.status === 401) {
          router.push("/auth/login");
          return;
        }

        if (!response.ok) {
          const data = await response.json() as { error?: string };
          throw new Error(data.error || "Failed to send message");
        }

        const data = await response.json() as {
          userMessage: Message;
          assistantMessage: Message;
        };

        // Replace temp messages with real ones
        setMessages((prev) =>
          prev
            .filter((m) => !m.id.startsWith("temp-"))
            .concat([data.userMessage, data.assistantMessage])
        );

        // Update cache
        const updated = { ...cacheRef.current.messages, [selectedChatId]: [data.userMessage, data.assistantMessage] };
        saveCache(chats, updated);

        // Generate title if first message
        if (messages.length === 0) {
          await fetch("/api/chat/title", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ chatId: selectedChatId, message }),
          }).catch(() => {
            // Silently fail
          });

          // Refresh chats
          const chatsResponse = await fetch("/api/chats", { method: "GET" });
          if (chatsResponse.ok) {
            const chatsData = await chatsResponse.json() as { chats: Chat[] };
            setChats(chatsData.chats);
            saveCache(chatsData.chats, updated);
          }
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Error sending message";
        setError(message);
        // Remove optimistic message on error
        setMessages((prev) => prev.slice(0, -1));
      } finally {
        setIsLoading(false);
      }
    },
    [selectedChatId, messages.length, chats, saveCache, router]
  );

  const handleDeleteChat = useCallback(
    async (chatId: string): Promise<void> => {
      try {
        const response = await fetch("/api/chat/delete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chatId }),
        });

        if (!response.ok) {
          throw new Error("Failed to delete chat");
        }

        const updatedChats = chats.filter((c) => c.id !== chatId);
        setChats(updatedChats);

        if (selectedChatId === chatId) {
          setSelectedChatId(updatedChats.length > 0 ? updatedChats[0].id : null);
          setMessages([]);
        }

        const updated = { ...cacheRef.current.messages };
        delete updated[chatId];
        saveCache(updatedChats, updated);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Error deleting chat";
        setError(message);
      }
    },
    [chats, selectedChatId, saveCache]
  );

  return (
    <div className="flex h-screen bg-white">
      {/* Mobile menu toggle */}
      <div className="hidden sm:hidden">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="fixed bottom-4 right-4 z-50 rounded-full bg-blue-600 p-3 text-white"
        >
          ☰
        </button>
      </div>

      {/* Sidebar */}
      <div
        className={`${
          isMobileMenuOpen ? "fixed inset-0 z-40" : "hidden sm:flex"
        } sm:flex w-full sm:w-64 flex-col border-r border-gray-200 bg-gray-50`}
        onClick={() => setIsMobileMenuOpen(false)}
      >
        <div onClick={(e) => e.stopPropagation()}>
          <ChatList
            chats={chats}
            selectedChatId={selectedChatId}
            onSelectChat={(id) => {
              setSelectedChatId(id);
              setIsMobileMenuOpen(false);
            }}
            onNewChat={handleNewChat}
            onDeleteChat={handleDeleteChat}
          />
        </div>
      </div>

      {/* Main chat area */}
      <div className="flex flex-1 flex-col">
        {error && (
          <div className="border-b border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
            {error}
            <button
              onClick={() => setError(null)}
              className="ml-2 font-medium hover:underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {selectedChatId ? (
          <>
            <ChatContainer messages={messages} isLoading={isLoading} />
            <ChatInput onSend={handleSendMessage} isLoading={isLoading} />
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center">
            <button
              onClick={handleNewChat}
              disabled={isLoading}
              className="rounded bg-blue-600 px-6 py-2 font-medium text-white hover:bg-blue-700 disabled:bg-gray-400"
            >
              Start a new chat
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
