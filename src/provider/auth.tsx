"use client"
import { Auth0Provider } from "@auth0/auth0-react"
import type { FC, PropsWithChildren } from "react";
import { usePathname } from 'next/navigation'

export const AuthProvider: FC<PropsWithChildren> = ({ children }) => {
    let path = usePathname()
    const callbackPaths = ["/t", "/c"]
    path = callbackPaths.includes(path) ? path : "/"
    return (
        <Auth0Provider
            domain={process.env.NEXT_PUBLIC_AUTH0_DOMAIN ?? ""}
            clientId={process.env.NEXT_PUBLIC_AUTH0_CLIENTID ?? ""}
            authorizationParams={{
                redirect_uri: process.env.NEXT_PUBLIC_DOMAIN + path
            }}
        >
            {children}
        </Auth0Provider>
    )
}