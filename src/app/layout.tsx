import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/provider/auth";
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Keyboard ToDo| ショートカットを駆使した爆速Todoアプリ",
  description: "ショートカットを駆使した爆速で管理できるTodoアプリです。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthProvider>
      <html lang="en">
        <body className={inter.className}>{children}</body>
      </html>
    </AuthProvider>
  );
}
