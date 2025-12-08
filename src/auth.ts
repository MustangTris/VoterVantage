import NextAuth from "next-auth"
import PostgresAdapter from "@auth/pg-adapter"
import pool from "@/lib/db"
import authConfig from "./auth.config"
import Credentials from "next-auth/providers/credentials"
import { z } from "zod"
import bcrypt from "bcryptjs"

export const { handlers, signIn, signOut, auth } = NextAuth({
    adapter: PostgresAdapter(pool),
    session: { strategy: "jwt" },
    ...authConfig,
    providers: [
        ...authConfig.providers,
        Credentials({
            async authorize(credentials) {
                const parsedCredentials = z
                    .object({ email: z.string().email(), password: z.string().min(6) })
                    .safeParse(credentials);

                if (parsedCredentials.success) {
                    const { email, password } = parsedCredentials.data;

                    const client = await pool.connect();
                    try {
                        const result = await client.query('SELECT * FROM users WHERE email = $1', [email]);
                        const user = result.rows[0];

                        if (!user) return null;

                        // If user has no password (e.g. google only), return null
                        if (!user.password) return null;

                        const passwordsMatch = await bcrypt.compare(password, user.password);

                        if (passwordsMatch) return user;
                    } finally {
                        client.release();
                    }
                }
                console.log("Invalid credentials");
                return null;
            },
        }),
    ],
})
