import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

interface AppLayoutProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
}

export default function AppLayout({ children, sidebar }: AppLayoutProps) {
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-white dark:bg-neutral-950">
      {/* Desktop Sidebar - Hidden on mobile, fixed width on desktop */}
      {sidebar && (
        <>
          <div className="hidden w-64 flex-shrink-0 flex-col lg:flex">
            {sidebar}
          </div>

          {/* Mobile Sidebar Overlay */}
          {showMobileSidebar && (
            <>
              <div
                className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                onClick={() => setShowMobileSidebar(false)}
              />
              <div className="fixed bottom-0 left-0 right-0 top-0 z-50 w-64 flex flex-col animate-in slide-in-from-left-full duration-200 lg:hidden">
                {sidebar}
              </div>
            </>
          )}
        </>
      )}

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex-shrink-0 border-b border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-950">
          <div className="mx-auto flex max-w-full items-center justify-between gap-4 px-6 py-3">
            {/* Left: Mobile Menu + Title */}
            <div className="flex items-center gap-3">
              {sidebar && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden"
                  onClick={() => setShowMobileSidebar(!showMobileSidebar)}
                  title="Toggle sidebar"
                >
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle sidebar</span>
                </Button>
              )}
              <h1 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">
                Calsyx
              </h1>
            </div>

            {/* Right: Spacer (reserved for future functional buttons only) */}
            <div />
          </div>
        </header>

        {/* Main Content - Chat Area */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
}
