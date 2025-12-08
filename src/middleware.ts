import NextAuth from "next-auth"
import authConfig from "./auth.config"
import { NextResponse } from "next/server"

const { auth } = NextAuth(authConfig)

export default auth((req) => {
    const isLoggedIn = !!req.auth
    const isOnDashboard = req.nextUrl.pathname.startsWith("/dashboard")

    if (isOnDashboard) {
        if (isLoggedIn) return
        return NextResponse.redirect(new URL("/login", req.nextUrl))
    }

    // Redirect logged-in users away from login and register pages
    if ((req.nextUrl.pathname.startsWith("/login") || req.nextUrl.pathname.startsWith("/signup")) && isLoggedIn) {
        return NextResponse.redirect(new URL("/dashboard", req.nextUrl))
    }

    return NextResponse.next()
})

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
