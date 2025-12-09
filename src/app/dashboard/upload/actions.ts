'use server'

import { auth } from "@/auth"

export async function authAction() {
    const session = await auth()

    if (!session?.user?.id) {
        return { success: false, error: "Not authenticated", userId: null }
    }

    return {
        success: true,
        userId: session.user.id, // Return UUID instead of email
        user: session.user
    }
}
