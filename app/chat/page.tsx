"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import AppLayout from "@/components/layouts/AppLayout";
import ChatInput from "@/components/ChatInput";
import ChatContainer from "@/components/ChatContainer";
import ChatList from "@/components/ChatList";
import { AlertCircle, Download, Settings, Share2, BarChart3, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

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
    <AppLayout
      sidebar={
        <ChatList
          chats={chats}
          selectedChatId={selectedChatId}
          onSelectChat={(id) => {
            setSelectedChatId(id);
          }}
          onNewChat={handleNewChat}
          onDeleteChat={handleDeleteChat}
        />
      }
    >
      {/* Error Banner - Inside Flex Column */}
      {error && (
        <div className="flex-shrink-0 border-b border-red-200 bg-red-50 px-4 py-3 dark:border-red-900/50 dark:bg-red-950/50">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600 dark:text-red-400" />
              <span className="text-sm font-medium text-red-900 dark:text-red-200">
                {error}
              </span>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-700 hover:text-red-900 dark:text-red-300 dark:hover:text-red-200"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Chat Area */}
      {selectedChatId ? (
        <>
          {/* Chat Header */}
          <div className="flex-shrink-0 border-b border-neutral-200 bg-white px-6 py-4 dark:border-neutral-800 dark:bg-neutral-950">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0 flex-1">
                <h2 className="truncate text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                  {chats.find((c) => c.id === selectedChatId)?.title || "Chat"}
                </h2>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  {messages.length} messages
                </p>
              </div>

              {/* Header Actions */}
              <div className="flex items-center gap-2">
                {/* Export */}
                <Button
                  variant="ghost"
                  size="icon"
                  title="Export chat"
                  onClick={() => {
                    // Placeholder for export functionality
                    const content = messages
                      .map((m) => `${m.role}: ${m.content}`)
                      .join("\n\n");
                    const element = document.createElement("a");
                    element.setAttribute(
                      "href",
                      "data:text/plain;charset=utf-8," +
                        encodeURIComponent(content)
                    );
                    element.setAttribute("download", "chat.txt");
                    element.style.display = "none";
                    document.body.appendChild(element);
                    element.click();
                    document.body.removeChild(element);
                  }}
                >
                  <Download className="h-4 w-4" />
                  <span className="sr-only">Export</span>
                </Button>

                {/* Share */}
                <Button
                  variant="ghost"
                  size="icon"
                  title="Share chat"
                >
                  <Share2 className="h-4 w-4" />
                  <span className="sr-only">Share</span>
                </Button>

                {/* Settings */}
                <Button
                  variant="ghost"
                  size="icon"
                  title="Chat settings"
                >
                  <Settings className="h-4 w-4" />
                  <span className="sr-only">Settings</span>
                </Button>

                {/* Stats */}
                <Button
                  variant="ghost"
                  size="icon"
                  title="Chat statistics"
                >
                  <BarChart3 className="h-4 w-4" />
                  <span className="sr-only">Stats</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Messages Container - Scrollable */}
          <ChatContainer messages={messages} isLoading={isLoading} />

          {/* Input Container - Sticky Bottom */}
          <ChatInput onSend={handleSendMessage} isLoading={isLoading} />
        </>
      ) : (
        <div className="flex flex-1 items-center justify-center">
          <div className="space-y-4 text-center">
            <div className="inline-block">
              <div className="text-6xl">💬</div>
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
                No conversation yet
              </h2>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Start a new chat or select one from your history
              </p>
            </div>
            <Button
              onClick={handleNewChat}
              disabled={isLoading}
              size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-700 dark:hover:bg-blue-800"
            >
              Start New Chat
            </Button>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
