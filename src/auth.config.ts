import Google from "next-auth/providers/google"
import type { NextAuthConfig } from "next-auth"

export default {
    providers: [
        Google({
            clientId: process.env.AUTH_GOOGLE_ID,
            clientSecret: process.env.AUTH_GOOGLE_SECRET,
        }),

    ],
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
