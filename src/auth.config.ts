import type { NextAuthConfig } from "next-auth"

export default {
    providers: [],
    pages: {
        signIn: "/login",
    },
    callbacks: {
        async session({ session, token }) {
            // Add user ID to session from JWT token
            if (token?.sub) {
                session.user.id = token.sub
            }
            if (token?.email) {
                session.user.email = token.email
            }
            return session
        }
    }
} satisfies NextAuthConfig
