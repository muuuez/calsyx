"use client";

import { memo, useEffect, useRef, useMemo, useState } from "react";
import { motion } from "framer-motion";
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
            className="my-2 overflow-x-auto rounded-lg bg-neutral-950 p-3 text-neutral-50 text-xs leading-relaxed border border-neutral-800/50 dark:bg-neutral-900 dark:border-neutral-700/50"
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
    <motion.div
      key={msg.id}
      className={`flex ${
        msg.role === "user" ? "justify-end" : "justify-start"
      }`}
      initial={{ opacity: 0, y: 20, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      onMouseEnter={() => setHoveredId(msg.id)}
      onMouseLeave={() => setHoveredId(null)}
    >
      <div className="flex max-w-xl items-end gap-2">
        {msg.role === "assistant" && hoveredId === msg.id && (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0 opacity-0 transition-opacity duration-150 group-hover:opacity-100"
            onClick={handleCopy}
            title="Copy message"
          >
            {copiedId === msg.id ? (
              <Check className="h-3.5 w-3.5 text-green-600" />
            ) : (
              <Copy className="h-3.5 w-3.5 text-neutral-600 dark:text-neutral-400" />
            )}
          </Button>
        )}

        <Card
          className={`rounded-lg px-4 py-2.5 transition-[colors,border-color,background-color] duration-150 ${
            msg.role === "user"
              ? "bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
              : "border border-neutral-300/50 bg-white text-neutral-900 hover:bg-neutral-50 hover:border-neutral-300 dark:border-neutral-700/50 dark:bg-neutral-900 dark:text-neutral-50 dark:hover:bg-neutral-800/50 dark:hover:border-neutral-700"
          }`}
        >
          <div className="space-y-2">
            {renderContent()}
            <div
              className={`text-xs transition-opacity duration-150 ${
                hoveredId === msg.id ? "opacity-100" : "opacity-0"
              } ${
                msg.role === "user"
                  ? "text-blue-100"
                  : "text-neutral-500 dark:text-neutral-400"
              }`}
            >
              {formatTime(msg.created_at)}
            </div>
          </div>
        </Card>

        {msg.role === "user" && hoveredId === msg.id && (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0 opacity-70 hover:opacity-100 transition-opacity duration-150"
            onClick={handleCopy}
            title="Copy message"
          >
            {copiedId === msg.id ? (
              <Check className="h-3.5 w-3.5 text-green-400" />
            ) : (
              <Copy className="h-3.5 w-3.5 text-white" />
            )}
          </Button>
        )}
      </div>
    </motion.div>
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
    <ScrollArea className="flex-1">
      <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl shadow-[0_0_60px_rgba(99,102,241,0.15)] m-6">
        <div className="mx-auto max-w-3xl space-y-3 p-6">
        {/* Empty State */}
        {formattedMessages.length === 0 && !isLoading && (
          <div className="flex h-96 items-center justify-center rounded-lg border border-dashed border-neutral-300/50 bg-neutral-50/50 dark:border-neutral-700/50 dark:bg-neutral-900/50">
            <div className="text-center">
              <div className="mb-3 text-4xl">💬</div>
              <p className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                Start a Calsyx conversation
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
          <div className="flex justify-start animate-in fade-in-0 slide-in-from-bottom-2 duration-200">
            <Card className="rounded-lg border border-neutral-300/50 bg-white px-4 py-2.5 dark:border-neutral-700/50 dark:bg-neutral-900">
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
      </div>
    </ScrollArea>
  );
}

export default memo(ChatContainerComponent);
