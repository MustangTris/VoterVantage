import { z } from "zod"

export const TransactionSchema = z.object({
    // Core Fields
    Filer_NamL: z.string().optional(),
    Filer_ID: z.string().optional(),

    // Transaction Fields
    Entity_Name: z.string().min(1, "Name is required"),
    Amount: z.number(),
    Tran_Date: z.union([z.string(), z.date()]).optional().transform((val) => {
        if (!val) return null
        const date = new Date(val)
        return isNaN(date.getTime()) ? null : date.toISOString()
    }),

    // Detailed Fields
    Tran_City: z.string().optional().nullable(),
    Tran_State: z.string().optional().nullable(),
    Tran_Zip4: z.string().optional().nullable(),
    Tran_Emp: z.string().optional().nullable(),
    Tran_Occ: z.string().optional().nullable(),
    Rec_Type: z.enum(['CONTRIBUTION', 'EXPENDITURE', 'UNKNOWN']).optional().default('UNKNOWN'),
})

export type Transaction = z.infer<typeof TransactionSchema>

// Helper to clean raw CSV rows before Zod validation
export const cleanRow = (row: any): any => {
    const amountRaw = row['Amount'] || row['Amount Received'] || row['Amount Paid'] || '0'
    let amountClean: number | null = 0

    try {
        if (typeof amountRaw === 'number') {
            amountClean = amountRaw
        } else {
            // Safe string conversion before replace
            const strVal = String(amountRaw || "").replace(/[^0-9.-]+/g, "")
            amountClean = strVal ? parseFloat(strVal) : 0
        }
    } catch (e) {
        amountClean = 0
    }

    return {
        ...row,
        Amount: (amountClean === null || isNaN(amountClean)) ? 0 : amountClean, // Ensure number
        Entity_Name: row['Entity_Name'] || row['Entity Name'] || row['Payee'] || row['Contributor'] || row['Name'] || "Unknown Entity",
    }
}
