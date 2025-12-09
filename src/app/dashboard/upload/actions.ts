'use server'

import { auth } from "@/auth"

export async function authAction() {
    const session = await auth()

    if (!session?.user?.email) {
        return { success: false, error: "Not authenticated", userId: null }
    }

    return {
        success: true,
        userId: session.user.email, // Using email as the user identifier
        user: session.user
    }
}
