import React from "react";
import { Card } from "@/components/ui/card";

interface AuthLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

export default function AuthLayout({
  children,
  title,
  description,
}: AuthLayoutProps) {
  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Animated Background Gradient */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-blue-50 via-neutral-50 to-indigo-50 dark:from-blue-950 dark:via-neutral-950 dark:to-indigo-950" />
      
      {/* Animated Blobs */}
      <div className="fixed -left-64 -top-64 h-96 w-96 rounded-full bg-blue-200/20 blur-3xl dark:bg-blue-900/20" />
      <div className="fixed -right-64 -bottom-64 h-96 w-96 rounded-full bg-indigo-200/20 blur-3xl dark:bg-indigo-900/20" />

      {/* Content */}
      <div className="relative flex min-h-screen w-full items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Header */}
          {title && (
            <div className="mb-8 space-y-3 text-center">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-600">
                <span className="text-xl font-bold text-white">AI</span>
              </div>
              <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-50">
                {title}
              </h1>
              {description && (
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  {description}
                </p>
              )}
            </div>
          )}

          {/* Form Card */}
          <Card className="border border-neutral-200/50 bg-white/80 backdrop-blur-sm shadow-xl dark:border-neutral-800/50 dark:bg-neutral-950/80">
            {children}
          </Card>

          {/* Trust Badges */}
          <div className="mt-6 flex flex-col items-center gap-4">
            <div className="flex items-center gap-4 text-xs text-neutral-600 dark:text-neutral-400">
              <div className="flex items-center gap-1">
                <span className="text-lg">✓</span>
                <span>Secure & Private</span>
              </div>
              <div className="h-1 w-1 rounded-full bg-neutral-300 dark:bg-neutral-700" />
              <div className="flex items-center gap-1">
                <span className="text-lg">🔒</span>
                <span>End-to-End</span>
              </div>
            </div>

            {/* Footer Text */}
            <p className="text-center text-xs text-neutral-500 dark:text-neutral-400">
              Part of AI Chatbox • Powered by OpenRouter
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
