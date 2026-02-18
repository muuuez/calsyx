"use client";

import { useCallback, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2 } from "lucide-react";

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
}

export default function ChatInput({ onSend, isLoading }: ChatInputProps) {
  const [message, setMessage] = useState<string>("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = useCallback(() => {
    if (message.trim() && !isLoading) {
      onSend(message);
      setMessage("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  }, [message, isLoading, onSend]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value.slice(0, 2000);
      setMessage(value);

      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
        textareaRef.current.style.height = `${Math.min(
          textareaRef.current.scrollHeight,
          120
        )}px`;
      }
    },
    []
  );

  return (
    <div className="flex-shrink-0 border-t border-neutral-200/50 dark:border-neutral-800/50 bg-white dark:bg-neutral-950">
      <div className="mx-auto max-w-3xl px-6 py-3">
        <div className="space-y-3">
            {/* Textarea + Actions Row */}
            <div className="flex gap-2">
              <Textarea
                ref={textareaRef}
                value={message}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                placeholder="Type your message... (Shift+Enter for new line)"
                disabled={isLoading}
                rows={1}
                className="resize-none border border-neutral-300 bg-white px-3 py-2 text-sm transition-colors duration-150 focus-visible:ring-1 focus-visible:ring-blue-500/30 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-50"
              />

              {/* Action Buttons */}
              <div className="flex flex-col gap-1">
                {/* Send Button */}
                <Button
                  onClick={handleSend}
                  disabled={!message.trim() || isLoading}
                  size="icon"
                  className="h-9 w-9 shrink-0 bg-gradient-to-r from-indigo-500 to-cyan-500 hover:shadow-[0_0_25px_rgba(99,102,241,0.6)] active:scale-95 transition-all duration-200"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  <span className="sr-only">Send message</span>
                </Button>
              </div>
            </div>

            {/* Bottom Row: Character Counter */}
            <div className="flex items-center justify-end gap-2">
              {/* Character Counter */}
              <div className="text-right text-xs text-neutral-500 dark:text-neutral-400">
                <span className={message.length > 1800 ? "text-orange-600 dark:text-orange-400 font-medium" : ""}>
                  {message.length}
                </span>
                <span className="text-neutral-400">/2000</span>
              </div>
            </div>

            {/* Keyboard Hint */}
            <div className="text-xs text-neutral-500 dark:text-neutral-400">
              Press <kbd className="rounded border border-neutral-300/50 bg-neutral-50 px-1 py-0.5 font-mono text-xs dark:border-neutral-700/50 dark:bg-neutral-900/50">Shift</kbd>{" "}
              + <kbd className="rounded border border-neutral-300/50 bg-neutral-50 px-1 py-0.5 font-mono text-xs dark:border-neutral-700/50 dark:bg-neutral-900/50">Enter</kbd>{" "}
              for new line
            </div>
          </div>
      </div>
    </div>
  );
}
