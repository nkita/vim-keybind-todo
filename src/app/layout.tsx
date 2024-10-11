import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/provider/auth";
import { Toaster } from "@/components/ui/sonner"

import { Noto_Sans_JP } from "next/font/google";
import { TodoProvider } from "@/provider/todo";

const noto = Noto_Sans_JP({
  weight: ["400", "500", "600", "700", "800"],
  style: ["normal"],
  subsets: ["latin"],
});


export const metadata: Metadata = {
  title: "Shiba ToDo | ショートカットを駆使した爆速Todoアプリ",
  description: "ショートカットを駆使した爆速で管理できるTodoアプリです。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthProvider>
      <TodoProvider>
        <html>
          <body className={noto.className}>
            {children}
            <Toaster position="top-center" richColors />
          </body>
        </html>
      </TodoProvider>
    </AuthProvider>
  );
}
