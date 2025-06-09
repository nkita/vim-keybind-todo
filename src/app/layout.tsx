import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/provider/auth";
import { Toaster } from "@/components/ui/sonner"

import { Noto_Sans_JP } from "next/font/google";
import { OfflineTodoProvider } from "@/provider/offline-todo";


import Script from "next/script";

const noto = Noto_Sans_JP({
  weight: ["400", "500", "600", "700", "800"],
  style: ["normal"],
  subsets: ["latin"],
});


export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_DOMAIN || ""),
  openGraph: {
    images: [
      {
        url: `https://${process.env.NEXT_PUBLIC_S3_DOMAIN}/og.png`,
        width: 1200,
        height: 630,
        alt: "Shiba Todo Logo",
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
    nocache: true,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  title: "Shiba ToDo | シンプルで最速のタスク管理ツール",
  description: "Shiba Todoは、キーボード操作を最優先に設計された究極にシンプルなタスク管理サービスです。ホームポジションから手を離さずに、タスクの作成から完了までを最短ステップでサポート。シンプルなUIでタスクに集中し、生産性を最大化します。",
};

export const viewport = {
  themeColor: '#16A34A'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const gaid = process.env.GAID
  return (
    <AuthProvider>
      <OfflineTodoProvider>
        <html>
          <body className={noto.className}>
            <Script src={"https://www.googletagmanager.com/gtag/js?id=" + gaid} />
            <Script id="google-analytics">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
 
                gtag('config', "${gaid}");
            `}
            </Script>
            {children}
            <Toaster position="bottom-right" richColors closeButton />
          </body>
        </html>
      </OfflineTodoProvider>
    </AuthProvider>
  );
}
