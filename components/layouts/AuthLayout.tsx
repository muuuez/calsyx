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
    <div className="relative min-h-screen w-full overflow-hidden bg-white dark:bg-neutral-950">
      {/* Content */}
      <div className="flex min-h-screen w-full items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Header */}
          {title && (
            <div className="mb-8 space-y-3 text-center">
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
          <Card className="border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 shadow-sm">
            {children}
          </Card>
        </div>
      </div>
    </div>
  );
}
