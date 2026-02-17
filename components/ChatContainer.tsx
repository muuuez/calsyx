"use client";

import { memo, useEffect, useRef, useMemo, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";

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

function MessageBubble({ msg }: { msg: Message }) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(msg.content);
      setCopiedId(msg.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Enhanced code block detection and rendering
  const renderContent = () => {
    const codeBlockRegex = /```([\s\S]*?)```/g;
    const parts = msg.content.split(codeBlockRegex);

    return parts.map((part, idx) => {
      if (idx % 2 === 1) {
        // Code block
        return (
          <pre
            key={idx}
            className="my-2 overflow-x-auto rounded-lg bg-neutral-900 p-4 text-neutral-50 text-xs leading-relaxed dark:bg-neutral-800"
          >
            <code>{part.trim()}</code>
          </pre>
        );
      }
      return (
        <p key={idx} className="whitespace-pre-wrap break-words text-sm leading-relaxed">
          {part}
        </p>
      );
    });
  };

  return (
    <div
      key={msg.id}
      className={`flex animate-in slide-in-from-bottom-2 transition-all duration-300 ${
        msg.role === "user" ? "justify-end" : "justify-start"
      }`}
      onMouseEnter={() => setHoveredId(msg.id)}
      onMouseLeave={() => setHoveredId(null)}
    >
      <div className="flex max-w-xl items-end gap-2">
        {msg.role === "assistant" && hoveredId === msg.id && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
            onClick={handleCopy}
            title="Copy message"
          >
            {copiedId === msg.id ? (
              <Check className="h-4 w-4 text-green-600" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        )}

        <Card
          className={`rounded-lg px-5 py-3 transition-all duration-200 ${
            msg.role === "user"
              ? "bg-blue-600 text-white dark:bg-blue-700"
              : "border border-neutral-200 bg-white text-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-50"
          }`}
        >
          <div className="space-y-2">
            {renderContent()}
            {hoveredId === msg.id && (
              <div
                className={`text-xs transition-opacity duration-200 ${
                  msg.role === "user"
                    ? "text-blue-100"
                    : "text-neutral-500 dark:text-neutral-400"
                }`}
              >
                {formatTime(msg.created_at)}
              </div>
            )}
          </div>
        </Card>

        {msg.role === "user" && hoveredId === msg.id && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={handleCopy}
            title="Copy message"
          >
            {copiedId === msg.id ? (
              <Check className="h-4 w-4 text-green-400" />
            ) : (
              <Copy className="h-4 w-4 text-white opacity-70" />
            )}
          </Button>
        )}
      </div>
    </div>
  );
}

function ChatContainerComponent({
  messages,
  isLoading,
}: ChatContainerProps): React.ReactElement {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    const timer = setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 0);
    return () => clearTimeout(timer);
  }, [messages, isLoading]);

  // Memoize formatted messages
  const formattedMessages = useMemo(() => messages, [messages]);

  return (
    <ScrollArea className="flex-1 bg-white dark:bg-neutral-900">
      <div className="mx-auto max-w-3xl space-y-4 p-6">
        {/* Empty State */}
        {formattedMessages.length === 0 && !isLoading && (
          <div className="flex h-96 items-center justify-center rounded-lg border-2 border-dashed border-neutral-200 bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800/50">
            <div className="text-center">
              <div className="mb-3 text-4xl">💬</div>
              <p className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">
                Start a conversation
              </p>
              <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
                Begin by sending your first message below
              </p>
            </div>
          </div>
        )}

        {/* Messages */}
        {formattedMessages.map((msg) => (
          <MessageBubble key={msg.id} msg={msg} />
        ))}

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-start">
            <Card className="rounded-lg border border-neutral-200 bg-white px-5 py-3 dark:border-neutral-700 dark:bg-neutral-900">
              <div className="flex gap-2">
                <Skeleton className="h-2 w-2 animate-pulse rounded-full" />
                <Skeleton className="h-2 w-2 animate-pulse rounded-full" style={{ animationDelay: "100ms" }} />
                <Skeleton className="h-2 w-2 animate-pulse rounded-full" style={{ animationDelay: "200ms" }} />
              </div>
            </Card>
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  );
}

export default memo(ChatContainerComponent);
