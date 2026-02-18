import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, Plus, Moon, Sun, HelpCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface AppLayoutProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
}

export default function AppLayout({ children, sidebar }: AppLayoutProps) {
  const [showHelp, setShowHelp] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  const toggleDarkMode = () => {
    const html = document.documentElement;
    html.classList.toggle("dark");
    setIsDark(!isDark);
  };

  return (
    <div className="flex h-screen w-full bg-white dark:bg-neutral-950">
      {/* Desktop Sidebar */}
      {sidebar && (
        <>
          <div className="hidden flex-shrink-0 lg:flex">
            {sidebar}
          </div>

          {/* Mobile Sidebar Overlay */}
          {showMobileSidebar && (
            <>
              <div
                className="fixed inset-0 z-40 bg-black/50 lg:hidden animate-in fade-in-0 duration-200"
                onClick={() => setShowMobileSidebar(false)}
              />
              <div className="fixed bottom-0 left-0 right-0 top-0 z-50 w-64 lg:hidden animate-in slide-in-from-left-full duration-200">
                {sidebar}
              </div>
            </>
          )}
        </>
      )}

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header Bar - Premium SaaS */}
        <header className="shrink-0 border-b border-neutral-200/50 dark:border-neutral-800/50 bg-white dark:bg-neutral-950 px-6 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Left: Mobile Menu + Title */}
            <div className="flex items-center gap-3">
              {sidebar && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden"
                  onClick={() => setShowMobileSidebar(!showMobileSidebar)}
                >
                  <Menu className="h-4 w-4" />
                  <span className="sr-only">Toggle sidebar</span>
                </Button>
              )}
              <h1 className="text-base font-semibold text-neutral-900 dark:text-neutral-50">

                AI Chatbox
              </h1>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
              {/* Dark Mode Toggle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleDarkMode}
                title="Toggle dark mode"
              >
                {isDark ? (
                  <Sun className="h-5 w-5 text-yellow-500" />
                ) : (
                  <Moon className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
                )}
                <span className="sr-only">Toggle theme</span>
              </Button>

              {/* Help */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowHelp(true)}
                title="Keyboard shortcuts"
              >
                <HelpCircle className="h-5 w-5" />
                <span className="sr-only">Help</span>
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {children}
        </div>

        {/* Mobile Floating Action Button - Premium */}
        <Button
          className="fixed bottom-6 right-6 hidden gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 active:scale-95 shadow-lg transition-transform duration-100 max-sm:flex sm:hidden"
          onClick={() => {
            // This would trigger new chat from the page component
            const event = new CustomEvent("createNewChat");
            window.dispatchEvent(event);
          }}
        >
          <Plus className="h-4 w-4" />
          <span className="text-sm font-medium">New</span>
        </Button>
      </div>

      {/* Keyboard Shortcuts Help Modal - Premium */}
      <Dialog open={showHelp} onOpenChange={setShowHelp}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">Keyboard Shortcuts</DialogTitle>
            <DialogDescription>
              Quick commands to navigate the app
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-neutral-900 dark:text-neutral-50">
                  Send message
                </span>
                <kbd className="rounded border border-neutral-300/50 dark:border-neutral-700/50 bg-neutral-50 dark:bg-neutral-900/50 px-2 py-1 font-mono text-xs text-neutral-600 dark:text-neutral-400">
                  Enter
                </kbd>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-neutral-900 dark:text-neutral-50">
                  New line in message
                </span>
                <kbd className="rounded border border-neutral-300/50 dark:border-neutral-700/50 bg-neutral-50 dark:bg-neutral-900/50 px-2 py-1 font-mono text-xs text-neutral-600 dark:text-neutral-400">
                  Shift + Enter
                </kbd>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-neutral-900 dark:text-neutral-50">
                  Search chats
                </span>
                <kbd className="rounded border border-neutral-300/50 dark:border-neutral-700/50 bg-neutral-50 dark:bg-neutral-900/50 px-2 py-1 font-mono text-xs text-neutral-600 dark:text-neutral-400">
                  Cmd + K
                </kbd>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
