'use server'

import { auth } from "@/auth"

export async function getUserProfile() {
    const session = await auth()

    if (!session?.user) {
        return { success: false, error: "Not authenticated" }
    }

    // In a real app we might fetch more from a 'profiles' table if we had one linked to auth users
    // For now we just return the session user info
    return {
        success: true,
        user: {
            name: session.user.name,
            email: session.user.email,
            image: session.user.image,
            role: 'Volunteer' // Placeholder as we don't have roles in session yet
        }
    }
}
