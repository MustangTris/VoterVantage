"use server"

import { signIn } from "@/auth"
import pool from "@/lib/db"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { AuthError } from "next-auth"

const RegisterSchema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
})

export async function registerUser(prevState: string | undefined, formData: FormData) {
    const data = Object.fromEntries(formData.entries())
    const validatedFields = RegisterSchema.safeParse(data)

    if (!validatedFields.success) {
        return "Invalid inputs provided."
    }

    const { name, email, password } = validatedFields.data

    try {
        const client = await pool.connect()

        // Check if user exists
        const existingUser = await client.query('SELECT * FROM users WHERE email = $1', [email])
        if (existingUser.rows.length > 0) {
            client.release()
            return "Email already registered."
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        await client.query(
            'INSERT INTO users (name, email, password) VALUES ($1, $2, $3)',
            [name, email, hashedPassword]
        )

        client.release()
    } catch (error) {
        console.error("Registration error:", error)
        return "Failed to register user."
    }

    // Attempt to sign in immediately after registration
    try {
        await signIn("credentials", {
            email,
            password,
            redirectTo: "/dashboard",
        })
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case "CredentialsSignin":
                    return "Invalid credentials."
                default:
                    return "Something went wrong."
            }
        }
        throw error // Rethrow redirect error
    }
}

export async function authenticate(
    prevState: string | undefined,
    formData: FormData,
) {
    try {
        await signIn("credentials", {
            ...Object.fromEntries(formData),
            redirectTo: "/dashboard",
        })
    } catch (error) {
        console.error("Authentication Error:", error); // Log full error to server console
        if (error instanceof AuthError) {
            switch (error.type) {
                case "CredentialsSignin":
                    return "Invalid credentials."
                default:
                    return "Something went wrong."
            }
        }
        throw error;
    }
}
