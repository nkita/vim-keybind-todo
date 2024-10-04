'use client'
import Image from "next/image"
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Noto_Sans_JP } from "next/font/google";

const noto = Noto_Sans_JP({
    weight: ["400"],
    style: "normal",
    subsets: ["latin"],
});

export default function NotFound() {
    return (
        <>
            <html>
                <body className={noto.className}>
                    <header>
                        <title>{"404 Not Found | Shiba Todo"}</title>
                    </header>
                    <div className='flex flex-col justify-center items-center gap-8 py-28'>
                        <Image width={200} height={200} src={`https://${process.env.NEXT_PUBLIC_S3_DOMAIN}/logo.png`} alt={"todo logo"} className="" />
                        <section className="text-center">
                            <h1 className="text-xl">404 Not Found</h1>
                            <p>ページがみつかりません。</p>
                        </section>
                        <Button asChild><Link href={"/"}>トップへ戻る</Link></Button>
                    </div>
                </body>
            </html>
        </>
    )
}