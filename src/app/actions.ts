'use server'

import { auth } from "@/auth"
import pool from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function updateProfile(table: string, id: string, field: string, value: any) {
    const session = await auth()

    // 1. Verify Authentication
    if (!session?.user) {
        throw new Error("Unauthorized")
    }

    // 2. Validate Table and Field (Prevent SQL Injection)
    const allowedTables = ['profiles', 'cities', 'politicians'] // Add more as needed
    const allowedFields = ['name', 'description', 'image_url', 'type'] // Restrict editable fields

    if (!allowedTables.includes(table)) {
        throw new Error("Invalid table")
    }

    // Simple validation for field names to prevent extensive injection, though parameterized queries handle values.
    // For column names, we must escape or whitelist. Whitelisting is safer.
    if (!allowedFields.includes(field)) {
        throw new Error(`Invalid field: ${field}`)
    }

    // 3. Update Database
    const client = await pool.connect()
    try {
        const query = `
            UPDATE ${table} 
            SET ${field} = $1, 
                created_at = NOW() -- Just updating a timestamp if needed, or add updated_at col
            WHERE id = $2
        `
        // Note: Dynamic column name ${field} is safe ONLY because we whitelisted it above.
        await client.query(query, [value, id])

        revalidatePath('/politicians')
        revalidatePath('/cities')
        revalidatePath('/lobby-groups')

    } catch (error) {
        console.error("Update failed:", error)
        throw new Error("Update failed")
    } finally {
        client.release()
    }
}
