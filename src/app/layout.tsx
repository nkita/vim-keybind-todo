import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/provider/auth";
// import { Zen_Kaku_Gothic_New } from "next/font/google";
import { Toaster } from "@/components/ui/sonner"
// const inter = Zen_Kaku_Gothic_New({ weight: "400", subsets: ["latin"] })

import { Noto_Sans_JP } from "next/font/google";
import { useEffect } from "react";

const noto = Noto_Sans_JP({
  weight: ["400"],
  style: "normal",
  subsets: ["latin"],
});


export const metadata: Metadata = {
  title: "キーボードでToDo| ショートカットを駆使した爆速Todoアプリ",
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
        <body className={noto.className}>
          {children}
          <Toaster position="top-center" richColors />
        </body>
      </html>
    </AuthProvider>
  );
}
