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
    <div className="relative min-h-screen w-full overflow-hidden bg-neutral-50 dark:bg-neutral-950">
      {/* Content */}
      <div className="flex min-h-screen w-full items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Header */}
          {title && (
            <div className="mb-8 space-y-4 text-center">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-blue-600">
                <span className="text-xl font-bold text-white">AI</span>
              </div>
              <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
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
          <Card className="border border-neutral-200 bg-white shadow-sm rounded-lg dark:border-neutral-800 dark:bg-neutral-900">
            {children}
          </Card>

          {/* Trust Badges */}
          <div className="mt-6 flex flex-col items-center gap-4">
            <div className="flex items-center gap-4 text-xs text-neutral-600 dark:text-neutral-400">
              <div className="flex items-center gap-2">
                <span className="text-lg">✓</span>
                <span>Secure & Private</span>
              </div>
              <div className="h-1 w-1 rounded-full bg-neutral-300 dark:bg-neutral-700" />
              <div className="flex items-center gap-2">
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
