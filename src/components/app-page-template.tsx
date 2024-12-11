'use client'

import Link from "next/link";

export default function AppPageTemplate({ title, children }: { title?: React.ReactNode, children: React.ReactNode }) {
    return (
        <>
            {title && <header className="h-12 px-3 flex shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
                {title}
            </header>
            }
            <main className="w-full">
                {children}
            </main>
        </>
    )
}

const ExLink = ({ href, rel, target, children, ...props }: { href: string, rel?: string, target?: string, children: React.ReactNode }) => {
    return (
        <Link href={href} rel={rel} target={target} className={`text-sm text-primary hover:underline hover:cursor-pointer transition-all`} {...props} >
            {children}
        </Link >
    )
}
