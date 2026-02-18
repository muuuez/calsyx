"use client";

import { useCallback, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, MoreVertical, Trash2, Search, Star, Edit2, Check, X } from "lucide-react";

interface Chat {
  id: string;
  title: string | null;
  created_at: string;
}

interface ChatListProps {
  chats: Chat[];
  selectedChatId: string | null;
  onSelectChat: (chatId: string) => void;
  onNewChat: () => void;
  onDeleteChat: (chatId: string) => void;
}

export default function ChatList({
  chats,
  selectedChatId,
  onSelectChat,
  onNewChat,
  onDeleteChat,
}: ChatListProps) {
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [renameId, setRenameId] = useState<string | null>(null);
  const [renamingTitle, setRenamingTitle] = useState("");

  const handleDelete = useCallback(
    (chatId: string) => {
      onDeleteChat(chatId);
      setDeleteConfirm(null);
    },
    [onDeleteChat]
  );

  const toggleFavorite = (chatId: string) => {
    setFavorites((prev) => {
      const updated = new Set(prev);
      if (updated.has(chatId)) {
        updated.delete(chatId);
      } else {
        updated.add(chatId);
      }
      return updated;
    });
  };

  const startRename = (chat: Chat) => {
    setRenameId(chat.id);
    setRenamingTitle(chat.title || "");
  };

  const formatDate = (date: string) => {
    const d = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (d.toDateString() === today.toDateString()) {
      return "Today";
    } else if (d.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else if (d.getTime() > today.getTime() - 7 * 24 * 60 * 60 * 1000) {
      return "This Week";
    } else {
      return "Older";
    }
  };

  // Filter and group chats
  const groupedChats = useMemo(() => {
    let filtered = chats.filter((chat) =>
      (chat.title || "Untitled Chat")
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    );

    // Sort favorites to top
    const favChats = filtered.filter((c) => favorites.has(c.id));
    const other = filtered.filter((c) => !favorites.has(c.id));

    const grouped: Record<string, Chat[]> = {
      "⭐ Favorites": favChats,
    };

    // Group others by date
    const dateGroups: Record<string, Chat[]> = {};
    other.forEach((chat) => {
      const dateGroup = formatDate(chat.created_at);
      if (!dateGroups[dateGroup]) {
        dateGroups[dateGroup] = [];
      }
      dateGroups[dateGroup].push(chat);
    });

    Object.assign(grouped, dateGroups);
    return grouped;
  }, [chats, searchQuery, favorites]);

  return (
    <>
      {/* Sidebar */}
      <div className="flex w-64 flex-col border-r border-neutral-300/50 bg-white dark:border-neutral-700/50 dark:bg-neutral-950">
        {/* New Chat Button - Sticky Top */}
        <div className="shrink-0 space-y-3 border-b border-neutral-300/50 bg-white p-4 dark:border-neutral-700/50 dark:bg-neutral-950">
          <Button
            onClick={onNewChat}
            className="w-full gap-2 rounded-lg bg-blue-600 dark:bg-blue-700"
            size="sm"
          >
            <Plus className="h-4 w-4" />
            New Chat
          </Button>

          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-400" />
            <Input
              type="text"
              placeholder="Search chats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 border border-neutral-300/50 bg-white pl-8 text-sm transition-colors duration-150 focus-visible:ring-1 focus-visible:ring-blue-500/30 dark:border-neutral-700/50 dark:bg-neutral-900 dark:text-neutral-50"
            />
          </div>
        </div>

        {/* Chat List - Scrollable */}
        <ScrollArea className="flex-1">
          <div className="space-y-1 p-4">
            {chats.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  No chats yet
                </p>
              </div>
            ) : Object.entries(groupedChats).every(([_, items]) => items.length === 0) ? (
              <div className="px-4 py-8 text-center">
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  No chats match "{searchQuery}"
                </p>
              </div>
            ) : (
              Object.entries(groupedChats).map(([group, groupChats]) =>
                groupChats.length > 0 ? (
                  <div key={group}>
                    <div className="px-3 py-2 text-xs font-semibold uppercase text-neutral-500 dark:text-neutral-400">
                      {group}
                    </div>
                    <div className="space-y-1">
                      {groupChats.map((chat) => (
                        <div key={chat.id} className="group relative">
                          {renameId === chat.id ? (
                            // Rename Mode
                            <div className="flex items-center gap-1 rounded-lg border border-blue-500/50 dark:border-blue-500/30 bg-white dark:bg-neutral-900 p-1.5">
                              <Input
                                autoFocus
                                value={renamingTitle}
                                onChange={(e) => setRenamingTitle(e.target.value)}
                                className="h-6 border-0 bg-white dark:bg-neutral-900 text-sm px-1"
                                maxLength={50}
                              />
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-5 w-5 shrink-0"
                                onClick={() => {
                                  // In production, you'd call an API to update the title
                                  setRenameId(null);
                                }}
                              >
                                <Check className="h-3 w-3 text-green-600" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-5 w-5 shrink-0"
                                onClick={() => setRenameId(null)}
                              >
                                <X className="h-3 w-3 text-neutral-500" />
                              </Button>
                            </div>
                          ) : (
                            // Normal Mode
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => onSelectChat(chat.id)}
                                className={`flex-1 truncate rounded-lg pl-3 pr-3 py-2 text-left text-sm transition-[background-color,padding-left,transform] duration-150 ${
                                  selectedChatId === chat.id
                                    ? "bg-neutral-200/60 dark:bg-neutral-800/60 text-neutral-900 dark:text-neutral-50 scale-[1.01]"
                                    : "text-neutral-700 hover:bg-neutral-100/50 hover:pl-[14px] dark:text-neutral-300 dark:hover:bg-neutral-800/30"
                                }`}
                              >
                                <span className="line-clamp-1">
                                  {chat.title || "Untitled Chat"}
                                </span>
                              </button>

                              {/* Hover Actions */}
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 shrink-0 opacity-0 transition-opacity duration-150 group-hover:opacity-100"
                                  >
                                    <MoreVertical className="h-3.5 w-3.5" />
                                    <span className="sr-only">Options</span>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48 animate-in fade-in-0 slide-in-from-top-2 duration-200">
                                  <DropdownMenuItem
                                    onClick={() => toggleFavorite(chat.id)}
                                    className="cursor-pointer"
                                  >
                                    <Star
                                      className={`mr-2 h-4 w-4 ${
                                        favorites.has(chat.id)
                                          ? "fill-yellow-500 text-yellow-500"
                                          : ""
                                      }`}
                                    />
                                    {favorites.has(chat.id) ? "Unstar" : "Star Chat"}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => startRename(chat)}
                                    className="cursor-pointer"
                                  >
                                    <Edit2 className="mr-2 h-4 w-4" />
                                    Rename
                                  </DropdownMenuItem>
                                  <Separator />
                                  <DropdownMenuItem
                                    onClick={() => setDeleteConfirm(chat.id)}
                                    className="cursor-pointer text-red-600 dark:text-red-400"
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          )}

                          {/* Timestamp on Hover */}
                          {selectedChatId === chat.id && !renameId && (
                            <div className="px-3 text-xs text-neutral-400 dark:text-neutral-500">
                              {new Date(chat.created_at).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null
              )
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirm !== null} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Chat</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this chat? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setDeleteConfirm(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
