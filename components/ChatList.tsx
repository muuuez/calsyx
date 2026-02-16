"use client";

import { useCallback, useState } from "react";

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

  const handleDelete = useCallback(
    (chatId: string) => {
      onDeleteChat(chatId);
      setDeleteConfirm(null);
    },
    [onDeleteChat]
  );

  return (
    <div className="flex w-64 flex-col border-r border-gray-200 bg-gray-50">
      <button
        onClick={onNewChat}
        className="m-4 rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
      >
        + New Chat
      </button>

      <div className="flex-1 overflow-y-auto">
        {chats.length === 0 ? (
          <div className="p-4 text-center text-sm text-gray-500">
            No chats yet
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {chats.map((chat) => (
              <div
                key={chat.id}
                className="group relative flex items-center"
              >
                <button
                  onClick={() => onSelectChat(chat.id)}
                  className={`flex-1 truncate rounded px-3 py-2 text-left text-sm transition-colors ${
                    selectedChatId === chat.id
                      ? "bg-blue-100 text-blue-900"
                      : "text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {chat.title || "Untitled Chat"}
                </button>

                <button
                  onClick={() => setDeleteConfirm(chat.id)}
                  className="hidden rounded p-1 text-gray-400 hover:bg-red-100 hover:text-red-600 group-hover:block"
                  title="Delete chat"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {deleteConfirm && (
        <div className="border-t border-gray-200 bg-red-50 p-3">
          <p className="mb-2 text-sm text-gray-700">Delete this chat?</p>
          <div className="flex gap-2">
            <button
              onClick={() => handleDelete(deleteConfirm)}
              className="flex-1 rounded bg-red-600 px-2 py-1 text-xs font-medium text-white hover:bg-red-700"
            >
              Delete
            </button>
            <button
              onClick={() => setDeleteConfirm(null)}
              className="flex-1 rounded bg-gray-300 px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
