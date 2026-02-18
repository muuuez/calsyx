import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Chatbox",
  description: "Chat with AI powered by Google Gemini",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): React.ReactElement {
  return (
    <html lang="en">
      <body className="bg-white font-sans text-neutral-900 dark:bg-neutral-950 dark:text-neutral-50">{children}</body>
    </html>
  );
}
