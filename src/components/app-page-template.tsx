'use client'

export default function AppPageTemplate({ title, children }: { title?: React.ReactNode, children: React.ReactNode }) {

    return (
        <>
            {title && <header className="h-12 px-3 flex shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
                {title}
            </header>
            }
            {children}
        </>
    )
}
