import NextAuth from "next-auth"
import PostgresAdapter from "@auth/pg-adapter"
import pool from "@/lib/db"
import authConfig from "./auth.config"

export const { handlers, signIn, signOut, auth } = NextAuth({
    adapter: PostgresAdapter(pool),
    ...authConfig,
})

