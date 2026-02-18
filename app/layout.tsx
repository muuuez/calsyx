import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Calsyx - AI Conversations",
  description: "Modern AI-powered conversations with Calsyx",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): React.ReactElement {
  return (
    <html lang="en">
      <body className="bg-white font-sans text-neutral-900 dark:bg-neutral-950 dark:text-neutral-50">
        {children}
      </body>
    </html>
  );
}
