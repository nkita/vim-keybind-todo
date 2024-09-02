import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/provider/auth";
import { Zen_Kaku_Gothic_New } from "next/font/google";

const inter = Zen_Kaku_Gothic_New({ weight: "400", subsets: ["latin"] })

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
        <body className={inter.className}>{children}</body>
      </html>
    </AuthProvider>
  );
}
