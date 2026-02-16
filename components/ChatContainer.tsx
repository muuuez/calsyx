"use client";

import { memo, useEffect, useRef, useMemo } from "react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

interface ChatContainerProps {
  messages: Message[];
  isLoading: boolean;
}

function ChatContainerComponent({
  messages,
  isLoading,
}: ChatContainerProps): React.ReactElement {
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Use intersection observer for smooth scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Auto-scroll only if already near bottom
          bottomRef.current?.scrollIntoView({ behavior: "smooth" });
        }
      },
      { threshold: 0.5 }
    );

    if (bottomRef.current) {
      observer.observe(bottomRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Memoize formatted messages to prevent re-renders
  const formattedMessages = useMemo(() => messages, [messages]);

  return (
    <div
      ref={containerRef}
      className="flex flex-1 flex-col overflow-y-auto bg-white"
    >
      <div className="flex-1 space-y-2 p-4">
        {formattedMessages.length === 0 && !isLoading && (
          <div className="flex h-full items-center justify-center text-center text-gray-500">
            <p>No messages yet. Start a conversation!</p>
          </div>
        )}

        {formattedMessages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-xs break-words rounded-lg px-4 py-2 text-sm sm:max-w-sm md:max-w-md lg:max-w-lg ${
                msg.role === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-900"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="rounded-lg bg-gray-100 px-4 py-2">
              <div className="flex gap-1">
                <span className="inline-block h-2 w-2 animate-bounce rounded-full bg-gray-400"></span>
                <span className="inline-block h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: "0.1s" }}></span>
                <span className="inline-block h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: "0.2s" }}></span>
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  );
}

export default memo(ChatContainerComponent);
