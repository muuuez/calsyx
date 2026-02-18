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

  // Render content with code block support
  const renderContent = () => {
    const codeBlockRegex = /```([\s\S]*?)```/g;
    const parts = msg.content.split(codeBlockRegex);

    return parts.map((part, idx) => {
      if (idx % 2 === 1) {
        // Code block
        return (
          <pre
            key={idx}
            className="my-2 overflow-x-auto rounded-lg bg-neutral-800 p-3 text-neutral-50 text-xs leading-relaxed border border-neutral-700/50 dark:bg-neutral-900 dark:border-neutral-700"
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
      className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* Assistant copy button (left) */}
      {msg.role === "assistant" && (
        <div className="shrink-0 help-opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 opacity-0 hover:opacity-100 transition-opacity duration-200"
            onClick={handleCopy}
            title="Copy message"
          >
            {copiedId === msg.id ? (
              <Check className="h-4 w-4 text-green-600" />
            ) : (
              <Copy className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />
            )}
          </Button>
        </div>
      )}

      {/* Message Card */}
      <Card
        className={`max-w-xl rounded-lg px-4 py-3 transition-colors duration-200 ${
          msg.role === "user"
            ? "bg-indigo-600 text-white dark:bg-indigo-600"
            : "bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-50"
        }`}
      >
        <div className="space-y-1">
          {renderContent()}
          <div
            className={`text-xs pt-1 border-t ${
              msg.role === "user"
                ? "border-indigo-700 text-indigo-100"
                : "border-neutral-200 dark:border-neutral-700 text-neutral-500 dark:text-neutral-400"
            }`}
          >
            {formatTime(msg.created_at)}
          </div>
        </div>
      </Card>

      {/* User copy button (right) */}
      {msg.role === "user" && (
        <div className="shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 opacity-0 hover:opacity-100 transition-opacity duration-200"
            onClick={handleCopy}
            title="Copy message"
          >
            {copiedId === msg.id ? (
              <Check className="h-4 w-4 text-green-400" />
            ) : (
              <Copy className="h-4 w-4 text-white" />
            )}
          </Button>
        </div>
      )}
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

  const formattedMessages = useMemo(() => messages, [messages]);

  return (
    <ScrollArea className="flex-1 overflow-hidden">
      <div className="h-full px-6 py-6">
        <div className="mx-auto w-full max-w-3xl flex flex-col gap-3">
          {/* Empty State */}
          {formattedMessages.length === 0 && !isLoading && (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-center text-base font-medium text-neutral-700 dark:text-neutral-300">
                Start a conversation
              </p>
              <p className="mt-1 text-center text-sm text-neutral-500 dark:text-neutral-400">
                Send a message to begin
              </p>
            </div>
          )}

          {/* Messages */}
          {formattedMessages.map((msg) => (
            <MessageBubble key={msg.id} msg={msg} />
          ))}

          {/* Loading State */}
          {isLoading && (
            <motion.div
              className="flex justify-start"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="rounded-lg bg-neutral-100 px-4 py-3 dark:bg-neutral-800">
                <div className="flex gap-2">
                  <Skeleton className="h-2 w-2 animate-pulse rounded-full" />
                  <Skeleton className="h-2 w-2 animate-pulse rounded-full" style={{ animationDelay: "100ms" }} />
                  <Skeleton className="h-2 w-2 animate-pulse rounded-full" style={{ animationDelay: "200ms" }} />
                </div>
              </Card>
            </motion.div>
          )}

          {/* Scroll anchor */}
          <div ref={bottomRef} className="h-0" />
        </div>
      </div>
    </ScrollArea>
  );
}

export default memo(ChatContainerComponent);
