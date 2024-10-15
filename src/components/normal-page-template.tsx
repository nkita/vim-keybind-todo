'use client'

import { useLocalStorage } from "@/hook/useLocalStrorage";
import { redirect, useRouter } from "next/navigation";
import Image from "next/image"
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { FaXTwitter, FaGithub } from "react-icons/fa6";
import { Heart } from "lucide-react";
import { useAuth0 } from "@auth0/auth0-react";

export default function NormalPageTemplate({ children }: { children: React.ReactNode }) {
    return (
        <div className={`flex justify-center w-full`}>
            <div className="w-full max-w-[1024px]">
                <header className={`flex justify-between items-center w-full px-8 h-[60px]`}>
                    <div className="flex items-center gap-1 ">
                        <Image
                            src={`https://${process.env.NEXT_PUBLIC_S3_DOMAIN}/logo.png`}
                            alt="Shiba Todo Logo"
                            className="w-[20px]"
                            width={500} // 実際の画像サイズを指定しますが、表示サイズはTailwindで制御
                            height={500} // 実際の画像サイズ
                        />
                        <a href="/lp" className="hover:cursor-pointer text-sm">Shiba Todo</a>
                    </div>
                    <nav className="flex items-center gap-1">
                        <span className="flex items-center text-xs"> Feel free to follow me<Heart size={14} className="text-rose-400" /></span>
                        <Link target="_blank" href={"https://x.com/nkitao7"} className={`flex items-center gap-1 px-3 py-2 rounded-full hover:bg-secondary transition-all fade-in-5`} ><FaXTwitter /></Link>
                        <Link target="_blank" href={"https://github.com/nkita"} className={`flex items-center gap-1 px-3 py-2 rounded-full hover:bg-secondary transition-all fade-in-5`} ><FaGithub /></Link>
                    </nav>
                </header>
                <div className="px-12">
                    {children}
                </div>
                <div className="flex justify-center w-full pt-36">
                    <hr className="w-[93%]" />
                </div>
                <footer className="flex sm:flex-row flex-col-reverse sm:justify-between items-center px-12 gap-8 py-12">
                    <div className="flex items-center gap-1">
                        <Image
                            src={`https://${process.env.NEXT_PUBLIC_S3_DOMAIN}/logo.png`}
                            alt="Shiba Todo Logo"
                            className="w-[20px]"
                            width={500}
                            height={500}
                        />
                        <span className="text-sm">Copyright©2024 Shiba Tools</span>
                    </div>
                    <div className="flex flex-wrap justify-start sm:justify-end gap-3">
                        <ExLink href="/terms" >利用規約</ExLink>
                        <ExLink href="/privacy" >プライバシーポリシー</ExLink>
                        <ExLink target="_blank" rel="noopener noreferrer" href={process.env.NEXT_PUBLIC_CONTACT_URL || ""} >お問い合わせ </ExLink>
                    </div>
                </footer>
            </div >
        </div >
    )
}

const ExLink = ({ href, rel, target, children, ...props }: { href: string, rel?: string, target?: string, children: React.ReactNode }) => {
    return (
        <Link href={href} rel={rel} target={target} className={`text-sm text-primary hover:underline hover:cursor-pointer transition-all`} {...props} >
            {children}
        </Link >
    )
}
