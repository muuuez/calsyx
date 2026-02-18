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
      <body className="bg-white font-sans text-neutral-900 dark:bg-[#0A0F1C] dark:text-neutral-50">
        <div className="fixed inset-0 -z-10 bg-gradient-to-br from-[#0f172a] via-[#0b1120] to-[#020617]" />
        <div className="fixed inset-0 -z-10 animate-gradient bg-[length:200%_200%] bg-gradient-to-br from-indigo-900/20 via-slate-900/10 to-cyan-900/20" />
        {children}
      </body>
    </html>
  );
}
